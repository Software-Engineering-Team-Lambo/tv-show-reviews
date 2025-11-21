import { PrismaClient } from "../generated/prisma/index.js";
import type {
  TmdbPopularShowsResponse,
  TmdbShowDetails,
  TmdbAggregateCreditsResponse,
} from "../src/types/tmdb.js";
import {
  getTmdbConfiguration,
  setupImagesDirectory,
  downloadShowPoster,
} from "./lib/image-downloader.js";

const prisma = new PrismaClient();

/**
 * Database Seed Script
 *
 * Fetches TV show data from TMDB API and seeds the database.
 * Also downloads poster images for each show.
 *
 * IMPORTANT: This script is NEVER run automatically in production.
 * To seed production manually (one time only):
 *   docker compose -f docker-compose.prod.yml run --rm api npm run seed
 *
 * The script is idempotent - safe to run multiple times (checks if already seeded).
 */

/**
 * Create sample users
 */
async function createSampleUsers() {
  console.log("Creating sample users...");
  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Johnson",
      password_hash: "hashed_password_placeholder",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob Smith",
      password_hash: "hashed_password_placeholder",
    },
  });

  console.log(`✅ Created 2 users`);
  return { user1, user2 };
}

/**
 * Fetch popular TV shows from TMDB and save to database
 */
async function fetchAndSaveShows(
  apiKey: string,
  pages: number = 5
): Promise<void> {
  console.log(`Fetching ${pages} pages of popular TV shows from TMDB...`);

  for (let i = 0; i < pages; i++) {
    console.log(`Fetching page ${i + 1}/${pages}...`);

    const response = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=${i + 1}`
    );

    const showsData: TmdbPopularShowsResponse = await response.json();
    const shows = showsData.results;

    for (const show of shows) {
      await prisma.show.upsert({
        where: { id: show.id },
        create: {
          id: show.id,
          title: show.name,
          description: show.overview ?? "",
          posterPath: show.poster_path,
          releaseDate: show.first_air_date
            ? new Date(show.first_air_date)
            : null,
          popularity: show.popularity,
        },
        update: {},
      });
    }

    console.log(`✅ Saved ${shows.length} shows from page ${i + 1}`);
  }
}

/**
 * Fetch and save genres for a show
 */
async function saveShowGenres(
  showId: number,
  showData: TmdbShowDetails
): Promise<void> {
  if (showData.genres.length === 0) return;

  // Create all genres
  await prisma.genre.createMany({
    data: showData.genres.map((genre) => ({
      id: genre.id,
      name: genre.name,
    })),
    skipDuplicates: true,
  });

  // Assign genres to show
  await prisma.showGenre.createMany({
    data: showData.genres.map((genre) => ({
      showId: showId,
      genreId: genre.id,
    })),
    skipDuplicates: true,
  });
}

/**
 * Fetch and save cast members for a show
 */
async function saveShowCast(
  apiKey: string,
  showId: number,
  showTitle: string
): Promise<void> {
  const creditsResponse = await fetch(
    `https://api.themoviedb.org/3/tv/${showId}/aggregate_credits?api_key=${apiKey}&language=en-US`
  );
  const creditsData: TmdbAggregateCreditsResponse =
    await creditsResponse.json();

  const castMembers = creditsData.cast.filter(
    (m) => m.known_for_department === "Acting"
  );

  if (castMembers.length === 0) return;

  // Create all actors
  await prisma.actor.createMany({
    data: castMembers.map((castMember) => ({
      id: castMember.id,
      name: castMember.name,
    })),
    skipDuplicates: true,
  });

  // Assign actors to show
  await prisma.showCast.createMany({
    data: castMembers.map((castMember) => ({
      showId: showId,
      actorId: castMember.id,
      role: castMember.roles.length > 0 ? castMember.roles[0].character : null,
      order: castMember.order,
    })),
    skipDuplicates: true,
  });

  console.log(`✅ Added ${castMembers.length} cast members to ${showTitle}`);
}

/**
 * Enrich shows with detailed information (genres, cast, episodes, etc.)
 */
async function enrichShowDetails(
  apiKey: string,
  imageBaseUrl: string
): Promise<void> {
  console.log("Enriching show details...");
  const allShows = await prisma.show.findMany();

  for (const show of allShows) {
    console.log(`Processing show: ${show.title}...`);

    // Fetch detailed show information
    const response = await fetch(
      `https://api.themoviedb.org/3/tv/${show.id}?api_key=${apiKey}&language=en-US`
    );
    const showData: TmdbShowDetails = await response.json();

    // Save genres
    await saveShowGenres(show.id, showData);

    // Save cast members
    await saveShowCast(apiKey, show.id, show.title);

    // Update show with additional details
    await prisma.show.update({
      where: { id: show.id },
      data: {
        seasons: showData.number_of_seasons,
        status: showData.status,
        episodes: showData.number_of_episodes,
      },
    });

    // Download poster image
    await downloadShowPoster(
      show.id,
      show.title,
      show.posterPath,
      imageBaseUrl
    );
  }

  console.log("✅ Enriched all show details");
}

/**
 * Create sample reviews
 */
async function createSampleReviews(
  user1Id: number,
  user2Id: number
): Promise<void> {
  console.log("Creating sample reviews...");
  const allShows = await prisma.show.findMany({ take: 3 });

  if (allShows.length > 0) {
    await prisma.review.create({
      data: {
        rating: 10,
        comment:
          "One of the best TV shows ever made. Walter White's transformation is incredible!",
        userId: user1Id,
        showId: allShows[0].id,
      },
    });
  }

  if (allShows.length > 1) {
    await prisma.review.create({
      data: {
        rating: 9,
        comment:
          "Hilarious and relatable. Michael Scott is an iconic character.",
        userId: user2Id,
        showId: allShows[1].id,
      },
    });
  }

  if (allShows.length > 2) {
    await prisma.review.create({
      data: {
        rating: 8,
        comment:
          "Great sci-fi mystery with a perfect 80s vibe. Highly recommended!",
        userId: user1Id,
        showId: allShows[2].id,
      },
    });
  }

  console.log(`✅ Created ${Math.min(3, allShows.length)} reviews`);
}

/**
 * Main seed function
 */
async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Check if database is already seeded
    const existingShows = await prisma.show.count();
    const existingUsers = await prisma.user.count();

    if (existingShows > 0 || existingUsers > 0) {
      console.log("✅ Database already contains data. Skipping seed.");
      console.log(`Found ${existingUsers} users and ${existingShows} shows.`);
      return;
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB_API_KEY environment variable is not set");
    }

    // Get TMDB configuration for image URLs
    const tmdbConfig = await getTmdbConfiguration(apiKey);
    const imageBaseUrl = tmdbConfig.images.secure_base_url;

    // Setup images directory
    setupImagesDirectory();

    // Create sample users
    const { user1, user2 } = await createSampleUsers();

    // Fetch and save shows
    await fetchAndSaveShows(apiKey, 5);

    // Enrich shows with details and download images
    await enrichShowDetails(apiKey, imageBaseUrl);

    // Create sample reviews
    await createSampleReviews(user1.id, user2.id);

    console.log("🎉 Seed completed successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main();
