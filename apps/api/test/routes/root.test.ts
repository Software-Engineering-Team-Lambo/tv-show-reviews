import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helper.js";

describe("GET /", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns root response", async () => {
    const res = await app.inject({
      url: "/",
    });
    expect(JSON.parse(res.payload)).toEqual({ root: true });
  });
});
