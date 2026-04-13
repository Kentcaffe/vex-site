/**
 * Șterge TOATE anunțurile din baza de date (+ mesaje chat, favorite, rapoarte legate).
 * Rulare: node scripts/clear-all-listings.js
 */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL lipsește. Setează connection string-ul PostgreSQL în .env.");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  try {
    const before = await prisma.listing.count();

    await prisma.$transaction(async (tx) => {
      await tx.chatMessage.deleteMany();
      await tx.chatReadState.deleteMany();
      await tx.chatRoom.deleteMany();
      await tx.listingReport.deleteMany();
      await tx.listingFavorite.deleteMany();
      await tx.listing.deleteMany();
    });

    const after = await prisma.listing.count();
    console.log(`Șters: ${before} anunțuri. Rămân în DB: ${after}.`);
  } finally {
    await prisma.$disconnect().catch(() => {});
    await pool.end().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
