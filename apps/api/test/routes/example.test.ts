import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { FastifyInstance } from "fastify";
import { buildApp } from "../helper.js";

describe("GET /example", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns example message", async () => {
    const res = await app.inject({
      url: "/example",
    });

    expect(res.payload).toBe("this is an example");
  });
});
