"use server";

import { ValidateError } from "@/lib/errors";
import {
  ActionInputCreateChapter,
  ActionInputUpdateChapter,
  ActionInputDeleteChapter,
  ActionInputGetChaptersByCourseId,
  ActionInputCreateChapterItem,
  ActionInputUpdateChapterItem,
  ActionInputDeleteChapterItem,
  ActionInputGetChapterItems,
  ActionOutputCreateChapter,
  ActionOutputUpdateChapter,
  ActionOutputDeleteChapter,
  ActionOutputGetChaptersByCourseId,
  ActionOutputCreateChapterItem,
  ActionOutputUpdateChapterItem,
  ActionOutputDeleteChapterItem,
  ActionOutputGetChapterItems,
  validateActionInputCreateChapter,
  validateActionInputUpdateChapter,
  validateActionInputDeleteChapter,
  validateActionInputGetChaptersByCourseId,
  validateActionInputCreateChapterItem,
  validateActionInputUpdateChapterItem,
  validateActionInputDeleteChapterItem,
  validateActionInputGetChapterItems,
} from "./course-action-dto";
import {
  serviceCreateChapter,
  serviceUpdateChapter,
  serviceDeleteChapter,
  serviceGetChaptersByCourseId,
  serviceCreateChapterItem,
  serviceUpdateChapterItem,
  serviceDeleteChapterItem,
  serviceGetChapterItems,
} from "./course-service";
import {
  log,
  checkCourseOwnership,
  checkChapterOwnership,
  checkChapterItemOwnership,
} from "./course-action-helpers";

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
