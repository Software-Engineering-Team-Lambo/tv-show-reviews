import { PrismaClient } from "../generated/prisma/index.js";
import {
  getTmdbConfiguration,
  setupImagesDirectory,
  downloadShowPoster,
} from "./lib/image-downloader.js";

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

    // Get TMDB configuration for image URLs
    const tmdbConfig = await getTmdbConfiguration(apiKey);
    const imageBaseUrl = tmdbConfig.images.secure_base_url;

    // Setup images directory
    setupImagesDirectory();

    // Get all shows from database
    const shows = await prisma.show.findMany({
      select: {
        id: true,
        title: true,
        posterPath: true,
      },
    });

    console.log(`Found ${shows.length} shows in database`);

    // Download all posters
    for (const show of shows) {
      await downloadShowPoster(
        show.id,
        show.title,
        show.posterPath,
        imageBaseUrl
      );
    }

    console.log("🎉 Image download completed successfully!");
  } catch (err) {
    console.error("❌ Error downloading images:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main();
