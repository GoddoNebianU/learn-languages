/**
 * Seed an Uyghur (维吾尔语) course for Chinese learners from
 * uyghur-course-data.json in the same directory.
 *
 * 8 chapters x 3 lessons = 24 lessons. Each lesson is a LESSON chapter-item
 * with article + dialogue + vocabulary + grammar + exercises content. Each
 * lesson also gets a PUBLIC vocabulary deck linked via ChapterItem.deckId,
 * with one Card per vocab item (nested card + meanings + examples).
 *
 * Idempotent: deletes any existing course with the same title+user first.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/seed-uyghur-course-v2.ts
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const USERNAME = "goddonebianu";
const COURSE_TITLE = "ئۇيغۇر تىلى ئۆگىنىش — 维吾尔语课程";
const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "uyghur-course-data.json");

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

type LessonData = {
  title: string;
  article: { body: string; translation: string };
  dialogue: { lines: DialogueLine[] };
  vocabulary: { items: VocabItem[] };
  grammar: { body: string };
  exercises: { questions: Question[] };
};

type CourseFile = {
  course: {
    title: string;
    description: string;
    language: string;
    learnerLanguage: string;
  };
  chapters: { title: string; lessons: LessonData[] }[];
};

function loadCourse(): CourseFile {
  const raw = readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw) as CourseFile;
}

function buildLessonContent(lesson: LessonData) {
  return JSON.parse(
    JSON.stringify({
      article: lesson.article,
      dialogue: lesson.dialogue,
      vocabulary: lesson.vocabulary,
      grammar: lesson.grammar,
      exercises: lesson.exercises,
    }),
  ) as object;
}

async function createDeckForLesson(
  userId: string,
  courseTitle: string,
  lesson: LessonData,
  sortOrder: number,
): Promise<number> {
  const deck = await prisma.deck.create({
    data: {
      name: `${courseTitle} — ${lesson.title}`,
      desc: `Uyghur vocabulary — ${lesson.title}`,
      userId,
      visibility: "PUBLIC",
      sortOrder,
    },
  });

  const items = lesson.vocabulary.items.filter((v) => v.word && v.translation);
  if (items.length === 0) return deck.id;

  await prisma.card.createMany({
    data: items.map((v, i) => ({
      deckId: deck.id,
      word: v.word,
      ipa: v.pronunciation ?? null,
      queryLang: "uyghur",
      cardType: "WORD" as const,
      sortOrder: i,
    })),
  });

  const cards = await prisma.card.findMany({
    where: { deckId: deck.id },
    orderBy: { sortOrder: "asc" },
    select: { id: true, sortOrder: true },
  });

  const meaningsData = cards.map((c) => {
    const v = items[c.sortOrder];
    return { cardId: c.id, partOfSpeech: v?.partOfSpeech ?? null, definition: v?.translation ?? "" };
  }).filter((m) => m.definition);
  await prisma.cardMeaning.createMany({ data: meaningsData });

  const meanings = await prisma.cardMeaning.findMany({
    where: { cardId: { in: cards.map((c) => c.id) } },
    select: { id: true, cardId: true },
  });
  const examplesData: { meaningId: number; example: string }[] = [];
  for (const m of meanings) {
    const card = cards.find((c) => c.id === m.cardId);
    if (!card) continue;
    const v = items[card.sortOrder];
    if (v?.example) examplesData.push({ meaningId: m.id, example: v.example });
  }
  if (examplesData.length > 0) await prisma.cardExample.createMany({ data: examplesData });

  return deck.id;
}

async function main() {
  const data = loadCourse();
  const chapterCount = data.chapters.length;
  const lessonCount = data.chapters.reduce(
    (n, c) => n + c.lessons.length,
    0,
  );
  console.log(`Seeding Uyghur course: "${COURSE_TITLE}"`);
  console.log(`Chapters: ${chapterCount}, lessons: ${lessonCount}`);

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
      title: COURSE_TITLE,
      description: data.course.description,
      language: data.course.language,
      learnerLanguage: data.course.learnerLanguage,
      userId: user.id,
      visibility: "PUBLIC",
    },
  });
  console.log(`Created course id=${course.id}`);

  let lessonIdx = 0;
  for (let ci = 0; ci < data.chapters.length; ci++) {
    const ch = data.chapters[ci];
    const chapter = await prisma.chapter.create({
      data: { courseId: course.id, title: ch.title, sortOrder: ci },
    });

    for (let li = 0; li < ch.lessons.length; li++) {
      const lesson = ch.lessons[li];
      const deckId = await createDeckForLesson(
        user.id,
        COURSE_TITLE,
        lesson,
        lessonIdx,
      );

      const item = await prisma.chapterItem.create({
        data: {
          chapterId: chapter.id,
          type: "LESSON",
          title: lesson.title,
          sortOrder: li,
          deckId,
          content: buildLessonContent(lesson),
        },
      });

      lessonIdx++;
      console.log(
        `  Ch${ci + 1} L${li + 1}: id=${item.id}, deck=${deckId} (${lesson.title})`,
      );
    }
  }

  console.log(`\nInserted ${chapterCount} chapters, ${lessonCount} lessons`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
