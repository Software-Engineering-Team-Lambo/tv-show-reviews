import { FastifyPluginAsync } from "fastify";

const homePage: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.get("/api/home-page", async function () {
    const popularShows = await fastify.prisma.show.findMany({
      orderBy: {
        popularity: "desc", // or 'asc'
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      take: 10, // limits to 10 items
    });

    const newReleases = await fastify.prisma.show.findMany({
      orderBy: {
        releaseDate: "desc",
      },
      include: {
        genres: {
          include: {
            genre: true,
          },
        },
      },
      take: 10,
    });

    const genres = await fastify.prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return { popularShows, newReleases, genres };
  });
};

export default homePage;
