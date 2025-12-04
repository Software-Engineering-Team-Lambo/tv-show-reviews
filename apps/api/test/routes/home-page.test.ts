import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("GET /api/home-page", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("should return home page data", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    expect(body).toHaveProperty("popularShows");
    expect(body).toHaveProperty("newReleases");
    expect(body).toHaveProperty("genres");
  });

  it("should return popular shows as an array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    expect(Array.isArray(body.popularShows)).toBe(true);
    expect(body.popularShows.length).toBeGreaterThan(0);
    expect(body.popularShows.length).toBeLessThanOrEqual(10);
  });

  it("should return new releases as an array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    expect(Array.isArray(body.newReleases)).toBe(true);
    expect(body.newReleases.length).toBeGreaterThan(0);
    expect(body.newReleases.length).toBeLessThanOrEqual(10);
  });

  it("should return genres as an array", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    expect(Array.isArray(body.genres)).toBe(true);
    expect(body.genres.length).toBeGreaterThan(0);
  });

  it("should include required fields in popular shows", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    const show = body.popularShows[0];
    expect(show).toHaveProperty("id");
    expect(show).toHaveProperty("title");
    expect(show).toHaveProperty("posterPath");
    expect(show).toHaveProperty("genres");
    expect(show).toHaveProperty("rating");
    expect(show).toHaveProperty("reviewCount");
  });

  it("should include required fields in new releases", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    const show = body.newReleases[0];
    expect(show).toHaveProperty("id");
    expect(show).toHaveProperty("title");
    expect(show).toHaveProperty("posterPath");
    expect(show).toHaveProperty("genres");
    expect(show).toHaveProperty("rating");
    expect(show).toHaveProperty("reviewCount");
  });

  it("should include id and name in genres", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/home-page",
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);

    const genre = body.genres[0];
    expect(genre).toHaveProperty("id");
    expect(genre).toHaveProperty("name");
  });
});
