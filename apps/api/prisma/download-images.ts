import { PrismaClient } from "../generated/prisma/index.js";
import {
  getTmdbConfiguration,
  setupImagesDirectory,
  downloadShowPoster,
} from "./lib/image-downloader.js";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env from apps/api/.env
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

/**
 * Download Images Script
 *
 * Downloads poster images for all shows in the database.
 * This can be run separately from seeding, useful for CI/CD pipelines.
 *
 * Used by GitHub Actions during deployment to ensure images are bundled
 * with the static build even if the database has new shows.
 */

async function main() {
  console.log("🖼️  Starting image download...");

  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB_API_KEY environment variable is not set");
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log("✅ Database connection successful");
    } catch (error) {
      console.error("❌ Failed to connect to database:", error);
      throw new Error(
        "Cannot connect to database. Ensure DATABASE_URL is correct and database is accessible."
      );
    }

    // Get TMDB configuration for image URLs
    const tmdbConfig = await getTmdbConfiguration(apiKey);
    const imageBaseUrl = tmdbConfig.images.secure_base_url;

    // Setup images directory
    setupImagesDirectory();

    // Get all shows from database with error handling for schema mismatch
    let shows;
    try {
      shows = await prisma.show.findMany({
        select: {
          id: true,
          title: true,
          posterPath: true,
        },
      });
    } catch (error: any) {
      if (error.code === "P2021" || error.message?.includes("posterPath")) {
        console.error(
          "❌ Schema mismatch detected: 'posterPath' column may not exist in database."
        );
        console.error("Run migrations first: npx prisma migrate deploy");
        throw new Error(
          "Database schema is out of sync. Run migrations before downloading images."
        );
      }
      throw error;
    }

    if (shows.length === 0) {
      console.log("⚠️  No shows found in database. Run seed script first.");
      return;
    }

    console.log(`Found ${shows.length} shows in database`);

    // Download all posters
    let successCount = 0;
    let failCount = 0;

    for (const show of shows) {
      try {
        await downloadShowPoster(
          show.id,
          show.title,
          show.posterPath,
          imageBaseUrl
        );
        successCount++;
      } catch (error) {
        failCount++;
        console.error(
          `⚠️  Failed to download poster for ${show.title}:`,
          error
        );
        // Continue with other shows instead of failing entirely
      }
    }

    console.log(
      `🎉 Image download completed! Success: ${successCount}, Failed: ${failCount}`
    );

    if (failCount > 0) {
      console.log(
        "⚠️  Some images failed to download but the process continued."
      );
    }
  } catch (err) {
    console.error("❌ Error downloading images:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main();
