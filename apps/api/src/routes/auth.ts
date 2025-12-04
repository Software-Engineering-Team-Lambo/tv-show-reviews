import type { FastifyPluginAsync } from "fastify";

const auth: FastifyPluginAsync = async (fastify) => {
  // Check if user is authenticated
  fastify.get("/api/auth/me", async (request, reply) => {
    try {
      // Verify JWT from cookie
      await request.jwtVerify();

      // Get user from database
      const user = await fastify.prisma.user.findUnique({
        where: { id: request.user.userId },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      return reply.send({ user });
    } catch (error) {
      // Not authenticated or invalid token
      console.log(error);
      return reply.status(401).send({
        error: "Not authenticated",
      });
    }
  });
};

export default auth;
