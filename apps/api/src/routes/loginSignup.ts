import type { FastifyPluginAsync } from "fastify";
import { type Static, Type } from "@sinclair/typebox";
import argon2 from "argon2";

// Define the signup request schema
const SignupBodySchema = Type.Object({
  username: Type.String({
    minLength: 4,
    maxLength: 16,
    pattern: "^[a-zA-Z0-9_]+$",
    description:
      "Username must be 4-16 characters and contain only letters, numbers, and underscores",
  }),
  email: Type.String({
    format: "email",
    description: "Valid email address",
  }),
  password: Type.String({
    minLength: 8,
    description: "Password must be at least 8 characters",
  }),
});

type SignupBody = Static<typeof SignupBodySchema>;

// Define the login request schema
const LoginBodySchema = Type.Object({
  emailOrUsername: Type.String({
    minLength: 1,
    description: "Email or username",
  }),
  password: Type.String({
    minLength: 1,
    description: "Password",
  }),
});

type LoginBody = Static<typeof LoginBodySchema>;

const loginSignup: FastifyPluginAsync = async (fastify) => {
  const generateToken = (userId: number) => {
    return fastify.jwt.sign({ userId }, { expiresIn: "7d" });
  };

  fastify.post<{ Body: SignupBody }>(
    "/api/loginSignup/signup",
    {
      schema: {
        body: SignupBodySchema,
      },
    },
    async (request, reply) => {
      const { username, email, password } = request.body;

      try {
        // TypeBox/AJV already validated the format, length, and pattern
        // Now just check if email or username already exists

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

        const token = generateToken(user.id);

        // Set httpOnly cookie instead of returning token
        reply.setCookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        return reply.send({ user });
      } catch (error) {
        console.log("Error Signing Up", error);
        return reply.status(500).send({
          message: "Error Signing Up",
        });
      }
    }
  );

  fastify.post<{ Body: LoginBody }>(
    "/api/loginSignup/login",
    {
      schema: {
        body: LoginBodySchema,
      },
    },
    async (request, reply) => {
      const { emailOrUsername, password } = request.body;

      try {
        // TypeBox/AJV already validated that fields are present

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

        const token = generateToken(user.id);

        // Set httpOnly cookie instead of returning token
        reply.setCookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        });

        return reply.send({ user });
      } catch (error) {
        console.log("Error Logging In", error);
        return reply.status(500).send({
          message: "Error Logging In",
        });
      }
    }
  );

  // Logout route - clears the cookie
  fastify.post("/api/loginSignup/logout", async (_request, reply) => {
    reply.clearCookie("token", {
      path: "/",
    });
    return reply.send({ message: "Logged out successfully" });
  });

  //to be added later
  fastify.post("/api/forgot-password", async (_request, _reply) => {});
};

export default loginSignup;
