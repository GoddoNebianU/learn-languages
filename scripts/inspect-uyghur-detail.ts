/**
 * Inspect Uyghur course articles + vocabulary in detail.
 * Usage: DATABASE_URL=xxx npx tsx scripts/inspect-uyghur-detail.ts
 */
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

interface VocabItem {
  word: string;
  pronunciation?: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
}

interface LessonContent {
  article?: { body: string; translation?: string };
  dialogue?: { lines: { speaker: string; text: string; translation?: string }[] };
  vocabulary?: { items: VocabItem[] };
  grammar?: { body: string };
  exercises?: { questions: unknown[] };
}

async function main() {
  const USERNAME = "goddonebianu";
  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    console.log(`User "${USERNAME}" not found`);
    return;
  }
  const course = await prisma.course.findFirst({
    where: { userId: user.id, language: "Uyghur" },
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!course) {
    console.log("Uyghur course not found");
    return;
  }
  console.log(`=== Course id=${course.id}: "${course.title}" ===\n`);

  for (const ch of course.chapters) {
    for (const item of ch.items) {
      const c = item.content as LessonContent;
      console.log(`--- Chapter ${ch.sortOrder} (id=${ch.id}): "${ch.title}" ---`);
      console.log(`Item id=${item.id} sortOrder=${item.sortOrder} title="${item.title}"`);
      console.log(`ARTICLE BODY (uyghur):`);
      console.log(c.article?.body ?? "(none)");
      console.log(`ARTICLE TRANSLATION (zh):`);
      console.log(c.article?.translation ?? "(none)");
      const voc = c.vocabulary?.items ?? [];
      console.log(`VOCABULARY (${voc.length} items):`);
      for (const v of voc) {
        console.log(`  - ${v.word} = ${v.translation}${v.partOfSpeech ? ` [${v.partOfSpeech}]` : ""}`);
      }
      console.log("");
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
