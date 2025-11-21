import "dotenv/config";
import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import app from "./app.js";

async function start() {
  const server = Fastify({ logger: true });
  server.withTypeProvider<TypeBoxTypeProvider>();

  // Register the application plugin (from app.ts)
  await server.register(app);

  const host = process.env.FASTIFY_ADDRESS || "0.0.0.0";
  const port = Number(process.env.FASTIFY_PORT || process.env.PORT || 3000);

  await server.listen({ host, port });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
