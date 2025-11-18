import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient();

/**
 * Database Seed Script
 *
 * THIS IS A PLACEHOLDER - Replace with real data from a movie/TV API later!
 *
 * IMPORTANT: This script is NEVER run automatically in production.
 * To seed production manually (one time only):
 *   docker compose -f docker-compose.prod.yml run --rm api npm run seed
 *
 * The script is idempotent - safe to run multiple times (checks if already seeded).
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

    // Create sample users
    console.log("Creating sample users...");
    const user1 = await prisma.user.create({
      data: {
        email: "alice@example.com",
        name: "Alice Johnson",
        password_hash: "hashed_password_placeholder", // In real app, use bcrypt
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

    // Fetch sample TV shows from The Movie Database (TMDB) API
    console.log("Fetching movies from TMDB...");

    const apiKey = process.env.API_KEY;

    const response = await fetch(
      `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`
    );

    const showsData = await response.json();
    console.log(showsData);
    const shows = showsData.results;
    console.log(`Found ${shows.length} shows. Saving to database...`);

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
        },
        update: {}, // nothing to update yet
      });
    }

    console.log(`✅ Created ${shows.length} TV shows`);

    // Get the created shows to create reviews
    const allShows = await prisma.show.findMany();

    // Create sample reviews
    console.log("Creating sample reviews...");
    await prisma.review.create({
      data: {
        rating: 10,
        comment:
          "One of the best TV shows ever made. Walter White's transformation is incredible!",
        userId: user1.id,
        showId: allShows[0].id, // Breaking Bad
      },
    });

    await prisma.review.create({
      data: {
        rating: 9,
        comment:
          "Hilarious and relatable. Michael Scott is an iconic character.",
        userId: user2.id,
        showId: allShows[1].id, // The Office
      },
    });

    await prisma.review.create({
      data: {
        rating: 8,
        comment:
          "Great sci-fi mystery with a perfect 80s vibe. Highly recommended!",
        userId: user1.id,
        showId: allShows[2].id, // Stranger Things
      },
    });

    console.log(`✅ Created 3 reviews`);

    console.log("🎉 Seed completed successfully!");
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
