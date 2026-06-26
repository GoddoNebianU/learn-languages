import { prisma } from "@/lib/db";
import { Prisma } from "../../../generated/prisma/client";
import { createLogger } from "@/lib/logger";
import { Visibility } from "../../../generated/prisma/enums";
import {
  RepoInputCreateCourse,
  RepoInputUpdateCourse,
  RepoInputDeleteCourse,
  RepoInputGetCourseById,
  RepoInputGetCoursesByUserId,
  RepoInputGetPublicCourses,
  RepoInputSearchPublicCourses,
  RepoOutputCourse,
  RepoOutputPublicCourse,
  RepoInputCreateChapter,
  RepoInputUpdateChapter,
  RepoInputDeleteChapter,
  RepoInputGetChaptersByCourseId,
  RepoOutputChapter,
  RepoInputCreateChapterItem,
  RepoInputUpdateChapterItem,
  RepoInputDeleteChapterItem,
  RepoInputGetChapterItems,
  RepoOutputChapterItem,
  RepoInputCreateEnrollment,
  RepoInputDeleteEnrollment,
  RepoInputGetEnrollmentsByUserId,
  RepoInputCheckEnrollment,
  RepoInputGetEnrolledCourses,
  RepoOutputEnrollment,
} from "./course-repository-dto";

const log = createLogger("course-repository");

// ============================================
// Course mappers
// ============================================

type CourseWithPublicIncludes = {
  id: number;
  title: string;
  description: string;
  language: string;
  userId: string;
  visibility: Visibility;
  coverImage: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: { chapters?: number };
  user?: { name: string; username: string } | null;
};

function mapCourseToPublicOutput(course: CourseWithPublicIncludes): RepoOutputPublicCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    userId: course.userId,
    visibility: course.visibility,
    coverImage: course.coverImage,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
    userName: course.user?.name ?? null,
    userUsername: course.user?.username ?? null,
    chapterCount: course._count?.chapters ?? 0,
  };
}

// ============================================
// Course CRUD
// ============================================

export async function repoCreateCourse(input: RepoInputCreateCourse): Promise<number> {
  log.debug("Creating course", { title: input.title, userId: input.userId });
  const course = await prisma.course.create({
    data: {
      title: input.title,
      description: input.description ?? "",
      language: input.language ?? "",
      userId: input.userId,
      visibility: input.visibility ?? Visibility.PRIVATE,
      coverImage: input.coverImage ?? null,
    },
  });
  log.info("Course created", { courseId: course.id });
  return course.id;
}

export async function repoUpdateCourse(input: RepoInputUpdateCourse): Promise<void> {
  log.debug("Updating course", { courseId: input.id });
  const { id, ...updateData } = input;
  await prisma.course.update({
    where: { id },
    data: updateData,
  });
  log.info("Course updated", { courseId: id });
}

export async function repoDeleteCourse(input: RepoInputDeleteCourse): Promise<void> {
  log.debug("Deleting course", { courseId: input.id });
  await prisma.course.delete({
    where: { id: input.id },
  });
  log.info("Course deleted", { courseId: input.id });
}

export async function repoGetCourseById(
  input: RepoInputGetCourseById
): Promise<RepoOutputCourse | null> {
  log.debug("Getting course by id", { courseId: input.id });
  const course = await prisma.course.findUnique({
    where: { id: input.id },
  });

  if (!course) return null;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    userId: course.userId,
    visibility: course.visibility,
    coverImage: course.coverImage,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
}

export async function repoGetCoursesByUserId(
  input: RepoInputGetCoursesByUserId
): Promise<RepoOutputCourse[]> {
  log.debug("Getting courses by userId", { userId: input.userId });
  const courses = await prisma.course.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
  });

  return courses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    language: course.language,
    userId: course.userId,
    visibility: course.visibility,
    coverImage: course.coverImage,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  }));
}

export async function repoGetPublicCourses(
  input: RepoInputGetPublicCourses = {}
): Promise<RepoOutputPublicCourse[]> {
  const { limit = 50, offset = 0 } = input;

  const courses = await prisma.course.findMany({
    where: { visibility: Visibility.PUBLIC },
    include: {
      _count: { select: { chapters: true } },
      user: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  log.debug("Fetched public courses", { count: courses.length });
  return courses.map(mapCourseToPublicOutput);
}

export async function repoSearchPublicCourses(
  input: RepoInputSearchPublicCourses
): Promise<RepoOutputPublicCourse[]> {
  const { query, limit = 50, offset = 0 } = input;
  log.debug("Searching public courses", { query });

  const courses = await prisma.course.findMany({
    where: {
      visibility: Visibility.PUBLIC,
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { chapters: true } },
      user: { select: { name: true, username: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  });

  log.debug("Searched public courses", { query, count: courses.length });
  return courses.map(mapCourseToPublicOutput);
}

export async function repoGetUserIdByCourseId(courseId: number): Promise<string | null> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { userId: true },
  });
  return course?.userId ?? null;
}

export async function repoGetCourseIdByChapterId(chapterId: number): Promise<number | null> {
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { courseId: true },
  });
  return chapter?.courseId ?? null;
}

export async function repoGetChapterIdByItemId(itemId: number): Promise<number | null> {
  const item = await prisma.chapterItem.findUnique({
    where: { id: itemId },
    select: { chapterId: true },
  });
  return item?.chapterId ?? null;
}

// ============================================
// Chapter CRUD
// ============================================

export async function repoCreateChapter(input: RepoInputCreateChapter): Promise<number> {
  log.debug("Creating chapter", { courseId: input.courseId });
  const maxSortOrder = await prisma.chapter.count({ where: { courseId: input.courseId } });
  const chapter = await prisma.chapter.create({
    data: {
      courseId: input.courseId,
      title: input.title,
      sortOrder: input.sortOrder ?? maxSortOrder,
    },
  });
  log.info("Chapter created", { chapterId: chapter.id });
  return chapter.id;
}

export async function repoUpdateChapter(input: RepoInputUpdateChapter): Promise<void> {
  log.debug("Updating chapter", { chapterId: input.id });
  const { id, ...updateData } = input;
  await prisma.chapter.update({
    where: { id },
    data: updateData,
  });
  log.info("Chapter updated", { chapterId: id });
}

export async function repoDeleteChapter(input: RepoInputDeleteChapter): Promise<void> {
  log.debug("Deleting chapter", { chapterId: input.id });
  await prisma.chapter.delete({
    where: { id: input.id },
  });
  log.info("Chapter deleted", { chapterId: input.id });
}

export async function repoGetChaptersByCourseId(
  input: RepoInputGetChaptersByCourseId
): Promise<RepoOutputChapter[]> {
  log.debug("Getting chapters by courseId", { courseId: input.courseId });
  const chapters = await prisma.chapter.findMany({
    where: { courseId: input.courseId },
    orderBy: { sortOrder: "asc" },
  });

  return chapters.map((chapter) => ({
    id: chapter.id,
    courseId: chapter.courseId,
    title: chapter.title,
    sortOrder: chapter.sortOrder,
    createdAt: chapter.createdAt,
    updatedAt: chapter.updatedAt,
  }));
}

// ============================================
// ChapterItem CRUD
// ============================================

export async function repoCreateChapterItem(input: RepoInputCreateChapterItem): Promise<number> {
  log.debug("Creating chapter item", { chapterId: input.chapterId });
  const maxSortOrder = await prisma.chapterItem.count({ where: { chapterId: input.chapterId } });
  const item = await prisma.chapterItem.create({
    data: {
      chapterId: input.chapterId,
      type: input.type,
      title: input.title,
      sortOrder: input.sortOrder ?? maxSortOrder,
      content: input.content ?? {},
      deckId: input.deckId ?? null,
    },
  });
  log.info("Chapter item created", { chapterItemId: item.id });
  return item.id;
}

export async function repoUpdateChapterItem(input: RepoInputUpdateChapterItem): Promise<void> {
  log.debug("Updating chapter item", { chapterItemId: input.id });
  const data: {
    title?: string;
    sortOrder?: number;
    content?: Prisma.InputJsonValue;
    deckId?: number | null;
  } = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.sortOrder !== undefined) data.sortOrder = input.sortOrder;
  if (input.content !== undefined) data.content = input.content as Prisma.InputJsonValue;
  if (input.deckId !== undefined) data.deckId = input.deckId;
  await prisma.chapterItem.update({
    where: { id: input.id },
    data,
  });
  log.info("Chapter item updated", { chapterItemId: input.id });
}

export async function repoDeleteChapterItem(input: RepoInputDeleteChapterItem): Promise<void> {
  log.debug("Deleting chapter item", { chapterItemId: input.id });
  await prisma.chapterItem.delete({
    where: { id: input.id },
  });
  log.info("Chapter item deleted", { chapterItemId: input.id });
}

export async function repoGetChapterItems(
  input: RepoInputGetChapterItems
): Promise<RepoOutputChapterItem[]> {
  log.debug("Getting chapter items", { chapterId: input.chapterId, summary: input.summary });
  const items = await prisma.chapterItem.findMany({
    where: { chapterId: input.chapterId },
    orderBy: { sortOrder: "asc" },
    ...(input.summary ? {
      select: { id: true, chapterId: true, type: true, title: true, sortOrder: true, deckId: true, createdAt: true, updatedAt: true },
    } : {}),
  });

  return items.map((item) => ({
    id: item.id,
    chapterId: item.chapterId,
    type: item.type as RepoOutputChapterItem["type"],
    title: item.title,
    sortOrder: item.sortOrder,
    content: "content" in item ? item.content : null,
    deckId: item.deckId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
}

export async function repoGetChapterItemById(itemId: number): Promise<RepoOutputChapterItem | null> {
  const item = await prisma.chapterItem.findUnique({ where: { id: itemId } });
  if (!item) return null;
  return {
    id: item.id,
    chapterId: item.chapterId,
    type: item.type as RepoOutputChapterItem["type"],
    title: item.title,
    sortOrder: item.sortOrder,
    content: item.content,
    deckId: item.deckId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

// ============================================
// Enrollment
// ============================================

export async function repoCreateEnrollment(input: RepoInputCreateEnrollment): Promise<void> {
  log.debug("Creating enrollment", { userId: input.userId, courseId: input.courseId });
  await prisma.courseEnrollment.create({
    data: {
      userId: input.userId,
      courseId: input.courseId,
    },
  });
  log.info("Enrollment created", { userId: input.userId, courseId: input.courseId });
}

export async function repoDeleteEnrollment(input: RepoInputDeleteEnrollment): Promise<void> {
  log.debug("Deleting enrollment", { userId: input.userId, courseId: input.courseId });
  await prisma.courseEnrollment.deleteMany({
    where: {
      userId: input.userId,
      courseId: input.courseId,
    },
  });
  log.info("Enrollment deleted", { userId: input.userId, courseId: input.courseId });
}

export async function repoGetEnrollmentsByUserId(
  input: RepoInputGetEnrollmentsByUserId
): Promise<RepoOutputEnrollment[]> {
  log.debug("Getting enrollments by userId", { userId: input.userId });
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: input.userId },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => ({
    id: enrollment.id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    createdAt: enrollment.createdAt,
  }));
}

export async function repoCheckEnrollment(
  input: RepoInputCheckEnrollment
): Promise<boolean> {
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      userId_courseId: {
        userId: input.userId,
        courseId: input.courseId,
      },
    },
    select: { id: true },
  });
  return !!enrollment;
}

export async function repoGetEnrolledCourses(
  input: RepoInputGetEnrolledCourses
): Promise<RepoOutputPublicCourse[]> {
  log.debug("Getting enrolled courses with details", { userId: input.userId });
  const enrollments = await prisma.courseEnrollment.findMany({
    where: { userId: input.userId },
    include: {
      course: {
        include: {
          _count: { select: { chapters: true } },
          user: { select: { name: true, username: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((enrollment) => mapCourseToPublicOutput(enrollment.course));
}
