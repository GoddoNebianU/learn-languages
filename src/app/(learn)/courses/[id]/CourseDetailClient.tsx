"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  MessagesSquare,
  ListChecks,
  Pencil,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Badge } from "@/design-system/badge";
import { Card } from "@/design-system/card";
import { VStack, HStack } from "@/design-system/stack";
import { Spinner } from "@/design-system/spinner";
import { PageLayout } from "@/components/ui/PageLayout";
import {
  actionCheckEnrollment,
  actionEnrollCourse,
  actionUnenrollCourse,
} from "@/modules/course/course-enrollment-action";
import type {
  ActionOutputChapter,
  ActionOutputChapterItem,
  ActionOutputCourse,
} from "@/modules/course/course-action-dto";

interface CourseDetailClientProps {
  course: ActionOutputCourse;
  chapters: (ActionOutputChapter & { items: ActionOutputChapterItem[] })[];
  isOwner: boolean;
  currentUserId: string | null;
}

export function CourseDetailClient({
  course,
  chapters,
  isOwner,
  currentUserId,
}: CourseDetailClientProps) {
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(true);
  const [togglingEnroll, setTogglingEnroll] = useState(false);

  useEffect(() => {
    if (isOwner || !currentUserId) {
      setEnrollLoading(false);
      return;
    }
    actionCheckEnrollment(course.id).then((res) => {
      if (res.success && res.data) setEnrolled(res.data.enrolled);
      setEnrollLoading(false);
    });
  }, [course.id, isOwner, currentUserId]);

  const handleToggleEnroll = async () => {
    setTogglingEnroll(true);
    const action = enrolled ? actionUnenrollCourse : actionEnrollCourse;
    const result = await action({ courseId: course.id });
    setTogglingEnroll(false);
    if (result.success) {
      setEnrolled(!enrolled);
      toast.success(enrolled ? "Unenrolled" : "Enrolled");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <PageLayout>
      <VStack gap={6} align="stretch">
        {/* Course header */}
        <Card variant="bordered" padding="lg" className="flex flex-col gap-4">
          <HStack align="start" justify="between" wrap>
            <VStack gap={2} align="start" className="flex-1">
              <HStack gap={2} wrap>
                {course.language && <Badge variant="info">{course.language}</Badge>}
                <Badge variant={course.visibility === "PUBLIC" ? "success" : "neutral"}>
                  {course.visibility === "PUBLIC" ? "Public" : "Private"}
                </Badge>
              </HStack>
              <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{course.title}</h1>
              {course.description && (
                <p className="text-sm text-gray-600 md:text-base">{course.description}</p>
              )}
            </VStack>
            <HStack gap={2} align="center">
              {isOwner && (
                <Button variant="light" href={`/courses/${course.id}/edit`}>
                  <Pencil size={16} />
                  Edit Course
                </Button>
              )}
              {isOwner ? (
                <Badge variant="info">Owner</Badge>
              ) : enrollLoading ? (
                <Spinner size={18} />
              ) : (
                <Button
                  variant={enrolled ? "light" : "primary"}
                  loading={togglingEnroll}
                  onClick={handleToggleEnroll}
                >
                  <GraduationCap size={16} />
                  {enrolled ? "Unenroll" : "Enroll"}
                </Button>
              )}
            </HStack>
          </HStack>
        </Card>

        {/* Chapter directory */}
        {chapters.length === 0 ? (
          <Card variant="bordered" padding="lg">
            <p className="text-center text-sm text-gray-400">
              {isOwner
                ? "No chapters yet. Click \"Edit Course\" to start adding content."
                : "This course has no content yet."}
            </p>
          </Card>
        ) : (
          <VStack gap={3} align="stretch">
            {chapters.map((chapter, idx) => {
              const singleItem = chapter.items.length === 1 ? chapter.items[0] : null;

              if (singleItem) {
                const titlesDiffer = chapter.title !== singleItem.title;
                return (
                  <Card key={chapter.id} variant="bordered" padding="none">
                    <Link
                      href={`/courses/${course.id}/lesson/${singleItem.id}`}
                      className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-gray-50"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        {idx + 1}
                      </span>
                      <BookOpen size={16} className="shrink-0 text-gray-400" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-gray-900">{singleItem.title}</span>
                        {titlesDiffer && (
                          <span className="block text-xs text-gray-400">{chapter.title}</span>
                        )}
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-gray-300" />
                    </Link>
                  </Card>
                );
              }

              return (
                <Card key={chapter.id} variant="bordered" padding="none">
                  <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-gray-900">{chapter.title}</span>
                    <Badge variant="neutral">{chapter.items.length} lessons</Badge>
                  </div>

                  {chapter.items.length === 0 ? (
                    <p className="px-5 py-3 text-sm text-gray-400">No lessons in this chapter.</p>
                  ) : (
                    <VStack gap={0} align="stretch">
                      {chapter.items.map((item) => (
                        <Link
                          key={item.id}
                          href={`/courses/${course.id}/lesson/${item.id}`}
                          className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                        >
                          <span className="text-gray-400">
                            {item.type === "LESSON" ? <BookOpen size={16} /> :
                             item.type === "ARTICLE" ? <FileText size={16} /> :
                             item.type === "DIALOGUE" ? <MessagesSquare size={16} /> :
                             item.type === "EXERCISE" ? <ListChecks size={16} /> :
                             <BookOpen size={16} />}
                          </span>
                          <span className="flex-1 text-sm font-medium text-gray-800">{item.title}</span>
                          <ChevronRight size={16} className="text-gray-300" />
                        </Link>
                      ))}
                    </VStack>
                  )}
                </Card>
              );
            })}
          </VStack>
        )}

        <HStack gap={1} align="center" className="text-xs text-gray-400">
          <Users size={12} />
          <span>Course ID: {course.id}</span>
        </HStack>
      </VStack>
    </PageLayout>
  );
}
