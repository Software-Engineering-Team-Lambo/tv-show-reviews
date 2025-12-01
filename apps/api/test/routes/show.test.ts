import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("GET /show/:id", () => {
  let app: FastifyInstance;
  let firstShow: { id: number; title: string };

  beforeAll(async () => {
    app = await buildApp();
    // Get the first show from the seeded database
    const show = await prisma.show.findFirst({
      orderBy: { id: "asc" },
    });
    if (!show) throw new Error("No shows found in test database");
    firstShow = show;
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("should return 400 for non-numeric id", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/show/abc",
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Bad Request");
    expect(body.message).toContain("Invalid show ID");
  });

  it("should return 400 for negative id", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/show/-5",
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Bad Request");
    expect(body.message).toContain("Invalid show ID");
  });

  it("should return 404 for non-existent show", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/show/999999999",
    });

    expect(response.statusCode).toBe(404);
    const body = JSON.parse(response.payload);
    expect(body.error).toBe("Not Found");
    expect(body.message).toContain("Show not found");
  });

  it("should return show details for a valid show", async () => {
    const response = await app.inject({
      method: "GET",
      url: `/show/${firstShow.id}`,
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.payload);

    // Check basic show data
    expect(body.id).toBe(firstShow.id);
    expect(body.title).toBe(firstShow.title);
    expect(body).toHaveProperty("description");
    expect(body).toHaveProperty("status");

    // Check that related data is included
    expect(body).toHaveProperty("genres");
    expect(Array.isArray(body.genres)).toBe(true);

    expect(body).toHaveProperty("cast");
    expect(Array.isArray(body.cast)).toBe(true);

    expect(body).toHaveProperty("creators");
    expect(Array.isArray(body.creators)).toBe(true);

    expect(body).toHaveProperty("reviews");
    expect(Array.isArray(body.reviews)).toBe(true);

    // Check rating stats
    expect(body).toHaveProperty("averageRating");
    expect(body).toHaveProperty("reviewCount");
    expect(typeof body.reviewCount).toBe("number");
  });

  it("should limit cast to 15 members sorted by order", async () => {
    // Find a show that has more than 15 cast members
    const showWithManyCast = await prisma.show.findFirst({
      where: {
        cast: {
          some: {},
        },
      },
      include: {
        _count: {
          select: { cast: true },
        },
      },
      orderBy: {
        cast: {
          _count: "desc",
        },
      },
    });

    if (!showWithManyCast || showWithManyCast._count.cast <= 15) {
      console.log("Skipping cast limit test - no show with >15 cast members");
      return;
    }

    const response = await app.inject({
      method: "GET",
      url: `/show/${showWithManyCast.id}`,
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.payload);

    // Should be limited to 15
    expect(body.cast.length).toBeLessThanOrEqual(15);

    // Should be sorted by order
    for (let i = 1; i < body.cast.length; i++) {
      const prevOrder = body.cast[i - 1].order ?? Infinity;
      const currOrder = body.cast[i].order ?? Infinity;
      expect(prevOrder).toBeLessThanOrEqual(currOrder);
    }
  });

  it("should include user info in reviews", async () => {
    // Find a show that has reviews
    const showWithReviews = await prisma.show.findFirst({
      where: {
        reviews: {
          some: {},
        },
      },
    });

    if (!showWithReviews) {
      console.log("Skipping review test - no shows with reviews");
      return;
    }

    const response = await app.inject({
      method: "GET",
      url: `/show/${showWithReviews.id}`,
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.payload);

    expect(body.reviews.length).toBeGreaterThan(0);
    expect(body.reviews[0]).toHaveProperty("user");
    expect(body.reviews[0].user).toHaveProperty("name");
  });
});
