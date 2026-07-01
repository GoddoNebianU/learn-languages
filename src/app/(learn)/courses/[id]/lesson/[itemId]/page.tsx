import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { actionGetCourseById } from "@/modules/course/course-action";
import { actionGetChapterItemById } from "@/modules/course/course-chapter-action";
import { PageLayout } from "@/components/ui/PageLayout";
import { LessonViewClient } from "./LessonViewClient";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}): Promise<Metadata> {
  const { itemId } = await params;
  const result = await actionGetChapterItemById(Number(itemId));
  return { title: result.success && result.data ? `${result.data.title} | Learn Languages` : "Lesson" };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string; itemId: string }>;
}) {
  const { id, itemId } = await params;
  const courseId = Number(id);
  const lessonId = Number(itemId);
  if (!courseId || !lessonId) redirect("/courses");

  const courseResult = await actionGetCourseById({ courseId });
  if (!courseResult.success || !courseResult.data) redirect("/courses");

  const itemResult = await actionGetChapterItemById(lessonId);
  if (!itemResult.success || !itemResult.data) redirect(`/courses/${courseId}`);

  return (
    <PageLayout>
      <div className="mb-4">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500"
        >
          <ChevronLeft size={16} />
          Back to {courseResult.data.title}
        </Link>
      </div>
      <LessonViewClient
        lesson={itemResult.data}
        courseTitle={courseResult.data.title}
        courseId={courseId}
        courseLanguage={courseResult.data.language}
      />
    </PageLayout>
  );
}
