import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("Authentication Routes", () => {
  let app: FastifyInstance;
  const testUser = {
    username: "testuser123",
    email: "testuser123@example.com",
    password: "securePassword123",
  };

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: testUser.email },
          { username: testUser.username },
          { email: "another@example.com" },
          { username: "anotheruser" },
        ],
      },
    });
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up test user before each test
    await prisma.user.deleteMany({
      where: {
        OR: [{ email: testUser.email }, { username: testUser.username }],
      },
    });
  });

  describe("POST /api/login-signup/signup", () => {
    it("should create a new user and set auth cookie", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: testUser,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("user");
      expect(body.user.username).toBe(testUser.username);
      expect(body.user.email).toBe(testUser.email);
      expect(body.user).not.toHaveProperty("password");
      expect(body.user).not.toHaveProperty("password_hash");

      // Check that cookie is set
      const cookies = response.cookies;
      const tokenCookie = cookies.find((c) => c.name === "token");
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie?.httpOnly).toBe(true);
    });

    it("should reject duplicate email", async () => {
      // First signup
      await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: testUser,
      });

      // Try to signup with same email
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "differentuser",
          email: testUser.email,
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toContain("email");
    });

    it("should reject duplicate username", async () => {
      // First signup
      await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: testUser,
      });

      // Try to signup with same username
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: testUser.username,
          email: "different@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toContain("Username");
    });

    // Validation tests
    it("should reject username shorter than 4 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "abc",
          email: "test@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject username longer than 16 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "thisusernameiswaytoolong",
          email: "test@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject username with invalid characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "user@name!",
          email: "test@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject invalid email format", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "validuser",
          email: "notanemail",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject password shorter than 8 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "validuser",
          email: "test@example.com",
          password: "short",
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject missing required fields", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: {
          username: "validuser",
          // missing email and password
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/login-signup/login", () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: testUser,
      });
    });

    it("should login with valid email and password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/login",
        payload: {
          emailOrUsername: testUser.email,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("user");
      expect(body.user.email).toBe(testUser.email);

      // Check that cookie is set
      const cookies = response.cookies;
      const tokenCookie = cookies.find((c) => c.name === "token");
      expect(tokenCookie).toBeDefined();

      // Verify the token works for authenticated requests
      const meResponse = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        cookies: { token: tokenCookie!.value },
      });
      expect(meResponse.statusCode).toBe(200);
      const meBody = JSON.parse(meResponse.payload);
      expect(meBody.user.email).toBe(testUser.email);
    });

    it("should login with valid username and password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/login",
        payload: {
          emailOrUsername: testUser.username,
          password: testUser.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("user");
      expect(body.user.username).toBe(testUser.username);
    });

    it("should reject invalid password", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/login",
        payload: {
          emailOrUsername: testUser.email,
          password: "wrongpassword",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject non-existent user", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/login",
        payload: {
          emailOrUsername: "nonexistent@example.com",
          password: "password123",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject empty credentials", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/login-signup/login",
        payload: {
          emailOrUsername: "",
          password: "",
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/login-signup/logout", () => {
    it("should clear the auth cookie", async () => {
      // First login to get a cookie
      const loginResponse = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: testUser,
      });

      const tokenCookie = loginResponse.cookies.find((c) => c.name === "token");
      expect(tokenCookie).toBeDefined();

      // Now logout
      const logoutResponse = await app.inject({
        method: "POST",
        url: "/api/login-signup/logout",
        cookies: { token: tokenCookie!.value },
      });

      expect(logoutResponse.statusCode).toBe(200);
      const body = JSON.parse(logoutResponse.payload);
      expect(body.message).toContain("Logged out");

      // Cookie should be cleared (set to empty or expired)
      const clearedCookie = logoutResponse.cookies.find(
        (c) => c.name === "token"
      );
      expect(
        clearedCookie === undefined ||
          clearedCookie.value === "" ||
          (clearedCookie.expires &&
            new Date(clearedCookie.expires) < new Date())
      ).toBe(true);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user when authenticated", async () => {
      // Signup to get token
      const signupResponse = await app.inject({
        method: "POST",
        url: "/api/login-signup/signup",
        payload: testUser,
      });

      const tokenCookie = signupResponse.cookies.find(
        (c) => c.name === "token"
      );
      expect(tokenCookie).toBeDefined();

      // Get current user
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        cookies: { token: tokenCookie!.value },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("user");
      expect(body.user.username).toBe(testUser.username);
      expect(body.user.email).toBe(testUser.email);
    });

    it("should return 401 without auth cookie", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 401 with invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/auth/me",
        cookies: { token: "invalid-token-here" },
      });

      expect(response.statusCode).toBe(401);
    });
  });
});
