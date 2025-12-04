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
import crypto from "crypto";
import argon2 from "argon2";

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

  const firstNames = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Edward",
    "Fiona",
    "George",
    "Hannah",
    "Ivan",
    "Julia",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
  ];
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "email.com",
  ];

  const users = [];

  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[i];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const randomNum = Math.floor(Math.random() * 1000);

    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomNum}@${domain}`;
    const username = `${firstName}${lastName.substring(0, 1)}${randomNum}`;
    const password = crypto.randomBytes(12).toString("hex");
    const password_hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });

    const user = await prisma.user.create({
      data: {
        email,
        username,
        password_hash: password_hash,
      },
    });

    users.push({ ...user, plainPassword: password });
  }

  console.log(`✅ Created ${users.length} users`);
  return users;
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
 * Fetch and save creators for a show
 */
async function saveShowCreators(
  showId: number,
  showData: TmdbShowDetails
): Promise<void> {
  if (showData.created_by.length === 0) return;

  // Create all creators
  await prisma.creator.createMany({
    data: showData.created_by.map((creator) => ({
      id: creator.id,
      name: creator.name,
    })),
    skipDuplicates: true,
  });

  // Assign creators to show
  await prisma.showCreator.createMany({
    data: showData.created_by.map((creator) => ({
      showId: showId,
      creatorId: creator.id,
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

    // Save creators
    await saveShowCreators(show.id, showData);

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
  users: Array<{ id: number; username: string }>
): Promise<void> {
  console.log("Creating sample reviews...");
  const allShows = await prisma.show.findMany();

  if (allShows.length === 0) {
    console.log("No shows found, skipping reviews.");
    return;
  }

  const comments = [
    "Absolutely brilliant! One of the best shows I've ever watched.",
    "Great acting and compelling storyline. Highly recommended!",
    "A bit slow at times, but overall a solid show.",
    "Incredible character development throughout the series.",
    "The plot twists kept me on the edge of my seat!",
    "Not my favorite, but I can see why people like it.",
    "Binged the entire season in one weekend. No regrets!",
    "The cinematography is stunning. Every frame is art.",
    "Started strong but lost steam in later seasons.",
    "A masterpiece of modern television.",
    "Funny, heartwarming, and endlessly rewatchable.",
    "The writing is top-notch. Every episode delivers.",
    "Good show, but overhyped in my opinion.",
    "Perfect blend of drama and comedy.",
    "One of those rare shows that gets better with each season.",
  ];

  let reviewCount = 0;

  for (const user of users) {
    // Each user reviews 3-8 random shows
    const numReviews = Math.floor(Math.random() * 6) + 3;
    const shuffledShows = [...allShows].sort(() => Math.random() - 0.5);
    const showsToReview = shuffledShows.slice(0, numReviews);

    for (const show of showsToReview) {
      const rating = Math.floor(Math.random() * 3) + 3; // Rating between 3-5
      const comment = comments[Math.floor(Math.random() * comments.length)];

      await prisma.review.create({
        data: {
          rating,
          comment,
          userId: user.id,
          showId: show.id,
        },
      });
      reviewCount++;
    }
  }

  console.log(`✅ Created ${reviewCount} reviews`);
}

/**
 * Create sample favorites
 */
async function createSampleFavorites(
  users: Array<{ id: number; username: string }>
): Promise<void> {
  console.log("Creating sample favorites...");
  const allShows = await prisma.show.findMany();

  if (allShows.length === 0) {
    console.log("No shows found, skipping favorites.");
    return;
  }

  let favoriteCount = 0;

  for (const user of users) {
    // Each user has 2-5 favorites
    const numFavorites = Math.floor(Math.random() * 4) + 2;
    const shuffledShows = [...allShows].sort(() => Math.random() - 0.5);
    const favoriteShows = shuffledShows.slice(0, numFavorites);

    for (const show of favoriteShows) {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          showId: show.id,
        },
      });
      favoriteCount++;
    }
  }

  console.log(`✅ Created ${favoriteCount} favorites`);
}

/**
 * Create sample watchlist items
 */
async function createSampleWatchlist(
  users: Array<{ id: number; username: string }>
): Promise<void> {
  console.log("Creating sample watchlist items...");
  const allShows = await prisma.show.findMany();

  if (allShows.length === 0) {
    console.log("No shows found, skipping watchlist.");
    return;
  }

  const notes = [
    "Recommended by a friend",
    "Looks interesting!",
    "Need to finish this one",
    "For the weekend binge",
    "Everyone's talking about this",
    null,
    null,
    "High priority",
    null,
    "Watch with family",
  ];

  let watchlistCount = 0;

  for (const user of users) {
    // Each user has 3-7 watchlist items
    const numWatchlist = Math.floor(Math.random() * 5) + 3;
    const shuffledShows = [...allShows].sort(() => Math.random() - 0.5);
    const watchlistShows = shuffledShows.slice(0, numWatchlist);

    for (const show of watchlistShows) {
      const note = notes[Math.floor(Math.random() * notes.length)];

      await prisma.watchlist.create({
        data: {
          userId: user.id,
          showId: show.id,
          note,
        },
      });
      watchlistCount++;
    }
  }

  console.log(`✅ Created ${watchlistCount} watchlist items`);
}

/**
 * Print user summary
 */
async function printUserSummary(
  users: Array<{
    id: number;
    username: string;
    email: string;
    plainPassword: string;
  }>
): Promise<void> {
  console.log("\n" + "=".repeat(80));
  console.log("📋 USER SUMMARY");
  console.log("=".repeat(80));

  for (const user of users) {
    const reviewCount = await prisma.review.count({
      where: { userId: user.id },
    });
    const favoriteCount = await prisma.favorite.count({
      where: { userId: user.id },
    });
    const watchlistCount = await prisma.watchlist.count({
      where: { userId: user.id },
    });

    console.log(`\n👤 ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.plainPassword}`);
    console.log(
      `   Reviews: ${reviewCount} | Favorites: ${favoriteCount} | Watchlist: ${watchlistCount}`
    );
  }

  console.log("\n" + "=".repeat(80));
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
    const users = await createSampleUsers();

    // Fetch and save shows
    await fetchAndSaveShows(apiKey, 5);

    // Enrich shows with details and download images
    await enrichShowDetails(apiKey, imageBaseUrl);

    // Create sample reviews, favorites, and watchlist
    await createSampleReviews(users);
    await createSampleFavorites(users);
    await createSampleWatchlist(users);

    // Print user summary
    await printUserSummary(users);

    console.log("🎉 Seed completed successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main();
