import type { FastifyPluginAsync } from "fastify";
import { type Static, Type } from "@sinclair/typebox";
import { Prisma } from "../../generated/prisma/index.js";
import {
  type ProfileTab,
  type PublicProfileUser,
  type PublicProfileResponse,
  type ReviewWithShow,
  type FavoriteWithShow,
  type WatchlistWithShow,
  createPaginationInfo,
  toPublicWatchlist,
} from "../types/types-profile.ts";

// Pagination query schema
const PaginationQuerySchema = Type.Object({
  reviewsPage: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  favoritesPage: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  watchlistPage: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 10 })),
  // Optional: specify which tab to load (for "load more" requests)
  tab: Type.Optional(
    Type.Union([
      Type.Literal("reviews"),
      Type.Literal("favorites"),
      Type.Literal("watchlist"),
    ])
  ),
});

type PaginationQuery = Static<typeof PaginationQuerySchema>;

// Route params schema
const UserParamsSchema = Type.Object({
  username: Type.String(),
});

type UserParams = Static<typeof UserParamsSchema>;

const user: FastifyPluginAsync = async (fastify) => {
  // GET /api/users/:username - Get public user profile
  fastify.get<{ Params: UserParams; Querystring: PaginationQuery }>(
    "/api/users/:username",
    {
      schema: {
        params: UserParamsSchema,
        querystring: PaginationQuerySchema,
      },
    },
    async (request, reply) => {
      const { username } = request.params;
      const {
        reviewsPage = 1,
        favoritesPage = 1,
        watchlistPage = 1,
        limit = 10,
        tab,
      } = request.query;

      // Find the user by username first
      const userBasic = await fastify.prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!userBasic) {
        return reply.status(404).send({ error: "User not found" });
      }

      const userId = userBasic.id;

      // Determine which data to fetch based on tab parameter
      const fetchReviews = !tab || tab === "reviews";
      const fetchFavorites = !tab || tab === "favorites";
      const fetchWatchlist = !tab || tab === "watchlist";

      // Build dynamic select object
      const select: Prisma.UserSelect = {
        id: true,
        username: true,
        createdAt: true,
        // Note: don't include email for public profiles
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
      const [reviewsCount, favoritesCount, watchlistCount, userData] =
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

      if (!userData) {
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

      // Build typed response (hide private watchlist notes)
      const publicUser: PublicProfileUser = {
        id: userData.id,
        username: userData.username,
        createdAt: userData.createdAt,
        reviews: (userData.reviews as ReviewWithShow[] | undefined) ?? [],
        favorites: (userData.favorites as FavoriteWithShow[] | undefined) ?? [],
        watchlist: toPublicWatchlist(
          userData.watchlist as WatchlistWithShow[] | undefined
        ),
      };

      const response: PublicProfileResponse = { user: publicUser, pagination };
      return reply.send(response);
    }
  );
};

export default user;
