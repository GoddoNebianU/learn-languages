import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import {
  actionGetCourseById,
  actionGetChaptersByCourseId,
  actionGetChapterItems,
} from "@/modules/course/course-action";
import { CourseDetailClient } from "./CourseDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await actionGetCourseById({ courseId: Number(id) });
  return {
    title:
      result.success && result.data
        ? `${result.data.title} | Learn Languages`
        : "Course | Learn Languages",
    description: "View course chapters and lessons.",
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = Number(id);
  if (!courseId) redirect("/courses");

  const userId = await getCurrentUserId();
  const courseResult = await actionGetCourseById({ courseId });

  if (!courseResult.success || !courseResult.data) {
    redirect("/courses");
  }

  const course = courseResult.data;
  const isOwner = userId === course.userId;
  const isPublic = course.visibility === "PUBLIC";

  if (!isOwner && !isPublic) {
    redirect("/courses");
  }

  const chaptersResult = await actionGetChaptersByCourseId({ courseId });
  const chapters = chaptersResult.success ? (chaptersResult.data ?? []) : [];

  const chaptersWithItems = await Promise.all(
    chapters.map(async (chapter) => {
      const itemsResult = await actionGetChapterItems({ chapterId: chapter.id });
      return {
        ...chapter,
        items: itemsResult.success ? (itemsResult.data ?? []) : [],
      };
    })
  );

  return (
    <CourseDetailClient
      course={course}
      chapters={chaptersWithItems}
      isOwner={isOwner}
      currentUserId={userId}
    />
  );
}
