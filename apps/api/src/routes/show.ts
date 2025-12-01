import type { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";

const ParamsSchema = Type.Object({
  id: Type.String(),
});

type Params = Static<typeof ParamsSchema>;

const showRoute: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get<{ Params: Params }>(
    "/api/show/:id",
    {
      schema: {
        params: ParamsSchema,
      },
    },
    async function (request, reply) {
      const id = Number(request.params.id);
      if (!Number.isInteger(id) || id <= 0) {
        reply
          .code(400)
          .send({ error: "Invalid id - must be a positive integer" });
        return;
      }

      // Fetch show data and calculate ratings in parallel
      const [show, ratingStats] = await Promise.all([
        fastify.prisma.show.findUnique({
          where: { id },
          include: {
            genres: { include: { genre: true } },
            creators: { include: { creator: true } },
            cast: {
              include: { actor: true },
              orderBy: { order: "asc" },
              take: 15,
            },
            reviews: { include: { user: true } },
          },
        }),
        fastify.prisma.review.aggregate({
          where: { showId: id },
          _avg: { rating: true },
          _count: true,
        }),
      ]);

      if (!show) {
        reply.code(404).send({ error: "Show not found" });
        return;
      }

      const avgRating = ratingStats._avg.rating ?? 0;
      const reviewCount = ratingStats._count;

      // Prepare cast: already sorted and limited by the query
      const orderedCast: string[] = show.cast.map((c) => c.actor.name);

      // Get creators from database
      const creators: string[] = show.creators.map((c) => c.creator.name);

      const transformed = {
        id: show.id,
        title: show.title,
        year: show.releaseDate ? show.releaseDate.getFullYear() : null,
        description: show.description,
        seasons: show.seasons,
        status: show.status,
        posterPath: show.posterPath ?? null,
        genres: show.genres.map((g) => g.genre.name),
        cast: orderedCast,
        creators,
        averageRating: Number(avgRating.toFixed(2)),
        reviewCount: reviewCount,
        reviews: show.reviews.map((r) => ({
          id: r.id,
          userId: r.userId,
          username: r.user?.name ?? `user_${r.userId}`,
          rating: r.rating,
          comment: r.comment ?? null,
          reviewText: r.comment ?? null,
          createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
          updatedAt: r.updatedAt?.toISOString() ?? new Date().toISOString(),
          date: r.createdAt?.toISOString() ?? new Date().toISOString(),
          showId: show.id,
          likes: 0,
        })),
      };

      reply.send(transformed);
    }
  );
};

export default showRoute;
