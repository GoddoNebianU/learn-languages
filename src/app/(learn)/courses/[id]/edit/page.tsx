import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/modules/shared/action-utils";
import { actionGetCourseById } from "@/modules/course/course-action";
import {
  actionGetChaptersByCourseId,
  actionGetChapterItems,
} from "@/modules/course/course-chapter-action";
import { CourseEditClient } from "./CourseEditClient";

export const metadata: Metadata = {
  title: "Edit Course | Learn Languages",
  description: "Edit course structure and lesson content.",
};

export default async function CourseEditPage({
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

  if (userId !== course.userId) {
    redirect(`/courses/${courseId}`);
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

  return <CourseEditClient course={course} chapters={chaptersWithItems} />;
}
