// Note: dotenv is loaded in app.ts which supports DOTENV_CONFIG_PATH
import Fastify from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import app from "./app.js";

async function start() {
  const server = Fastify({
    logger: true,
    // Trust proxy headers (X-Forwarded-*) from Caddy reverse proxy in production
    // This ensures correct client IP logging and protocol detection
    trustProxy: process.env.NODE_ENV === "production",
  });
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
