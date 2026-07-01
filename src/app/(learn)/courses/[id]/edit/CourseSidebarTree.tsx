"use client";

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Card } from "@/design-system/card";
import { VStack, HStack } from "@/design-system/stack";
import { IconButton } from "@/design-system/icon-button";
import type {
  ActionOutputChapter,
  ActionOutputChapterItem,
} from "@/modules/course/course-action-dto";

export type SidebarSelection =
  | { kind: "course" }
  | { kind: "chapter"; chapterId: number }
  | { kind: "lesson"; itemId: number };

export interface SidebarHandlers {
  onSelect: (sel: SidebarSelection) => void;
  onAddLesson: (chapterId: number) => void;
  onDeleteChapter: (chapterId: number, title: string) => void;
  onDeleteLesson: (itemId: number, title: string) => void;
  onMoveChapter: (idx: number, direction: -1 | 1) => void;
  onMoveLesson: (chapterId: number, idx: number, direction: -1 | 1) => void;
}

interface CourseSidebarTreeProps {
  chapters: (ActionOutputChapter & { items: ActionOutputChapterItem[] })[];
  selection: SidebarSelection;
  expanded: Set<number>;
  onToggleExpand: (id: number) => void;
  opLoading: string | null;
  handlers: SidebarHandlers;
}

export function CourseSidebarTree({
  chapters,
  selection,
  expanded,
  onToggleExpand,
  opLoading,
  handlers,
}: CourseSidebarTreeProps) {
  return (
    <Card variant="bordered" padding="sm">
      <VStack gap={1} align="stretch">
        <button
          type="button"
          onClick={() => handlers.onSelect({ kind: "course" })}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
            selection.kind === "course" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Pencil size={14} /> Course Settings
        </button>

        {chapters.length === 0 && (
          <p className="px-3 py-2 text-xs text-gray-400">No chapters yet.</p>
        )}

        {chapters.map((chapter, idx) => {
          const isExpanded = expanded.has(chapter.id);
          const isSelected = selection.kind === "chapter" && selection.chapterId === chapter.id;
          return (
            <VStack key={chapter.id} gap={0} align="stretch">
              <HStack gap={1} align="center" className="rounded-md px-1 py-1">
                <button
                  type="button"
                  onClick={() => onToggleExpand(chapter.id)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => handlers.onSelect({ kind: "chapter", chapterId: chapter.id })}
                  className={`flex-1 truncate rounded px-2 py-1 text-left text-sm font-medium ${
                    isSelected ? "bg-primary-50 text-primary-700" : "text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xs text-gray-400">{idx + 1}.</span> {chapter.title}
                </button>
                <IconButton size={14} title="Move up" tone="muted" disabled={idx === 0 || opLoading !== null} onClick={() => handlers.onMoveChapter(idx, -1)}>
                  <ChevronUp size={14} />
                </IconButton>
                <IconButton size={14} title="Move down" tone="muted" disabled={idx === chapters.length - 1 || opLoading !== null} onClick={() => handlers.onMoveChapter(idx, 1)}>
                  <ChevronDown size={14} />
                </IconButton>
                <IconButton size={14} title="Add lesson" tone="muted" loading={opLoading === `add-lesson-${chapter.id}`} onClick={() => handlers.onAddLesson(chapter.id)}>
                  <Plus size={14} />
                </IconButton>
                <IconButton size={14} title="Delete chapter" tone="danger" onClick={() => handlers.onDeleteChapter(chapter.id, chapter.title)}>
                  <Trash2 size={14} />
                </IconButton>
              </HStack>
              {isExpanded && (
                <VStack gap={0} align="stretch" className="ml-6 border-l border-gray-200 pl-2">
                  {chapter.items.length === 0 && (
                    <p className="px-2 py-1 text-xs text-gray-400">No lessons.</p>
                  )}
                  {chapter.items.map((item, itemIdx) => {
                    const isLessonSelected = selection.kind === "lesson" && selection.itemId === item.id;
                    return (
                      <HStack key={item.id} gap={1} align="center" className="rounded-md py-0.5">
                        <button
                          type="button"
                          onClick={() => handlers.onSelect({ kind: "lesson", itemId: item.id })}
                          className={`flex flex-1 items-center gap-2 truncate rounded px-2 py-1 text-left text-sm ${
                            isLessonSelected ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <BookOpen size={12} className="shrink-0 text-gray-400" />
                          <span className="truncate">{item.title}</span>
                        </button>
                        <IconButton size={12} title="Move up" tone="muted" disabled={itemIdx === 0 || opLoading !== null} onClick={() => handlers.onMoveLesson(chapter.id, itemIdx, -1)}>
                          <ChevronUp size={12} />
                        </IconButton>
                        <IconButton size={12} title="Move down" tone="muted" disabled={itemIdx === chapter.items.length - 1 || opLoading !== null} onClick={() => handlers.onMoveLesson(chapter.id, itemIdx, 1)}>
                          <ChevronDown size={12} />
                        </IconButton>
                        <IconButton size={12} title="Delete lesson" tone="danger" onClick={() => handlers.onDeleteLesson(item.id, item.title)}>
                          <Trash2 size={12} />
                        </IconButton>
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </VStack>
          );
        })}
      </VStack>
    </Card>
  );
}
