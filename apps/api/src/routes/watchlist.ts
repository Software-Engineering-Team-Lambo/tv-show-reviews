import type { FastifyPluginAsync } from "fastify";
import { Type, type Static } from "@sinclair/typebox";

// Schema for adding to watchlist
const WatchlistBodySchema = Type.Object({
  showId: Type.Number({ minimum: 1 }),
  note: Type.Optional(Type.String({ maxLength: 500 })),
});

type WatchlistBody = Static<typeof WatchlistBodySchema>;

// Schema for show ID param
const ShowParamsSchema = Type.Object({
  showId: Type.String(),
});

type ShowParams = Static<typeof ShowParamsSchema>;

const watchlistRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // Add a show to watchlist
  fastify.post<{ Body: WatchlistBody }>(
    "/api/watchlist",
    {
      schema: {
        body: WatchlistBodySchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply
          .status(401)
          .send({ error: "You must be logged in to add to your watchlist" });
      }

      const userId = (request.user as { userId: number }).userId;
      const { showId, note } = request.body;

      // Check if show exists
      const show = await fastify.prisma.show.findUnique({
        where: { id: showId },
      });
      if (!show) {
        return reply.status(404).send({ error: "Show not found" });
      }

      // Check if already in watchlist - if so, just return success (idempotent)
      const existing = await fastify.prisma.watchlist.findUnique({
        where: { userId_showId: { userId, showId } },
      });

      if (existing) {
        return reply.send({ success: true });
      }

      await fastify.prisma.watchlist.create({
        data: { userId, showId, note },
      });

      return reply.status(201).send({ success: true });
    }
  );

  // Remove a show from watchlist
  fastify.delete<{ Params: ShowParams }>(
    "/api/watchlist/:showId",
    {
      schema: {
        params: ShowParamsSchema,
      },
    },
    async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({
          error: "You must be logged in to remove from your watchlist",
        });
      }

      const userId = (request.user as { userId: number }).userId;
      const showId = Number(request.params.showId);

      if (!Number.isInteger(showId) || showId <= 0) {
        return reply.status(400).send({ error: "Invalid show ID" });
      }

      // Delete if exists, don't error if not (idempotent)
      await fastify.prisma.watchlist.deleteMany({
        where: { userId, showId },
      });

      return reply.send({ success: true });
    }
  );
};

export default watchlistRoutes;
