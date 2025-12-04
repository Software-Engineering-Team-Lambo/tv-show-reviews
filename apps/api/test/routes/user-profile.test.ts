import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("Profile Routes", () => {
  let app: FastifyInstance;
  let authToken: string;
  let testUserId: number;
  const testUser = {
    username: "profiletest",
    email: "profiletest@example.com",
    password: "securePassword123",
  };

  beforeAll(async () => {
    app = await buildApp();

    // Clean up any existing test user
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUser.email },
          { username: testUser.username },
          { username: "newusername1" },
          { username: "takenname123" },
        ],
      },
    });

    // Create test user and get token
    const signupResponse = await app.inject({
      method: "POST",
      url: "/api/login-signup/signup",
      payload: testUser,
    });

    const tokenCookie = signupResponse.cookies.find((c) => c.name === "token");
    authToken = tokenCookie!.value;

    const body = JSON.parse(signupResponse.payload);
    testUserId = body.user.id;
  });

  afterAll(async () => {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUser.email },
          { username: testUser.username },
          { username: "newusername1" },
          { username: "takenname123" },
        ],
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  describe("GET /api/profile", () => {
    it("should return profile data when authenticated", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/profile",
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("user");
      expect(body).toHaveProperty("pagination");
      expect(body.user.username).toBe(testUser.username);
      expect(body.user.email).toBe(testUser.email);
      expect(body.user).toHaveProperty("reviews");
      expect(body.user).toHaveProperty("favorites");
      expect(body.user).toHaveProperty("watchlist");
    });

    it("should return 401 without auth cookie", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/profile",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should support tab parameter for selective loading", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/profile?tab=reviews",
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.pagination).toHaveProperty("reviews");
    });

    it("should return pagination info with defaults", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/profile",
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.pagination.reviews).toHaveProperty("page");
      expect(body.pagination.reviews).toHaveProperty("limit");
      expect(body.pagination.reviews.page).toBe(1);
      expect(body.pagination.reviews.limit).toBe(10); // default limit
    });
  });

  describe("PUT /api/profile", () => {
    it("should update username when authenticated", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: "newusername1" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.user.username).toBe("newusername1");

      // Update back to original for other tests
      await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: testUser.username },
      });
    });

    it("should return 401 without auth cookie", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        payload: { username: "newusername" },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject same username as current", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: testUser.username },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toContain("different");
    });

    it("should reject username already taken by another user", async () => {
      // Create another user
      await prisma.user.create({
        data: {
          username: "takenname123",
          email: "taken@example.com",
          password_hash: "hash",
        },
      });

      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: "takenname123" },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toContain("taken");
    });

    // Validation tests
    it("should reject username shorter than 4 characters", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: "abc" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject username longer than 16 characters", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: "thisusernameiswaytoolong" },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject username with invalid characters", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/profile",
        cookies: { token: authToken },
        payload: { username: "user@name!" },
      });

      expect(response.statusCode).toBe(400);
    });
  });
});

describe("Public User Profile Routes", () => {
  let app: FastifyInstance;
  const testUser = {
    username: "publicuser1",
    email: "publicuser1@example.com",
    password: "securePassword123",
  };

  beforeAll(async () => {
    app = await buildApp();

    // Clean up and create test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    await app.inject({
      method: "POST",
      url: "/api/login-signup/signup",
      payload: testUser,
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await app.close();
    await prisma.$disconnect();
  });

  describe("GET /api/users/:username", () => {
    it("should return public profile for existing user", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/users/${testUser.username}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("user");
      expect(body).toHaveProperty("pagination");
      expect(body.user.username).toBe(testUser.username);
      // Email should NOT be in public profile
      expect(body.user).not.toHaveProperty("email");
    });

    it("should return 404 for non-existent user", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/users/nonexistentuser12345",
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return pagination info", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/users/${testUser.username}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.pagination.reviews).toHaveProperty("page");
      expect(body.pagination.reviews).toHaveProperty("limit");
      expect(body.pagination.reviews).toHaveProperty("totalCount");
    });

    it("should hide private notes from watchlist", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/users/${testUser.username}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      // Watchlist items should not have notes (private field)
      body.user.watchlist.forEach((item: Record<string, unknown>) => {
        expect(item).not.toHaveProperty("notes");
      });
    });
  });
});
