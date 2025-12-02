"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.default = (0, fastify_plugin_1.default)(async (fastify, _opts) => {
  //fastify.decorateRequest("user", null);
  fastify.addHook("preHandler", async (request, _reply) => {
    const headerUsername = request.headers["x-username"] || undefined;
    const headerId = request.headers["x-user-id"] || undefined;
    const headerEmail = request.headers["x-email"] || undefined;
    if (headerUsername || headerId || headerEmail) {
      const user = {};
      if (headerId) user.id = Number(headerId);
      if (headerUsername) user.username = headerUsername;
      if (headerEmail) user.email = headerEmail;
      request.user = user;
      return;
    }
    const devAuth = String(process.env.DEV_AUTH || "false").toLowerCase();
    if (devAuth === "true") {
      request.user = {
        id: 1,
        username: "tv_enthusiast",
        email: "user@example.com",
      };
    }
  });
});
//# sourceMappingURL=dev-auth.js.map
