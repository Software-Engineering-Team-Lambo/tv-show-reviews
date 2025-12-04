import type { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";

// Schema for creating/updating a review
const ReviewBodySchema = Type.Object({
  showId: Type.Number({ minimum: 1 }),
  rating: Type.Number({ minimum: 1, maximum: 5 }),
  comment: Type.Optional(Type.String({ maxLength: 5000 })),
});

type ReviewBody = Static<typeof ReviewBodySchema>;

// Schema for review ID param
const ReviewParamsSchema = Type.Object({
  id: Type.String(),
});

type ReviewParams = Static<typeof ReviewParamsSchema>;

// Schema for paginated reviews query
const ReviewsQuerySchema = Type.Object({
  showId: Type.String(),
  page: Type.Optional(Type.String()),
  limit: Type.Optional(Type.String()),
});

type ReviewsQuery = Static<typeof ReviewsQuerySchema>;

const reviewRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Get paginated reviews for a show
  fastify.get<{ Querystring: ReviewsQuery }>(
    "/api/reviews",
    {
      schema: {
        querystring: ReviewsQuerySchema,
      },
    },
    async (request, reply) => {
      const showId = Number(request.query.showId);
      const page = Math.max(1, Number(request.query.page) || 1);
      const limit = Math.min(
        50,
        Math.max(1, Number(request.query.limit) || 10)
      );
      const skip = (page - 1) * limit;

      if (!Number.isInteger(showId) || showId <= 0) {
        return reply.status(400).send({ error: "Invalid showId" });
      }

      const [reviews, totalCount] = await Promise.all([
        fastify.prisma.review.findMany({
          where: { showId },
          include: { user: { select: { id: true, username: true } } },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        fastify.prisma.review.count({ where: { showId } }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return reply.send({
        reviews: reviews.map((r) => ({
          id: r.id,
          userId: r.userId,
          username: r.user.username,
          rating: r.rating,
          comment: r.comment,
          reviewText: r.comment,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          date: r.createdAt.toISOString(),
          showId: r.showId,
          likes: 0,
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore: page < totalPages,
        },
      });
    }
  );

  // Create a review (requires auth)
  fastify.post<{ Body: ReviewBody }>(
    "/api/reviews",
    {
      schema: {
        body: ReviewBodySchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply
          .status(401)
          .send({ error: "You must be logged in to write a review" });
      }

      const userId = (request.user as { userId: number }).userId;
      const { showId, rating, comment } = request.body;

      // Check if show exists
      const show = await fastify.prisma.show.findUnique({
        where: { id: showId },
      });
      if (!show) {
        return reply.status(404).send({ error: "Show not found" });
      }

      // Check if user already has a review for this show
      const existingReview = await fastify.prisma.review.findUnique({
        where: { userId_showId: { userId, showId } },
      });

      if (existingReview) {
        return reply.status(400).send({
          error: "You have already reviewed this show. Use PUT to update.",
        });
      }

      const review = await fastify.prisma.review.create({
        data: { userId, showId, rating, comment },
        include: { user: { select: { id: true, username: true } } },
      });

      return reply.status(201).send({
        id: review.id,
        userId: review.userId,
        username: review.user.username,
        rating: review.rating,
        comment: review.comment,
        reviewText: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        date: review.createdAt.toISOString(),
        showId: review.showId,
        likes: 0,
      });
    }
  );

  // Update a review (requires auth, must be owner)
  fastify.put<{ Params: ReviewParams; Body: ReviewBody }>(
    "/api/reviews/:id",
    {
      schema: {
        params: ReviewParamsSchema,
        body: ReviewBodySchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply
          .status(401)
          .send({ error: "You must be logged in to update a review" });
      }

      const userId = (request.user as { userId: number }).userId;
      const reviewId = Number(request.params.id);
      const { rating, comment } = request.body;

      if (!Number.isInteger(reviewId) || reviewId <= 0) {
        return reply.status(400).send({ error: "Invalid review ID" });
      }

      // Find the review
      const existingReview = await fastify.prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return reply.status(404).send({ error: "Review not found" });
      }

      if (existingReview.userId !== userId) {
        return reply
          .status(403)
          .send({ error: "You can only edit your own reviews" });
      }

      const review = await fastify.prisma.review.update({
        where: { id: reviewId },
        data: { rating, comment },
        include: { user: { select: { id: true, username: true } } },
      });

      return reply.send({
        id: review.id,
        userId: review.userId,
        username: review.user.username,
        rating: review.rating,
        comment: review.comment,
        reviewText: review.comment,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        date: review.createdAt.toISOString(),
        showId: review.showId,
        likes: 0,
      });
    }
  );

  // Delete a review (requires auth, must be owner)
  fastify.delete<{ Params: ReviewParams }>(
    "/api/reviews/:id",
    {
      schema: {
        params: ReviewParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply
          .status(401)
          .send({ error: "You must be logged in to delete a review" });
      }

      const userId = (request.user as { userId: number }).userId;
      const reviewId = Number(request.params.id);

      if (!Number.isInteger(reviewId) || reviewId <= 0) {
        return reply.status(400).send({ error: "Invalid review ID" });
      }

      const existingReview = await fastify.prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!existingReview) {
        return reply.status(404).send({ error: "Review not found" });
      }

      if (existingReview.userId !== userId) {
        return reply
          .status(403)
          .send({ error: "You can only delete your own reviews" });
      }

      await fastify.prisma.review.delete({ where: { id: reviewId } });

      return reply.send({ message: "Review deleted successfully" });
    }
  );
};

export default reviewRoutes;
