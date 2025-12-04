import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("Watchlist Routes", () => {
  let app: FastifyInstance;
  let authToken: string;
  let testUserId: number;
  let testShowId: number;
  const testUser = {
    username: "watchtest1",
    email: "watchtest1@example.com",
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
    await prisma.watchlist.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up watchlist before each test
    await prisma.watchlist.deleteMany({ where: { userId: testUserId } });
  });

  describe("POST /api/watchlist", () => {
    it("should add a show to watchlist when authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: { showId: testShowId },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);

      // Verify in database
      const watchlistItem = await prisma.watchlist.findUnique({
        where: { userId_showId: { userId: testUserId, showId: testShowId } },
      });
      expect(watchlistItem).not.toBeNull();
    });

    it("should add a show with a note", async () => {
      const note = "Need to watch this with friends!";
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: { showId: testShowId, note },
      });

      expect(response.statusCode).toBe(201);

      // Verify note in database
      const watchlistItem = await prisma.watchlist.findUnique({
        where: { userId_showId: { userId: testUserId, showId: testShowId } },
      });
      expect(watchlistItem?.note).toBe(note);
    });

    it("should be idempotent - return success if already in watchlist", async () => {
      // First add
      await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: { showId: testShowId },
      });

      // Second add should also succeed
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: { showId: testShowId },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        payload: { showId: testShowId },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 for non-existent show", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: { showId: 999999 },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should reject invalid showId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: { showId: -1 },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject note longer than 500 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/watchlist",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          note: "a".repeat(501),
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/watchlist/:showId", () => {
    beforeEach(async () => {
      // Add to watchlist before each delete test
      await prisma.watchlist.create({
        data: { userId: testUserId, showId: testShowId },
      });
    });

    it("should remove a show from watchlist when authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/watchlist/${testShowId}`,
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.success).toBe(true);

      // Verify removed from database
      const watchlistItem = await prisma.watchlist.findUnique({
        where: { userId_showId: { userId: testUserId, showId: testShowId } },
      });
      expect(watchlistItem).toBeNull();
    });

    it("should be idempotent - return success if not in watchlist", async () => {
      // First delete
      await app.inject({
        method: "DELETE",
        url: `/api/watchlist/${testShowId}`,
        cookies: { token: authToken },
      });

      // Second delete should also succeed
      const response = await app.inject({
        method: "DELETE",
        url: `/api/watchlist/${testShowId}`,
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/watchlist/${testShowId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject invalid showId", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/api/watchlist/invalid",
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
