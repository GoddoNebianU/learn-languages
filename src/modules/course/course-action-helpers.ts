import { createLogger } from "@/lib/logger";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { Visibility } from "../../../generated/prisma/enums";
import {
  repoGetCourseIdByChapterId,
  repoGetChapterIdByItemId,
} from "./course-repository";
import { serviceCheckOwnership } from "./course-service";

export const log = createLogger("course-action");

export function mapVisibility(v: string): "PRIVATE" | "PUBLIC" {
  return v as "PRIVATE" | "PUBLIC";
}

export function mapVisibilityToService(v: string | undefined): Visibility | undefined {
  return v as Visibility | undefined;
}

export async function checkCourseOwnership(courseId: number): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  return serviceCheckOwnership({ courseId, userId });
}

export async function checkChapterOwnership(chapterId: number): Promise<boolean> {
  const courseId = await repoGetCourseIdByChapterId(chapterId);
  if (courseId === null) return false;
  return checkCourseOwnership(courseId);
}

export async function checkChapterItemOwnership(chapterItemId: number): Promise<boolean> {
  const chapterId = await repoGetChapterIdByItemId(chapterItemId);
  if (chapterId === null) return false;
  return checkChapterOwnership((await repoGetCourseIdByChapterId(chapterId)) ?? -1);
}
