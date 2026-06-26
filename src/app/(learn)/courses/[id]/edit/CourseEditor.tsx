"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Textarea } from "@/design-system/textarea";
import { Select } from "@/design-system/select";
import { Badge } from "@/design-system/badge";
import { Card } from "@/design-system/card";
import { Switch } from "@/design-system/switch";
import { IconButton } from "@/design-system/icon-button";
import { VStack, HStack } from "@/design-system/stack";
import { PageLayout } from "@/components/ui/PageLayout";
import {
  actionUpdateCourse,
  actionCreateChapter,
  actionUpdateChapter,
  actionDeleteChapter,
  actionCreateChapterItem,
  actionUpdateChapterItem,
  actionDeleteChapterItem,
} from "@/modules/course/course-action";
import type {
  ActionOutputChapter,
  ActionOutputChapterItem,
  ActionOutputCourse,
} from "@/modules/course/course-action-dto";
import type {
  ArticleContent,
  ChapterItemType,
  DialogueContent,
  ExerciseContent,
} from "@/modules/course/course-repository-dto";
import {
  ArticleContentEditor,
  DialogueContentEditor,
  ExerciseContentEditor,
  MemorizeContentEditor,
} from "./ContentEditors";

type ChapterWithItems = ActionOutputChapter & { items: ActionOutputChapterItem[] };

interface CourseEditorProps {
  initialCourse: ActionOutputCourse;
  initialChapters: ChapterWithItems[];
}

const ITEM_TYPES: { value: ChapterItemType; label: string }[] = [
  { value: "ARTICLE", label: "Article" },
  { value: "DIALOGUE", label: "Dialogue" },
  { value: "MEMORIZE", label: "Memorize" },
  { value: "EXERCISE", label: "Exercise" },
];

export function CourseEditor({ initialCourse, initialChapters }: CourseEditorProps) {
  const router = useRouter();
  const courseId = initialCourse.id;

  const [title, setTitle] = useState(initialCourse.title);
  const [description, setDescription] = useState(initialCourse.description);
  const [language, setLanguage] = useState(initialCourse.language);
  const [isPublic, setIsPublic] = useState(initialCourse.visibility === "PUBLIC");
  const [savingCourse, setSavingCourse] = useState(false);

  const [chapters, setChapters] = useState<ChapterWithItems[]>(initialChapters);
  const [openChapter, setOpenChapter] = useState<number | null>(initialChapters[0]?.id ?? null);
  const [openItem, setOpenItem] = useState<number | null>(null);

  useEffect(() => {
    setTitle(initialCourse.title);
    setDescription(initialCourse.description);
    setLanguage(initialCourse.language);
    setIsPublic(initialCourse.visibility === "PUBLIC");
  }, [initialCourse]);

  const saveCourse = async () => {
    setSavingCourse(true);
    const result = await actionUpdateCourse({
      courseId,
      title,
      description,
      language,
      visibility: isPublic ? "PUBLIC" : "PRIVATE",
    });
    setSavingCourse(false);
    if (result.success) toast.success("Course saved");
    else toast.error(result.message);
  };

  // ---- Chapter operations ----

  const addChapter = async () => {
    const result = await actionCreateChapter({ courseId, title: "New chapter" });
    if (result.success && result.chapterId) {
      const newChapter: ChapterWithItems = {
        id: result.chapterId,
        courseId,
        title: "New chapter",
        sortOrder: chapters.length,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChapters([...chapters, newChapter]);
      setOpenChapter(result.chapterId);
    } else {
      toast.error(result.message);
    }
  };

  const renameChapter = (chapterId: number, newTitle: string) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, title: newTitle } : c))
    );
  };

  const commitChapterRename = async (chapterId: number, newTitle: string) => {
    if (!newTitle.trim()) return;
    const result = await actionUpdateChapter({ chapterId, title: newTitle });
    if (!result.success) toast.error(result.message);
  };

  const moveChapter = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= chapters.length) return;
    const next = [...chapters];
    [next[idx], next[target]] = [next[target], next[idx]];
    const reordered = next.map((c, i) => ({ ...c, sortOrder: i }));
    setChapters(reordered);
    // Persist new sort orders
    await Promise.all(
      reordered.map((c) => actionUpdateChapter({ chapterId: c.id, sortOrder: c.sortOrder }))
    );
  };

  const deleteChapter = async (chapterId: number) => {
    if (!confirm("Delete this chapter and all its lessons?")) return;
    const result = await actionDeleteChapter({ chapterId });
    if (result.success) {
      setChapters((prev) => prev.filter((c) => c.id !== chapterId));
      toast.success("Chapter deleted");
    } else {
      toast.error(result.message);
    }
  };

  // ---- Item operations ----

  const addItem = async (chapterId: number, type: ChapterItemType) => {
    const emptyContent =
      type === "ARTICLE"
        ? { body: "" }
        : type === "DIALOGUE"
          ? { lines: [] }
          : type === "EXERCISE"
            ? { questions: [] }
            : {};
    const result = await actionCreateChapterItem({
      chapterId,
      type,
      title: `New ${ITEM_TYPES.find((t) => t.value === type)?.label ?? "item"}`,
      content: emptyContent,
    });
    if (result.success && result.chapterItemId) {
      const newItem: ActionOutputChapterItem = {
        id: result.chapterItemId,
        chapterId,
        type,
        title: `New ${ITEM_TYPES.find((t) => t.value === type)?.label ?? "item"}`,
        sortOrder: chapters.find((c) => c.id === chapterId)?.items.length ?? 0,
        content: emptyContent,
        deckId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, items: [...c.items, newItem] } : c
        )
      );
      setOpenItem(result.chapterItemId);
    } else {
      toast.error(result.message);
    }
  };

  const renameItem = (chapterId: number, itemId: number, newTitle: string) => {
    setChapters((prev) =>
      prev.map((c) =>
        c.id === chapterId
          ? {
              ...c,
              items: c.items.map((it) => (it.id === itemId ? { ...it, title: newTitle } : it)),
            }
          : c
      )
    );
  };

  const commitItemTitle = async (itemId: number, newTitle: string) => {
    if (!newTitle.trim()) return;
    const result = await actionUpdateChapterItem({ chapterItemId: itemId, title: newTitle });
    if (!result.success) toast.error(result.message);
  };

  const updateItemContent = async (
    itemId: number,
    content: unknown,
    deckId?: number | null
  ) => {
    const result = await actionUpdateChapterItem({
      chapterItemId: itemId,
      content,
      deckId: deckId ?? undefined,
    });
    if (result.success) {
      setChapters((prev) =>
        prev.map((c) => ({
          ...c,
          items: c.items.map((it) =>
            it.id === itemId
              ? { ...it, content, deckId: deckId !== undefined ? deckId : it.deckId }
              : it
          ),
        }))
      );
    } else {
      toast.error(result.message);
    }
  };

  const deleteItem = async (chapterId: number, itemId: number) => {
    if (!confirm("Delete this lesson?")) return;
    const result = await actionDeleteChapterItem({ chapterItemId: itemId });
    if (result.success) {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c
        )
      );
      if (openItem === itemId) setOpenItem(null);
      toast.success("Lesson deleted");
    } else {
      toast.error(result.message);
    }
  };

  const renderItemEditor = (item: ActionOutputChapterItem) => {
    switch (item.type) {
      case "ARTICLE":
        return (
          <ArticleContentEditor
            value={item.content}
            onChange={(c: ArticleContent) => updateItemContent(item.id, c)}
          />
        );
      case "DIALOGUE":
        return (
          <DialogueContentEditor
            value={item.content}
            onChange={(c: DialogueContent) => updateItemContent(item.id, c)}
          />
        );
      case "MEMORIZE":
        return (
          <MemorizeContentEditor
            value={item.content}
            deckId={item.deckId}
            onChange={(content, deckId) => updateItemContent(item.id, content, deckId)}
          />
        );
      case "EXERCISE":
        return (
          <ExerciseContentEditor
            value={item.content}
            onChange={(c: ExerciseContent) => updateItemContent(item.id, c)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout variant="full-width">
      <VStack gap={6} align="stretch">
        <HStack align="center" gap={2}>
          <Button variant="ghost" onClick={() => router.push(`/courses/${courseId}`)}>
            <ArrowLeft size={16} />
            Back to course
          </Button>
        </HStack>

        {/* Course settings */}
        <Card variant="bordered" padding="lg" className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900">Course details</h2>
          <VStack gap={1} align="stretch">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <Input variant="bordered" value={title} onChange={(e) => setTitle(e.target.value)} />
          </VStack>
          <VStack gap={1} align="stretch">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <Textarea
              variant="bordered"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </VStack>
          <HStack gap={4} align="end" wrap>
            <VStack gap={1} align="stretch" className="flex-1">
              <label className="text-sm font-medium text-gray-700">Language</label>
              <Input
                variant="bordered"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                placeholder="e.g. Spanish"
              />
            </VStack>
            <HStack gap={2} align="center">
              <span className="text-sm font-medium text-gray-700">Public</span>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </HStack>
            <Button variant="primary" loading={savingCourse} onClick={saveCourse}>
              Save course
            </Button>
          </HStack>
        </Card>

        {/* Chapters */}
        <VStack gap={3} align="stretch">
          <HStack justify="between" align="center">
            <h2 className="text-lg font-bold text-gray-900">Chapters</h2>
            <Button variant="light" onClick={addChapter}>
              <Plus size={16} />
              Add chapter
            </Button>
          </HStack>

          {chapters.length === 0 ? (
            <Card variant="bordered" padding="lg">
              <p className="text-center text-sm text-gray-400">
                No chapters yet. Click “Add chapter” to get started.
              </p>
            </Card>
          ) : (
            chapters.map((chapter, cIdx) => {
              const isOpen = openChapter === chapter.id;
              return (
                <Card key={chapter.id} variant="bordered" padding="none">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenChapter(isOpen ? null : chapter.id)}
                      className="flex flex-1 items-center gap-3 text-left"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                        {cIdx + 1}
                      </span>
                      <input
                        className="flex-1 bg-transparent font-semibold text-gray-900 focus:outline-none"
                        value={chapter.title}
                        onChange={(e) => renameChapter(chapter.id, e.target.value)}
                        onBlur={(e) => commitChapterRename(chapter.id, e.target.value)}
                      />
                      <Badge variant="neutral" size="sm">
                        {chapter.items.length} lessons
                      </Badge>
                    </button>
                    <IconButton size={16} onClick={() => moveChapter(cIdx, -1)} disabled={cIdx === 0}>
                      <ChevronUp size={16} />
                    </IconButton>
                    <IconButton
                      size={16}
                      onClick={() => moveChapter(cIdx, 1)}
                      disabled={cIdx === chapters.length - 1}
                    >
                      <ChevronDown size={16} />
                    </IconButton>
                    <IconButton tone="danger" size={16} onClick={() => deleteChapter(chapter.id)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </div>

                  {isOpen && (
                    <VStack gap={2} align="stretch" className="border-t border-gray-100 p-4">
                      {/* Add item row */}
                      <HStack gap={2} align="center" wrap>
                        <span className="text-xs font-medium text-gray-500">Add lesson:</span>
                        {ITEM_TYPES.map((t) => (
                          <Button
                            key={t.value}
                            size="sm"
                            variant="light"
                            onClick={() => addItem(chapter.id, t.value)}
                          >
                            <Plus size={12} />
                            {t.label}
                          </Button>
                        ))}
                      </HStack>

                      {chapter.items.length === 0 ? (
                        <p className="py-2 text-sm text-gray-400">No lessons yet.</p>
                      ) : (
                        <VStack gap={2} align="stretch">
                          {chapter.items.map((item) => {
                            const itemOpen = openItem === item.id;
                            return (
                              <div
                                key={item.id}
                                className="rounded-md border border-gray-200"
                              >
                                <HStack gap={2} align="center" className="p-2">
                                  <button
                                    type="button"
                                    onClick={() => setOpenItem(itemOpen ? null : item.id)}
                                    className="flex flex-1 items-center gap-2 text-left"
                                  >
                                    <Badge variant="info" size="sm">
                                      {ITEM_TYPES.find((t) => t.value === item.type)?.label}
                                    </Badge>
                                    <input
                                      className="flex-1 bg-transparent text-sm font-medium text-gray-800 focus:outline-none"
                                      value={item.title}
                                      onChange={(e) =>
                                        renameItem(chapter.id, item.id, e.target.value)
                                      }
                                      onBlur={(e) => commitItemTitle(item.id, e.target.value)}
                                    />
                                  </button>
                                  {itemOpen ? (
                                    <ChevronUp size={14} className="text-gray-400" />
                                  ) : (
                                    <ChevronDown size={14} className="text-gray-400" />
                                  )}
                                  <IconButton
                                    tone="danger"
                                    size={14}
                                    onClick={() => deleteItem(chapter.id, item.id)}
                                  >
                                    <Trash2 size={14} />
                                  </IconButton>
                                </HStack>
                                {itemOpen && (
                                  <div className="border-t border-gray-100 p-3">
                                    {renderItemEditor(item)}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </VStack>
                      )}
                    </VStack>
                  )}
                </Card>
              );
            })
          )}
        </VStack>

        <HStack gap={2} align="center" justify="center" className="pb-4">
          <span className="text-xs text-gray-400">
            Changes to lessons save automatically.
          </span>
        </HStack>
      </VStack>
    </PageLayout>
  );
}
