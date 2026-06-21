/**
 * Seed Uyghur Swadesh 100-word deck from ~/Desktop/uyghur-swadesh-100.json.
 *
 * Idempotent: deletes any existing deck with the same name+user first.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-uyghur-swadesh.ts
 */

import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type JsonCard = {
  word: string;
  ipa: string | null;
  queryLang: string;
  cardType: "WORD" | "PHRASE" | "SENTENCE";
  sortOrder: number;
  meanings: { partOfSpeech: string | null; definition: string; example: string | null }[];
};

type JsonFile = {
  deck: { name: string; desc: string; visibility: "PUBLIC" | "PRIVATE" };
  cards: JsonCard[];
};

const USERNAME = "goddonebianu";
const JSON_PATH = join(homedir(), "Desktop", "uyghur-swadesh-100.json");

async function main() {
  const data: JsonFile = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  console.log(`Loaded ${data.cards.length} cards from ${JSON_PATH}`);
  console.log(`Deck name: "${data.deck.name}"`);

  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    console.error(`User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`Found user: ${user.id} (${user.username})`);

  // Idempotent: drop existing deck with same name for this user
  const existing = await prisma.deck.findMany({
    where: { userId: user.id, name: data.deck.name },
    select: { id: true },
  });
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing deck(s) with same name, deleting...`);
    await prisma.deck.deleteMany({ where: { id: { in: existing.map((d) => d.id) } } });
  }

  // Create deck
  const deck = await prisma.deck.create({
    data: {
      name: data.deck.name,
      desc: data.deck.desc,
      userId: user.id,
      visibility: data.deck.visibility,
    },
  });
  console.log(`Created deck id=${deck.id}`);

  // Create cards (without meanings first to get IDs back)
  await prisma.card.createMany({
    data: data.cards.map((c) => ({
      deckId: deck.id,
      word: c.word,
      ipa: c.ipa,
      queryLang: c.queryLang,
      cardType: c.cardType,
      sortOrder: c.sortOrder,
    })),
  });

  const createdCards = await prisma.card.findMany({
    where: { deckId: deck.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });

  // Map sortOrder -> original card to preserve meanings order
  const meaningData: { cardId: number; partOfSpeech: string | null; definition: string; example: string | null }[] = [];
  for (const cc of createdCards) {
    const original = data.cards[cc.sortOrder];
    if (!original) continue;
    for (const m of original.meanings) {
      meaningData.push({
        cardId: cc.id,
        partOfSpeech: m.partOfSpeech,
        definition: m.definition,
        example: m.example,
      });
    }
  }
  await prisma.cardMeaning.createMany({ data: meaningData });

  console.log(`Inserted ${createdCards.length} cards and ${meaningData.length} meanings`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
