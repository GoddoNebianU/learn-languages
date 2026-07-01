"use server";

import { getCurrentUserId } from "@/modules/shared/action-utils";
import { ValidateError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";
import { Visibility } from "../../../generated/prisma/enums";
import {
  ActionInputCreateCourse,
  ActionInputUpdateCourse,
  ActionInputDeleteCourse,
  ActionInputGetCourseById,
  ActionInputGetPublicCourses,
  ActionInputSearchPublicCourses,
  ActionOutputCreateCourse,
  ActionOutputUpdateCourse,
  ActionOutputDeleteCourse,
  ActionOutputGetCourseById,
  ActionOutputGetMyCourses,
  ActionOutputGetPublicCourses,
  ActionOutputSearchPublicCourses,
  validateActionInputCreateCourse,
  validateActionInputUpdateCourse,
  validateActionInputDeleteCourse,
  validateActionInputGetCourseById,
  validateActionInputGetPublicCourses,
  validateActionInputSearchPublicCourses,
} from "./course-action-dto";
import {
  serviceCreateCourse,
  serviceUpdateCourse,
  serviceDeleteCourse,
  serviceGetCourseById,
  serviceGetCoursesByUserId,
  serviceGetPublicCourses,
  serviceSearchPublicCourses,
} from "./course-service";
import {
  log,
  mapVisibility,
  mapVisibilityToService,
  checkCourseOwnership,
} from "./course-action-helpers";

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

export * from "./course-chapter-action";
export * from "./course-enrollment-action";
