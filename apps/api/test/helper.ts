// This file contains code that we reuse between our tests.
import dotenv from "dotenv";
import path from "node:path";

// Load test environment BEFORE importing anything that uses the database
dotenv.config({ path: path.join(__dirname, "../.env.test") });

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
