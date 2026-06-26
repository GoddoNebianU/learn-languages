import { generateValidator } from "@/utils/validate";
import z from "zod";
import type { ChapterItemType } from "./course-repository-dto";

// ============================================
// Course — input schemas
// ============================================

export const schemaActionInputCreateCourse = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  language: z.string().max(50).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  coverImage: z.string().url().max(1000).optional(),
});
export type ActionInputCreateCourse = z.infer<typeof schemaActionInputCreateCourse>;
export const validateActionInputCreateCourse = generateValidator(schemaActionInputCreateCourse);

export const schemaActionInputUpdateCourse = z.object({
  courseId: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  language: z.string().max(50).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).optional(),
  coverImage: z.string().url().max(1000).nullable().optional(),
});
export type ActionInputUpdateCourse = z.infer<typeof schemaActionInputUpdateCourse>;
export const validateActionInputUpdateCourse = generateValidator(schemaActionInputUpdateCourse);

export const schemaActionInputDeleteCourse = z.object({
  courseId: z.number().int().positive(),
});
export type ActionInputDeleteCourse = z.infer<typeof schemaActionInputDeleteCourse>;
export const validateActionInputDeleteCourse = generateValidator(schemaActionInputDeleteCourse);

export const schemaActionInputGetCourseById = z.object({
  courseId: z.number().int().positive(),
});
export type ActionInputGetCourseById = z.infer<typeof schemaActionInputGetCourseById>;
export const validateActionInputGetCourseById = generateValidator(schemaActionInputGetCourseById);

export const schemaActionInputGetPublicCourses = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});
export type ActionInputGetPublicCourses = z.infer<typeof schemaActionInputGetPublicCourses>;
export const validateActionInputGetPublicCourses = generateValidator(
  schemaActionInputGetPublicCourses
);

export const schemaActionInputSearchPublicCourses = z.object({
  query: z.string().min(1),
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
});
export type ActionInputSearchPublicCourses = z.infer<typeof schemaActionInputSearchPublicCourses>;
export const validateActionInputSearchPublicCourses = generateValidator(
  schemaActionInputSearchPublicCourses
);

// ============================================
// Chapter — input schemas
// ============================================

export const schemaActionInputCreateChapter = z.object({
  courseId: z.number().int().positive(),
  title: z.string().min(1).max(200),
});
export type ActionInputCreateChapter = z.infer<typeof schemaActionInputCreateChapter>;
export const validateActionInputCreateChapter = generateValidator(schemaActionInputCreateChapter);

export const schemaActionInputUpdateChapter = z.object({
  chapterId: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  sortOrder: z.number().int().nonnegative().optional(),
});
export type ActionInputUpdateChapter = z.infer<typeof schemaActionInputUpdateChapter>;
export const validateActionInputUpdateChapter = generateValidator(schemaActionInputUpdateChapter);

export const schemaActionInputDeleteChapter = z.object({
  chapterId: z.number().int().positive(),
});
export type ActionInputDeleteChapter = z.infer<typeof schemaActionInputDeleteChapter>;
export const validateActionInputDeleteChapter = generateValidator(schemaActionInputDeleteChapter);

export const schemaActionInputGetChaptersByCourseId = z.object({
  courseId: z.number().int().positive(),
});
export type ActionInputGetChaptersByCourseId = z.infer<
  typeof schemaActionInputGetChaptersByCourseId
>;
export const validateActionInputGetChaptersByCourseId = generateValidator(
  schemaActionInputGetChaptersByCourseId
);

// ============================================
// ChapterItem — input schemas
// ============================================

const chapterItemTypeSchema = z.enum(["ARTICLE", "DIALOGUE", "MEMORIZE", "EXERCISE", "LESSON"]);

export const schemaActionInputCreateChapterItem = z.object({
  chapterId: z.number().int().positive(),
  type: chapterItemTypeSchema,
  title: z.string().min(1).max(200),
  content: z.unknown(),
  deckId: z.number().int().positive().nullable().optional(),
});
export type ActionInputCreateChapterItem = z.infer<typeof schemaActionInputCreateChapterItem>;
export const validateActionInputCreateChapterItem = generateValidator(
  schemaActionInputCreateChapterItem
);

export const schemaActionInputUpdateChapterItem = z.object({
  chapterItemId: z.number().int().positive(),
  title: z.string().min(1).max(200).optional(),
  content: z.unknown().optional(),
  deckId: z.number().int().positive().nullable().optional(),
});
export type ActionInputUpdateChapterItem = z.infer<typeof schemaActionInputUpdateChapterItem>;
export const validateActionInputUpdateChapterItem = generateValidator(
  schemaActionInputUpdateChapterItem
);

export const schemaActionInputDeleteChapterItem = z.object({
  chapterItemId: z.number().int().positive(),
});
export type ActionInputDeleteChapterItem = z.infer<typeof schemaActionInputDeleteChapterItem>;
export const validateActionInputDeleteChapterItem = generateValidator(
  schemaActionInputDeleteChapterItem
);

export const schemaActionInputGetChapterItems = z.object({
  chapterId: z.number().int().positive(),
  summary: z.boolean().optional(),
});
export type ActionInputGetChapterItems = z.infer<typeof schemaActionInputGetChapterItems>;
export const validateActionInputGetChapterItems = generateValidator(schemaActionInputGetChapterItems);

// ============================================
// Enrollment — input schemas
// ============================================

export const schemaActionInputEnrollCourse = z.object({
  courseId: z.number().int().positive(),
});
export type ActionInputEnrollCourse = z.infer<typeof schemaActionInputEnrollCourse>;
export const validateActionInputEnrollCourse = generateValidator(schemaActionInputEnrollCourse);

export const schemaActionInputUnenrollCourse = z.object({
  courseId: z.number().int().positive(),
});
export type ActionInputUnenrollCourse = z.infer<typeof schemaActionInputUnenrollCourse>;
export const validateActionInputUnenrollCourse = generateValidator(
  schemaActionInputUnenrollCourse
);

// ============================================
// Output types
// ============================================

export type ActionOutputCourse = {
  id: number;
  title: string;
  description: string;
  language: string;
  userId: string;
  visibility: "PRIVATE" | "PUBLIC";
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionOutputPublicCourse = ActionOutputCourse & {
  userName: string | null;
  userUsername: string | null;
  chapterCount: number;
};

export type ActionOutputChapter = {
  id: number;
  courseId: number;
  title: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type ActionOutputChapterItem = {
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

export type ActionOutputCreateCourse = {
  success: boolean;
  message: string;
  courseId?: number;
};

export type ActionOutputUpdateCourse = {
  success: boolean;
  message: string;
};

export type ActionOutputDeleteCourse = {
  success: boolean;
  message: string;
};

export type ActionOutputGetCourseById = {
  success: boolean;
  message: string;
  data?: ActionOutputCourse;
};

export type ActionOutputGetMyCourses = {
  success: boolean;
  message: string;
  data?: ActionOutputCourse[];
};

export type ActionOutputGetPublicCourses = {
  success: boolean;
  message: string;
  data?: ActionOutputPublicCourse[];
};

export type ActionOutputSearchPublicCourses = {
  success: boolean;
  message: string;
  data?: ActionOutputPublicCourse[];
};

export type ActionOutputCreateChapter = {
  success: boolean;
  message: string;
  chapterId?: number;
};

export type ActionOutputUpdateChapter = {
  success: boolean;
  message: string;
};

export type ActionOutputDeleteChapter = {
  success: boolean;
  message: string;
};

export type ActionOutputGetChaptersByCourseId = {
  success: boolean;
  message: string;
  data?: ActionOutputChapter[];
};

export type ActionOutputCreateChapterItem = {
  success: boolean;
  message: string;
  chapterItemId?: number;
};

export type ActionOutputUpdateChapterItem = {
  success: boolean;
  message: string;
};

export type ActionOutputDeleteChapterItem = {
  success: boolean;
  message: string;
};

export type ActionOutputGetChapterItems = {
  success: boolean;
  message: string;
  data?: ActionOutputChapterItem[];
};

export type ActionOutputEnrollCourse = {
  success: boolean;
  message: string;
};

export type ActionOutputUnenrollCourse = {
  success: boolean;
  message: string;
};

export type ActionOutputGetEnrolledCourses = {
  success: boolean;
  message: string;
  data?: ActionOutputPublicCourse[];
};

export type ActionOutputCheckEnrollment = {
  success: boolean;
  message: string;
  data?: { enrolled: boolean };
};
