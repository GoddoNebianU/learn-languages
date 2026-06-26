import { Visibility } from "../../../generated/prisma/enums";

// ============================================
// Content JSON shapes (stored in ChapterItem.content)
// ============================================

export type ChapterItemType = "ARTICLE" | "DIALOGUE" | "MEMORIZE" | "EXERCISE" | "LESSON";

export interface VocabularyItem {
  word: string;
  pronunciation?: string;
  translation: string;
  partOfSpeech?: string;
  example?: string;
}

export interface LessonContent {
  article?: { body: string };
  dialogue?: { lines: DialogueLine[] };
  vocabulary?: { items: VocabularyItem[] };
  grammar?: { body: string };
  exercises?: { questions: ExerciseQuestion[] };
}

export interface DialogueLine {
  speaker: string;
  text: string;
  translation?: string;
}

export interface ArticleContent {
  body: string;
}

export interface DialogueContent {
  lines: DialogueLine[];
}

export interface ExerciseQuestion {
  type: "MULTIPLE_CHOICE" | "FILL_BLANK";
  question: string;
  options?: string[];
  answer: number | string;
  explanation?: string;
}

export interface ExerciseContent {
  questions: ExerciseQuestion[];
}

// MEMORIZE items use the deckId field; content is empty.

// ============================================
// Course
// ============================================

export interface RepoInputCreateCourse {
  title: string;
  description?: string;
  language?: string;
  learnerLanguage?: string;
  userId: string;
  visibility?: Visibility;
  coverImage?: string;
}

export interface RepoInputUpdateCourse {
  id: number;
  title?: string;
  description?: string;
  language?: string;
  learnerLanguage?: string;
  visibility?: Visibility;
  coverImage?: string | null;
}

export interface RepoInputDeleteCourse {
  id: number;
}

export interface RepoInputGetCourseById {
  id: number;
}

export interface RepoInputGetCoursesByUserId {
  userId: string;
}

export interface RepoInputGetPublicCourses {
  limit?: number;
  offset?: number;
}

export interface RepoInputSearchPublicCourses {
  query: string;
  limit?: number;
  offset?: number;
}

export type RepoOutputCourse = {
  id: number;
  title: string;
  description: string;
  language: string;
  learnerLanguage: string;
  userId: string;
  visibility: Visibility;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RepoOutputPublicCourse = RepoOutputCourse & {
  userName: string | null;
  userUsername: string | null;
  chapterCount: number;
};

// ============================================
// Chapter
// ============================================

export interface RepoInputCreateChapter {
  courseId: number;
  title: string;
  sortOrder?: number;
}

export interface RepoInputUpdateChapter {
  id: number;
  title?: string;
  sortOrder?: number;
}

export interface RepoInputDeleteChapter {
  id: number;
}

export interface RepoInputGetChaptersByCourseId {
  courseId: number;
}

export type RepoOutputChapter = {
  id: number;
  courseId: number;
  title: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// ChapterItem
// ============================================

export interface RepoInputCreateChapterItem {
  chapterId: number;
  type: ChapterItemType;
  title: string;
  sortOrder?: number;
  content: unknown;
  deckId?: number | null;
}

export interface RepoInputUpdateChapterItem {
  id: number;
  title?: string;
  sortOrder?: number;
  content?: unknown;
  deckId?: number | null;
}

export interface RepoInputDeleteChapterItem {
  id: number;
}

export interface RepoInputGetChapterItems {
  chapterId: number;
  summary?: boolean;
}

export type RepoOutputChapterItem = {
  id: number;
  chapterId: number;
  type: ChapterItemType;
  title: string;
  sortOrder: number;
  content: unknown;
  deckId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

// ============================================
// Enrollment
// ============================================

export interface RepoInputCreateEnrollment {
  userId: string;
  courseId: number;
}

export interface RepoInputDeleteEnrollment {
  userId: string;
  courseId: number;
}

export interface RepoInputGetEnrollmentsByUserId {
  userId: string;
}

export interface RepoInputCheckEnrollment {
  userId: string;
  courseId: number;
}

export interface RepoInputGetEnrolledCourses {
  userId: string;
}

export type RepoOutputEnrollment = {
  id: number;
  userId: string;
  courseId: number;
  createdAt: Date;
};
