/**
 * Șterge TOATE anunțurile din baza de date (+ mesaje chat, favorite, rapoarte legate).
 * Rulare: node scripts/clear-all-listings.js
 */
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
