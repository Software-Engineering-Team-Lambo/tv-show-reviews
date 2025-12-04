import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp, prisma } from "../helper.js";

describe("Review Routes", () => {
  let app: FastifyInstance;
  let authToken: string;
  let testUserId: number;
  let testShowId: number;
  const testUser = {
    username: "reviewtest1",
    email: "reviewtest1@example.com",
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
      url: "/api/login-signup/signup",
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
    await prisma.review.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { email: testUser.email } });
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up reviews before each test
    await prisma.review.deleteMany({ where: { userId: testUserId } });
  });

  describe("GET /api/reviews", () => {
    it("should return paginated reviews for a show", async () => {
      // Create a review first
      await prisma.review.create({
        data: {
          userId: testUserId,
          showId: testShowId,
          rating: 4,
          comment: "Great show!",
        },
      });

      const response = await app.inject({
        method: "GET",
        url: `/api/reviews?showId=${testShowId}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty("reviews");
      expect(body).toHaveProperty("pagination");
      expect(Array.isArray(body.reviews)).toBe(true);
      expect(body.pagination).toHaveProperty("page");
      expect(body.pagination).toHaveProperty("totalCount");
    });

    it("should support pagination parameters", async () => {
      const response = await app.inject({
        method: "GET",
        url: `/api/reviews?showId=${testShowId}&page=1&limit=5`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.pagination.page).toBe(1);
      expect(body.pagination.limit).toBe(5);
    });

    it("should return 400 for missing showId", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/reviews",
      });

      expect(response.statusCode).toBe(400);
    });

    it("should return 400 for invalid showId", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/reviews?showId=invalid",
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("POST /api/reviews", () => {
    it("should create a review when authenticated", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
          comment: "Amazing show, highly recommend!",
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.rating).toBe(5);
      expect(body.comment).toBe("Amazing show, highly recommend!");
      expect(body.username).toBe(testUser.username);
    });

    it("should create a review without comment", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 4,
        },
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.rating).toBe(4);
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        payload: {
          showId: testShowId,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 for non-existent show", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: 999999,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should reject duplicate review for same show", async () => {
      // First review
      await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
        },
      });

      // Second review should fail
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 4,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.error).toContain("already reviewed");
    });

    // Validation tests
    it("should reject rating below 1", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 0,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject rating above 5", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 6,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject comment longer than 5000 characters", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
          comment: "a".repeat(5001),
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it("should reject invalid showId", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/api/reviews",
        cookies: { token: authToken },
        payload: {
          showId: -1,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("PUT /api/reviews/:id", () => {
    let reviewId: number;

    beforeEach(async () => {
      // Create a review to update
      const review = await prisma.review.create({
        data: {
          userId: testUserId,
          showId: testShowId,
          rating: 3,
          comment: "Original comment",
        },
      });
      reviewId = review.id;
    });

    it("should update own review when authenticated", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/reviews/${reviewId}`,
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
          comment: "Updated comment",
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.rating).toBe(5);
      expect(body.comment).toBe("Updated comment");

      // Verify update persisted in database
      const updatedReview = await prisma.review.findUnique({
        where: { id: reviewId },
      });
      expect(updatedReview?.rating).toBe(5);
      expect(updatedReview?.comment).toBe("Updated comment");
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "PUT",
        url: `/api/reviews/${reviewId}`,
        payload: {
          showId: testShowId,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 for non-existent review", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/reviews/999999",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 403 when trying to update another user's review", async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          username: "otheruser99",
          email: "otheruser99@example.com",
          password_hash: "hash",
        },
      });

      // Create a review by other user
      const otherReview = await prisma.review.create({
        data: {
          userId: otherUser.id,
          showId: testShowId,
          rating: 3,
        },
      });

      // Try to update it with our auth
      const response = await app.inject({
        method: "PUT",
        url: `/api/reviews/${otherReview.id}`,
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(403);

      // Clean up
      await prisma.review.delete({ where: { id: otherReview.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it("should reject invalid review ID", async () => {
      const response = await app.inject({
        method: "PUT",
        url: "/api/reviews/invalid",
        cookies: { token: authToken },
        payload: {
          showId: testShowId,
          rating: 5,
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe("DELETE /api/reviews/:id", () => {
    let reviewId: number;

    beforeEach(async () => {
      // Create a review to delete
      const review = await prisma.review.create({
        data: {
          userId: testUserId,
          showId: testShowId,
          rating: 3,
          comment: "To be deleted",
        },
      });
      reviewId = review.id;
    });

    it("should delete own review when authenticated", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/reviews/${reviewId}`,
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.message).toContain("deleted");

      // Verify deleted from database
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });
      expect(review).toBeNull();
    });

    it("should return 401 without auth", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: `/api/reviews/${reviewId}`,
      });

      expect(response.statusCode).toBe(401);
    });

    it("should return 404 for non-existent review", async () => {
      const response = await app.inject({
        method: "DELETE",
        url: "/api/reviews/999999",
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(404);
    });

    it("should return 403 when trying to delete another user's review", async () => {
      // Create another user
      const otherUser = await prisma.user.create({
        data: {
          username: "delother99",
          email: "delother99@example.com",
          password_hash: "hash",
        },
      });

      // Create a review by other user
      const otherReview = await prisma.review.create({
        data: {
          userId: otherUser.id,
          showId: testShowId,
          rating: 3,
        },
      });

      // Try to delete it with our auth
      const response = await app.inject({
        method: "DELETE",
        url: `/api/reviews/${otherReview.id}`,
        cookies: { token: authToken },
      });

      expect(response.statusCode).toBe(403);

      // Clean up
      await prisma.review.delete({ where: { id: otherReview.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });
  });
});
