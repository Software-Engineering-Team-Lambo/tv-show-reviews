import { FastifyPluginAsync } from "fastify";
import type { FastifyRequest } from "fastify";

type SearchRequestBody = {
  query: string;
};

// this is just a demo route, you can delete it
// just so you know how to add routes and how it works with the web app
const search: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post(
    "/api/search",
    async function (
      request: FastifyRequest<{ Body: SearchRequestBody }>,
      reply
    ) {
      const body = request.body;

      const results = await fastify.prisma.show.findMany({
        where: {
          OR: [
            {
              title: {
                contains: body.query,
              },
            },
            {
              description: {
                contains: body.query,
              },
            },
          ],
        },
      });

      reply.send(results);
    }
  );
};

export default search;
