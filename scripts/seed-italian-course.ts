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
const COURSE_TITLE = "意大利语入门 — Italiano per cinesi";

// ============================================
// Types (mirror course-repository-dto.ts LessonContent)
// ============================================

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
  chapterTitle: string;
  lessonTitle: string;
  article: { body: string; translation: string };
  dialogue: { lines: DialogueLine[] };
  vocabulary: { items: VocabItem[] };
  grammar: { body: string };
  exercises: { questions: Question[] };
};

// ============================================
// Course content — 8 chapters, Chinese learner language
// Dialogue speakers use consistent Italian names: Marco, Giulia, plus
// Cameriere/Passante as needed. All translations into Chinese.
// ============================================

const CHAPTERS: ChapterData[] = [
  // ---------- Chapter 1 ----------
  {
    chapterTitle: "第一章：基础发音与问候",
    lessonTitle: "第一课：初次见面",
    article: {
      body:
        "## Il mio primo incontro\n\n" +
        "Mi chiamo Marco. Sono uno studente. Ogni mattina mi sveglio presto, mi lavo la faccia e faccio colazione. Poi vado a scuola.\n\n" +
        "A scuola incontro i miei amici. Li saluto: «Ciao! Come stai?» Loro mi rispondono: «Bene, grazie. E tu?»\n\n" +
        "A mezzogiorno torno a casa. Mia madre prepara il pranzo. Mangiamo insieme. Il cibo è molto buono.",
      translation:
        "## 我的初次相遇\n\n" +
        "我叫马尔科。我是学生。每天早上我很早起床，洗脸，吃早饭。然后去学校。\n\n" +
        "在学校我见到朋友们。我向他们打招呼：「你好！你怎么样？」他们回答我：「很好，谢谢。你呢？」\n\n" +
        "中午我回家。妈妈做午饭。我们一起吃饭。饭菜非常美味。",
    },
    dialogue: {
      lines: [
        { speaker: "Marco", text: "Ciao! Come stai?", translation: "你好！你怎么样？" },
        { speaker: "Giulia", text: "Bene, grazie. E tu?", translation: "很好，谢谢。你呢？" },
        { speaker: "Marco", text: "Anch'io bene. Come ti chiami?", translation: "我也很好。你叫什么名字？" },
        { speaker: "Giulia", text: "Mi chiamo Giulia. E tu?", translation: "我叫朱莉娅。你呢？" },
        { speaker: "Marco", text: "Mi chiamo Marco. Piacere di conoscerti.", translation: "我叫马尔科。很高兴认识你。" },
        { speaker: "Giulia", text: "Piacere mio. Arrivederci!", translation: "我也是。再见！" },
      ],
    },
    vocabulary: {
      items: [
        { word: "ciao", translation: "你好 / 再见", partOfSpeech: "interjection", example: "Ciao! Come stai?" },
        { word: "bene", translation: "好 / 很好", partOfSpeech: "adverb", example: "Sto bene, grazie." },
        { word: "grazie", translation: "谢谢", partOfSpeech: "interjection", example: "Grazie mille!" },
        { word: "prego", translation: "不客气 / 请", partOfSpeech: "interjection", example: "Prego, si accomodi." },
        { word: "io", translation: "我", partOfSpeech: "pronoun", example: "Io sono Marco." },
        { word: "tu", translation: "你", partOfSpeech: "pronoun", example: "E tu?" },
        { word: "nome", translation: "名字", partOfSpeech: "noun", example: "Il mio nome è Marco." },
        { word: "studente", translation: "学生", partOfSpeech: "noun", example: "Sono uno studente." },
        { word: "scuola", translation: "学校", partOfSpeech: "noun", example: "Vado a scuola." },
        { word: "amico", translation: "朋友", partOfSpeech: "noun", example: "Lui è un amico." },
      ],
    },
    grammar: {
      body:
        "## 基本语序\n\n" +
        "意大利语是 **主语-谓语-宾语 (SVO)** 语序。\n\n" +
        "| 中文 | 意大利语 | 分析 |\n|---|---|---|\n" +
        "| 我吃面包 | Io mangio il pane | Io(我) + mangio(吃) + il pane(面包) |\n" +
        "| 他喝水 | Lui beve l'acqua | Lui(他) + beve(喝) + l'acqua(水) |\n\n" +
        "## 人称代词\n\n" +
        "| 人称 | 意大利语 |\n|---|---|\n" +
        "| 我 | io |\n| 我们 | noi |\n| 你 | tu |\n| 你们 | voi |\n| 他 | lui |\n| 她 | lei |\n| 他们 | loro |\n\n" +
        "## 动词现在时：essere (是)\n\n" +
        "| 人称 | 变位 |\n|---|---|\n" +
        "| io | sono |\n| tu | sei |\n" +
        "| lui/lei | è |\n| noi | siamo |\n" +
        "| voi | siete |\n| loro | sono |\n\n" +
        "例句：\n" +
        "- Io **sono** studente. (我是学生。)\n" +
        "- Tu **sei** mio amico. (你是我的朋友。)\n" +
        "- Lei **è** italiana. (她是意大利人。)",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"grazie\" 是什么意思？",
          options: ["你好", "谢谢", "再见", "对不起"],
          answer: 1,
          explanation: "grazie 意为\"谢谢\"。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "意大利语中打招呼最常用的词是？",
          options: ["addio", "ciao", "no", "forse"],
          answer: 1,
          explanation: "ciao 既可以表示\"你好\"，也可以表示\"再见\"。",
        },
        {
          type: "FILL_BLANK",
          question: "打招呼时说 \"___! Come stai?\"，横线处应填？",
          answer: "Ciao",
          explanation: "Ciao 是最常用的问候语。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Io ___ studente.\" 中应填？",
          options: ["sei", "sono", "è", "siamo"],
          answer: 1,
          explanation: "与 io 对应的 essere 变位是 sono。",
        },
      ],
    },
  },

  // ---------- Chapter 2 ----------
  {
    chapterTitle: "第二章：数字与时间",
    lessonTitle: "第二课：现在几点了？",
    article: {
      body:
        "## Che ore sono?\n\n" +
        "Oggi è lunedì. Sono le otto di mattina. Marco deve andare a scuola. Guarda l'orologio: «Sono le otto! Devo correre!»\n\n" +
        "A scuola, la prima lezione inizia alle nove. Il professore entra in classe e dice: «Buongiorno a tutti!» Gli studenti rispondono: «Buongiorno, professore!»\n\n" +
        "La lezione finisce a mezzogiorno. Marco ha lezione tre ore al giorno. Dopo la scuola, va in biblioteca a studiare.",
      translation:
        "## 现在几点了？\n\n" +
        "今天是星期一。早上八点。马尔科必须去学校。他看了看钟：「八点了！我得赶紧！」\n\n" +
        "在学校，第一节课九点开始。老师走进教室说：「大家早上好！」学生们回答：「老师早上好！」\n\n" +
        "中午十二点下课。马尔科每天有三节课。放学后，他去图书馆学习。",
    },
    dialogue: {
      lines: [
        { speaker: "Marco", text: "Scusa, che ore sono?", translation: "打扰一下，现在几点了？" },
        { speaker: "Giulia", text: "Sono le tre e mezza.", translation: "三点半。" },
        { speaker: "Marco", text: "Grazie! Ho una lezione alle quattro.", translation: "谢谢！我四点有课。" },
        { speaker: "Giulia", text: "Anch'io. Oggi ho tre lezioni.", translation: "我也是。今天我有三节课。" },
        { speaker: "Marco", text: "A che ora finisci?", translation: "你几点结束？" },
        { speaker: "Giulia", text: "Finisco alle sei. E tu?", translation: "我六点结束。你呢？" },
        { speaker: "Marco", text: "Anch'io alle sei. Andiamo via insieme?", translation: "我也是六点。我们一起走吗？" },
        { speaker: "Giulia", text: "Va bene! A dopo!", translation: "好的！待会儿见！" },
      ],
    },
    vocabulary: {
      items: [
        { word: "ora", translation: "小时 / 点钟", partOfSpeech: "noun", example: "Che ore sono?" },
        { word: "orologio", translation: "钟 / 表", partOfSpeech: "noun", example: "Guardo l'orologio." },
        { word: "mattina", translation: "早上", partOfSpeech: "noun", example: "La mattina bevo il caffè." },
        { word: "mezzogiorno", translation: "中午", partOfSpeech: "noun", example: "A mezzogiorno mangio." },
        { word: "sera", translation: "晚上", partOfSpeech: "noun", example: "La sera guardo la TV." },
        { word: "giorno", translation: "天 / 日", partOfSpeech: "noun", example: "Oggi è un bel giorno." },
        { word: "oggi", translation: "今天", partOfSpeech: "adverb", example: "Oggi piove." },
        { word: "domani", translation: "明天", partOfSpeech: "adverb", example: "Domani vado a Roma." },
        { word: "lezione", translation: "课 / 课程", partOfSpeech: "noun", example: "La lezione inizia alle nove." },
        { word: "professore", translation: "老师 / 教授", partOfSpeech: "noun", example: "Il professore è bravo." },
      ],
    },
    grammar: {
      body:
        "## 数字 1-10\n\n" +
        "| 数字 | 意大利语 |\n|---|---|\n" +
        "| 1 | uno |\n| 2 | due |\n| 3 | tre |\n" +
        "| 4 | quattro |\n| 5 | cinque |\n| 6 | sei |\n" +
        "| 7 | sette |\n| 8 | otto |\n| 9 | nove |\n" +
        "| 10 | dieci |\n\n" +
        "## 询问时间\n\n" +
        "- **Che ore sono?** = 现在几点了？（复数形式）\n" +
        "- **Che ora è?** = 现在几点了？（单数形式）\n\n" +
        "## 回答时间\n\n" +
        "- È l'**una**. = 一点。\n" +
        "- Sono le **due**. = 两点。\n" +
        "- Sono le **tre e mezza**. = 三点半。\n" +
        "- Sono le **quattro e un quarto**. = 四点十五。\n\n" +
        "## 动词 andare (去)\n\n" +
        "| 人称 | 变位 |\n|---|---|\n" +
        "| io | vado |\n| tu | vai |\n" +
        "| lui/lei | va |\n| noi | andiamo |\n" +
        "| voi | andate |\n| loro | vanno |\n\n" +
        "例句：\n" +
        "- Io **vado** a scuola. (我去学校。)\n" +
        "- Tu **vai** a casa. (你回家。)",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Sono le otto.\" 是什么意思？",
          options: ["八点", "两点", "十点", "五点"],
          answer: 0,
          explanation: "otto = 8。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Che ore sono?\" 是什么意思？",
          options: ["今天是星期几", "现在几点了", "你好吗", "你叫什么"],
          answer: 1,
          explanation: "Che ore sono? = 现在几点了？",
        },
        {
          type: "FILL_BLANK",
          question: "\"È l'___.\"（一点钟）",
          answer: "una",
          explanation: "一点钟用单数形式 una。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Io ___ a scuola.\" 中应填？",
          options: ["vado", "vai", "va", "andiamo"],
          answer: 0,
          explanation: "与 io 对应的 andare 变位是 vado。",
        },
      ],
    },
  },

  // ---------- Chapter 3 ----------
  {
    chapterTitle: "第三章：家庭与朋友",
    lessonTitle: "第三课：我的家人",
    article: {
      body:
        "## La mia famiglia\n\n" +
        "La mia famiglia è grande. Siamo in cinque: mio padre, mia madre, due fratelli ed io.\n\n" +
        "Mio padre si chiama Giovanni. Lavora in un ufficio. Mia madre si chiama Anna. È insegnante. I miei fratelli sono più piccoli di me. Hanno dieci e dodici anni.\n\n" +
        "La domenica andiamo tutti insieme a casa dei nonni. La nonna cucina la pasta. Il nonno racconta storie del passato. Siamo molto uniti.",
      translation:
        "## 我的家庭\n\n" +
        "我的家庭很大。我们有五口人：爸爸、妈妈、两个兄弟和我。\n\n" +
        "我爸爸叫乔瓦尼。他在办公室工作。我妈妈叫安娜。她是老师。我的兄弟们比我小。他们十岁和十二岁。\n\n" +
        "星期天我们全家一起去爷爷奶奶家。奶奶做意大利面。爷爷讲过去的故事。我们非常亲密。",
    },
    dialogue: {
      lines: [
        { speaker: "Marco", text: "Hai dei fratelli?", translation: "你有兄弟姐妹吗？" },
        { speaker: "Giulia", text: "Sì, ho una sorella. Si chiama Sofia.", translation: "有，我有一个姐姐。她叫索菲娅。" },
        { speaker: "Marco", text: "Quanti anni ha?", translation: "她几岁了？" },
        { speaker: "Giulia", text: "Ha sedici anni. E tu?", translation: "她十六岁。你呢？" },
        { speaker: "Marco", text: "Io ho un fratello piccolo.", translation: "我有一个弟弟。" },
        { speaker: "Giulia", text: "Come si chiama?", translation: "他叫什么名字？" },
        { speaker: "Marco", text: "Si chiama Luca. Ha cinque anni.", translation: "他叫卢卡。五岁了。" },
      ],
    },
    vocabulary: {
      items: [
        { word: "famiglia", translation: "家庭", partOfSpeech: "noun", example: "La mia famiglia è grande." },
        { word: "padre", translation: "父亲", partOfSpeech: "noun", example: "Mio padre lavora." },
        { word: "madre", translation: "母亲", partOfSpeech: "noun", example: "Mia madre cucina." },
        { word: "fratello", translation: "兄弟", partOfSpeech: "noun", example: "Ho un fratello." },
        { word: "sorella", translation: "姐妹", partOfSpeech: "noun", example: "Ho una sorella." },
        { word: "nonno", translation: "祖父", partOfSpeech: "noun", example: "Mio nonno è vecchio." },
        { word: "nonna", translation: "祖母", partOfSpeech: "noun", example: "Mia nonna cucina bene." },
        { word: "figlio", translation: "儿子", partOfSpeech: "noun", example: "Hai un figlio?" },
        { word: "anno", translation: "年 / 岁", partOfSpeech: "noun", example: "Ho vent'anni." },
        { word: "amico", translation: "朋友", partOfSpeech: "noun", example: "Lui è un amico." },
      ],
    },
    grammar: {
      body:
        "## 物主形容词\n\n" +
        "表示\"我的、你的、他的……\"的词。\n\n" +
        "| 人称 | 阳性单数 | 阴性单数 | 阳性复数 | 阴性复数 |\n|---|---|---|---|---|\n" +
        "| 我的 | mio | mia | miei | mie |\n" +
        "| 你的 | tuo | tua | tuoi | tue |\n" +
        "| 他的/她的 | suo | sua | suoi | sue |\n" +
        "| 我们的 | nostro | nostra | nostri | nostre |\n" +
        "| 你们的 | vostro | vostra | vostri | vostre |\n" +
        "| 他们的 | loro | loro | loro | loro |\n\n" +
        "注意：意大利语中，物主形容词通常要加定冠词：\n" +
        "- **il mio** padre (我的父亲)\n" +
        "- **la mia** madre (我的母亲)\n\n" +
        "例外：对于单数直系亲属（父亲、母亲、兄弟、姐妹等），可省略冠词：\n" +
        "- **mio** padre, **mia** madre, **mio** fratello\n\n" +
        "## 动词 avere (有)\n\n" +
        "| 人称 | 变位 |\n|---|---|\n" +
        "| io | ho |\n| tu | hai |\n" +
        "| lui/lei | ha |\n| noi | abbiamo |\n" +
        "| voi | avete |\n| loro | hanno |\n\n" +
        "例句：\n" +
        "- Io **ho** un fratello. (我有一个兄弟。)\n" +
        "- Tu **hai** una sorella. (你有一个姐妹。)\n" +
        "- Lui **ha** vent'anni. (他二十岁。)  *(注：vent'anni = venti anni 的省略形式)*",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Ho ___ fratello.\"（我有一个兄弟）",
          options: ["un", "una", "uno", "i"],
          answer: 0,
          explanation: "fratello 是阳性名词，以辅音开头，用 un。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Quanti anni ___?\"（你几岁了？）",
          options: ["ho", "hai", "ha", "hanno"],
          answer: 1,
          explanation: "询问对方年龄用 tu 的 hai。",
        },
        {
          type: "FILL_BLANK",
          question: "\"Mio padre ha una sorella. È la mia ___.\"（父亲的姐妹）",
          answer: "zia",
          explanation: "父亲的姐妹是 zia（姑姑/阿姨）。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "下列哪个表示\"姐妹\"？",
          options: ["fratello", "sorella", "padre", "madre"],
          answer: 1,
          explanation: "sorella = 姐妹。",
        },
      ],
    },
  },

  // ---------- Chapter 4 ----------
  {
    chapterTitle: "第四章：日常生活",
    lessonTitle: "第四课：我的一天",
    article: {
      body:
        "## La mia giornata\n\n" +
        "Mi sveglio alle sette. Faccio la doccia, mi vesto e poi faccio colazione. Bevo un caffè e mangio dei biscotti.\n\n" +
        "Alle otto esco di casa. Prendo l'autobus per andare al lavoro. Lavoro in un ufficio in centro. Faccio la pausa pranzo all'una. Mangio un panino al bar.\n\n" +
        "Dopo il lavoro, alle sei, vado in palestra. Faccio ginnastica per un'ora. Poi torno a casa, preparo la cena e guardo un po' di televisione. Vado a letto verso le undici.",
      translation:
        "## 我的一天\n\n" +
        "我七点起床。洗澡，穿衣服，然后吃早饭。我喝咖啡，吃饼干。\n\n" +
        "八点出门。我坐公交车去上班。我在市中心的一个办公室工作。一点午休。我在酒吧吃三明治。\n\n" +
        "下班后，六点，我去健身房。锻炼一个小时。然后回家，准备晚饭，看会儿电视。大约十一点睡觉。",
    },
    dialogue: {
      lines: [
        { speaker: "Marco", text: "Cosa fai la mattina?", translation: "你早上做什么？" },
        { speaker: "Giulia", text: "Mi sveglio presto e faccio ginnastica.", translation: "我很早起床做体操。" },
        { speaker: "Marco", text: "E dopo?", translation: "然后呢？" },
        { speaker: "Giulia", text: "Faccio colazione e vado al lavoro.", translation: "吃早饭去上班。" },
        { speaker: "Marco", text: "A che ora pranzi?", translation: "你几点吃午饭？" },
        { speaker: "Giulia", text: "Pranzo all'una. E tu?", translation: "我一点吃午饭。你呢？" },
        { speaker: "Marco", text: "Io all'una e mezza.", translation: "我一点半。" },
        { speaker: "Giulia", text: "Cosa fai la sera?", translation: "你晚上做什么？" },
        { speaker: "Marco", text: "Guardo la TV o leggo un libro.", translation: "我看电视或读书。" },
      ],
    },
    vocabulary: {
      items: [
        { word: "svegliarsi", translation: "醒来 / 起床", partOfSpeech: "verb", example: "Mi sveglio alle sette." },
        { word: "doccia", translation: "淋浴", partOfSpeech: "noun", example: "Faccio la doccia." },
        { word: "colazione", translation: "早餐", partOfSpeech: "noun", example: "Faccio colazione." },
        { word: "pranzo", translation: "午餐", partOfSpeech: "noun", example: "A mezzogiorno pranzo." },
        { word: "cena", translation: "晚餐", partOfSpeech: "noun", example: "La sera ceno." },
        { word: "lavoro", translation: "工作", partOfSpeech: "noun", example: "Vado al lavoro." },
        { word: "casa", translation: "家 / 房子", partOfSpeech: "noun", example: "Vado a casa." },
        { word: "autobus", translation: "公交车", partOfSpeech: "noun", example: "Prendo l'autobus." },
        { word: "palestra", translation: "健身房", partOfSpeech: "noun", example: "Vado in palestra." },
        { word: "letto", translation: "床", partOfSpeech: "noun", example: "Vado a letto." },
      ],
    },
    grammar: {
      body:
        "## 反身动词\n\n" +
        "反身动词表示动作作用于自身，其变位需要反身代词。\n\n" +
        "### 反身代词\n\n" +
        "| 人称 | 反身代词 |\n|---|---|\n" +
        "| io | mi |\n| tu | ti |\n" +
        "| lui/lei | si |\n| noi | ci |\n" +
        "| voi | vi |\n| loro | si |\n\n" +
        "### 常用反身动词\n\n" +
        "- **svegliarsi** = 醒来\n" +
        "- **alzarsi** = 起床\n" +
        "- **lavarsi** = 洗（自己）\n" +
        "- **vestirsi** = 穿衣\n" +
        "- **chiamarsi** = 名叫\n\n" +
        "### 变位示例：alzarsi (起床)\n\n" +
        "| 人称 | 变位 |\n|---|---|\n" +
        "| io | mi alzo |\n| tu | ti alzi |\n" +
        "| lui/lei | si alza |\n| noi | ci alziamo |\n" +
        "| voi | vi alzate |\n| loro | si alzano |\n\n" +
        "例句：\n" +
        "- Io **mi alzo** alle sette. (我七点起床。)\n" +
        "- Tu **ti chiami** Marco. (你叫马尔科。)\n" +
        "- Lei **si lava** la faccia. (她洗脸。)",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Faccio la doccia\" 是什么意思？",
          options: ["我吃早饭", "我洗澡", "我上班", "我睡觉"],
          answer: 1,
          explanation: "doccia = 淋浴。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"___ mi sveglio alle sette.\"（我七点醒来）",
          options: ["Mi", "Ti", "Si", "Ci"],
          answer: 0,
          explanation: "io 的反身代词是 mi。",
        },
        {
          type: "FILL_BLANK",
          question: "\"La sera io ___ la TV.\"（我晚上看电视，用 guardare 的第一人称）",
          answer: "guardo",
          explanation: "io 的 guardare 变位是 guardo。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "下列哪个是\"早餐\"？",
          options: ["pranzo", "cena", "colazione", "merenda"],
          answer: 2,
          explanation: "colazione = 早餐；pranzo = 午餐；cena = 晚餐。",
        },
      ],
    },
  },

  // ---------- Chapter 5 ----------
  {
    chapterTitle: "第五章：天气与季节",
    lessonTitle: "第五课：今天天气怎么样？",
    article: {
      body:
        "## Il tempo e le stagioni\n\n" +
        "In Italia ci sono quattro stagioni: primavera, estate, autunno e inverno. Ogni stagione ha il suo clima.\n\n" +
        "In primavera il tempo è mite. I fiori sbocciano e gli alberi diventano verdi. È una stagione bellissima.\n\n" +
        "In estate fa molto caldo. Il sole splende e le persone vanno al mare. Mi piace nuotare nel mare blu.\n\n" +
        "In autunno piove spesso. Le foglie degli alberi cadono e diventano gialle o rosse. È una stagione malinconica.\n\n" +
        "In inverno fa freddo e nevica. La gente indossa cappotti e sciarpe. A Natale, le famiglie si riuniscono.",
      translation:
        "## 天气与季节\n\n" +
        "意大利有四个季节：春、夏、秋、冬。每个季节都有它自己的气候。\n\n" +
        "春天天气温和。花朵盛开，树木变绿。这是一个美丽的季节。\n\n" +
        "夏天非常热。阳光灿烂，人们去海边。我喜欢在蓝色的大海里游泳。\n\n" +
        "秋天经常下雨。树叶落下，变成黄色或红色。这是一个忧郁的季节。\n\n" +
        "冬天很冷，下雪。人们穿上大衣和围巾。圣诞节时，全家人团聚。",
    },
    dialogue: {
      lines: [
        { speaker: "Marco", text: "Che tempo fa oggi?", translation: "今天天气怎么样？" },
        { speaker: "Giulia", text: "Fa bel tempo. C'è il sole.", translation: "天气很好。有太阳。" },
        { speaker: "Marco", text: "Che temperatura c'è?", translation: "温度是多少？" },
        { speaker: "Giulia", text: "Ci sono venti gradi.", translation: "二十度。" },
        { speaker: "Marco", text: "E domani?", translation: "明天呢？" },
        { speaker: "Giulia", text: "Domani piove, dicono.", translation: "他们说，明天会下雨。" },
        { speaker: "Marco", text: "Allora porto l'ombrello.", translation: "那我带伞。" },
        { speaker: "Giulia", text: "Sì, è meglio!", translation: "对，最好这样！" },
      ],
    },
    vocabulary: {
      items: [
        { word: "tempo", translation: "天气 / 时间", partOfSpeech: "noun", example: "Che tempo fa?" },
        { word: "stagione", translation: "季节", partOfSpeech: "noun", example: "La mia stagione preferita." },
        { word: "primavera", translation: "春天", partOfSpeech: "noun", example: "In primavera fa bello." },
        { word: "estate", translation: "夏天", partOfSpeech: "noun", example: "In estate fa caldo." },
        { word: "autunno", translation: "秋天", partOfSpeech: "noun", example: "In autunno piove." },
        { word: "inverno", translation: "冬天", partOfSpeech: "noun", example: "In inverno nevica." },
        { word: "sole", translation: "太阳", partOfSpeech: "noun", example: "C'è il sole." },
        { word: "pioggia", translation: "雨", partOfSpeech: "noun", example: "La pioggia cade." },
        { word: "neve", translation: "雪", partOfSpeech: "noun", example: "La neve è bianca." },
        { word: "freddo", translation: "冷 / 寒冷", partOfSpeech: "adjective", example: "Fa freddo." },
      ],
    },
    grammar: {
      body:
        "## 描述天气\n\n" +
        "### 使用 fare 表达天气\n\n" +
        "- **Fa bel tempo.** = 天气好。\n" +
        "- **Fa brutto tempo.** = 天气坏。\n" +
        "- **Fa caldo.** = 天气热。\n" +
        "- **Fa freddo.** = 天气冷。\n" +
        "- **Fa vento.** = 刮风。\n\n" +
        "### 其他天气表达\n\n" +
        "- **C'è il sole.** = 出太阳。\n" +
        "- **Piove.** = 下雨。\n" +
        "- **Nevica.** = 下雪。\n" +
        "- **C'è la nebbia.** = 有雾。\n\n" +
        "## 季节介词\n\n" +
        "| 季节 | 介词 |\n|---|---|\n" +
        "| 春天 | in primavera |\n" +
        "| 夏天 | in estate |\n" +
        "| 秋天 | in autunno |\n" +
        "| 冬天 | in inverno |\n\n" +
        "## 动词 piacere (喜欢)\n\n" +
        "piacere 的用法与中文不同，主语是\"被喜欢的事物\"。\n\n" +
        "- Mi **piace** il caffè. = 我喜欢咖啡。（字面：咖啡让我高兴）\n" +
        "- Mi **piacciono** i libri. = 我喜欢书。\n" +
        "- Ti **piace** la pizza? = 你喜欢披萨吗？\n\n" +
        "规则：单数事物用 piace，复数事物用 piacciono。",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Fa caldo\" 是什么意思？",
          options: ["天气冷", "天气热", "下雨", "刮风"],
          answer: 1,
          explanation: "caldo = 热。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "哪个季节是 \"in estate\"？",
          options: ["春天", "夏天", "秋天", "冬天"],
          answer: 1,
          explanation: "estate = 夏天。",
        },
        {
          type: "FILL_BLANK",
          question: "\"In inverno ___ .\"（下雪，用动词）",
          answer: "nevica",
          explanation: "nevica 来自 nevicare（下雪）。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Mi ___ la pizza.\"（我喜欢披萨）",
          options: ["piace", "piacciono", "piaci", "piaccio"],
          answer: 0,
          explanation: "单数名词用 piace。",
        },
      ],
    },
  },

  // ---------- Chapter 6 ----------
  {
    chapterTitle: "第六章：饮食与餐厅",
    lessonTitle: "第六课：在餐厅",
    article: {
      body:
        "## Al ristorante\n\n" +
        "Stasera Marco e Giulia vanno al ristorante. È un ristorante italiano tipico. Il cameriere li accoglie: «Buonasera! Un tavolo per due?»\n\n" +
        "Si siedono e guardano il menu. Giulia ordina un piatto di pasta al pomodoro e un'insalata. Marco prende una pizza margherita e una birra. Per dolce, prendono il tiramisù.\n\n" +
        "Dopo cena, il cameriere porta il conto. Marco paga per tutti. Lascia una mancia sul tavolo. La cena è deliziosa. Tornano a casa soddisfatti.",
      translation:
        "## 在餐厅\n\n" +
        "今晚马尔科和朱莉娅去餐厅。这是一家典型的意大利餐厅。服务员迎接他们：「晚上好！两人一桌？」\n\n" +
        "他们坐下，看菜单。朱莉娅点了一份番茄意大利面和一份沙拉。马尔科要了一个玛格丽特披萨和一杯啤酒。甜点他们要了提拉米苏。\n\n" +
        "晚饭后，服务员拿来账单。马尔科付了所有人的钱。他在桌上留了小费。晚餐非常美味。他们满意地回家。",
    },
    dialogue: {
      lines: [
        { speaker: "Cameriere", text: "Buonasera! Un tavolo per due?", translation: "晚上好！两人桌吗？" },
        { speaker: "Marco", text: "Sì, grazie.", translation: "是的，谢谢。" },
        { speaker: "Cameriere", text: "Ecco il menu. Cosa desiderate?", translation: "这是菜单。您想点什么？" },
        { speaker: "Giulia", text: "Per me, un piatto di pasta.", translation: "我要一份意面。" },
        { speaker: "Marco", text: "Io prendo una pizza.", translation: "我要一个披萨。" },
        { speaker: "Cameriere", text: "Da bere?", translation: "喝点什么？" },
        { speaker: "Giulia", text: "Un bicchiere di vino rosso.", translation: "一杯红酒。" },
        { speaker: "Marco", text: "Per me, una birra.", translation: "我要啤酒。" },
        { speaker: "Cameriere", text: "Subito!", translation: "马上来！" },
      ],
    },
    vocabulary: {
      items: [
        { word: "ristorante", translation: "餐厅", partOfSpeech: "noun", example: "Andiamo al ristorante." },
        { word: "menu", translation: "菜单", partOfSpeech: "noun", example: "Guardo il menu." },
        { word: "cameriere", translation: "服务员", partOfSpeech: "noun", example: "Il cameriere è gentile." },
        { word: "piatto", translation: "盘 / 菜", partOfSpeech: "noun", example: "Un piatto di pasta." },
        { word: "pasta", translation: "意大利面", partOfSpeech: "noun", example: "Mi piace la pasta." },
        { word: "pizza", translation: "披萨", partOfSpeech: "noun", example: "La pizza è buona." },
        { word: "pesce", translation: "鱼", partOfSpeech: "noun", example: "Mi piace il pesce." },
        { word: "vino", translation: "葡萄酒", partOfSpeech: "noun", example: "Un bicchiere di vino." },
        { word: "acqua", translation: "水", partOfSpeech: "noun", example: "Bevo l'acqua." },
        { word: "conto", translation: "账单", partOfSpeech: "noun", example: "Il conto, per favore." },
      ],
    },
    grammar: {
      body:
        "## 定冠词\n\n" +
        "意大利语的定冠词（相当于英文 the）根据名词的性、数和首字母变化。\n\n" +
        "### 阳性单数\n\n" +
        "| 名词首字母 | 定冠词 | 例 |\n|---|---|---|\n" +
        "| 一般辅音 | il | il pane (面包) |\n" +
        "| z, s+辅音, gn, ps | lo | lo zio (叔叔) |\n" +
        "| 元音 | l' | l'amico (朋友) |\n\n" +
        "### 阳性复数\n\n" +
        "| 名词首字母 | 定冠词 | 例 |\n|---|---|---|\n" +
        "| 一般辅音 | i | i libri (书) |\n" +
        "| z, s+辅音, gn, ps, 元音 | gli | gli zii (叔叔们), gli amici (朋友们) |\n\n" +
        "### 阴性\n\n" +
        "| 单数 | 复数 | 例 |\n|---|---|---|\n" +
        "| 一般辅音 → la | le | la casa (家) / le case |\n" +
        "| 元音 → l' | le | l'acqua (水) / le acque |\n\n" +
        "## 点餐用语\n\n" +
        "- **Per me, ___ .** = 我要 ___。\n" +
        "- **Io prendo ___ .** = 我要 ___。\n" +
        "- **Da bere?** = 喝点什么？\n" +
        "- **Il conto, per favore.** = 请结账。",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Un bicchiere di vino\" 是什么意思？",
          options: ["一杯水", "一杯啤酒", "一杯葡萄酒", "一杯咖啡"],
          answer: 2,
          explanation: "vino = 葡萄酒。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Il ___\"（朋友 amico，单数）— 注意 amico 以元音开头。",
          options: ["il", "lo", "la", "l'"],
          answer: 3,
          explanation: "以元音开头的阳性单数用 l'。",
        },
        {
          type: "FILL_BLANK",
          question: "\"Per me, un ___ di pasta.\"（一份意面）",
          answer: "piatto",
          explanation: "piatto = 盘 / 一份。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "在餐厅结账时应该说？",
          options: ["Il menu", "Il conto", "Il cameriere", "La pizza"],
          answer: 1,
          explanation: "il conto = 账单。",
        },
      ],
    },
  },

  // ---------- Chapter 7 ----------
  {
    chapterTitle: "第七章：问路与旅行",
    lessonTitle: "第七课：火车站在哪里？",
    article: {
      body:
        "## In viaggio\n\n" +
        "Domani Marco parte per Roma. Deve andare alla stazione. Guarda la mappa sul suo telefonino: la stazione è lontana. Decide di chiedere informazioni.\n\n" +
        "Si avvicina a un poliziotto: «Mi scusi, dov'è la stazione?» Il poliziotto risponde: «Vada dritto, poi giri a destra. La stazione è a cinquecento metri.»\n\n" +
        "Alla stazione, Marco compra un biglietto. Il treno parte alle nove. Il viaggio dura due ore. Marco guarda il paesaggio dal finestrino. Finalmente arriva a Roma. È una città bellissima.",
      translation:
        "## 旅行\n\n" +
        "明天马尔科出发去罗马。他必须去火车站。他看手机上的地图：火车站很远。他决定问路。\n\n" +
        "他走到一个警察旁边：「打扰一下，火车站在哪里？」警察回答：「直走，然后右转。火车站五百米远。」\n\n" +
        "在火车站，马尔科买了一张票。火车九点出发。旅程两个小时。马尔科从车窗看风景。终于他到了罗马。这是一座美丽的城市。",
    },
    dialogue: {
      lines: [
        { speaker: "Marco", text: "Mi scusi!", translation: "打扰一下！" },
        { speaker: "Passante", text: "Sì? Come posso aiutarla?", translation: "嗯？我能帮您什么？" },
        { speaker: "Marco", text: "Dov'è la stazione?", translation: "火车站在哪里？" },
        { speaker: "Passante", text: "È vicino. Vada dritto, poi giri a sinistra.", translation: "很近。直走，然后左转。" },
        { speaker: "Marco", text: "Quanto è lontano?", translation: "有多远？" },
        { speaker: "Passante", text: "Circa cinque minuti a piedi.", translation: "走路大约五分钟。" },
        { speaker: "Marco", text: "Grazie mille!", translation: "非常感谢！" },
        { speaker: "Passante", text: "Prego! Buon viaggio!", translation: "不客气！旅途愉快！" },
      ],
    },
    vocabulary: {
      items: [
        { word: "stazione", translation: "车站", partOfSpeech: "noun", example: "Dov'è la stazione?" },
        { word: "treno", translation: "火车", partOfSpeech: "noun", example: "Il treno arriva." },
        { word: "biglietto", translation: "票", partOfSpeech: "noun", example: "Compro un biglietto." },
        { word: "viaggio", translation: "旅行", partOfSpeech: "noun", example: "Faccio un viaggio." },
        { word: "mappa", translation: "地图", partOfSpeech: "noun", example: "Guardo la mappa." },
        { word: "destra", translation: "右", partOfSpeech: "noun", example: "Giri a destra." },
        { word: "sinistra", translation: "左", partOfSpeech: "noun", example: "Giri a sinistra." },
        { word: "dritto", translation: "直", partOfSpeech: "adverb", example: "Vada dritto." },
        { word: "vicino", translation: "近", partOfSpeech: "adverb", example: "È vicino." },
        { word: "lontano", translation: "远", partOfSpeech: "adverb", example: "È lontano." },
      ],
    },
    grammar: {
      body:
        "## 方向词\n\n" +
        "- **a destra** = 向右\n" +
        "- **a sinistra** = 向左\n" +
        "- **dritto** = 直走\n" +
        "- **vicino (a)** = 在……附近\n" +
        "- **lontano (da)** = 离……远\n\n" +
        "## 问路常用句\n\n" +
        "- **Dov'è...?** = ……在哪里？\n" +
        "- **Come posso arrivare a...?** = 我怎么到……？\n" +
        "- **Dov'è la stazione?** = 火车站在哪里？\n" +
        "- **Dov'è il bagno?** = 洗手间在哪里？\n\n" +
        "## 命令式（正式 Lei 形式）\n\n" +
        "用于指路、给出指令。\n\n" +
        "### andare (去) 的正式命令式\n\n" +
        "- **Vada** dritto! = 您直走！\n" +
        "- **Giri** a destra! = 您右转！\n\n" +
        "### 其他常用命令\n\n" +
        "- **Guardi** la mappa. = 您看地图。\n" +
        "- **Prenda** il biglietto. = 您拿票。\n" +
        "- **Aspetti** qui. = 您在这里等。\n\n" +
        "## 部分冠词\n\n" +
        "表示\"一些\"，用于不可数或不确定的量。\n\n" +
        "| 性数 | 形式 | 例 |\n|---|---|---|\n" +
        "| 阳性单数 | del / dello / dell' | del pane (一些面包) |\n" +
        "| 阴性单数 | della / dell' | della frutta (一些水果) |\n" +
        "| 阳性复数 | dei / degli | dei libri (一些书) |\n" +
        "| 阴性复数 | delle | delle mele (一些苹果) |\n\n" +
        "例：Compro **del** pane. (我买些面包。)",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Giri a destra\" 是什么意思？",
          options: ["左转", "右转", "直走", "掉头"],
          answer: 1,
          explanation: "destra = 右。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Dov'è il bagno?\" 是什么意思？",
          options: ["火车站在哪", "洗手间在哪", "餐厅在哪", "你叫什么"],
          answer: 1,
          explanation: "il bagno = 洗手间。",
        },
        {
          type: "FILL_BLANK",
          question: "\"Compro ___ pane.\"（我买些面包）",
          answer: "del",
          explanation: "阳性以辅音开头的部分冠词用 del。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Buon ___ !\"（旅途愉快）",
          options: ["viaggio", "stazione", "treno", "biglietto"],
          answer: 0,
          explanation: "Buon viaggio! = 旅途愉快！",
        },
      ],
    },
  },

  // ---------- Chapter 8 ----------
  {
    chapterTitle: "第八章：过去的故事",
    lessonTitle: "第八课：上周我去了罗马",
    article: {
      body:
        "## Il mio viaggio a Roma\n\n" +
        "La settimana scorsa sono andato a Roma. È stato un viaggio bellissimo. Ho visitato il Colosseo, Fontana di Trevi e il Vaticano.\n\n" +
        "Il primo giorno ho preso una guida e ho camminato per la città. Ho visto molti monumenti antichi. Ho fatto tante foto. La sera ho mangiato in un ristorante vicino a Piazza Navona.\n\n" +
        "Il secondo giorno sono andato al Vaticano. Ho visitato San Pietro e i Musei Vaticani. È stato stupendo. La sera sono tornato in albergo molto stanco ma felice.\n\n" +
        "È stato un viaggio indimenticabile. Tornerò a Roma presto.",
      translation:
        "## 我的罗马之旅\n\n" +
        "上周我去了罗马。这是一次非常美的旅行。我参观了斗兽场、特雷维喷泉和梵蒂冈。\n\n" +
        "第一天，我请了一位导游，在城市里走了一天。我看到了许多古迹。我拍了许多照片。晚上我在纳沃纳广场附近的一家餐厅吃饭。\n\n" +
        "第二天，我去了梵蒂冈。我参观了圣彼得大教堂和梵蒂冈博物馆。太美了。晚上我回到酒店，非常累但很幸福。\n\n" +
        "这是一次难忘的旅行。我很快会再回罗马。",
    },
    dialogue: {
      lines: [
        { speaker: "Giulia", text: "Come stai? Non ti ho visto ieri.", translation: "你怎么样？昨天没看到你。" },
        { speaker: "Marco", text: "Sono stato a Roma per il weekend.", translation: "我周末去了罗马。" },
        { speaker: "Giulia", text: "Davvero? Com'è andata?", translation: "真的？怎么样？" },
        { speaker: "Marco", text: "Benissimo! Ho visto il Colosseo.", translation: "非常好！我看了斗兽场。" },
        { speaker: "Giulia", text: "Hai fatto delle foto?", translation: "你拍照了吗？" },
        { speaker: "Marco", text: "Sì, tantissime! Ti mostro.", translation: "是的，非常多！我给你看。" },
        { speaker: "Giulia", text: "Hai mangiato bene?", translation: "你吃得好吗？" },
        { speaker: "Marco", text: "Sì, ho mangiato una pizza buonissima.", translation: "是的，我吃了非常好的披萨。" },
      ],
    },
    vocabulary: {
      items: [
        { word: "settimana", translation: "周 / 星期", partOfSpeech: "noun", example: "La settimana scorsa." },
        { word: "ieri", translation: "昨天", partOfSpeech: "adverb", example: "Ieri sono andato al cinema." },
        { word: "oggi", translation: "今天", partOfSpeech: "adverb", example: "Oggi sono a casa." },
        { word: "domani", translation: "明天", partOfSpeech: "adverb", example: "Domani parto." },
        { word: "viaggio", translation: "旅行", partOfSpeech: "noun", example: "Ho fatto un viaggio." },
        { word: "foto", translation: "照片", partOfSpeech: "noun", example: "Ho fatto una foto." },
        { word: "ricordo", translation: "回忆", partOfSpeech: "noun", example: "Un bel ricordo." },
        { word: "stanco", translation: "累", partOfSpeech: "adjective", example: "Sono stanco." },
        { word: "felice", translation: "幸福 / 快乐", partOfSpeech: "adjective", example: "Sono felice." },
        { word: "bello", translation: "美 / 漂亮", partOfSpeech: "adjective", example: "È un bel giorno." },
      ],
    },
    grammar: {
      body:
        "## 近过去时 (passato prossimo)\n\n" +
        "表示过去完成的动作。结构：**avere/essere 的现在时 + 过去分词**。\n\n" +
        "### 过去分词的构成\n\n" +
        "- -are 动词 → -ato：mangiare → mangiato\n" +
        "- -ere 动词 → -uto：vedere → veduto\n" +
        "- -ire 动词 → -ito：dormire → dormito\n\n" +
        "### 助动词的选择\n\n" +
        "**大多数动词用 avere：**\n\n" +
        "| 人称 | avere 变位 |\n|---|---|\n" +
        "| io | ho |\n| tu | hai |\n" +
        "| lui/lei | ha |\n| noi | abbiamo |\n" +
        "| voi | avete |\n| loro | hanno |\n\n" +
        "例：\n" +
        "- Io **ho mangiato**. = 我吃过了。\n" +
        "- Tu **hai visto**. = 你看见了。\n\n" +
        "**少数不及物动词（运动、状态变化）用 essere，过去分词需与主语性数一致：**\n\n" +
        "| 动词 | 例句（阳性） | 例句（阴性） |\n|---|---|---|\n" +
        "| andare | Sono andato. (我去了) | Sono andata. |\n" +
        "| venire | Sono venuto. (我来了) | Sono venuta. |\n" +
        "| partire | Sono partito. (我出发了) | Sono partita. |\n" +
        "| tornare | Sono tornato. (我回来了) | Sono tornata. |\n\n" +
        "### 常见不规则过去分词\n\n" +
        "| 动词 | 过去分词 |\n|---|---|\n" +
        "| fare | fatto |\n" +
        "| andare | andato |\n" +
        "| vedere | visto / veduto |\n" +
        "| dire | detto |\n" +
        "| prendere | preso |\n" +
        "| essere | stato |\n" +
        "| avere | avuto |\n\n" +
        "例句：\n" +
        "- Ieri **ho mangiato** una pizza. (昨天我吃了一个披萨。)\n" +
        "- La settimana scorsa **sono andato** a Roma. (上周我去了罗马。)\n" +
        "- Dove **sei andato**? (你去了哪里？)",
    },
    exercises: {
      questions: [
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Sono andato\" 是什么意思？",
          options: ["我吃过了", "我去了", "我看见了", "我做了"],
          answer: 1,
          explanation: "andare 用 essere 作助动词。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "\"Ho ___ una pizza.\"（我吃了披萨）— mangiare 的过去分词？",
          options: ["mangiato", "mangiare", "mangiata", "mangio"],
          answer: 0,
          explanation: "mangiare 的过去分词是 mangiato。",
        },
        {
          type: "FILL_BLANK",
          question: "\"La settimana ___ sono andato a Roma.\"（上周）",
          answer: "scorsa",
          explanation: "la settimana scorsa = 上周。",
        },
        {
          type: "MULTIPLE_CHOICE",
          question: "下列哪个动词用 essere 作助动词？",
          options: ["mangiare", "vedere", "andare", "prendere"],
          answer: 2,
          explanation: "andare (去) 用 essere。",
        },
      ],
    },
  },
];

// ============================================
// Seed logic
// ============================================

async function main() {
  console.log(`Seeding Italian course: "${COURSE_TITLE}"`);
  console.log(`Chapters: ${CHAPTERS.length}`);

  const user = await prisma.user.findFirst({ where: { username: USERNAME } });
  if (!user) {
    console.error(`User "${USERNAME}" not found`);
    process.exit(1);
  }
  console.log(`Found user: ${user.id} (${user.username})`);

  // Idempotent: drop existing course with same title for this user
  const existing = await prisma.course.findMany({
    where: { userId: user.id, title: COURSE_TITLE },
    select: { id: true },
  });
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing course(s) with same title, deleting...`);
    await prisma.course.deleteMany({ where: { id: { in: existing.map((c) => c.id) } } });
  }

  // Create course
  const course = await prisma.course.create({
    data: {
      title: COURSE_TITLE,
      description: "从零开始学习意大利语。涵盖基础发音、日常对话、核心词汇和基础语法。",
      language: "Italian",
      learnerLanguage: "Chinese",
      userId: user.id,
      visibility: "PUBLIC",
    },
  });
  console.log(`Created course id=${course.id}`);

  // Create chapters + items
  for (let i = 0; i < CHAPTERS.length; i++) {
    const ch = CHAPTERS[i];
    const chapter = await prisma.chapter.create({
      data: {
        courseId: course.id,
        title: ch.chapterTitle,
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

    console.log(`  Chapter ${i + 1}: id=${chapter.id}, item id=${item.id} (${ch.lessonTitle})`);
  }

  console.log(`\nInserted ${CHAPTERS.length} chapters`);
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
