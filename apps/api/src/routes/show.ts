import { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";
import type { ShowDetailsResponse } from "../types/show.js";

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

      // Fetch the show with related data
      // Only fetch top 15 cast members sorted by order (billing priority)
      const show = await fastify.prisma.show.findUnique({
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
      });

      if (!show) {
        reply.code(404).send({ error: "Show not found" });
        return;
      }

      // Calculate average rating using database aggregation
      const ratingStats = await fastify.prisma.review.aggregate({
        where: { showId: id },
        _avg: { rating: true },
        _count: true,
      });

      const avgRating = ratingStats._avg.rating ?? 0;
      const reviewCount = ratingStats._count;

      // Prepare cast: already sorted and limited by the query
      const orderedCast: string[] = show.cast.map((c) => c.actor.name);

      // Get creators from database
      const creators: string[] = show.creators.map((c) => c.creator.name);

      const transformed: ShowDetailsResponse = {
        id: show.id,
        title: show.title,
        year: show.releaseDate ? show.releaseDate.getFullYear() : null,
        description: show.description,
        seasons: show.seasons,
        status: show.status,
        // keep posterPath for frontend consistency with HomeView
        posterPath: show.posterPath ?? null,
        image: show.posterPath ?? null,
        genres: show.genres.map((g) => g.genre.name),
        cast: orderedCast,
        creators,
        rating: Number(avgRating.toFixed(2)),
        totalReviews: reviewCount,
        reviews: show.reviews.map((r) => ({
          id: r.id,
          userId: r.userId,
          username: r.user?.name ?? `user_${r.userId}`,
          rating: r.rating,
          reviewText: r.comment ?? null,
          date: r.createdAt?.toISOString() ?? new Date().toISOString(),
        })),
      };

      reply.send(transformed);
    }
  );
};

export default showRoute;
