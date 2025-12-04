import type { FastifyPluginAsync } from "fastify";
import { type Static, Type } from "@sinclair/typebox";
import { Prisma } from "../../generated/prisma/index.js";
import {
  type ProfileTab,
  type ProfileUser,
  type ProfileResponse,
  type ReviewWithShow,
  type FavoriteWithShow,
  type WatchlistWithShow,
  createPaginationInfo,
} from "../types/user-profile.js";

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

// Pagination query schema
const PaginationQuerySchema = Type.Object({
  reviewsPage: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  favoritesPage: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  watchlistPage: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 })),
  // Optional: specify which tab to load (for "load more" requests)
  // If not specified, loads all tabs (initial load)
  tab: Type.Optional(
    Type.Union([
      Type.Literal("reviews"),
      Type.Literal("favorites"),
      Type.Literal("watchlist"),
    ])
  ),
});

type PaginationQuery = Static<typeof PaginationQuerySchema>;

const profile: FastifyPluginAsync = async (fastify) => {
  fastify.get<{ Querystring: PaginationQuery }>(
    "/api/profile",
    {
      schema: {
        querystring: PaginationQuerySchema,
      },
    },
    async (request, reply) => {
      // Verify JWT from cookie
      try {
        await request.jwtVerify();
      } catch (error) {
        console.log(error);
        return reply.status(401).send({ error: "Not authenticated" });
      }

      const userId = request.user.userId;
      if (!userId) {
        return reply.status(401).send({ error: "User ID Not Authenticated" });
      }

      const {
        reviewsPage = 1,
        favoritesPage = 1,
        watchlistPage = 1,
        limit = 10,
        tab,
      } = request.query;

      // Determine which data to fetch based on tab parameter
      const fetchReviews = !tab || tab === "reviews";
      const fetchFavorites = !tab || tab === "favorites";
      const fetchWatchlist = !tab || tab === "watchlist";

      // Build dynamic select object
      const select: Prisma.UserSelect = {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        ...(fetchReviews && {
          reviews: {
            include: { show: true },
            orderBy: { createdAt: "desc" as const },
            skip: (reviewsPage - 1) * limit,
            take: limit,
          },
        }),
        ...(fetchFavorites && {
          favorites: {
            include: { show: true },
            orderBy: { createdAt: "desc" as const },
            skip: (favoritesPage - 1) * limit,
            take: limit,
          },
        }),
        ...(fetchWatchlist && {
          watchlist: {
            include: { show: true },
            orderBy: { addedAt: "desc" as const },
            skip: (watchlistPage - 1) * limit,
            take: limit,
          },
        }),
      };

      // Get counts and user data in parallel
      const [reviewsCount, favoritesCount, watchlistCount, user] =
        await Promise.all([
          fetchReviews
            ? fastify.prisma.review.count({ where: { userId } })
            : Promise.resolve(0),
          fetchFavorites
            ? fastify.prisma.favorite.count({ where: { userId } })
            : Promise.resolve(0),
          fetchWatchlist
            ? fastify.prisma.watchlist.count({ where: { userId } })
            : Promise.resolve(0),
          fastify.prisma.user.findUnique({ where: { id: userId }, select }),
        ]);

      if (!user) {
        return reply.status(404).send({ error: "User not found" });
      }

      // Build pagination object
      const pagination: Partial<
        Record<ProfileTab, ReturnType<typeof createPaginationInfo>>
      > = {};
      if (fetchReviews) {
        pagination.reviews = createPaginationInfo(
          reviewsPage,
          limit,
          reviewsCount
        );
      }
      if (fetchFavorites) {
        pagination.favorites = createPaginationInfo(
          favoritesPage,
          limit,
          favoritesCount
        );
      }
      if (fetchWatchlist) {
        pagination.watchlist = createPaginationInfo(
          watchlistPage,
          limit,
          watchlistCount
        );
      }

      // Build typed response
      const profileUser: ProfileUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        reviews: (user.reviews as ReviewWithShow[] | undefined) ?? [],
        favorites: (user.favorites as FavoriteWithShow[] | undefined) ?? [],
        watchlist: (user.watchlist as WatchlistWithShow[] | undefined) ?? [],
      };

      const response: ProfileResponse = { user: profileUser, pagination };
      return reply.send(response);
    }
  );

  fastify.put<{ Body: UpdateUsernameBody }>(
    "/api/profile",
    { schema: { body: UpdateUsernameSchema } },
    async (request, reply) => {
      // Verify JWT from cookie
      try {
        await request.jwtVerify();
      } catch (error) {
        console.error("Profile update auth error:", error);
        return reply.status(401).send({
          error: "Not authenticated",
        });
      }

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
    }
  );
};

export default profile;
