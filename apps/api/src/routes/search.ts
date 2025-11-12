import { FastifyPluginAsync } from "fastify";
import { Static, Type } from "@sinclair/typebox";

// Define the schema
const SearchBodySchema = Type.Object({
  query: Type.String({ minLength: 1 }),
});

// Infer the TypeScript type from the schema
type SearchBody = Static<typeof SearchBodySchema>;

const search: FastifyPluginAsync = async (fastify, _opts): Promise<void> => {
  fastify.post<{ Body: SearchBody }>(
    "/api/search",
    {
      schema: {
        body: SearchBodySchema,
      },
    },
    async function (request, reply) {
      const { query } = request.body;

      const results = await fastify.prisma.show.findMany({
        where: {
          OR: [
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
          ],
        },
      });

      reply.send(results);
    }
  );
};

export default search;
