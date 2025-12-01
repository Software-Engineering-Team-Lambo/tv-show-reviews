// pull user data from login to display on profile page
import type { FastifyPluginAsync, FastifyRequest } from "fastify";

type AuthUser = { id?: number | string; username?: string; email?: string };

const profile: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  // GET /api/profile
  // - If caller provides `X-User-Id` header or `?id=` query param, try to load that user from Prisma
  // - Otherwise return a demo/mock user object to support frontend development
  fastify.get("/api/profile", async (request, reply) => {
    // If the authentication plugin sets `request.user`, prefer that
    const req = request as FastifyRequest & {
      user?: AuthUser;
      query?: Record<string, unknown>;
    };
    const authUser = req.user;
    if (authUser) {
      // When an authenticated identity exists, load the canonical profile
      // from the database and include favorites/watchlist (with show data)
      // so the frontend receives full lists.
      let userFromAuth: unknown = null;
      if (authUser.username) {
        userFromAuth = await fastify.prisma.user.findFirst({
          where: { name: String(authUser.username) },
          include: {
            reviews: {
              include: { show: true },
              orderBy: { createdAt: "desc" },
            },
            favorites: { include: { show: true } },
            watchlist: { include: { show: true } },
          },
        });
      }
      if (!userFromAuth && authUser.id) {
        userFromAuth = await fastify.prisma.user.findUnique({
          where: { id: Number(authUser.id) },
          include: {
            reviews: {
              include: { show: true },
              orderBy: { createdAt: "desc" },
            },
            favorites: { include: { show: true } },
            watchlist: { include: { show: true } },
          },
        });
      }
      if (!userFromAuth && authUser.email) {
        userFromAuth = await fastify.prisma.user.findUnique({
          where: { email: String(authUser.email) },
          include: {
            reviews: {
              include: { show: true },
              orderBy: { createdAt: "desc" },
            },
            favorites: { include: { show: true } },
            watchlist: { include: { show: true } },
          },
        });
      }

      if (userFromAuth) {
        const ufa = userFromAuth as {
          reviews?: unknown[];
          favorites?: unknown[];
          watchlist?: unknown[];
          id?: number;
          name?: string | null;
          email?: string;
          createdAt?: Date | string;
        };

        const reviews = (ufa.reviews || []).map((r: unknown) => {
          const rr = r as Record<string, unknown>;
          return {
            id: Number(rr.id as number | string),
            showId: Number(rr.showId as number | string),
            showTitle: (() => {
              const s = rr.show as Record<string, unknown> | undefined;
              if (s) {
                if (typeof s.title === "string") return s.title;
                if (typeof s.name === "string") return s.name;
              }
              return null;
            })(),
            showImage: (() => {
              const s = rr.show as Record<string, unknown> | undefined;
              return s && typeof s.posterPath === "string"
                ? s.posterPath
                : null;
            })(),
            rating:
              typeof rr.rating === "number"
                ? rr.rating
                : Number(rr.rating as string) || 0,
            reviewText: typeof rr.comment === "string" ? rr.comment : "",
            date:
              rr.createdAt && typeof rr.createdAt === "string"
                ? rr.createdAt.split("T")[0]
                : "",
            likes: 0,
          };
        });

        const favorites = (ufa.favorites || []).map((f: unknown) => {
          const ff = f as Record<string, unknown>;
          const show = ff.show as Record<string, unknown> | undefined;
          return {
            id:
              show && show.id
                ? Number(show.id as number | string)
                : Number(ff.showId as number | string),
            title: show?.title ?? null,
            image: show?.posterPath ?? null,
            rating: null,
          };
        });

        const watchlist = (ufa.watchlist || []).map((w: unknown) => {
          const ww = w as Record<string, unknown>;
          const show = ww.show as Record<string, unknown> | undefined;
          return {
            id:
              show && show.id
                ? Number(show.id as number | string)
                : Number(ww.showId as number | string),
            title: show?.title ?? null,
            image: show?.posterPath ?? null,
            rating: null,
          };
        });

        return {
          id: ufa.id,
          username:
            ufa.name ??
            (ufa.email ? ufa.email.split("@")[0] : undefined) ??
            undefined,
          email: ufa.email,
          joinDate: ufa.createdAt
            ? typeof ufa.createdAt === "string"
              ? ufa.createdAt.split("T")[0]
              : (ufa.createdAt as Date).toISOString().split("T")[0]
            : undefined,
          bio: "",
          stats: {
            reviews: reviews.length,
            favorites: favorites.length,
            watchlist: watchlist.length,
          },
          reviews,
          favorites,
          watchlist,
        };
      }
    }

    // Fallbacks: X-User-Id header or ?id= query
    const headerId = request.headers["x-user-id"] as string | undefined;
    const queryId = req.query?.id;
    const maybeId = headerId ?? queryId;
    const userId = Number(maybeId);

    if (Number.isInteger(userId) && userId > 0) {
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
        include: {
          reviews: { include: { show: true }, orderBy: { createdAt: "desc" } },
          favorites: { include: { show: true } },
          watchlist: { include: { show: true } },
        },
      });

      if (!user) {
        reply.code(404);
        return { error: "User not found" };
      }

      const reviews = (user.reviews || []).map((r: unknown) => {
        const rr = r as Record<string, unknown>;
        const show = rr.show as Record<string, unknown> | undefined;
        return {
          id: Number(rr.id as number | string),
          showId: Number(rr.showId as number | string),
          showTitle: show?.title ?? show?.name ?? null,
          showImage: null,
          rating:
            typeof rr.rating === "number"
              ? (rr.rating as number)
              : Number(rr.rating as string) || 0,
          reviewText:
            typeof rr.comment === "string" ? (rr.comment as string) : "",
          date:
            rr.createdAt && typeof rr.createdAt === "string"
              ? (rr.createdAt as string).split("T")[0]
              : "",
          likes: 0,
        };
      });

      return {
        id: user.id,
        username: user.name ?? user.email.split("@")[0],
        email: user.email,
        joinDate: user.createdAt.toISOString().split("T")[0],
        bio: "",
        stats: { reviews: reviews.length, favorites: 0, watchlist: 0 },
        reviews,
        favorites: [],
        watchlist: [],
      };
    }

    // Demo fallback when no user id provided (useful for frontend development)
    return {
      id: 1,
      username: "tv_enthusiast",
      email: "user@example.com",
      joinDate: "2023-01-01",
      bio: "Love watching TV shows and sharing my thoughts! Huge fan of sci-fi and drama series.",
      stats: {
        reviews: 2,
        favorites: 3,
        watchlist: 2,
      },
      reviews: [
        {
          id: 1,
          showId: 1,
          showTitle: "Breaking Bad",
          showImage:
            "https://via.placeholder.com/150x225/4F46E5/FFFFFF?text=Breaking+Bad",
          rating: 5,
          reviewText:
            "Absolutely phenomenal! One of the best TV shows ever made. The character development and storytelling are unmatched.",
          date: "2024-01-15",
          likes: 24,
        },
        {
          id: 2,
          showId: 2,
          showTitle: "Stranger Things",
          showImage:
            "https://via.placeholder.com/150x225/7C3AED/FFFFFF?text=Stranger+Things",
          rating: 4,
          reviewText:
            "Great nostalgia vibes and excellent acting from the young cast. Season 1 was the strongest.",
          date: "2024-01-10",
          likes: 18,
        },
      ],
      favorites: [
        {
          id: 1,
          title: "Breaking Bad",
          image:
            "https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=Breaking+Bad",
          rating: 4.8,
        },
        {
          id: 3,
          title: "The Office",
          image:
            "https://via.placeholder.com/200x300/2563EB/FFFFFF?text=The+Office",
          rating: 4.7,
        },
        {
          id: 4,
          title: "Game of Thrones",
          image:
            "https://via.placeholder.com/200x300/DC2626/FFFFFF?text=Game+of+Thrones",
          rating: 4.5,
        },
      ],
      watchlist: [
        {
          id: 7,
          title: "The Last of Us",
          image:
            "https://via.placeholder.com/200x300/EA580C/FFFFFF?text=Last+of+Us",
          rating: 4.9,
        },
        {
          id: 8,
          title: "Wednesday",
          image:
            "https://via.placeholder.com/200x300/64748B/FFFFFF?text=Wednesday",
          rating: 4.3,
        },
      ],
    };
  });

  // PUT /api/profile - update profile fields (currently supports updating username/name)
  fastify.put("/api/profile", async (request, reply) => {
    const req = request as FastifyRequest & {
      user?: AuthUser;
      query?: Record<string, unknown>;
    };
    const body = request.body as unknown as {
      username?: string;
      name?: string;
    };
    const authUser = req.user;

    // Determine target user id: prefer authenticated identity, then X-User-Id header or ?id= query param
    let targetId: number | undefined;
    if (authUser && (authUser.id || authUser.username || authUser.email)) {
      if (authUser.id) targetId = Number(authUser.id);
    }

    const headerId = request.headers["x-user-id"] as string | undefined;
    const queryId = req.query?.id;
    if (!targetId && (headerId || queryId)) {
      const maybe = headerId ?? queryId;
      const num = Number(maybe);
      if (Number.isInteger(num) && num > 0) targetId = num;
    }

    if (!targetId) {
      reply.code(401);
      return { error: "No authenticated user or id provided" };
    }

    // Only supported update today: username/name
    const newName = body.username ?? body.name;
    if (!newName || typeof newName !== "string") {
      reply.code(400);
      return { error: "Missing or invalid 'username' in body" };
    }

    // Ensure user exists
    const existing = await fastify.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!existing) {
      reply.code(404);
      return { error: "User not found" };
    }

    // Update the name and return the same shape as GET /api/profile
    const updated = await fastify.prisma.user.update({
      where: { id: targetId },
      data: { name: String(newName) },
      include: {
        reviews: { include: { show: true }, orderBy: { createdAt: "desc" } },
        favorites: { include: { show: true } },
        watchlist: { include: { show: true } },
      },
    });

    const reviews = (updated.reviews || []).map((r: unknown) => {
      const rr = r as Record<string, unknown>;
      return {
        id: Number(rr.id as number | string),
        showId: Number(rr.showId as number | string),
        showTitle: (() => {
          const s = rr.show as Record<string, unknown> | undefined;
          if (s) {
            if (typeof s.title === "string") return s.title;
            if (typeof s.name === "string") return s.name;
          }
          return null;
        })(),
        showImage: (() => {
          const s = rr.show as Record<string, unknown> | undefined;
          return s && typeof s.posterPath === "string" ? s.posterPath : null;
        })(),
        rating:
          typeof rr.rating === "number"
            ? rr.rating
            : Number(String(rr.rating)) || 0,
        reviewText: typeof rr.comment === "string" ? rr.comment : "",
        date:
          rr.createdAt && typeof rr.createdAt === "string"
            ? rr.createdAt.split("T")[0]
            : "",
        likes: 0,
      };
    });

    const favorites = (updated.favorites || []).map((f: unknown) => {
      const ff = f as Record<string, unknown>;
      const show = ff.show as Record<string, unknown> | undefined;
      return {
        id:
          show && show.id
            ? Number(show.id as number | string)
            : Number(ff.showId as number | string),
        title: show?.title ?? null,
        image: show?.posterPath ?? null,
        rating: null,
      };
    });

    const watchlist = (updated.watchlist || []).map((w: unknown) => {
      const ww = w as Record<string, unknown>;
      const show = ww.show as Record<string, unknown> | undefined;
      return {
        id:
          show && show.id
            ? Number(show.id as number | string)
            : Number(ww.showId as number | string),
        title: show?.title ?? null,
        image: show?.posterPath ?? null,
        rating: null,
      };
    });

    return {
      id: updated.id,
      username: updated.name ?? updated.email.split("@")[0],
      email: updated.email,
      joinDate: updated.createdAt.toISOString().split("T")[0],
      bio: "",
      stats: {
        reviews: reviews.length,
        favorites: favorites.length,
        watchlist: watchlist.length,
      },
      reviews,
      favorites,
      watchlist,
    };
  });
};

export default profile;
