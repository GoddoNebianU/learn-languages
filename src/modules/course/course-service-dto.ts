import { Visibility } from "../../../generated/prisma/enums";
import type { ChapterItemType } from "./course-repository-dto";

// ============================================
// Course
// ============================================

export type ServiceInputCreateCourse = {
  title: string;
  description?: string;
  language?: string;
  userId: string;
  visibility?: Visibility;
  coverImage?: string;
};

export type ServiceInputUpdateCourse = {
  courseId: number;
  title?: string;
  description?: string;
  language?: string;
  visibility?: Visibility;
  coverImage?: string | null;
};

export type ServiceInputDeleteCourse = {
  courseId: number;
};

export type ServiceInputGetCourseById = {
  courseId: number;
};

export type ServiceInputGetCoursesByUserId = {
  userId: string;
};

export type ServiceInputGetPublicCourses = {
  limit?: number;
  offset?: number;
};

export type ServiceInputSearchPublicCourses = {
  query: string;
  limit?: number;
  offset?: number;
};

export type ServiceInputCheckOwnership = {
  courseId: number;
  userId: string;
};

export type ServiceOutputCourse = {
  id: number;
  title: string;
  description: string;
  language: string;
  userId: string;
  visibility: Visibility;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ServiceOutputPublicCourse = ServiceOutputCourse & {
  userName: string | null;
  userUsername: string | null;
  chapterCount: number;
};

// ============================================
// Chapter
// ============================================

export type ServiceInputCreateChapter = {
  courseId: number;
  title: string;
};

export type ServiceInputUpdateChapter = {
  chapterId: number;
  title?: string;
  sortOrder?: number;
};

export type ServiceInputDeleteChapter = {
  chapterId: number;
};

export type ServiceInputGetChaptersByCourseId = {
  courseId: number;
};

export type ServiceOutputChapter = {
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

export type ServiceInputCreateChapterItem = {
  chapterId: number;
  type: ChapterItemType;
  title: string;
  content: unknown;
  deckId?: number | null;
};

export type ServiceInputUpdateChapterItem = {
  chapterItemId: number;
  title?: string;
  content?: unknown;
  deckId?: number | null;
};

export type ServiceInputDeleteChapterItem = {
  chapterItemId: number;
};

export type ServiceInputGetChapterItems = {
  chapterId: number;
};

export type ServiceOutputChapterItem = {
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

export type ServiceInputEnrollCourse = {
  userId: string;
  courseId: number;
};

export type ServiceInputUnenrollCourse = {
  userId: string;
  courseId: number;
};

export type ServiceInputGetEnrolledCourses = {
  userId: string;
};

export type ServiceInputCheckEnrollment = {
  userId: string;
  courseId: number;
};

export type ServiceOutputEnrollment = {
  id: number;
  userId: string;
  courseId: number;
  createdAt: Date;
};
