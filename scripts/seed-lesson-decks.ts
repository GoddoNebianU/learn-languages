/**
 * Create a vocabulary deck for every LESSON chapter item that has vocabulary
 * but no deck yet. Cards are generated from the vocabulary items in the
 * lesson's content JSON and the deck is linked via ChapterItem.deckId.
 *
 * Idempotent: skips items that already have a deckId.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-lesson-decks.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface VocabItem {
  word: string;
  pronunciation?: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
}

interface LessonContent {
  vocabulary?: { items: VocabItem[] };
}

async function main() {
  const courses = await prisma.course.findMany({
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { id: "asc" },
  });

  console.log(`Found ${courses.length} course(s)\n`);

  let decksCreated = 0;
  let cardsCreated = 0;
  let skipped = 0;

  for (const course of courses) {
    console.log(`[${course.language}] "${course.title}"`);
    for (const chapter of course.chapters) {
      for (const item of chapter.items) {
        if (item.type !== "LESSON") continue;
        if (item.deckId) {
          console.log(`  SKIP "${item.title}" — already has deckId=${item.deckId}`);
          skipped++;
          continue;
        }

        const content = item.content as LessonContent;
        const vocab = content?.vocabulary?.items;
        if (!vocab || vocab.length === 0) {
          console.log(`  SKIP "${item.title}" — no vocabulary`);
          continue;
        }

        const deck = await prisma.deck.create({
          data: {
            name: `${course.title} — ${item.title}`,
            desc: `${course.language} vocabulary — ${item.title}`,
            userId: course.userId,
            visibility: "PUBLIC",
          },
        });

        const queryLang = course.language.toLowerCase();
        for (let i = 0; i < vocab.length; i++) {
          const v = vocab[i];
          if (!v.word || !v.translation) continue;
          await prisma.card.create({
            data: {
              deckId: deck.id,
              word: v.word,
              ipa: v.pronunciation ?? null,
              queryLang,
              cardType: "WORD",
              sortOrder: i,
              meanings: {
                create: [{
                  partOfSpeech: v.partOfSpeech ?? null,
                  definition: v.translation,
                  examples: v.example
                    ? { create: [{ example: v.example }] }
                    : undefined,
                }],
              },
            },
          });
          cardsCreated++;
        }

        await prisma.chapterItem.update({
          where: { id: item.id },
          data: { deckId: deck.id },
        });

        decksCreated++;
        console.log(`  CREATED deck=${deck.id} for "${item.title}" (${vocab.length} cards)`);
      }
    }
    console.log();
  }

  console.log(`Done. Decks created: ${decksCreated}, cards created: ${cardsCreated}, items skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
