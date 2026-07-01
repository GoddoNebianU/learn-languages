"use server";

import { getCurrentUserId } from "@/modules/shared/action-utils";
import { ValidateError } from "@/lib/errors";
import { logActivity } from "@/modules/activity/activity-service";
import { ACTIVITY_ACTIONS } from "@/modules/activity/activity-constants";
import {
  ActionInputEnrollCourse,
  ActionInputUnenrollCourse,
  ActionOutputEnrollCourse,
  ActionOutputUnenrollCourse,
  ActionOutputGetEnrolledCourses,
  ActionOutputCheckEnrollment,
  validateActionInputEnrollCourse,
  validateActionInputUnenrollCourse,
} from "./course-action-dto";
import {
  serviceEnrollCourse,
  serviceUnenrollCourse,
  serviceGetEnrolledCourses,
  serviceCheckEnrollment,
} from "./course-service";
import { log, mapVisibility } from "./course-action-helpers";

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
