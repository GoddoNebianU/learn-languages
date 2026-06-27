/**
 * Copy all courses owned by a user from a source database to a target database.
 *
 * Idempotent: for each course, deletes any existing course with the same
 * title owned by the target user before recreating it (with chapters and
 * chapter items). Resolves the user by username in BOTH databases — so it
 * works even when the user has different IDs across environments.
 *
 * Usage:
 *   SOURCE_DATABASE_URL=<dev_url>  DATABASE_URL=<prod_url> \
 *     npx tsx scripts/copy-courses-to-target.ts [username]
 *
 * Example (dev → prod, default username "goddonebianu"):
 *   export $(grep -E "^DATABASE_URL=" .env            | xargs)  # dev first
 *   DEV_URL="$DATABASE_URL"
 *   export $(grep -E "^DATABASE_URL=" .env.production | xargs)  # prod target
 *   SOURCE_DATABASE_URL="$DEV_URL" npx tsx scripts/copy-courses-to-target.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function bail(message: string): never {
  console.error(message);
  process.exit(1);
}

const sourceUrl = process.env.SOURCE_DATABASE_URL ?? bail("SOURCE_DATABASE_URL is required (the database to copy FROM)");
const targetUrl = process.env.DATABASE_URL ?? bail("DATABASE_URL is required (the database to copy TO)");
const username = process.argv[2] ?? "goddonebianu";

if (sourceUrl === targetUrl) bail("SOURCE_DATABASE_URL and DATABASE_URL must differ");

const srcPrisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: sourceUrl }) });
const tgtPrisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: targetUrl }) });

async function main() {
  console.log(`Copying courses for user "${username}"`);
  console.log(`  source: ${sourceUrl.replace(/:[^:@]+@/, ":***@")}`);
  console.log(`  target: ${targetUrl.replace(/:[^:@]+@/, ":***@")}`);

  const srcUser = await srcPrisma.user.findFirst({ where: { username } });
  const tgtUser = await tgtPrisma.user.findFirst({ where: { username } });
  if (!srcUser) bail(`User "${username}" not found in SOURCE database`);
  if (!tgtUser) bail(`User "${username}" not found in TARGET database`);
  console.log(`  source user id=${srcUser.id}`);
  console.log(`  target user id=${tgtUser.id}`);

  const courses = await srcPrisma.course.findMany({
    where: { userId: srcUser.id },
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
    orderBy: { id: "asc" },
  });
  console.log(`\nFound ${courses.length} course(s) in source:`);
  for (const c of courses) {
    const itemCount = c.chapters.reduce((acc, ch) => acc + ch.items.length, 0);
    console.log(`  - [${c.language}] "${c.title}" (${c.chapters.length} chapters, ${itemCount} items)`);
  }

  for (const course of courses) {
    const existing = await tgtPrisma.course.findMany({
      where: { userId: tgtUser.id, title: course.title },
      select: { id: true },
    });
    if (existing.length > 0) {
      console.log(`\n  [${course.title}] replacing ${existing.length} existing course(s) in target`);
      await tgtPrisma.course.deleteMany({ where: { id: { in: existing.map((c) => c.id) } } });
    } else {
      console.log(`\n  [${course.title}] creating new in target`);
    }

    const newCourse = await tgtPrisma.course.create({
      data: {
        title: course.title,
        description: course.description,
        language: course.language,
        learnerLanguage: course.learnerLanguage,
        userId: tgtUser.id,
        visibility: course.visibility,
        coverImage: course.coverImage,
      },
    });

    for (const chapter of course.chapters) {
      const newChapter = await tgtPrisma.chapter.create({
        data: {
          courseId: newCourse.id,
          title: chapter.title,
          sortOrder: chapter.sortOrder,
        },
      });
      for (const item of chapter.items) {
        await tgtPrisma.chapterItem.create({
          data: {
            chapterId: newChapter.id,
            type: item.type,
            title: item.title,
            sortOrder: item.sortOrder,
            content: item.content as object,
            deckId: item.deckId,
          },
        });
      }
    }

    console.log(
      `    → course id=${newCourse.id}, ${course.chapters.length} chapters copied`,
    );
  }

  console.log("\nCopy complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await srcPrisma.$disconnect();
    await tgtPrisma.$disconnect();
  });
