import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("POST /api/search", () => {
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

  it("should return results with pagination when searching by show title", async () => {
    // Use part of the actual show title
    const searchTerm = sampleShow.title.split(" ")[0];

    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { query: searchTerm },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body).toHaveProperty("results");
    expect(body).toHaveProperty("pagination");
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
    expect(body.pagination).toHaveProperty("page");
    expect(body.pagination).toHaveProperty("totalCount");
    expect(body.pagination).toHaveProperty("totalPages");
    expect(body.pagination).toHaveProperty("hasMore");
  });

  it("should return empty results for non-matching query", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { query: "xyznonexistentshow123456" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results).toHaveLength(0);
    expect(body.pagination.totalCount).toBe(0);
  });

  it("should return all shows when no query provided", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: {},
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(Array.isArray(body.results)).toBe(true);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("should include genres in results", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { query: sampleShow.title },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
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
      method: "POST",
      url: "/api/search",
      payload: { query: actor.name },
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
      method: "POST",
      url: "/api/search",
      payload: { query: creator.name },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
  });

  it("should return show with required fields", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { query: sampleShow.title },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    const result = body.results[0];
    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("title");
    expect(result).toHaveProperty("posterPath");
    expect(result).toHaveProperty("genres");
    expect(result).toHaveProperty("rating");
    expect(result).toHaveProperty("reviewCount");
  });

  it("should filter by genre", async () => {
    // Get a genre that has shows
    const genre = await prisma.genre.findFirst({
      where: {
        shows: {
          some: {},
        },
      },
    });

    if (!genre) {
      console.log("Skipping genre filter test - no genres found");
      return;
    }

    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { genres: [genre.name] },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
    // All results should have this genre
    body.results.forEach((show: { genres: string[] }) => {
      expect(show.genres).toContain(genre.name);
    });
  });

  it("should support pagination with page and limit", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { page: 1, limit: 5 },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeLessThanOrEqual(5);
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
  });

  it("should support sorting by different fields", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/search",
      payload: { sortBy: "title" },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.results.length).toBeGreaterThan(0);
  });
});

describe("GET /api/search/filters", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("should return available genres and years", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/search/filters",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    expect(body).toHaveProperty("genres");
    expect(Array.isArray(body.genres)).toBe(true);

    expect(body).toHaveProperty("years");
    expect(Array.isArray(body.years)).toBe(true);
  });
});
