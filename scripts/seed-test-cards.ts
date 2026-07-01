/**
 * Seed test cards for the goddonebianu user.
 *
 * Creates 4 decks × 100+ cards each.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-test-cards.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import cardData from "./test-cards-data.json";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type CardType = "WORD" | "PHRASE" | "SENTENCE";

type SeedCard = {
  word: string;
  ipa: string | null;
  queryLang: string;
  cardType: CardType;
  meanings: { partOfSpeech: string | null; definition: string; examples: { example: string; translation?: string | null }[] }[];
};

const vocabularyCards: SeedCard[] = cardData.vocabulary.map(([word, ipa, pos, def, ex]) => ({
  word,
  ipa,
  queryLang: "English",
  cardType: "WORD" as CardType,
  meanings: [{ partOfSpeech: pos, definition: def, examples: [{ example: ex }] }],
}));

const phraseCards: SeedCard[] = cardData.phrases.map(([phrase, def, ex]) => ({
  word: phrase,
  ipa: null,
  queryLang: "English",
  cardType: "PHRASE" as CardType,
  meanings: [{ partOfSpeech: null, definition: def, examples: [{ example: ex }] }],
}));

const sentenceCards: SeedCard[] = cardData.sentenceEnglish.map((s, i) => ({
  word: s,
  ipa: null,
  queryLang: "English",
  cardType: "SENTENCE" as CardType,
  meanings: [{ partOfSpeech: null, definition: cardData.sentenceTranslations[i] ?? "", examples: [] }],
}));

const businessWordCards: SeedCard[] = cardData.businessWords.map(([word, ipa, pos, def, ex]) => ({
  word,
  ipa,
  queryLang: "English",
  cardType: "WORD" as CardType,
  meanings: [{ partOfSpeech: pos, definition: def, examples: [{ example: ex }] }],
}));

const businessPhraseCards: SeedCard[] = cardData.businessPhrases.map(([phrase, def, ex]) => ({
  word: phrase,
  ipa: null,
  queryLang: "English",
  cardType: "PHRASE" as CardType,
  meanings: [{ partOfSpeech: null, definition: def, examples: [{ example: ex }] }],
}));

const businessSentenceTranslations = cardData.businessSentenceTranslations as Record<string, string>;
const businessSentenceCards: SeedCard[] = cardData.businessSentenceEnglish.map((s) => ({
  word: s,
  ipa: null,
  queryLang: "English",
  cardType: "SENTENCE" as CardType,
  meanings: [{ partOfSpeech: null, definition: businessSentenceTranslations[s] ?? "", examples: [] }],
}));

const businessCards: SeedCard[] = [...businessWordCards, ...businessPhraseCards, ...businessSentenceCards];

async function main() {
  const user = await prisma.user.findFirst({
    where: { username: "goddonebianu" },
  });

  if (!user) {
    console.error('User "goddonebianu" not found');
    process.exit(1);
  }

  console.log(`Found user: ${user.id} (${user.username})`);

  const existingDecks = await prisma.deck.findMany({
    where: { userId: user.id, name: { in: ["英语核心词汇", "常用英语短语", "英语日常句子", "商务英语"] } },
    select: { id: true, name: true },
  });
  if (existingDecks.length > 0) {
    console.log(`Found ${existingDecks.length} existing seed decks, deleting...`);
    await prisma.deck.deleteMany({ where: { id: { in: existingDecks.map((d) => d.id) } } });
  }

  const decks = [
    { name: "英语核心词汇", desc: "100个常用英语单词，含IPA音标", cards: vocabularyCards },
    { name: "常用英语短语", desc: "100个高频英语短语", cards: phraseCards },
    { name: "英语日常句子", desc: "100个日常英语句子", cards: sentenceCards },
    { name: "商务英语", desc: "100个商务英语词汇、短语和句子", cards: businessCards },
  ];

  for (const deckData of decks) {
    const deck = await prisma.deck.create({
      data: {
        name: deckData.name,
        desc: deckData.desc,
        userId: user.id,
        visibility: "PRIVATE",
      },
    });

    await prisma.card.createMany({
      data: deckData.cards.map((c, i) => ({
        deckId: deck.id,
        word: c.word,
        ipa: c.ipa,
        queryLang: c.queryLang,
        cardType: c.cardType,
        sortOrder: i,
      })),
    });

    const createdCards = await prisma.card.findMany({
      where: { deckId: deck.id },
      orderBy: { sortOrder: "asc" },
      select: { id: true, sortOrder: true },
    });

    for (const cc of createdCards) {
      const original = deckData.cards[cc.sortOrder];
      if (!original) continue;
      for (const m of original.meanings) {
        await prisma.cardMeaning.create({
          data: {
            cardId: cc.id,
            partOfSpeech: m.partOfSpeech,
            definition: m.definition,
            examples: {
              create: m.examples.map((e) => ({
                example: e.example,
                translation: e.translation ?? null,
              })),
            },
          },
        });
      }
    }

    console.log(`  Created deck "${deckData.name}" with ${deckData.cards.length} cards`);
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
