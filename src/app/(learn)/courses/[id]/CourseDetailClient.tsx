"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FileText,
  GraduationCap,
  ListChecks,
  MessagesSquare,
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
} from "@/modules/course/course-action";
import type {
  ActionOutputChapter,
  ActionOutputChapterItem,
  ActionOutputCourse,
} from "@/modules/course/course-action-dto";
import type { ChapterItemType } from "@/modules/course/course-repository-dto";
import {
  ArticleViewer,
  DialogueViewer,
  ExerciseViewer,
  MemorizeViewer,
} from "../components/ContentViewers";

type ChapterWithItems = ActionOutputChapter & { items: ActionOutputChapterItem[] };

interface CourseDetailClientProps {
  course: ActionOutputCourse;
  chapters: ChapterWithItems[];
  isOwner: boolean;
  currentUserId: string | null;
}

const itemTypeIcon: Record<ChapterItemType, React.ReactNode> = {
  ARTICLE: <FileText size={16} />,
  DIALOGUE: <MessagesSquare size={16} />,
  MEMORIZE: <BookOpen size={16} />,
  EXERCISE: <ListChecks size={16} />,
};

const itemTypeLabel: Record<ChapterItemType, string> = {
  ARTICLE: "Article",
  DIALOGUE: "Dialogue",
  MEMORIZE: "Memorize",
  EXERCISE: "Exercise",
};

export function CourseDetailClient({
  course,
  chapters,
  isOwner,
  currentUserId,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [expandedChapter, setExpandedChapter] = useState<number | null>(
    chapters[0]?.id ?? null
  );
  const [openItem, setOpenItem] = useState<number | null>(null);
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

  const handleItemClick = (itemId: number) => {
    setOpenItem((prev) => (prev === itemId ? null : itemId));
  };

  const renderContent = (item: ActionOutputChapterItem) => {
    switch (item.type) {
      case "ARTICLE":
        return <ArticleViewer content={item.content} />;
      case "DIALOGUE":
        return <DialogueViewer content={item.content} />;
      case "MEMORIZE":
        return <MemorizeViewer deckId={item.deckId} />;
      case "EXERCISE":
        return <ExerciseViewer content={item.content} />;
      default:
        return null;
    }
  };

  return (
    <PageLayout variant="full-width">
      <VStack gap={6} align="stretch">
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
              {isOwner ? (
                <Button
                  variant="primary"
                  onClick={() => router.push(`/courses/${course.id}/edit`)}
                >
                  <Pencil size={16} />
                  Edit Course
                </Button>
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

        {chapters.length === 0 ? (
          <Card variant="bordered" padding="lg">
            <p className="text-center text-sm text-gray-400">
              {isOwner
                ? "No chapters yet. Edit the course to add chapters and lessons."
                : "This course has no content yet."}
            </p>
          </Card>
        ) : (
          <VStack gap={3} align="stretch">
            {chapters.map((chapter, idx) => {
              const isExpanded = expandedChapter === chapter.id;
              return (
                <Card key={chapter.id} variant="bordered" padding="none">
                  <button
                    type="button"
                    onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
                  >
                    <HStack gap={3} align="center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-gray-900">{chapter.title}</span>
                      <Badge variant="neutral">{chapter.items.length} lessons</Badge>
                    </HStack>
                    {isExpanded ? (
                      <ChevronDown size={18} className="text-gray-400" />
                    ) : (
                      <ChevronRight size={18} className="text-gray-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <VStack gap={0} align="stretch" className="border-t border-gray-100">
                      {chapter.items.length === 0 ? (
                        <p className="px-5 py-3 text-sm text-gray-400">No lessons in this chapter.</p>
                      ) : (
                        chapter.items.map((item) => {
                          const isOpen = openItem === item.id;
                          return (
                            <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                              <button
                                type="button"
                                onClick={() => handleItemClick(item.id)}
                                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50"
                              >
                                <span className="text-gray-400">
                                  {itemTypeIcon[item.type]}
                                </span>
                                <span className="flex-1 text-sm font-medium text-gray-800">
                                  {item.title}
                                </span>
                                <Badge variant="neutral" size="sm">
                                  {itemTypeLabel[item.type]}
                                </Badge>
                                {isOpen ? (
                                  <ChevronDown size={16} className="text-gray-400" />
                                ) : (
                                  <ChevronRight size={16} className="text-gray-400" />
                                )}
                              </button>
                              {isOpen && (
                                <div className="px-5 pb-5 pt-1">{renderContent(item)}</div>
                              )}
                            </div>
                          );
                        })
                      )}
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
