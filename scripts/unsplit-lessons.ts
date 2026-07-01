/**
 * Reverse the split-lessons migration: merge 课文/生词/语法/练习 items
 * within each chapter back into one complete LESSON item.
 *
 * Idempotent: chapters that already have a single item are skipped.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/unsplit-lessons.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const SPLIT_TITLES = new Set(["课文", "生词", "语法", "练习"]);

async function main() {
  const chapters = await prisma.chapter.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  console.log(`Found ${chapters.length} chapter(s)\n`);
  let merged = 0;
  let skipped = 0;

  for (const chapter of chapters) {
    const splitItems = chapter.items.filter((it) => SPLIT_TITLES.has(it.title));
    if (splitItems.length <= 1) {
      skipped++;
      continue;
    }

    const byTitle = new Map(splitItems.map((it) => [it.title, it]));
    const keben = byTitle.get("课文");
    const shengci = byTitle.get("生词");
    const yufa = byTitle.get("语法");
    const lianxi = byTitle.get("练习");
    if (!keben) continue;

    const kebenContent = (keben.content ?? {}) as Record<string, unknown>;
    const shengciContent = shengci ? (shengci.content ?? {}) as Record<string, unknown> : {};
    const yufaContent = yufa ? (yufa.content ?? {}) as Record<string, unknown> : {};
    const lianxiContent = lianxi ? (lianxi.content ?? {}) as Record<string, unknown> : {};

    const fullContent = JSON.parse(JSON.stringify({
      article: kebenContent.article,
      dialogue: kebenContent.dialogue,
      vocabulary: shengciContent.vocabulary,
      grammar: yufaContent.grammar,
      exercises: lianxiContent.exercises,
    }));

    const lessonTitle = chapter.title.replace("章", "课");
    const restoredDeckId = shengci?.deckId ?? null;

    await prisma.chapterItem.update({
      where: { id: keben.id },
      data: {
        title: lessonTitle,
        sortOrder: 0,
        content: fullContent,
        deckId: restoredDeckId,
      },
    });

    const toDelete: number[] = [];
    for (const it of [shengci, yufa, lianxi]) {
      if (it) toDelete.push(it.id);
    }
    if (toDelete.length) {
      await prisma.chapterItem.deleteMany({ where: { id: { in: toDelete } } });
    }

    merged++;
    console.log(`  MERGED chapter "${chapter.title}" → 1 lesson "${lessonTitle}" (deleted ${toDelete.length} split items)`);
  }

  console.log(`\nDone. Merged: ${merged}, skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
