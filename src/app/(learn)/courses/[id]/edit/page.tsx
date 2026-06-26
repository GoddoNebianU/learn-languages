import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  actionGetCourseById,
  actionGetChaptersByCourseId,
  actionGetChapterItems,
} from "@/modules/course/course-action";
import { CourseEditor } from "./CourseEditor";

export const metadata: Metadata = {
  title: "Edit Course | Learn Languages",
  description: "Edit course content, chapters, and lessons.",
};

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = Number(id);
  if (!courseId) redirect("/courses");

  const courseResult = await actionGetCourseById({ courseId });
  if (!courseResult.success || !courseResult.data) {
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
    <CourseEditor
      initialCourse={courseResult.data}
      initialChapters={chaptersWithItems}
    />
  );
}
