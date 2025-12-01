import { FastifyPluginAsync } from "fastify";
import type { HomePageShow, HomePageResponse } from "../types/home-page.js";

const homePage: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get("/api/home-page", async function () {
    // Run all queries in parallel for better performance
    const [popularShowsRaw, newReleasesRaw, genres, ratingAggregates] =
      await Promise.all([
        // Popular shows
        fastify.prisma.show.findMany({
          orderBy: {
            popularity: "desc",
          },
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
          take: 10,
        }),
        // New releases
        fastify.prisma.show.findMany({
          orderBy: {
            releaseDate: "desc",
          },
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
          take: 10,
        }),
        // All genres
        fastify.prisma.genre.findMany({
          orderBy: {
            name: "asc",
          },
        }),
        // Get average ratings for all shows
        fastify.prisma.review.groupBy({
          by: ["showId"],
          _avg: {
            rating: true,
          },
        }),
      ]);

    // Create a map for quick rating lookup
    const ratingMap = new Map(
      ratingAggregates.map((agg) => [agg.showId, agg._avg.rating ?? 0])
    );

    // Transform popular shows
    const popularShows: HomePageShow[] = popularShowsRaw.map((show) => ({
      id: show.id,
      title: show.title,
      description: show.description,
      posterPath: show.posterPath,
      releaseDate: show.releaseDate,
      popularity: show.popularity,
      genres: show.genres.map((g) => g.genre.name),
      rating: ratingMap.get(show.id) ?? 0,
      reviewCount: show._count.reviews,
    }));

    // Transform new releases
    const newReleases: HomePageShow[] = newReleasesRaw.map((show) => ({
      id: show.id,
      title: show.title,
      description: show.description,
      posterPath: show.posterPath,
      releaseDate: show.releaseDate,
      popularity: show.popularity,
      genres: show.genres.map((g) => g.genre.name),
      rating: ratingMap.get(show.id) ?? 0,
      reviewCount: show._count.reviews,
    }));

    const response: HomePageResponse = {
      popularShows,
      newReleases,
      genres,
    };

    return response;
  });
};

export default homePage;
