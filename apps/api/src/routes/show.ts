import { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";

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
      if (Number.isNaN(id)) {
        reply.code(400).send({ error: "Invalid id" });
        return;
      }

      // Fetch the show with related data
      const show = await fastify.prisma.show.findUnique({
        where: { id },
        include: {
          genres: { include: { genre: true } },
          cast: { include: { actor: true } },
          reviews: { include: { user: true } },
        },
      });

      if (!show) {
        reply.code(404).send({ error: "Show not found" });
        return;
      }

      // Calculate average rating
      const reviewCount = show.reviews?.length ?? 0;
      const avgRating =
        reviewCount > 0
          ? show.reviews.reduce((acc, r) => acc + (r.rating ?? 0), 0) /
            reviewCount
          : 0;

      // Prepare cast: sort by order (ascending) and take top 15
      const orderedCast = (show.cast || [])
        .slice()
        .sort((a, b) => {
          const oa = a.order ?? 9999;
          const ob = b.order ?? 9999;
          return oa - ob;
        })
        .slice(0, 15)
        .map((c) => c.actor.name);

      // Attempt to load creators. The Prisma schema currently doesn't store creators,
      // so fallback to fetching from TMDB at runtime if API key is available.
      let creators: string[] = [];
      try {
        if (process.env.TMDB_API_KEY) {
          const tmdbRes = await fetch(
            `https://api.themoviedb.org/3/tv/${show.id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
          );
          if (tmdbRes.ok) {
            const tmdbData: any = await tmdbRes.json();
            if (Array.isArray(tmdbData.created_by)) {
              creators = tmdbData.created_by
                .map((c: any) => c.name)
                .filter(Boolean);
            }
          }
        }
      } catch (e) {
        // ignore errors fetching TMDB; creators will remain empty
        fastify.log.debug(
          `Failed to fetch TMDB creators for show ${show.id}: ${e}`
        );
      }

      const transformed = {
        id: show.id,
        title: show.title,
        year: show.releaseDate ? show.releaseDate.getFullYear() : null,
        description: show.description,
        seasons: show.seasons,
        status: show.status,
        // keep posterPath for frontend consistency with HomeView
        posterPath: show.posterPath ?? null,
        image: show.posterPath ?? null,
        genres: show.genres?.map((g) => g.genre.name) ?? [],
        cast: orderedCast,
        creators,
        rating: Number(avgRating.toFixed(2)),
        totalReviews: reviewCount,
        reviews:
          show.reviews?.map((r) => ({
            id: r.id,
            userId: r.userId,
            username: r.user?.name ?? `user_${r.userId}`,
            rating: r.rating,
            reviewText: r.comment ?? null,
            date: r.createdAt?.toISOString() ?? new Date().toISOString(),
          })) ?? [],
      };

      reply.send(transformed);
    }
  );
};

export default showRoute;
