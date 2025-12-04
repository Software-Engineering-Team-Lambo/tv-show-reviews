import type { FastifyPluginAsync } from "fastify";
import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import type {
  SearchResult,
  FilterOptions,
  SortBy,
  ShowWhereInput,
  ShowOrderByInput,
} from "../types/search.js";

// Define the search request schema
const SearchBodySchema = Type.Object({
  query: Type.Optional(Type.String()),
  genres: Type.Optional(Type.Array(Type.String())),
  year: Type.Optional(Type.Number()),
  sortBy: Type.Optional(
    Type.Union([
      Type.Literal("rating"),
      Type.Literal("reviews"),
      Type.Literal("year"),
      Type.Literal("title"),
    ])
  ),
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 50, default: 20 })),
});

type SearchBody = Static<typeof SearchBodySchema>;

interface SearchResponse {
  results: SearchResult[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const search: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  // POST /api/search - Search shows with filters and sorting
  fastify.post<{ Body: SearchBody }>(
    "/api/search",
    {
      schema: {
        body: SearchBodySchema,
      },
    },
    async function (request, reply) {
      const {
        query,
        genres,
        year,
        sortBy = "rating",
        page = 1,
        limit = 20,
      } = request.body;

      // Build the where clause with proper typing
      const whereClause: ShowWhereInput = {};

      // Add text search if query provided
      if (query && query.trim()) {
        whereClause.OR = [
          {
            title: {
              contains: query,
            },
          },
          {
            description: {
              contains: query,
            },
          },
          {
            cast: {
              some: {
                actor: {
                  name: {
                    contains: query,
                  },
                },
              },
            },
          },
          {
            creators: {
              some: {
                creator: {
                  name: {
                    contains: query,
                  },
                },
              },
            },
          },
        ];
      }

      // Add year filter if provided (filter by releaseDate year)
      if (year) {
        whereClause.releaseDate = {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`),
        };
      }

      // Add genre filter if provided
      if (genres && genres.length > 0) {
        whereClause.genres = {
          some: {
            genre: {
              name: {
                in: genres,
              },
            },
          },
        };
      }

      // Build the orderBy clause with proper typing
      const orderBy: ShowOrderByInput = (() => {
        const sortByValue = sortBy as SortBy;
        switch (sortByValue) {
          case "rating":
            // Sort by average rating (need to calculate)
            return { reviews: { _count: "desc" } }; // Fallback to review count for now
          case "reviews":
            return { reviews: { _count: "desc" } };
          case "year":
            return { releaseDate: "desc" };
          case "title":
            return { title: "asc" };
          default:
            return { createdAt: "desc" };
        }
      })();

      // Get total count for pagination
      const totalCount = await fastify.prisma.show.count({
        where: whereClause,
      });

      // Calculate pagination values
      const skip = (page - 1) * limit;
      const totalPages = Math.ceil(totalCount / limit);
      const hasMore = page < totalPages;

      // Run both queries in parallel for better performance
      const [results, ratingAggregates] = await Promise.all([
        // Fetch results with genres and aggregated review data
        fastify.prisma.show.findMany({
          where: whereClause,
          include: {
            genres: {
              include: {
                genre: true,
              },
            },
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        // Get average ratings for all matching shows in parallel
        fastify.prisma.review.groupBy({
          by: ["showId"],
          where: {
            show: whereClause,
          },
          _avg: {
            rating: true,
          },
        }),
      ]);

      // Create a map for quick lookup
      const ratingMap = new Map(
        ratingAggregates.map((agg) => [agg.showId, agg._avg.rating ?? 0])
      );

      // Transform results to include calculated fields
      const transformedResults: SearchResult[] = results.map((show) => {
        const avgRating = ratingMap.get(show.id) ?? 0;

        return {
          id: show.id,
          title: show.title,
          description: show.description,
          posterPath: show.posterPath,
          releaseDate: show.releaseDate,
          genres: show.genres.map((g) => g.genre.name),
          rating: avgRating,
          reviewCount: show._count.reviews,
          createdAt: show.createdAt,
          updatedAt: show.updatedAt,
        };
      });

      // Re-sort by rating if needed (since we calculate it after query)
      if (sortBy === "rating") {
        transformedResults.sort((a, b) => b.rating - a.rating);
      }

      const response: SearchResponse = {
        results: transformedResults,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasMore,
        },
      };

      reply.send(response);
    }
  );

  // GET /api/search/filters - Get available genres and years
  fastify.get("/api/search/filters", async function (request, reply) {
    // Run both queries in parallel for better performance
    const [genres, years] = await Promise.all([
      // Get all genres
      fastify.prisma.genre.findMany({
        orderBy: {
          name: "asc",
        },
      }),
      // Get unique years from shows (extract from releaseDate)
      fastify.prisma.$queryRaw<{ year: bigint }[]>`
        SELECT DISTINCT YEAR(\`releaseDate\`) AS year
        FROM \`Show\`
        WHERE \`releaseDate\` IS NOT NULL
        ORDER BY year DESC;
      `,
    ]);

    const filterOptions: FilterOptions = {
      genres: genres.map((g) => g.name),
      years: years.map((y) => Number(y.year)),
    };

    reply.send(filterOptions);
  });
};

export default search;
