import { createLogger } from "@/lib/logger";
import {
  ServiceInputCreateCourse,
  ServiceInputUpdateCourse,
  ServiceInputDeleteCourse,
  ServiceInputGetCourseById,
  ServiceInputGetCoursesByUserId,
  ServiceInputGetPublicCourses,
  ServiceInputSearchPublicCourses,
  ServiceInputCheckOwnership,
  ServiceOutputCourse,
  ServiceOutputPublicCourse,
  ServiceInputCreateChapter,
  ServiceInputUpdateChapter,
  ServiceInputDeleteChapter,
  ServiceInputGetChaptersByCourseId,
  ServiceOutputChapter,
  ServiceInputCreateChapterItem,
  ServiceInputUpdateChapterItem,
  ServiceInputDeleteChapterItem,
  ServiceInputGetChapterItems,
  ServiceOutputChapterItem,
  ServiceInputEnrollCourse,
  ServiceInputUnenrollCourse,
  ServiceInputGetEnrolledCourses,
  ServiceInputCheckEnrollment,
} from "./course-service-dto";
import {
  repoCreateCourse,
  repoUpdateCourse,
  repoDeleteCourse,
  repoGetCourseById,
  repoGetCoursesByUserId,
  repoGetPublicCourses,
  repoSearchPublicCourses,
  repoGetUserIdByCourseId,
  repoCreateChapter,
  repoUpdateChapter,
  repoDeleteChapter,
  repoGetChaptersByCourseId,
  repoCreateChapterItem,
  repoUpdateChapterItem,
  repoDeleteChapterItem,
  repoGetChapterItems,
  repoCreateEnrollment,
  repoDeleteEnrollment,
  repoGetEnrolledCourses,
  repoCheckEnrollment,
} from "./course-repository";

const log = createLogger("course-service");

// ============================================
// Course — ownership & CRUD
// ============================================

export async function serviceCheckOwnership(
  input: ServiceInputCheckOwnership
): Promise<boolean> {
  const ownerId = await repoGetUserIdByCourseId(input.courseId);
  return ownerId === input.userId;
}

export async function serviceCreateCourse(
  input: ServiceInputCreateCourse
): Promise<{ success: boolean; courseId?: number; message: string }> {
  try {
    log.info("Creating course", { title: input.title, userId: input.userId });
    const courseId = await repoCreateCourse(input);
    log.info("Course created successfully", { courseId });
    return { success: true, courseId, message: "Course created successfully" };
  } catch (error) {
    log.error("Failed to create course", { error });
    return { success: false, message: "Failed to create course" };
  }
}

export async function serviceUpdateCourse(
  input: ServiceInputUpdateCourse
): Promise<{ success: boolean; message: string }> {
  try {
    log.info("Updating course", { courseId: input.courseId });
    await repoUpdateCourse({
      id: input.courseId,
      title: input.title,
      description: input.description,
      language: input.language,
      visibility: input.visibility,
      coverImage: input.coverImage,
    });
    log.info("Course updated successfully", { courseId: input.courseId });
    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    log.error("Failed to update course", { error, courseId: input.courseId });
    return { success: false, message: "Failed to update course" };
  }
}

export async function serviceDeleteCourse(
  input: ServiceInputDeleteCourse
): Promise<{ success: boolean; message: string }> {
  try {
    log.info("Deleting course", { courseId: input.courseId });
    await repoDeleteCourse({ id: input.courseId });
    log.info("Course deleted successfully", { courseId: input.courseId });
    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    log.error("Failed to delete course", { error, courseId: input.courseId });
    return { success: false, message: "Failed to delete course" };
  }
}

export async function serviceGetCourseById(
  input: ServiceInputGetCourseById
): Promise<{ success: boolean; data?: ServiceOutputCourse; message: string }> {
  try {
    const course = await repoGetCourseById({ id: input.courseId });
    if (!course) {
      return { success: false, message: "Course not found" };
    }
    return { success: true, data: course, message: "Course retrieved successfully" };
  } catch (error) {
    log.error("Failed to get course", { error, courseId: input.courseId });
    return { success: false, message: "Failed to get course" };
  }
}

export async function serviceGetCoursesByUserId(
  input: ServiceInputGetCoursesByUserId
): Promise<{ success: boolean; data?: ServiceOutputCourse[]; message: string }> {
  try {
    const courses = await repoGetCoursesByUserId(input);
    return { success: true, data: courses, message: "Courses retrieved successfully" };
  } catch (error) {
    log.error("Failed to get courses", { error, userId: input.userId });
    return { success: false, message: "Failed to get courses" };
  }
}

export async function serviceGetPublicCourses(
  input: ServiceInputGetPublicCourses = {}
): Promise<{ success: boolean; data?: ServiceOutputPublicCourse[]; message: string }> {
  try {
    const courses = await repoGetPublicCourses(input);
    return { success: true, data: courses, message: "Public courses retrieved successfully" };
  } catch (error) {
    log.error("Failed to get public courses", { error });
    return { success: false, message: "Failed to get public courses" };
  }
}

export async function serviceSearchPublicCourses(
  input: ServiceInputSearchPublicCourses
): Promise<{ success: boolean; data?: ServiceOutputPublicCourse[]; message: string }> {
  try {
    const courses = await repoSearchPublicCourses(input);
    return { success: true, data: courses, message: "Search completed successfully" };
  } catch (error) {
    log.error("Failed to search public courses", { error, query: input.query });
    return { success: false, message: "Search failed" };
  }
}

// ============================================
// Chapter
// ============================================

export async function serviceCreateChapter(
  input: ServiceInputCreateChapter
): Promise<{ success: boolean; chapterId?: number; message: string }> {
  try {
    const chapterId = await repoCreateChapter(input);
    return { success: true, chapterId, message: "Chapter created successfully" };
  } catch (error) {
    log.error("Failed to create chapter", { error, courseId: input.courseId });
    return { success: false, message: "Failed to create chapter" };
  }
}

export async function serviceUpdateChapter(
  input: ServiceInputUpdateChapter
): Promise<{ success: boolean; message: string }> {
  try {
    await repoUpdateChapter({
      id: input.chapterId,
      title: input.title,
      sortOrder: input.sortOrder,
    });
    return { success: true, message: "Chapter updated successfully" };
  } catch (error) {
    log.error("Failed to update chapter", { error, chapterId: input.chapterId });
    return { success: false, message: "Failed to update chapter" };
  }
}

export async function serviceDeleteChapter(
  input: ServiceInputDeleteChapter
): Promise<{ success: boolean; message: string }> {
  try {
    await repoDeleteChapter({ id: input.chapterId });
    return { success: true, message: "Chapter deleted successfully" };
  } catch (error) {
    log.error("Failed to delete chapter", { error, chapterId: input.chapterId });
    return { success: false, message: "Failed to delete chapter" };
  }
}

export async function serviceGetChaptersByCourseId(
  input: ServiceInputGetChaptersByCourseId
): Promise<{ success: boolean; data?: ServiceOutputChapter[]; message: string }> {
  try {
    const chapters = await repoGetChaptersByCourseId(input);
    return { success: true, data: chapters, message: "Chapters retrieved successfully" };
  } catch (error) {
    log.error("Failed to get chapters", { error, courseId: input.courseId });
    return { success: false, message: "Failed to get chapters" };
  }
}

// ============================================
// ChapterItem
// ============================================

export async function serviceCreateChapterItem(
  input: ServiceInputCreateChapterItem
): Promise<{ success: boolean; chapterItemId?: number; message: string }> {
  try {
    const chapterItemId = await repoCreateChapterItem(input);
    return { success: true, chapterItemId, message: "Chapter item created successfully" };
  } catch (error) {
    log.error("Failed to create chapter item", { error, chapterId: input.chapterId });
    return { success: false, message: "Failed to create chapter item" };
  }
}

export async function serviceUpdateChapterItem(
  input: ServiceInputUpdateChapterItem
): Promise<{ success: boolean; message: string }> {
  try {
    await repoUpdateChapterItem({
      id: input.chapterItemId,
      title: input.title,
      content: input.content,
      deckId: input.deckId,
    });
    return { success: true, message: "Chapter item updated successfully" };
  } catch (error) {
    log.error("Failed to update chapter item", { error, chapterItemId: input.chapterItemId });
    return { success: false, message: "Failed to update chapter item" };
  }
}

export async function serviceDeleteChapterItem(
  input: ServiceInputDeleteChapterItem
): Promise<{ success: boolean; message: string }> {
  try {
    await repoDeleteChapterItem({ id: input.chapterItemId });
    return { success: true, message: "Chapter item deleted successfully" };
  } catch (error) {
    log.error("Failed to delete chapter item", { error, chapterItemId: input.chapterItemId });
    return { success: false, message: "Failed to delete chapter item" };
  }
}

export async function serviceGetChapterItems(
  input: ServiceInputGetChapterItems
): Promise<{ success: boolean; data?: ServiceOutputChapterItem[]; message: string }> {
  try {
    const items = await repoGetChapterItems(input);
    return { success: true, data: items, message: "Chapter items retrieved successfully" };
  } catch (error) {
    log.error("Failed to get chapter items", { error, chapterId: input.chapterId });
    return { success: false, message: "Failed to get chapter items" };
  }
}

// ============================================
// Enrollment
// ============================================

export async function serviceEnrollCourse(
  input: ServiceInputEnrollCourse
): Promise<{ success: boolean; message: string }> {
  try {
    await repoCreateEnrollment(input);
    return { success: true, message: "Enrolled successfully" };
  } catch (error) {
    log.error("Failed to enroll", { error, userId: input.userId, courseId: input.courseId });
    return { success: false, message: "Failed to enroll" };
  }
}

export async function serviceUnenrollCourse(
  input: ServiceInputUnenrollCourse
): Promise<{ success: boolean; message: string }> {
  try {
    await repoDeleteEnrollment(input);
    return { success: true, message: "Unenrolled successfully" };
  } catch (error) {
    log.error("Failed to unenroll", { error, userId: input.userId, courseId: input.courseId });
    return { success: false, message: "Failed to unenroll" };
  }
}

export async function serviceGetEnrolledCourses(
  input: ServiceInputGetEnrolledCourses
): Promise<{ success: boolean; data?: ServiceOutputPublicCourse[]; message: string }> {
  try {
    const courses = await repoGetEnrolledCourses({ userId: input.userId });
    return { success: true, data: courses, message: "Enrolled courses retrieved successfully" };
  } catch (error) {
    log.error("Failed to get enrolled courses", { error, userId: input.userId });
    return { success: false, message: "Failed to get enrolled courses" };
  }
}

export async function serviceCheckEnrollment(
  input: ServiceInputCheckEnrollment
): Promise<{ success: boolean; data?: { enrolled: boolean }; message: string }> {
  try {
    const enrolled = await repoCheckEnrollment(input);
    return { success: true, data: { enrolled }, message: "Enrollment status retrieved" };
  } catch (error) {
    log.error("Failed to check enrollment", { error, userId: input.userId, courseId: input.courseId });
    return { success: false, message: "Failed to check enrollment" };
  }
}
