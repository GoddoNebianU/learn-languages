/**
 * Enrich the Uyghur beginner course (goddonebianu) so that every content word
 * used in each lesson's article is present in that lesson's vocabulary list.
 *
 * - Beginner (零基础) course: the student must be able to look up any word in
 *   the article, so every content word (lemma form) is added.
 * - Idempotent: new items already present (matched by normalized `word`) are
 *   not duplicated. Existing entries are preserved in order; new ones append.
 * - Only `content.vocabulary.items` is rewritten; all other sections
 *   (article / dialogue / grammar / exercises) are left untouched.
 *
 * Usage:
 *   DATABASE_URL=xxx npx tsx scripts/enrich-uyghur-vocab.ts
 */

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const USERNAME = "goddonebianu";
const COURSE_LANGUAGE = "Uyghur";

interface VocabItem {
  word: string;
  pronunciation?: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
}

interface LessonContent {
  article?: { body: string; translation?: string };
  dialogue?: { lines: unknown[] };
  vocabulary?: { items: VocabItem[] };
  grammar?: { body: string };
  exercises?: { questions: unknown[] };
}

// ---------- Per-lesson additions (lemma form + Chinese translation + POS) ----------
// Indexed by chapter sortOrder (0..7). Each entry is appended to that lesson's
// existing vocabulary after dedup.
const ADDITIONS: VocabItem[][] = [
  // ===== Lesson 1: 第一课：日常问候 (article: مېنىڭ كۈندىلىك تۇرمۇشۇم) =====
  [
    { word: "مەن", translation: "我", partOfSpeech: "pronoun" },
    { word: "سىز", translation: "您 / 你（敬称）", partOfSpeech: "pronoun" },
    { word: "ئۇ", translation: "他 / 她 / 它", partOfSpeech: "pronoun" },
    { word: "ئۇلار", translation: "他们 / 她们", partOfSpeech: "pronoun" },
    { word: "ئىسىم", translation: "名字", partOfSpeech: "noun" },
    { word: "ئوقۇغۇچى", translation: "学生", partOfSpeech: "noun" },
    { word: "كۈن", translation: "天 / 日", partOfSpeech: "noun" },
    { word: "كۈندىلىك", translation: "日常的 / 每天的", partOfSpeech: "adjective" },
    { word: "ئەتىگەن", translation: "早晨 / 早上", partOfSpeech: "noun" },
    { word: "چۈش", translation: "中午 / 午饭", partOfSpeech: "noun" },
    { word: "يۈز", translation: "脸", partOfSpeech: "noun" },
    { word: "مەكتەپ", translation: "学校", partOfSpeech: "noun" },
    { word: "دوست", translation: "朋友", partOfSpeech: "noun" },
    { word: "تاماق", translation: "饭菜 / 一顿饭", partOfSpeech: "noun" },
    { word: "تۇرمۇش", translation: "生活", partOfSpeech: "noun" },
    { word: "تۇرماق", translation: "站立 / 起床", partOfSpeech: "verb" },
    { word: "يۇيماق", translation: "洗", partOfSpeech: "verb" },
    { word: "يېمەك", translation: "吃", partOfSpeech: "verb" },
    { word: "بارماق", translation: "去", partOfSpeech: "verb" },
    { word: "كۆرۈشمەك", translation: "见面 / 会面", partOfSpeech: "verb" },
    { word: "قايتماق", translation: "回 / 返回", partOfSpeech: "verb" },
    { word: "ئەتمەك", translation: "做 / 制作（饭等）", partOfSpeech: "verb" },
    { word: "بەرمەك", translation: "给", partOfSpeech: "verb" },
    { word: "ھەر", translation: "每", partOfSpeech: "determiner" },
    { word: "ئاندىن", translation: "然后 / 之后", partOfSpeech: "adverb" },
    { word: "بىلەن", translation: "和 / 与（后置词）", partOfSpeech: "postposition" },
    { word: "بىرلىكتە", translation: "一起", partOfSpeech: "adverb" },
    { word: "بەك", translation: "很 / 非常", partOfSpeech: "adverb" },
    { word: "ئۆز", translation: "自己", partOfSpeech: "pronoun" },
    { word: "ياخشىمۇسىز", translation: "你好", partOfSpeech: "greeting" },
  ],

  // ===== Lesson 2: 第二课：市场购物 (article: بازاردا) =====
  [
    { word: "بۈگۈن", translation: "今天", partOfSpeech: "adverb" },
    { word: "ئالماق", translation: "买 / 拿", partOfSpeech: "verb" },
    { word: "ئىككى", translation: "二", partOfSpeech: "number" },
    { word: "ئۈچ", translation: "三", partOfSpeech: "number" },
    { word: "ئالتە", translation: "六", partOfSpeech: "number" },
    { word: "سەككىز", translation: "八", partOfSpeech: "number" },
    { word: "يۈەن", translation: "元（人民币）", partOfSpeech: "noun" },
    { word: "جەمئىي", translation: "总共 / 合计", partOfSpeech: "adverb" },
    { word: "ئادەم", translation: "人", partOfSpeech: "noun" },
    { word: "كۆپ", translation: "多 / 许多", partOfSpeech: "adjective" },
    { word: "ھەممە", translation: "全部 / 所有", partOfSpeech: "pronoun" },
    { word: "نەرسە", translation: "东西 / 事物", partOfSpeech: "noun" },
    { word: "موماي", translation: "老奶奶 / 老妇人", partOfSpeech: "noun" },
    { word: "بالا", translation: "孩子", partOfSpeech: "noun" },
    { word: "قارىماق", translation: "看 / 瞧", partOfSpeech: "verb" },
    { word: "كۈلمەك", translation: "笑", partOfSpeech: "verb" },
    { word: "سورىماق", translation: "问", partOfSpeech: "verb" },
    { word: "دېمەك", translation: "说", partOfSpeech: "verb" },
    { word: "ھەئە", translation: "是的", partOfSpeech: "particle" },
    { word: "يېمەك", translation: "吃", partOfSpeech: "verb" },
    { word: "مەن", translation: "我", partOfSpeech: "pronoun" },
    { word: "ئاندىن", translation: "然后 / 之后", partOfSpeech: "adverb" },
  ],

  // ===== Lesson 3: 第三课：我的家庭 (article: مېنىڭ ئائىلەم) =====
  [
    { word: "چوڭ", translation: "大的 / 年长的", partOfSpeech: "adjective" },
    { word: "دوختۇر", translation: "医生", partOfSpeech: "noun" },
    { word: "ئوقۇتقۇچى", translation: "老师 / 教师", partOfSpeech: "noun" },
    { word: "ئىككى", translation: "二", partOfSpeech: "number" },
    { word: "ۋە", translation: "和 / 与", partOfSpeech: "conjunction" },
    { word: "بار", translation: "有 / 存在", partOfSpeech: "verb" },
    { word: "ئىشلىمەك", translation: "工作", partOfSpeech: "verb" },
    { word: "كىچىك", translation: "小的 / 年幼的", partOfSpeech: "adjective" },
    { word: "ئوقۇماق", translation: "读 / 学习", partOfSpeech: "verb" },
    { word: "توي", translation: "婚礼 / 婚姻", partOfSpeech: "noun" },
    { word: "توي قىلماق", translation: "结婚", partOfSpeech: "verb" },
    { word: "بالا", translation: "孩子", partOfSpeech: "noun" },
    { word: "بىز", translation: "我们", partOfSpeech: "pronoun" },
    { word: "تۇرماق", translation: "居住 / 停留", partOfSpeech: "verb" },
    { word: "ئاقكۆڭۈل", translation: "善良的 / 好心的", partOfSpeech: "adjective" },
    { word: "ھەر", translation: "每", partOfSpeech: "determiner" },
    { word: "كۈن", translation: "天 / 日", partOfSpeech: "noun" },
    { word: "ھېكايە", translation: "故事", partOfSpeech: "noun" },
    { word: "سۆزلىمەك", translation: "讲 / 说", partOfSpeech: "verb" },
    { word: "بەرمەك", translation: "给", partOfSpeech: "verb" },
    { word: "ھەپتە", translation: "周 / 星期", partOfSpeech: "noun" },
    { word: "يەر", translation: "地方 / 处", partOfSpeech: "noun" },
    { word: "جەم", translation: "聚会 / 一起", partOfSpeech: "noun" },
    { word: "جەم بولماق", translation: "聚集 / 团聚", partOfSpeech: "verb" },
    { word: "بىرلىكتە", translation: "一起", partOfSpeech: "adverb" },
    { word: "تاماق", translation: "饭菜", partOfSpeech: "noun" },
    { word: "يېمەك", translation: "吃", partOfSpeech: "verb" },
    { word: "پاراڭلاشماق", translation: "聊天 / 交谈", partOfSpeech: "verb" },
    { word: "ئىللىق", translation: "温暖的", partOfSpeech: "adjective" },
    { word: "بەك", translation: "很 / 非常", partOfSpeech: "adverb" },
  ],

  // ===== Lesson 4: 第四章：日常活动 (article: كۈندىلىك پائالىيەتلەر) =====
  [
    { word: "كۈن", translation: "天 / 日", partOfSpeech: "noun" },
    { word: "ئەتىگەن", translation: "早晨", partOfSpeech: "noun" },
    { word: "يەتتە", translation: "七", partOfSpeech: "number" },
    { word: "ئالدى", translation: "前面 / 先", partOfSpeech: "noun" },
    { word: "يۈز", translation: "脸", partOfSpeech: "noun" },
    { word: "يۇيماق", translation: "洗", partOfSpeech: "verb" },
    { word: "ئاندىن", translation: "然后", partOfSpeech: "adverb" },
    { word: "سەككىز", translation: "八", partOfSpeech: "number" },
    { word: "مەكتەپ", translation: "学校", partOfSpeech: "noun" },
    { word: "ماڭماق", translation: "走 / 前往", partOfSpeech: "verb" },
    { word: "بىلەن", translation: "和 / 凭借（后置词）", partOfSpeech: "postposition" },
    { word: "بارماق", translation: "去", partOfSpeech: "verb" },
    { word: "چۈش", translation: "中午", partOfSpeech: "noun" },
    { word: "ئۆي", translation: "家 / 房子", partOfSpeech: "noun" },
    { word: "قايتماق", translation: "回 / 返回", partOfSpeech: "verb" },
    { word: "تاماق", translation: "饭菜", partOfSpeech: "noun" },
    { word: "يېمەك", translation: "吃", partOfSpeech: "verb" },
    { word: "كېيىن", translation: "之后 / 后来", partOfSpeech: "postposition" },
    { word: "كىتاب", translation: "书", partOfSpeech: "noun" },
    { word: "ئوقۇماق", translation: "读 / 学习", partOfSpeech: "verb" },
    { word: "كەچ", translation: "晚上", partOfSpeech: "noun" },
    { word: "ئون", translation: "十", partOfSpeech: "number" },
  ],

  // ===== Lesson 5: 第五章：天气与季节 (article: تۆت پەسىل) =====
  [
    { word: "ئۇيغۇر", translation: "维吾尔（人/语）", partOfSpeech: "noun" },
    { word: "دىيار", translation: "地区 / 地方", partOfSpeech: "noun" },
    { word: "تۆت", translation: "四", partOfSpeech: "number" },
    { word: "پەسىل", translation: "季节", partOfSpeech: "noun" },
    { word: "بار", translation: "有 / 存在", partOfSpeech: "verb" },
    { word: "ۋە", translation: "和 / 与", partOfSpeech: "conjunction" },
    { word: "ھاۋا", translation: "天气 / 空气", partOfSpeech: "noun" },
    { word: "ئىللىق", translation: "温暖的", partOfSpeech: "adjective" },
    { word: "بولماق", translation: "是 / 成为", partOfSpeech: "verb" },
    { word: "ئېچىلماق", translation: "开（花） / 绽放", partOfSpeech: "verb" },
    { word: "بەك", translation: "很 / 非常", partOfSpeech: "adverb" },
    { word: "تاتلىق", translation: "甜的", partOfSpeech: "adjective" },
    { word: "يوپۇرماق", translation: "叶子", partOfSpeech: "noun" },
    { word: "سارغايماق", translation: "变黄", partOfSpeech: "verb" },
    { word: "ياغماق", translation: "下（雨/雪）", partOfSpeech: "verb" },
  ],

  // ===== Lesson 6: 第六章：饮食文化 (article: ئۇيغۇر تائاملىرى) =====
  [
    { word: "ئۇيغۇر", translation: "维吾尔（人/语）", partOfSpeech: "noun" },
    { word: "تائام", translation: "食物 / 菜肴", partOfSpeech: "noun" },
    { word: "بەك", translation: "很 / 非常", partOfSpeech: "adverb" },
    { word: "مول", translation: "丰富的 / 丰盛的", partOfSpeech: "adjective" },
    { word: "ئەڭ", translation: "最", partOfSpeech: "adverb" },
    { word: "داڭلىق", translation: "有名的 / 著名的", partOfSpeech: "adjective" },
    { word: "بار", translation: "有 / 存在", partOfSpeech: "verb" },
    { word: "بىلەن", translation: "和 / 用（后置词）", partOfSpeech: "postposition" },
    { word: "ئەتمەك", translation: "做 / 烹制", partOfSpeech: "verb" },
    { word: "توي", translation: "婚礼", partOfSpeech: "noun" },
    { word: "توي-تۆكۈن", translation: "婚丧嫁娶 / 喜庆活动", partOfSpeech: "noun" },
    { word: "كۈندىلىك", translation: "日常的 / 每天的", partOfSpeech: "adjective" },
    { word: "كۈن", translation: "天 / 日", partOfSpeech: "noun" },
    { word: "ھەر", translation: "每", partOfSpeech: "determiner" },
    { word: "يېمەك", translation: "吃", partOfSpeech: "verb" },
    { word: "كەچ", translation: "晚上", partOfSpeech: "noun" },
    { word: "ئىچمەك", translation: "喝", partOfSpeech: "verb" },
    { word: "ۋە", translation: "和 / 与", partOfSpeech: "conjunction" },
    { word: "كۆكتات", translation: "蔬菜", partOfSpeech: "noun" },
  ],

  // ===== Lesson 7: 第七章：问路与出行 (article: يول سوراش) =====
  [
    { word: "بىر", translation: "一", partOfSpeech: "number" },
    { word: "كۈن", translation: "天 / 日", partOfSpeech: "noun" },
    { word: "مەن", translation: "我", partOfSpeech: "pronoun" },
    { word: "شەھەر", translation: "城市 / 城里", partOfSpeech: "noun" },
    { word: "بارماق", translation: "去", partOfSpeech: "verb" },
    { word: "ئىزدىمەك", translation: "寻找 / 找", partOfSpeech: "verb" },
    { word: "بوۋاي", translation: "老爷爷 / 老人", partOfSpeech: "noun" },
    { word: "سورىماق", translation: "问", partOfSpeech: "verb" },
    { word: "قەيەردە", translation: "在哪里", partOfSpeech: "adverb" },
    { word: "قەيەر", translation: "哪里", partOfSpeech: "pronoun" },
    { word: "ماڭماق", translation: "走 / 前往", partOfSpeech: "verb" },
    { word: "يېنىدا", translation: "在…旁边", partOfSpeech: "postposition" },
    { word: "يېنى", translation: "旁边 / 身边", partOfSpeech: "noun" },
    { word: "دېمەك", translation: "说", partOfSpeech: "verb" },
    { word: "راست", translation: "真的 / 真实的", partOfSpeech: "adjective" },
    { word: "راستلا", translation: "真的 / 确实", partOfSpeech: "adverb" },
    { word: "تاپماق", translation: "找到 / 找", partOfSpeech: "verb" },
  ],

  // ===== Lesson 8: 第八章：过去的故事 (article: بالىلىق ئەسلىمىلىرىم) =====
  [
    { word: "كىچىك", translation: "小的 / 小时候的", partOfSpeech: "adjective" },
    { word: "ۋاقىت", translation: "时间 / 时候", partOfSpeech: "noun" },
    { word: "ئولتۇرماق", translation: "坐 / 居住", partOfSpeech: "verb" },
    { word: "چوڭ", translation: "大的", partOfSpeech: "adjective" },
    { word: "ئىدى", translation: "是（过去时助动词）", partOfSpeech: "auxiliary" },
    { word: "ياز", translation: "夏天", partOfSpeech: "noun" },
    { word: "يازلىق", translation: "夏天的", partOfSpeech: "adjective" },
    { word: "دوست", translation: "朋友", partOfSpeech: "noun" },
    { word: "بىلەن", translation: "和 / 与（后置词）", partOfSpeech: "postposition" },
    { word: "بوي", translation: "旁 / 边 / 沿", partOfSpeech: "noun" },
    { word: "بارماق", translation: "去", partOfSpeech: "verb" },
    { word: "موما", translation: "奶奶 / 祖母", partOfSpeech: "noun" },
    { word: "ھەر", translation: "每", partOfSpeech: "determiner" },
    { word: "كۈن", translation: "天 / 日", partOfSpeech: "noun" },
    { word: "سۆزلىمەك", translation: "讲 / 说", partOfSpeech: "verb" },
    { word: "بەك", translation: "很 / 非常", partOfSpeech: "adverb" },
    { word: "دادا", translation: "父亲 / 爸爸", partOfSpeech: "noun" },
    { word: "ۋېلىسىپىت", translation: "自行车", partOfSpeech: "noun" },
    { word: "ئالماق", translation: "买 / 拿", partOfSpeech: "verb" },
    { word: "بەرمەك", translation: "给", partOfSpeech: "verb" },
    { word: "بولماق", translation: "是 / 成为", partOfSpeech: "verb" },
  ],
];

function normalizeWord(w: string): string {
  return w.trim().replace(/[ \t]+/g, " ");
}

async function main() {
  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    console.error(`User "${USERNAME}" not found`);
    process.exit(1);
  }
  const course = await prisma.course.findFirst({
    where: { userId: user.id, language: COURSE_LANGUAGE },
    include: {
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!course) {
    console.error(`Uyghur course for "${USERNAME}" not found`);
    process.exit(1);
  }

  console.log(`Course id=${course.id}: "${course.title}"`);
  console.log(`Chapters: ${course.chapters.length}, additions prepared: ${ADDITIONS.length}\n`);

  if (course.chapters.length !== ADDITIONS.length) {
    console.error(
      `Mismatch: ${course.chapters.length} chapters but ${ADDITIONS.length} addition sets. Aborting.`,
    );
    process.exit(1);
  }

  let totalAdded = 0;
  for (let i = 0; i < course.chapters.length; i++) {
    const chapter = course.chapters[i];
    // A chapter may have one or more items; we enrich items whose content has a
    // vocabulary section. For this course there is exactly one lesson item per
    // chapter, so we take the first item that has vocabulary.
    const item = chapter.items.find((it) => {
      const c = it.content as LessonContent | null;
      return c && typeof c === "object" && Array.isArray(c.vocabulary?.items);
    });
    if (!item) {
      console.warn(
        `Chapter ${chapter.sortOrder} (id=${chapter.id}): no item with vocabulary — skipped`,
      );
      continue;
    }

    const content = item.content as LessonContent;
    const existingItems: VocabItem[] = Array.isArray(content.vocabulary?.items)
      ? (content.vocabulary!.items as VocabItem[])
      : [];
    const existingWords = new Set(existingItems.map((v) => normalizeWord(v.word)));

    const toAppend: VocabItem[] = [];
    const seenNew = new Set<string>();
    for (const candidate of ADDITIONS[i]) {
      const key = normalizeWord(candidate.word);
      if (existingWords.has(key)) continue; // already in this lesson's vocab
      if (seenNew.has(key)) continue; // duplicate within additions
      seenNew.add(key);
      toAppend.push(candidate);
    }

    if (toAppend.length === 0) {
      console.log(
        `Chapter ${chapter.sortOrder} (item id=${item.id}): nothing to add (existing ${existingItems.length})`,
      );
      continue;
    }

    const mergedItems = [...existingItems, ...toAppend];
    const newContent: LessonContent = {
      ...content,
      vocabulary: { items: mergedItems },
    };

    await prisma.chapterItem.update({
      where: { id: item.id },
      data: { content: newContent as unknown as object },
    });

    totalAdded += toAppend.length;
    console.log(
      `Chapter ${chapter.sortOrder} (item id=${item.id}): added ${toAppend.length} → total ${mergedItems.length}`,
    );
  }

  console.log(`\nDone. Total vocabulary items added: ${totalAdded}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
