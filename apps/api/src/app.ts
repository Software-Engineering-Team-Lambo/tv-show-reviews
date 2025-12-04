import { join } from "node:path";
import AutoLoad from "@fastify/autoload";
import type { AutoloadPluginOptions } from "@fastify/autoload";
import type { FastifyPluginAsync, FastifyServerOptions } from "fastify";
import { TypeBoxValidatorCompiler } from "@fastify/type-provider-typebox";
import fastifyJwt from "@fastify/jwt";
import fastifyCookie from "@fastify/cookie";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Load environment variables:
// - In CI: env vars are already set, dotenv just fills in any gaps
// - Locally with DOTENV_CONFIG_PATH: load from that file (e.g., .env.test for E2E tests)
// - Locally otherwise: load from .env
dotenv.config({
  path: process.env.DOTENV_CONFIG_PATH || ".env",
  override: false, // Don't override existing env vars (CI sets them directly)
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Set up TypeBox validator with AJV
  fastify.setValidatorCompiler(TypeBoxValidatorCompiler);

  // Place here your custom code!

  // Register cookie support (required for JWT cookies)
  void fastify.register(fastifyCookie);

  // Register JWT with cookie support
  void fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "your-secret-key-change-in-production",
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options };
