import { execSync } from "node:child_process";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test environment variables:
// - In CI: env vars are already set by GitHub Actions
// - Locally: load from .env.test file
const envTestPath = path.join(__dirname, "../.env.test");
if (fs.existsSync(envTestPath)) {
  dotenv.config({ path: envTestPath, override: true });
}

export default async function globalSetup() {
  // Skip database reset if SKIP_DB_RESET is set (useful for faster local development)
  if (process.env.SKIP_DB_RESET === "true") {
    console.log("⏭️  Skipping database reset (SKIP_DB_RESET=true)");
    return;
  }

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
