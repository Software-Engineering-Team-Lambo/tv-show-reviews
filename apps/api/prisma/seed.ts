import { PrismaClient } from '../generated/prisma/index.js';

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
  console.log('🌱 Starting database seed...');

  // Check if database is already seeded
  const existingShows = await prisma.show.count();
  const existingUsers = await prisma.user.count();

  if (existingShows > 0 || existingUsers > 0) {
    console.log('✅ Database already contains data. Skipping seed.');
    console.log(`   Found ${existingUsers} users and ${existingShows} shows.`);
    return;
  }

  // Create sample users
  console.log('Creating sample users...');
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Johnson',
      password_hash: 'hashed_password_placeholder', // In real app, use bcrypt
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Smith',
      password_hash: 'hashed_password_placeholder',
    },
  });

  console.log(`✅ Created ${2} users`);

  // Create sample TV shows
  console.log('Creating sample TV shows...');
  const shows = await prisma.show.createMany({
    data: [
      {
        title: 'Breaking Bad',
        description: 'A high school chemistry teacher turned methamphetamine producer partners with a former student.',
      },
      {
        title: 'The Office',
        description: 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.',
      },
      {
        title: 'Stranger Things',
        description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces.',
      },
      {
        title: 'The Crown',
        description: 'Follows the political rivalries and romance of Queen Elizabeth II\'s reign and the events that shaped the second half of the 20th century.',
      },
      {
        title: 'Game of Thrones',
        description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
      },
    ],
  });

  console.log(`✅ Created ${shows.count} TV shows`);

  // Get the created shows to create reviews
  const allShows = await prisma.show.findMany();

  // Create sample reviews
  console.log('Creating sample reviews...');
  await prisma.review.create({
    data: {
      rating: 10,
      comment: 'One of the best TV shows ever made. Walter White\'s transformation is incredible!',
      userId: user1.id,
      showId: allShows[0].id, // Breaking Bad
    },
  });

  await prisma.review.create({
    data: {
      rating: 9,
      comment: 'Hilarious and relatable. Michael Scott is an iconic character.',
      userId: user2.id,
      showId: allShows[1].id, // The Office
    },
  });

  await prisma.review.create({
    data: {
      rating: 8,
      comment: 'Great sci-fi mystery with a perfect 80s vibe. Highly recommended!',
      userId: user1.id,
      showId: allShows[2].id, // Stranger Things
    },
  });

  console.log(`✅ Created ${3} reviews`);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
