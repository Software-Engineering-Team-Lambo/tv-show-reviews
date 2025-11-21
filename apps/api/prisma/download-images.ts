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
      console.error("⚠️  TMDB_API_KEY environment variable is not set");
      console.log(
        "Skipping image download - this is expected on first deploy before seeding."
      );
      process.exit(0); // Exit successfully
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log("✅ Database connection successful");
    } catch (error) {
      console.error("⚠️  Failed to connect to database:", error);
      console.log(
        "Skipping image download - database may not be seeded yet or migrations pending."
      );
      console.log(
        "This is expected on first deploy. Run seed script manually after deployment."
      );
      process.exit(0); // Exit successfully without failing workflow
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
          "⚠️  Schema mismatch detected: 'posterPath' column may not exist in database."
        );
        console.log(
          "Migrations will be applied during deployment. Skipping image download for now."
        );
        console.log(
          "Images will be downloaded on next deployment after seeding."
        );
        process.exit(0); // Exit successfully
      }
      // For other errors, also exit gracefully
      console.error("⚠️  Database query failed:", error);
      console.log(
        "Skipping image download - run migrations and seed script after deployment."
      );
      process.exit(0);
    }

    if (shows.length === 0) {
      console.log("⚠️  No shows found in database. Run seed script first.");
      console.log(
        "Skipping image download - this is expected on first deploy."
      );
      console.log(
        "After seeding, next deployment will download images automatically."
      );
      process.exit(0); // Exit successfully
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
    // Catch any unexpected errors and exit gracefully
    console.error("⚠️  Unexpected error during image download:", err);
    console.log(
      "Continuing deployment without images. Fix issues and redeploy."
    );
    process.exit(0); // Exit successfully to not break workflow
  } finally {
    await prisma.$disconnect();
  }
}

main();
