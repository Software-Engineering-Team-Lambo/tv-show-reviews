import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("GET /search", () => {
  let app: FastifyInstance;
  let sampleShow: { id: number; title: string };

  beforeAll(async () => {
    app = await buildApp();
    // Get a show to use for search tests
    const show = await prisma.show.findFirst({
      orderBy: { id: "asc" },
    });
    if (!show) throw new Error("No shows found in test database");
    sampleShow = show;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("should return results when searching by show title", async () => {
    // Use part of the actual show title
    const searchTerm = sampleShow.title.split(" ")[0];

    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(searchTerm)}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("should return empty results for non-matching query", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/search?q=xyznonexistentshow123",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results).toHaveLength(0);
  });

  it("should be case insensitive", async () => {
    const searchTerm = sampleShow.title.toLowerCase();

    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(searchTerm)}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("should include genres in results", async () => {
    const searchTerm = sampleShow.title.split(" ")[0];

    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(searchTerm)}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results[0]).toHaveProperty("genres");
    expect(Array.isArray(body.results[0].genres)).toBe(true);
  });

  it("should search by actor name", async () => {
    // Find an actor in the database
    const actor = await prisma.actor.findFirst({
      where: {
        shows: {
          some: {},
        },
      },
    });

    if (!actor) {
      console.log("Skipping actor search test - no actors found");
      return;
    }

    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(actor.name)}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("should search by creator name", async () => {
    // Find a creator in the database
    const creator = await prisma.creator.findFirst({
      where: {
        shows: {
          some: {},
        },
      },
    });

    if (!creator) {
      console.log("Skipping creator search test - no creators found");
      return;
    }

    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(creator.name)}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("should handle empty query string", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/search?q=",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("results");
    expect(Array.isArray(body.results)).toBe(true);
  });

  it("should return show with required fields", async () => {
    const searchTerm = sampleShow.title.split(" ")[0];

    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(searchTerm)}`,
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    const result = body.results[0];
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("posterPath");
    expect(result).toHaveProperty("genres");
  });
});
