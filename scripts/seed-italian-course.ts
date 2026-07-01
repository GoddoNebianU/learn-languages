/**
 * Seed an Italian (意大利语) course for Chinese learners.
 *
 * Idempotent: deletes any existing course with the same title+user first.
 * Mirrors the Uyghur course structure: 8 chapters, 1 LESSON chapter-item each,
 * item content packs article + dialogue + vocabulary + grammar + exercises.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-italian-course.ts
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

type DialogueLine = { speaker: string; text: string; translation?: string };
type VocabItem = {
  word: string;
  pronunciation?: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
};
type Question = {
  type: "MULTIPLE_CHOICE" | "FILL_BLANK";
  question: string;
  options?: string[];
  answer: number | string;
  explanation?: string;
};

type ChapterData = {
  title: string;
  lessonTitle: string;
  article: { body: string; translation: string };
  dialogue: { lines: DialogueLine[] };
  vocabulary: { items: VocabItem[] };
  grammar: { body: string };
  exercises: { questions: Question[] };
};

type CourseData = {
  course: {
    title: string;
    description: string;
    language: string;
    learnerLanguage: string;
  };
  chapters: ChapterData[];
};

const currentDir = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = resolve(currentDir, "italian-course-data.json");

function loadData(): CourseData {
  const raw = readFileSync(DATA_PATH, "utf-8");
  return JSON.parse(raw) as CourseData;
}

const DATA = loadData();
const COURSE_TITLE = DATA.course.title;
const USERNAME = "goddonebianu";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding Italian course: "${COURSE_TITLE}"`);
  console.log(`Chapters: ${DATA.chapters.length}`);

  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    console.error(`User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`Found user: ${user.id} (${user.username})`);

  const existing = await prisma.course.findMany({
    where: { userId: user.id, title: COURSE_TITLE },
    select: { id: true },
  });
  if (existing.length > 0) {
    console.log(
      `Found ${existing.length} existing course(s) with same title, deleting...`,
    );
    await prisma.course.deleteMany({
      where: { id: { in: existing.map((c) => c.id) } },
    });
  }

  const course = await prisma.course.create({
    data: {
      title: DATA.course.title,
      description: DATA.course.description,
      language: DATA.course.language,
      learnerLanguage: DATA.course.learnerLanguage,
      userId: user.id,
      visibility: "PUBLIC",
    },
  });
  console.log(`Created course id=${course.id}`);

  for (let i = 0; i < DATA.chapters.length; i++) {
    const ch = DATA.chapters[i];
    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        title: ch.title,
        sortOrder: i,
      },
    });

    const item = await prisma.chapterItem.create({
      data: {
        chapterId: chapter.id,
        type: "LESSON",
        title: ch.lessonTitle,
        sortOrder: 0,
        content: {
          article: ch.article,
          dialogue: ch.dialogue,
          vocabulary: ch.vocabulary,
          grammar: ch.grammar,
          exercises: ch.exercises,
        } as object,
      },
    });

    console.log(
      `  Chapter ${i + 1}: id=${chapter.id}, item id=${item.id} (${ch.lessonTitle})`,
    );
  }

  console.log(`\nInserted ${DATA.chapters.length} chapters`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
