import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("Favorite Routes", () => {
  let app: FastifyInstance;
  let authToken: string;
  let testUserId: number;
  let testShowId: number;
  const testUser = {
    username: "favtest123",
    email: "favtest123@example.com",
    password: "securePassword123",
  };

  beforeAll(async () => {
    app = await buildApp();

    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    // Create test user and get token
    const signupResponse = await app.inject({
      method: "POST",
      url: "/api/loginSignup/signup",
      payload: testUser,
    });

    const tokenCookie = signupResponse.cookies.find((c) => c.name === "token");
    authToken = tokenCookie!.value;

    const body = JSON.parse(signupResponse.payload);
    testUserId = body.user.id;

    // Get a show for testing
    const show = await prisma.show.findFirst();
    if (!show) throw new Error("No shows found in test database");
    testShowId = show.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.favorite.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up favorites before each test
    await prisma.favorite.deleteMany({ where: { userId: testUserId } });
  });

  describe("POST /api/favorites", () => {
    it("should add a show to favorites when authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/favorites",
        cookies: { token: authToken },
        payload: { showId: testShowId },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);

      // Verify in database
      const favorite = await prisma.favorite.findUnique({
        where: { userId_showId: { userId: testUserId, showId: testShowId } },
      });
      expect(favorite).not.toBeNull();
    });

    it("should be idempotent - return success if already favorited", async () => {
      // First add
      await app.inject({
        method: "POST",
        url: "/api/favorites",
        cookies: { token: authToken },
        payload: { showId: testShowId },
      });

      // Second add should also succeed
      const response = await app.inject({
        method: "POST",
        url: "/api/favorites",
        cookies: { token: authToken },
        payload: { showId: testShowId },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/favorites",
        payload: { showId: testShowId },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 for non-existent show", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/favorites",
        cookies: { token: authToken },
        payload: { showId: 999999 },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should reject invalid showId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/favorites",
        cookies: { token: authToken },
        payload: { showId: -1 },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/favorites/:showId", () => {
    beforeEach(async () => {
      // Add a favorite before each delete test
      await prisma.favorite.create({
        data: { userId: testUserId, showId: testShowId },
      });
    });

    it("should remove a show from favorites when authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/favorites/${testShowId}`,
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);

      // Verify removed from database
      const favorite = await prisma.favorite.findUnique({
        where: { userId_showId: { userId: testUserId, showId: testShowId } },
      });
      expect(favorite).toBeNull();
    });

    it("should be idempotent - return success if not in favorites", async () => {
      // First delete
      await app.inject({
        method: "DELETE",
        url: `/api/favorites/${testShowId}`,
        cookies: { token: authToken },
      });

      // Second delete should also succeed
      const response = await app.inject({
        method: "DELETE",
        url: `/api/favorites/${testShowId}`,
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/favorites/${testShowId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid showId", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/api/favorites/invalid",
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
