import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import Support from "../../src/plugins/support.js";

describe("support plugin", () => {
  it("works standalone", async () => {
    const fastify = Fastify();
    await fastify.register(Support);
    await fastify.ready();

    expect(fastify.someSupport()).toBe("hugs");

    await fastify.close();
  });
});
