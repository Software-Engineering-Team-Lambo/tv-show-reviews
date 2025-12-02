import { FastifyPluginAsync } from "fastify";
import { Static, Type } from "@sinclair/typebox";

// Define the profile update request schema
const UpdateUsernameSchema = Type.Object({
  username: Type.String({
    minLength: 4,
    maxLength: 16,
    pattern: "^[a-zA-Z0-9_]+$",
    description:
      "Username must be 4-16 characters and contain only letters, numbers, and underscores",
  }),
});

type UpdateUsernameBody = Static<typeof UpdateUsernameSchema>;

const profile: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/profile", async (request, reply) => {
    try {
      // Verify JWT from cookie
      await request.jwtVerify();

      const userId = request.user.userId;
      if (!userId) {
        return reply.status(401).send({
          error: "User ID Not Authenticated",
        });
      }

      // load in the logged in user's profile
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        include: {
          reviews: {
            include: { show: true },
            orderBy: { createdAt: "desc" },
          },
          favorites: {
            include: { show: true },
            orderBy: { createdAt: "desc" },
          },
          watchlist: {
            include: { show: true },
            orderBy: { addedAt: "desc" },
          },
        },
      });

      if (!user) {
        return reply.status(404).send({
          error: "User not found",
        });
      }

      const sanitizedUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        reviews: user.reviews,
        favorites: user.favorites,
        watchlist: user.watchlist,
      };

      return reply.send({ user: sanitizedUser });
    } catch (error) {
      // Not authenticated or invalid generateToken
      return reply.status(401).send({
        error: "Not authenticated",
      });
    }
  });

  fastify.put<{ Body: UpdateUsernameBody }>(
    "/api/profile",
    { schema: { body: UpdateUsernameSchema } },
    async (request, reply) => {
      try {
        // Verify JWT from cookie
        await request.jwtVerify();

        const userId = request.user.userId;
        if (!userId) {
          return reply.status(401).send({
            error: "User ID Not Authenticated",
          });
        }

        const { username } = request.body;

        const currentUser = await fastify.prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });

        if (currentUser?.username === username) {
          return reply.status(400).send({
            error: "New username must be different from the current username",
          });
        }

        // make sure the new username is not already taken
        const existingUsername = await fastify.prisma.user.findUnique({
          where: { username },
        });

        if (existingUsername && existingUsername.id !== userId) {
          return reply.status(400).send({
            error: "Username is already taken",
          });
        }

        // update username
        const updatedUser = await fastify.prisma.user.update({
          where: { id: userId },
          data: { username },
          select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
          },
        });

        return reply.send({ user: updatedUser });
      } catch (error) {
        // Not authenticated or invalid generateToken
        return reply.status(500).send({
          error: "Not authenticated",
        });
      }
    }
  );
};

export default profile;
