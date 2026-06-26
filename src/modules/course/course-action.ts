"use server";

import { createLogger } from "@/lib/logger";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { ValidateError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";
import { Visibility } from "../../../generated/prisma/enums";
import {
  repoGetCourseIdByChapterId,
  repoGetChapterIdByItemId,
} from "./course-repository";
import {
  ActionInputCreateCourse,
  ActionInputUpdateCourse,
  ActionInputDeleteCourse,
  ActionInputGetCourseById,
  ActionInputGetPublicCourses,
  ActionInputSearchPublicCourses,
  ActionInputCreateChapter,
  ActionInputUpdateChapter,
  ActionInputDeleteChapter,
  ActionInputGetChaptersByCourseId,
  ActionInputCreateChapterItem,
  ActionInputUpdateChapterItem,
  ActionInputDeleteChapterItem,
  ActionInputGetChapterItems,
  ActionInputEnrollCourse,
  ActionInputUnenrollCourse,
  ActionOutputCreateCourse,
  ActionOutputUpdateCourse,
  ActionOutputDeleteCourse,
  ActionOutputGetCourseById,
  ActionOutputGetMyCourses,
  ActionOutputGetPublicCourses,
  ActionOutputSearchPublicCourses,
  ActionOutputCreateChapter,
  ActionOutputUpdateChapter,
  ActionOutputDeleteChapter,
  ActionOutputGetChaptersByCourseId,
  ActionOutputCreateChapterItem,
  ActionOutputUpdateChapterItem,
  ActionOutputDeleteChapterItem,
  ActionOutputGetChapterItems,
  ActionOutputEnrollCourse,
  ActionOutputUnenrollCourse,
  ActionOutputGetEnrolledCourses,
  ActionOutputCheckEnrollment,
  validateActionInputCreateCourse,
  validateActionInputUpdateCourse,
  validateActionInputDeleteCourse,
  validateActionInputGetCourseById,
  validateActionInputGetPublicCourses,
  validateActionInputSearchPublicCourses,
  validateActionInputCreateChapter,
  validateActionInputUpdateChapter,
  validateActionInputDeleteChapter,
  validateActionInputGetChaptersByCourseId,
  validateActionInputCreateChapterItem,
  validateActionInputUpdateChapterItem,
  validateActionInputDeleteChapterItem,
  validateActionInputGetChapterItems,
  validateActionInputEnrollCourse,
  validateActionInputUnenrollCourse,
} from "./course-action-dto";
import {
  serviceCreateCourse,
  serviceUpdateCourse,
  serviceDeleteCourse,
  serviceGetCourseById,
  serviceGetCoursesByUserId,
  serviceGetPublicCourses,
  serviceCheckOwnership,
  serviceSearchPublicCourses,
  serviceCreateChapter,
  serviceUpdateChapter,
  serviceDeleteChapter,
  serviceGetChaptersByCourseId,
  serviceCreateChapterItem,
  serviceUpdateChapterItem,
  serviceDeleteChapterItem,
  serviceGetChapterItems,
  serviceEnrollCourse,
  serviceUnenrollCourse,
  serviceGetEnrolledCourses,
  serviceCheckEnrollment,
} from "./course-service";

const log = createLogger("course-action");

function mapVisibility(v: string): "PRIVATE" | "PUBLIC" {
  return v as "PRIVATE" | "PUBLIC";
}

function mapVisibilityToService(v: string | undefined): Visibility | undefined {
  return v as Visibility | undefined;
}

// ============================================
// Ownership helpers
// ============================================

async function checkCourseOwnership(courseId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  return serviceCheckOwnership({ courseId, userId });
}

async function checkChapterOwnership(chapterId: number): Promise<boolean> {
  const courseId = await repoGetCourseIdByChapterId(chapterId);
  if (courseId === null) return false;
  return checkCourseOwnership(courseId);
}

async function checkChapterItemOwnership(chapterItemId: number): Promise<boolean> {
  const chapterId = await repoGetChapterIdByItemId(chapterItemId);
  if (chapterId === null) return false;
  return checkChapterOwnership((await repoGetCourseIdByChapterId(chapterId)) ?? -1);
}

// ============================================
// Course actions
// ============================================

export async function actionCreateCourse(
  input: ActionInputCreateCourse
): Promise<ActionOutputCreateCourse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validateActionInputCreateCourse(input);
    const result = await serviceCreateCourse({
      title: validatedInput.title,
      description: validatedInput.description,
      language: validatedInput.language,
      userId,
      visibility: mapVisibilityToService(validatedInput.visibility),
      coverImage: validatedInput.coverImage,
    });

    if (result.success && result.courseId) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.COURSE.CREATE,
        entityType: "course",
        entityId: result.courseId,
      });
    }

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to create course", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionUpdateCourse(
  input: ActionInputUpdateCourse
): Promise<ActionOutputUpdateCourse> {
  try {
    const validatedInput = validateActionInputUpdateCourse(input);

    const isOwner = await checkCourseOwnership(validatedInput.courseId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to update this course" };
    }

    const result = await serviceUpdateCourse({
      courseId: validatedInput.courseId,
      title: validatedInput.title,
      description: validatedInput.description,
      language: validatedInput.language,
      visibility: mapVisibilityToService(validatedInput.visibility),
      coverImage: validatedInput.coverImage,
    });

    if (result.success) {
      await logActivity({
        userId: await getCurrentUserId(),
        action: ACTIVITY_ACTIONS.COURSE.UPDATE,
        entityType: "course",
        entityId: validatedInput.courseId,
      });
    }

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to update course", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionDeleteCourse(
  input: ActionInputDeleteCourse
): Promise<ActionOutputDeleteCourse> {
  try {
    const validatedInput = validateActionInputDeleteCourse(input);

    const isOwner = await checkCourseOwnership(validatedInput.courseId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to delete this course" };
    }

    const result = await serviceDeleteCourse({ courseId: validatedInput.courseId });

    if (result.success) {
      await logActivity({
        userId: await getCurrentUserId(),
        action: ACTIVITY_ACTIONS.COURSE.DELETE,
        entityType: "course",
        entityId: validatedInput.courseId,
      });
    }

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to delete course", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetCourseById(
  input: ActionInputGetCourseById
): Promise<ActionOutputGetCourseById> {
  try {
    const validatedInput = validateActionInputGetCourseById(input);
    const result = await serviceGetCourseById({ courseId: validatedInput.courseId });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    // Enforce visibility: private courses only visible to owner.
    if (result.data.visibility === Visibility.PRIVATE) {
      const userId = await getCurrentUserId();
      if (!userId || userId !== result.data.userId) {
        return { success: false, message: "You do not have permission to view this course" };
      }
    }

    return {
      success: true,
      message: result.message,
      data: {
        ...result.data,
        visibility: mapVisibility(result.data.visibility),
      },
    };
  } catch (e) {
    log.error("Failed to get course", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetMyCourses(): Promise<ActionOutputGetMyCourses> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const result = await serviceGetCoursesByUserId({ userId });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((course) => ({
        ...course,
        visibility: mapVisibility(course.visibility),
      })),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get my courses", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetPublicCourses(
  input: ActionInputGetPublicCourses = {}
): Promise<ActionOutputGetPublicCourses> {
  try {
    const validatedInput = validateActionInputGetPublicCourses(input);
    const result = await serviceGetPublicCourses(validatedInput);

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((course) => ({
        ...course,
        visibility: mapVisibility(course.visibility),
      })),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to get public courses", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionSearchPublicCourses(
  input: ActionInputSearchPublicCourses
): Promise<ActionOutputSearchPublicCourses> {
  try {
    const validatedInput = validateActionInputSearchPublicCourses(input);
    const result = await serviceSearchPublicCourses(validatedInput);

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((course) => ({
        ...course,
        visibility: mapVisibility(course.visibility),
      })),
    };
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to search public courses", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

// ============================================
// Chapter actions
// ============================================

export async function actionCreateChapter(
  input: ActionInputCreateChapter
): Promise<ActionOutputCreateChapter> {
  try {
    const validatedInput = validateActionInputCreateChapter(input);

    const isOwner = await checkCourseOwnership(validatedInput.courseId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to modify this course" };
    }

    return serviceCreateChapter({
      courseId: validatedInput.courseId,
      title: validatedInput.title,
    });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to create chapter", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionUpdateChapter(
  input: ActionInputUpdateChapter
): Promise<ActionOutputUpdateChapter> {
  try {
    const validatedInput = validateActionInputUpdateChapter(input);

    const isOwner = await checkChapterOwnership(validatedInput.chapterId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to modify this chapter" };
    }

    return serviceUpdateChapter({
      chapterId: validatedInput.chapterId,
      title: validatedInput.title,
      sortOrder: validatedInput.sortOrder,
    });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to update chapter", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionDeleteChapter(
  input: ActionInputDeleteChapter
): Promise<ActionOutputDeleteChapter> {
  try {
    const validatedInput = validateActionInputDeleteChapter(input);

    const isOwner = await checkChapterOwnership(validatedInput.chapterId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to delete this chapter" };
    }

    return serviceDeleteChapter({ chapterId: validatedInput.chapterId });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to delete chapter", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetChaptersByCourseId(
  input: ActionInputGetChaptersByCourseId
): Promise<ActionOutputGetChaptersByCourseId> {
  try {
    const validatedInput = validateActionInputGetChaptersByCourseId(input);
    const result = await serviceGetChaptersByCourseId({ courseId: validatedInput.courseId });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return { success: true, message: result.message, data: result.data };
  } catch (e) {
    log.error("Failed to get chapters", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

// ============================================
// ChapterItem actions
// ============================================

export async function actionCreateChapterItem(
  input: ActionInputCreateChapterItem
): Promise<ActionOutputCreateChapterItem> {
  try {
    const validatedInput = validateActionInputCreateChapterItem(input);

    const isOwner = await checkChapterOwnership(validatedInput.chapterId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to modify this chapter" };
    }

    return serviceCreateChapterItem({
      chapterId: validatedInput.chapterId,
      type: validatedInput.type,
      title: validatedInput.title,
      content: validatedInput.content,
      deckId: validatedInput.deckId,
    });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to create chapter item", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionUpdateChapterItem(
  input: ActionInputUpdateChapterItem
): Promise<ActionOutputUpdateChapterItem> {
  try {
    const validatedInput = validateActionInputUpdateChapterItem(input);

    const isOwner = await checkChapterItemOwnership(validatedInput.chapterItemId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to modify this item" };
    }

    return serviceUpdateChapterItem({
      chapterItemId: validatedInput.chapterItemId,
      title: validatedInput.title,
      content: validatedInput.content,
      deckId: validatedInput.deckId,
    });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to update chapter item", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionDeleteChapterItem(
  input: ActionInputDeleteChapterItem
): Promise<ActionOutputDeleteChapterItem> {
  try {
    const validatedInput = validateActionInputDeleteChapterItem(input);

    const isOwner = await checkChapterItemOwnership(validatedInput.chapterItemId);
    if (!isOwner) {
      return { success: false, message: "You do not have permission to delete this item" };
    }

    return serviceDeleteChapterItem({ chapterItemId: validatedInput.chapterItemId });
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to delete chapter item", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetChapterItems(
  input: ActionInputGetChapterItems
): Promise<ActionOutputGetChapterItems> {
  try {
    const validatedInput = validateActionInputGetChapterItems(input);
    const summary = typeof (input as { summary?: boolean }).summary === "boolean"
      ? (input as { summary: boolean }).summary : false;
    const result = await serviceGetChapterItems({ chapterId: validatedInput.chapterId, summary });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return { success: true, message: result.message, data: result.data };
  } catch (e) {
    log.error("Failed to get chapter items", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetChapterItemById(itemId: number) {
  try {
    const { repoGetChapterItemById } = await import("./course-repository");
    const item = await repoGetChapterItemById(itemId);
    if (!item) return { success: false, message: "Item not found" };
    return { success: true, message: "OK", data: item };
  } catch (e) {
    log.error("Failed to get chapter item", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

// ============================================
// Enrollment actions
// ============================================

export async function actionEnrollCourse(
  input: ActionInputEnrollCourse
): Promise<ActionOutputEnrollCourse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validateActionInputEnrollCourse(input);

    const result = await serviceEnrollCourse({
      userId,
      courseId: validatedInput.courseId,
    });

    if (result.success) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.COURSE.ENROLL,
        entityType: "course",
        entityId: validatedInput.courseId,
      });
    }

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to enroll", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionUnenrollCourse(
  input: ActionInputUnenrollCourse
): Promise<ActionOutputUnenrollCourse> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const validatedInput = validateActionInputUnenrollCourse(input);

    const result = await serviceUnenrollCourse({
      userId,
      courseId: validatedInput.courseId,
    });

    if (result.success) {
      await logActivity({
        userId,
        action: ACTIVITY_ACTIONS.COURSE.UNENROLL,
        entityType: "course",
        entityId: validatedInput.courseId,
      });
    }

    return result;
  } catch (e) {
    if (e instanceof ValidateError) {
      return { success: false, message: e.message };
    }
    log.error("Failed to unenroll", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionGetEnrolledCourses(): Promise<ActionOutputGetEnrolledCourses> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, message: "Unauthorized" };
    }

    const result = await serviceGetEnrolledCourses({ userId });

    if (!result.success || !result.data) {
      return { success: false, message: result.message };
    }

    return {
      success: true,
      message: result.message,
      data: result.data.map((course) => ({
        ...course,
        visibility: mapVisibility(course.visibility),
      })),
    };
  } catch (e) {
    log.error("Failed to get enrolled courses", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}

export async function actionCheckEnrollment(
  courseId: number
): Promise<ActionOutputCheckEnrollment> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: true, message: "Not logged in", data: { enrolled: false } };
    }

    return serviceCheckEnrollment({ userId, courseId });
  } catch (e) {
    log.error("Failed to check enrollment", { error: e });
    return { success: false, message: "Unknown error occurred" };
  }
}
