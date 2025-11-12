import { FastifyPluginAsync } from "fastify";
import bcrypt from "bcrypt";

const login: FastifyPluginAsync = async (fastify) => {
  fastify.post("/signup", async (request, reply) => {
    const { username, email, password } = request.body as {
      username: string;
      email: string;
      password: string;
    };

    try {
      if (!email || !password) {
        return reply.status(400).send({
          error: "Need Email and Password to Login",
        });
      }

      //check if user with certain email already exists
      const alreadyExistsEmail = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (alreadyExistsEmail) {
        return reply.status(400).send({
          error: "Account with this email already exists",
        });
      }

      //check if username is taken
      const alreadyExistsUsername = await fastify.prisma.user.findUnique({
        where: { username },
      });

      if (alreadyExistsUsername) {
        return reply.status(400).send({
          error: "Username is already taken",
        });
      }
    } catch (error) {
      console.log("Error Signing Up", error);
      return reply.status(500).send({
        message: "Error Signing Up",
      });
    }
  });

  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    try {
      if (!email || !password) {
        return reply.status(400).send({
          error: "Need Email and Password to Login",
        });
      }

      const user = await fastify.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.status(401).send({
          error: "Invalid Email or Password",
        });
      }

      const password = await bcrypt.compare(password, user.password_hash);

      if (!password) {
        return reply.status(401).send({
          message: "Invalid Email or Password",
        });
      }
    } catch (error) {
      console.log("Error Loging In", error);
      return reply.status(500).send({
        message: "Error Loginig In",
      });
    }
  });

  //to be added later
  fastify.post("forgot-password", async (request, reply) => {});
};
