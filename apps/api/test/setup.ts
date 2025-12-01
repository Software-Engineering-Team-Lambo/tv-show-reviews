import { execSync } from "node:child_process";
import dotenv from "dotenv";
import path from "node:path";

// Load test environment variables
dotenv.config({ path: path.join(__dirname, "../.env.test") });

export default async function globalSetup() {
  console.log("🧹 Setting up test database...");

  const cwd = path.join(__dirname, "..");
  const env = { ...process.env };

  // Reset the test database - apply schema fresh
  try {
    console.log("📦 Pushing schema to test database...");
    execSync("npx prisma db push --force-reset --skip-generate", {
      env,
      cwd,
      stdio: "inherit",
    });
    console.log("✅ Test database schema applied");
  } catch (error) {
    console.error("❌ Failed to reset test database:", error);
    throw error;
  }

  // Run the real seed script
  try {
    console.log("🌱 Running seed script...");
    execSync("npm run seed", {
      env,
      cwd,
      stdio: "inherit",
    });
    console.log("✅ Test database seeded");
  } catch (error) {
    console.error("❌ Failed to seed test database:", error);
    throw error;
  }
}
