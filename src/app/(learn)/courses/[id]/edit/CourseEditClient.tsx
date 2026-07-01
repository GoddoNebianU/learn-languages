"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/design-system/button";
import { VStack, HStack } from "@/design-system/stack";
import { Modal } from "@/design-system/modal";
import { PageLayout } from "@/components/ui/PageLayout";
import {
  actionCreateChapter,
  actionUpdateChapter,
  actionDeleteChapter,
  actionCreateChapterItem,
  actionUpdateChapterItem,
  actionDeleteChapterItem,
} from "@/modules/course/course-chapter-action";
import type {
  ActionOutputCourse,
  ActionOutputChapter,
  ActionOutputChapterItem,
} from "@/modules/course/course-action-dto";
import type { LessonContent } from "@/modules/course/course-repository-dto";
import { LessonContentEditor } from "./LessonContentEditor";
import { CourseMetaEditor, ChapterTitleEditor } from "./CourseMetaEditor";
import { CourseSidebarTree, type SidebarSelection } from "./CourseSidebarTree";

interface CourseEditClientProps {
  course: ActionOutputCourse;
  chapters: (ActionOutputChapter & { items: ActionOutputChapterItem[] })[];
}

type DeleteTarget =
  | { kind: "chapter"; id: number; title: string }
  | { kind: "lesson"; id: number; title: string }
  | null;

const EMPTY_LESSON_CONTENT: LessonContent = {
  article: { body: "" },
  dialogue: { lines: [] },
  vocabulary: { items: [] },
  grammar: { body: "" },
  exercises: { questions: [] },
};

export function CourseEditClient({ course, chapters: initial }: CourseEditClientProps) {
  const router = useRouter();
  const [chapters, setChapters] = useState(initial);
  const [selection, setSelection] = useState<SidebarSelection>({ kind: "course" });
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set(initial.map((c) => c.id)));
  const [opLoading, setOpLoading] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);

  const selectedChapter =
    selection.kind === "chapter" ? chapters.find((c) => c.id === selection.chapterId) ?? null : null;
  const selectedLesson =
    selection.kind === "lesson"
      ? chapters.flatMap((c) => c.items).find((it) => it.id === selection.itemId) ?? null
      : null;

  const toggleExpand = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleAddChapter = async () => {
    setOpLoading("add-chapter");
    const result = await actionCreateChapter({ courseId: course.id, title: "New Chapter" });
    if (result.success && result.chapterId) {
      const newChapter: ActionOutputChapter & { items: ActionOutputChapterItem[] } = {
        id: result.chapterId,
        courseId: course.id,
        title: "New Chapter",
        sortOrder: chapters.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        items: [],
      };
      setChapters([...chapters, newChapter]);
      setExpanded((prev) => new Set(prev).add(result.chapterId!));
      setSelection({ kind: "chapter", chapterId: result.chapterId });
      toast.success("Chapter added");
    } else {
      toast.error(result.message);
    }
    setOpLoading(null);
  };

  const handleAddLesson = async (chapterId: number) => {
    setOpLoading(`add-lesson-${chapterId}`);
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    const result = await actionCreateChapterItem({
      chapterId,
      type: "LESSON",
      title: "New Lesson",
      content: JSON.parse(JSON.stringify(EMPTY_LESSON_CONTENT)),
    });
    if (result.success && result.chapterItemId) {
      const newItem: ActionOutputChapterItem = {
        id: result.chapterItemId,
        chapterId,
        type: "LESSON",
        title: "New Lesson",
        sortOrder: chapter.items.length,
        content: JSON.parse(JSON.stringify(EMPTY_LESSON_CONTENT)),
        deckId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChapters(chapters.map((c) => (c.id === chapterId ? { ...c, items: [...c.items, newItem] } : c)));
      setSelection({ kind: "lesson", itemId: result.chapterItemId });
      toast.success("Lesson added");
    } else {
      toast.error(result.message);
    }
    setOpLoading(null);
  };

  const handleDeleteChapter = async (chapterId: number) => {
    setOpLoading(`del-chapter-${chapterId}`);
    const result = await actionDeleteChapter({ chapterId });
    if (result.success) {
      setChapters(chapters.filter((c) => c.id !== chapterId));
      if (selection.kind === "chapter" && selection.chapterId === chapterId) {
        setSelection({ kind: "course" });
      }
      toast.success("Chapter deleted");
    } else {
      toast.error(result.message);
    }
    setOpLoading(null);
  };

  const handleDeleteLesson = async (itemId: number) => {
    setOpLoading(`del-lesson-${itemId}`);
    const result = await actionDeleteChapterItem({ chapterItemId: itemId });
    if (result.success) {
      setChapters(chapters.map((c) => ({ ...c, items: c.items.filter((it) => it.id !== itemId) })));
      if (selection.kind === "lesson" && selection.itemId === itemId) {
        setSelection({ kind: "course" });
      }
      toast.success("Lesson deleted");
    } else {
      toast.error(result.message);
    }
    setOpLoading(null);
  };

  const handleMoveChapter = async (idx: number, direction: -1 | 1) => {
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= chapters.length) return;
    const a = chapters[idx];
    const b = chapters[swapIdx];
    const reordered = [...chapters];
    reordered[idx] = { ...b, sortOrder: idx };
    reordered[swapIdx] = { ...a, sortOrder: swapIdx };
    setChapters(reordered);
    setOpLoading(`move-chapter-${a.id}`);
    await Promise.all([
      actionUpdateChapter({ chapterId: a.id, sortOrder: swapIdx }),
      actionUpdateChapter({ chapterId: b.id, sortOrder: idx }),
    ]);
    setOpLoading(null);
  };

  const handleMoveLesson = async (chapterId: number, idx: number, direction: -1 | 1) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= chapter.items.length) return;
    const a = chapter.items[idx];
    const b = chapter.items[swapIdx];
    const reorderedItems = [...chapter.items];
    reorderedItems[idx] = { ...b, sortOrder: idx };
    reorderedItems[swapIdx] = { ...a, sortOrder: swapIdx };
    setChapters(chapters.map((c) => (c.id === chapterId ? { ...c, items: reorderedItems } : c)));
    setOpLoading(`move-lesson-${a.id}`);
    await Promise.all([
      actionUpdateChapterItem({ chapterItemId: a.id, content: a.content }),
      actionUpdateChapterItem({ chapterItemId: b.id, content: b.content }),
    ]);
    setOpLoading(null);
  };

  const handleSaveChapterTitle = async (chapterId: number, title: string) => {
    setOpLoading(`save-chapter-${chapterId}`);
    const result = await actionUpdateChapter({ chapterId, title });
    if (result.success) {
      setChapters(chapters.map((c) => (c.id === chapterId ? { ...c, title } : c)));
      toast.success("Chapter saved");
    } else {
      toast.error(result.message);
    }
    setOpLoading(null);
  };

  const handleSaveLesson = async (
    itemId: number,
    updates: { title: string; content: LessonContent }
  ): Promise<boolean> => {
    setOpLoading(`save-lesson-${itemId}`);
    const result = await actionUpdateChapterItem({
      chapterItemId: itemId,
      title: updates.title,
      content: JSON.parse(JSON.stringify(updates.content)),
    });
    if (result.success) {
      setChapters(
        chapters.map((c) => ({
          ...c,
          items: c.items.map((it) =>
            it.id === itemId ? { ...it, title: updates.title, content: updates.content } : it
          ),
        }))
      );
      setOpLoading(null);
      return true;
    }
    setOpLoading(null);
    toast.error(result.message);
    return false;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    if (target.kind === "chapter") await handleDeleteChapter(target.id);
    else await handleDeleteLesson(target.id);
  };

  return (
    <PageLayout>
      <VStack gap={4} align="stretch">
        <HStack justify="between" align="center" wrap>
          <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500">
            <ArrowLeft size={16} /> Back to course
          </Link>
          <HStack gap={2} align="center">
            <h1 className="text-lg font-bold text-gray-900">Edit: {course.title}</h1>
            <Button variant="primary" size="sm" onClick={handleAddChapter} loading={opLoading === "add-chapter"}>
              <Plus size={14} /> Add Chapter
            </Button>
          </HStack>
        </HStack>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
          <CourseSidebarTree
            chapters={chapters}
            selection={selection}
            expanded={expanded}
            onToggleExpand={toggleExpand}
            opLoading={opLoading}
            handlers={{
              onSelect: setSelection,
              onAddLesson: handleAddLesson,
              onDeleteChapter: (id, title) => setDeleteTarget({ kind: "chapter", id, title }),
              onDeleteLesson: (id, title) => setDeleteTarget({ kind: "lesson", id, title }),
              onMoveChapter: handleMoveChapter,
              onMoveLesson: handleMoveLesson,
            }}
          />
          <div>
            {selection.kind === "course" && (
              <CourseMetaEditor course={course} onSaved={() => router.refresh()} />
            )}
            {selection.kind === "chapter" && selectedChapter && (
              <ChapterTitleEditor
                chapter={selectedChapter}
                saving={opLoading === `save-chapter-${selectedChapter.id}`}
                onSave={(title) => handleSaveChapterTitle(selectedChapter.id, title)}
              />
            )}
            {selection.kind === "lesson" && selectedLesson && (
              <LessonContentEditor
                key={selectedLesson.id}
                lesson={selectedLesson}
                onSave={(updates) => handleSaveLesson(selectedLesson.id, updates)}
              />
            )}
          </div>
        </div>
      </VStack>

      <Modal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} size="sm">
        <Modal.Header>
          <Modal.Title>Confirm Delete</Modal.Title>
          <Modal.CloseButton onClick={() => setDeleteTarget(null)} />
        </Modal.Header>
        <Modal.Body>
          <p className="text-sm text-gray-600">
            Delete {deleteTarget?.kind} <span className="font-semibold">&quot;{deleteTarget?.title}&quot;</span>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" size="sm" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleConfirmDelete}>Delete</Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
