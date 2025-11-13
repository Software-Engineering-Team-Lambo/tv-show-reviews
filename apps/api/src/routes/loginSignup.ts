import { FastifyPluginAsync } from "fastify";
import argon2 from "argon2";

const loginSignup: FastifyPluginAsync = async (fastify) => {
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

      // validate certain username
      if (username.length < 4 || username.length > 16) {
        return reply.status(400).send({
          error: "Username must be greate than 4 and less than 16 characters",
        });
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return reply.status(400).send({
          error:
            "Username can only contain numbers, letters, underscore, and hyphens",
        });
      }

      // hashing the user provided password with argon2
      const password_hash = await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 1,
      });

      // create user
      const user = await fastify.prisma.user.create({
        data: {
          username,
          email,
          password_hash,
        },
        select: {
          id: true,
          username: true,
          email: true,
          createdAt: true,
        },
      });

      return reply.send({ user });
    } catch (error) {
      console.log("Error Signing Up", error);
      return reply.status(500).send({
        message: "Error Signing Up",
      });
    }
  });

  fastify.post("/login", async (request, reply) => {
    const { emailOrUsername, password } = request.body as {
      emailOrUsername: string;
      password: string;
    };

    try {
      if (!emailOrUsername || !password) {
        return reply.status(400).send({
          error: "Need Email and Password to Login",
        });
      }

      //checks if user exists from email or username
      const user = await fastify.prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
        },
      });

      if (!user) {
        return reply.status(401).send({
          error: "User not found from email or username",
        });
      }

      const validatePassword = await argon2.verify(
        user.password_hash,
        password
      );

      if (!validatePassword) {
        return reply.status(401).send({
          message: "Invalid Password",
        });
      }

      return reply.send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
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

export default loginSignup;
