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
      if (!Number.isInteger(id) || id <= 0) {
        reply
          .code(400)
          .send({ error: "Invalid id - must be a positive integer" });
        return;
      }

      // Try to get user ID from JWT (optional - don't fail if not authenticated)
      let userId: number | null = null;
      try {
        await request.jwtVerify();
        userId = (request.user as { userId: number }).userId;
      } catch {
        // User is not authenticated, that's fine
      }

      // Fetch show data and calculate ratings in parallel
      const [show, ratingStats, userFavorite, userWatchlist, userReview] =
        await Promise.all([
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
              reviews: {
                include: { user: { select: { id: true, username: true } } },
                orderBy: { createdAt: "desc" },
                take: 10, // Only get first page of reviews
              },
            },
          }),
          fastify.prisma.review.aggregate({
            where: { showId: id },
            _avg: { rating: true },
            _count: true,
          }),
          // Check if user has favorited this show
          userId
            ? fastify.prisma.favorite.findUnique({
                where: { userId_showId: { userId, showId: id } },
              })
            : null,
          // Check if user has this show in watchlist
          userId
            ? fastify.prisma.watchlist.findUnique({
                where: { userId_showId: { userId, showId: id } },
              })
            : null,
          // Get user's own review if exists
          userId
            ? fastify.prisma.review.findUnique({
                where: { userId_showId: { userId, showId: id } },
              })
            : null,
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
          username: r.user?.username ?? `user_${r.userId}`,
          rating: r.rating,
          comment: r.comment ?? null,
          reviewText: r.comment ?? null,
          createdAt: r.createdAt?.toISOString() ?? new Date().toISOString(),
          updatedAt: r.updatedAt?.toISOString() ?? new Date().toISOString(),
          date: r.createdAt?.toISOString() ?? new Date().toISOString(),
          showId: show.id,
          likes: 0,
        })),
        // User-specific data
        userStatus: {
          isFavorite: !!userFavorite,
          inWatchlist: !!userWatchlist,
          watchlistNote: userWatchlist?.note ?? null,
          userReview: userReview
            ? {
                id: userReview.id,
                rating: userReview.rating,
                comment: userReview.comment,
              }
            : null,
        },
      };

      reply.send(transformed);
    }
  );
};

export default showRoute;
