import type { FastifyPluginAsync } from "fastify";
import { Type, Static } from "@sinclair/typebox";

// Schema for adding a favorite
const FavoriteBodySchema = Type.Object({
  showId: Type.Number({ minimum: 1 }),
});

type FavoriteBody = Static<typeof FavoriteBodySchema>;

// Schema for show ID param
const ShowParamsSchema = Type.Object({
  showId: Type.String(),
});

type ShowParams = Static<typeof ShowParamsSchema>;

const favoriteRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Add a show to favorites
  fastify.post<{ Body: FavoriteBody }>(
    "/api/favorites",
    {
      schema: {
        body: FavoriteBodySchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply
          .status(401)
          .send({ error: "You must be logged in to add favorites" });
      }

      const userId = (request.user as { userId: number }).userId;
      const { showId } = request.body;

      // Check if show exists
      const show = await fastify.prisma.show.findUnique({
        where: { id: showId },
      });
      if (!show) {
        return reply.status(404).send({ error: "Show not found" });
      }

      // Check if already favorited - if so, just return success (idempotent)
      const existing = await fastify.prisma.favorite.findUnique({
        where: { userId_showId: { userId, showId } },
      });

      if (existing) {
        return reply.send({ success: true });
      }

      await fastify.prisma.favorite.create({
        data: { userId, showId },
      });

      return reply.status(201).send({ success: true });
    }
  );

  // Remove a show from favorites
  fastify.delete<{ Params: ShowParams }>(
    "/api/favorites/:showId",
    {
      schema: {
        params: ShowParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply
          .status(401)
          .send({ error: "You must be logged in to remove favorites" });
      }

      const userId = (request.user as { userId: number }).userId;
      const showId = Number(request.params.showId);

      if (!Number.isInteger(showId) || showId <= 0) {
        return reply.status(400).send({ error: "Invalid show ID" });
      }

      // Delete if exists, don't error if not (idempotent)
      await fastify.prisma.favorite.deleteMany({
        where: { userId, showId },
      });

      return reply.send({ success: true });
    }
  );
};

export default favoriteRoutes;
