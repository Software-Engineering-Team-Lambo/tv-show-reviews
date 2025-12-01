// This file contains code that we reuse between our tests.
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test environment variables:
// - In CI: env vars are already set by GitHub Actions
// - Locally: load from .env.test file
const envTestPath = path.join(__dirname, "../.env.test");
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath, override: true });
}

import Fastify from "fastify";
import { PrismaClient } from "../generated/prisma/index.js";
import app from "../src/app.js";

// Create a Prisma client for test utilities
export const prisma = new PrismaClient();

/**
 * Build a Fastify app instance for testing
 */
export async function buildApp() {
  const fastify = Fastify({
    logger: false, // Disable logging during tests
  });

  await fastify.register(app);
  await fastify.ready();

  return fastify;
}
