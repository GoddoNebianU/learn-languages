"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/design-system/button";
import { Input } from "@/design-system/input";
import { Textarea } from "@/design-system/textarea";
import { Select } from "@/design-system/select";
import { Card } from "@/design-system/card";
import { Field } from "@/design-system/field";
import { VStack, HStack } from "@/design-system/stack";
import { Badge } from "@/design-system/badge";
import { IconButton } from "@/design-system/icon-button";
import type { ActionOutputChapterItem } from "@/modules/course/course-action-dto";
import type {
  LessonContent,
  DialogueLine,
  VocabularyItem,
  ExerciseQuestion,
} from "@/modules/course/course-repository-dto";

interface LessonContentEditorProps {
  lesson: ActionOutputChapterItem;
  onSave: (updates: { title: string; content: LessonContent }) => Promise<boolean>;
}

function normalize(content: unknown): LessonContent {
  const empty: LessonContent = {
    article: { body: "" },
    dialogue: { lines: [] },
    vocabulary: { items: [] },
    grammar: { body: "" },
    exercises: { questions: [] },
  };
  if (!content || typeof content !== "object") return empty;
  const c = content as Record<string, unknown>;
  const result: LessonContent = { ...empty };
  if (c.article && typeof c.article === "object") {
    const a = c.article as { body?: unknown; translation?: unknown };
    result.article = {
      body: typeof a.body === "string" ? a.body : "",
      translation: typeof a.translation === "string" ? a.translation : "",
    };
  }
  if (c.dialogue && typeof c.dialogue === "object" && Array.isArray((c.dialogue as { lines?: unknown }).lines)) {
    result.dialogue = { lines: (c.dialogue as { lines: DialogueLine[] }).lines };
  }
  if (c.vocabulary && typeof c.vocabulary === "object" && Array.isArray((c.vocabulary as { items?: unknown }).items)) {
    result.vocabulary = { items: (c.vocabulary as { items: VocabularyItem[] }).items };
  }
  if (c.grammar && typeof c.grammar === "object" && typeof (c.grammar as { body?: unknown }).body === "string") {
    result.grammar = { body: (c.grammar as { body: string }).body };
  }
  if (c.exercises && typeof c.exercises === "object" && Array.isArray((c.exercises as { questions?: unknown }).questions)) {
    result.exercises = { questions: (c.exercises as { questions: ExerciseQuestion[] }).questions };
  }
  return result;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="bordered" padding="md">
      <VStack gap={3} align="stretch">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">{title}</h3>
        {children}
      </VStack>
    </Card>
  );
}

export function LessonContentEditor({ lesson, onSave }: LessonContentEditorProps) {
  const [title, setTitle] = useState(lesson.title);
  const [content, setContent] = useState<LessonContent>(() => normalize(lesson.content));
  const [saving, setSaving] = useState(false);

  const patch = (partial: Partial<LessonContent>) =>
    setContent((prev) => ({ ...prev, ...partial }));

  const updateArticle = (field: "body" | "translation", value: string) =>
    patch({ article: { ...content.article!, body: content.article?.body ?? "", translation: content.article?.translation ?? "", [field]: value } });

  const setGrammar = (body: string) => patch({ grammar: { body } });

  const updateDialogueLines = (lines: DialogueLine[]) =>
    patch({ dialogue: { lines } });

  const addDialogueLine = () =>
    updateDialogueLines([...(content.dialogue?.lines ?? []), { speaker: "", text: "" }]);

  const updateVocabItems = (items: VocabularyItem[]) =>
    patch({ vocabulary: { items } });

  const addVocabItem = () =>
    updateVocabItems([
      ...(content.vocabulary?.items ?? []),
      { word: "", translation: "" },
    ]);

  const updateQuestions = (questions: ExerciseQuestion[]) =>
    patch({ exercises: { questions } });

  const addQuestion = () =>
    updateQuestions([
      ...(content.exercises?.questions ?? []),
      { type: "MULTIPLE_CHOICE", question: "", options: ["", ""], answer: 0, explanation: "" },
    ]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    const ok = await onSave({ title: title.trim(), content });
    setSaving(false);
    if (ok) toast.success("Lesson saved");
    else toast.error("Failed to save lesson");
  };

  return (
    <VStack gap={4} align="stretch">
      <Card variant="bordered" padding="md">
        <Field label="Lesson Title" required>
          <Input variant="bordered" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Lesson title" />
        </Field>
      </Card>

      <SectionCard title="Article">
        <Field label="Body (Uyghur, Markdown)">
          <Textarea variant="bordered" rows={6} value={content.article?.body ?? ""} onChange={(e) => updateArticle("body", e.target.value)} />
        </Field>
        <Field label="Translation (Chinese, optional)">
          <Textarea variant="bordered" rows={4} value={content.article?.translation ?? ""} onChange={(e) => updateArticle("translation", e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard title="Dialogue">
        <VStack gap={2} align="stretch">
          {(content.dialogue?.lines ?? []).length === 0 && (
            <p className="text-xs text-gray-400">No dialogue lines yet.</p>
          )}
          {(content.dialogue?.lines ?? []).map((line, i) => (
            <HStack key={i} gap={2} align="end" wrap>
              <Field label={i === 0 ? "Speaker" : undefined} className="w-32">
                <Input variant="bordered" size="sm" value={line.speaker} onChange={(e) => {
                  const next = [...(content.dialogue?.lines ?? [])];
                  next[i] = { ...line, speaker: e.target.value };
                  updateDialogueLines(next);
                }} />
              </Field>
              <Field label={i === 0 ? "Uyghur" : undefined} className="flex-1 min-w-[180px]">
                <Input variant="bordered" size="sm" value={line.text} onChange={(e) => {
                  const next = [...(content.dialogue?.lines ?? [])];
                  next[i] = { ...line, text: e.target.value };
                  updateDialogueLines(next);
                }} />
              </Field>
              <Field label={i === 0 ? "Translation" : undefined} className="flex-1 min-w-[180px]">
                <Input variant="bordered" size="sm" value={line.translation ?? ""} onChange={(e) => {
                  const next = [...(content.dialogue?.lines ?? [])];
                  next[i] = { ...line, translation: e.target.value };
                  updateDialogueLines(next);
                }} />
              </Field>
              <IconButton
                tone="danger"
                onClick={() => {
                  const next = [...(content.dialogue?.lines ?? [])];
                  next.splice(i, 1);
                  updateDialogueLines(next);
                }}
                title="Remove line"
              >
                <Trash2 size={16} />
              </IconButton>
            </HStack>
          ))}
          <Button variant="light" size="sm" onClick={addDialogueLine} className="self-start">
            <Plus size={14} /> Add Line
          </Button>
        </VStack>
      </SectionCard>

      <SectionCard title="Vocabulary">
        <VStack gap={3} align="stretch">
          {(content.vocabulary?.items ?? []).length === 0 && (
            <p className="text-xs text-gray-400">No vocabulary items yet.</p>
          )}
          {(content.vocabulary?.items ?? []).map((item, i) => (
            <Card key={i} variant="flat" padding="sm">
              <HStack gap={2} align="start" justify="between">
                <Badge variant="neutral">#{i + 1}</Badge>
                <IconButton tone="danger" onClick={() => {
                  const next = [...(content.vocabulary?.items ?? [])];
                  next.splice(i, 1);
                  updateVocabItems(next);
                }} title="Remove item">
                  <Trash2 size={14} />
                </IconButton>
              </HStack>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Field label="Word"><Input variant="bordered" size="sm" value={item.word} onChange={(e) => {
                  const next = [...(content.vocabulary?.items ?? [])];
                  next[i] = { ...item, word: e.target.value };
                  updateVocabItems(next);
                }} /></Field>
                <Field label="Pronunciation"><Input variant="bordered" size="sm" value={item.pronunciation ?? ""} onChange={(e) => {
                  const next = [...(content.vocabulary?.items ?? [])];
                  next[i] = { ...item, pronunciation: e.target.value };
                  updateVocabItems(next);
                }} /></Field>
                <Field label="Translation"><Input variant="bordered" size="sm" value={item.translation} onChange={(e) => {
                  const next = [...(content.vocabulary?.items ?? [])];
                  next[i] = { ...item, translation: e.target.value };
                  updateVocabItems(next);
                }} /></Field>
                <Field label="Part of Speech"><Input variant="bordered" size="sm" value={item.partOfSpeech ?? ""} onChange={(e) => {
                  const next = [...(content.vocabulary?.items ?? [])];
                  next[i] = { ...item, partOfSpeech: e.target.value };
                  updateVocabItems(next);
                }} /></Field>
                <Field label="Example" className="sm:col-span-2"><Input variant="bordered" size="sm" value={item.example ?? ""} onChange={(e) => {
                  const next = [...(content.vocabulary?.items ?? [])];
                  next[i] = { ...item, example: e.target.value };
                  updateVocabItems(next);
                }} /></Field>
              </div>
            </Card>
          ))}
          <Button variant="light" size="sm" onClick={addVocabItem} className="self-start">
            <Plus size={14} /> Add Vocabulary Item
          </Button>
        </VStack>
      </SectionCard>

      <SectionCard title="Grammar">
        <Field label="Body (Markdown)">
          <Textarea variant="bordered" rows={8} value={content.grammar?.body ?? ""} onChange={(e) => setGrammar(e.target.value)} />
        </Field>
      </SectionCard>

      <SectionCard title="Exercises">
        <VStack gap={3} align="stretch">
          {(content.exercises?.questions ?? []).length === 0 && (
            <p className="text-xs text-gray-400">No questions yet.</p>
          )}
          {(content.exercises?.questions ?? []).map((q, i) => (
            <Card key={i} variant="flat" padding="sm">
              <HStack gap={2} align="center" justify="between">
                <Badge variant="info">#{i + 1}</Badge>
                <IconButton tone="danger" onClick={() => {
                  const next = [...(content.exercises?.questions ?? [])];
                  next.splice(i, 1);
                  updateQuestions(next);
                }} title="Remove question">
                  <Trash2 size={14} />
                </IconButton>
              </HStack>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <HStack gap={2} align="center">
                  <Field label="Type" className="w-48">
                    <Select variant="bordered" size="sm" value={q.type} onChange={(e) => {
                      const next = [...(content.exercises?.questions ?? [])];
                      const type = e.target.value as "MULTIPLE_CHOICE" | "FILL_BLANK";
                      next[i] = { ...q, type, options: type === "MULTIPLE_CHOICE" ? (q.options ?? ["", ""]) : undefined, answer: type === "MULTIPLE_CHOICE" ? 0 : "" };
                      updateQuestions(next);
                    }}>
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="FILL_BLANK">Fill Blank</option>
                    </Select>
                  </Field>
                </HStack>
                <Field label="Question"><Input variant="bordered" size="sm" value={q.question} onChange={(e) => {
                  const next = [...(content.exercises?.questions ?? [])];
                  next[i] = { ...q, question: e.target.value };
                  updateQuestions(next);
                }} /></Field>
                {q.type === "MULTIPLE_CHOICE" && (
                  <VStack gap={1} align="stretch">
                    <span className="text-xs font-medium text-gray-600">Options (correct = index 0..N)</span>
                    {(q.options ?? []).map((opt, oi) => (
                      <HStack key={oi} gap={2} align="center">
                        <Badge variant={Number(q.answer) === oi ? "success" : "neutral"}>{String.fromCharCode(65 + oi)}</Badge>
                        <Input variant="bordered" size="sm" value={opt} onChange={(e) => {
                          const next = [...(content.exercises?.questions ?? [])];
                          const options = [...(q.options ?? [])];
                          options[oi] = e.target.value;
                          next[i] = { ...q, options };
                          updateQuestions(next);
                        }} />
                        <IconButton tone="default" size={14} title="Mark as correct" onClick={() => {
                          const next = [...(content.exercises?.questions ?? [])];
                          next[i] = { ...q, answer: oi };
                          updateQuestions(next);
                        }}>
                          <span className="text-xs">{Number(q.answer) === oi ? "✓" : "○"}</span>
                        </IconButton>
                        <IconButton tone="danger" size={14} title="Remove option" onClick={() => {
                          if ((q.options ?? []).length <= 2) {
                            toast.error("Need at least 2 options");
                            return;
                          }
                          const next = [...(content.exercises?.questions ?? [])];
                          const options = [...(q.options ?? [])];
                          options.splice(oi, 1);
                          next[i] = { ...q, options, answer: Math.max(0, Number(q.answer) > oi ? Number(q.answer) - 1 : Number(q.answer)) };
                          updateQuestions(next);
                        }}>
                          <Trash2 size={14} />
                        </IconButton>
                      </HStack>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => {
                      const next = [...(content.exercises?.questions ?? [])];
                      const options = [...(q.options ?? []), ""];
                      next[i] = { ...q, options };
                      updateQuestions(next);
                    }} className="self-start">
                      <Plus size={12} /> Add Option
                    </Button>
                  </VStack>
                )}
                {q.type === "FILL_BLANK" && (
                  <Field label="Answer"><Input variant="bordered" size="sm" value={String(q.answer ?? "")} onChange={(e) => {
                    const next = [...(content.exercises?.questions ?? [])];
                    next[i] = { ...q, answer: e.target.value };
                    updateQuestions(next);
                  }} /></Field>
                )}
                <Field label="Explanation (optional)"><Input variant="bordered" size="sm" value={q.explanation ?? ""} onChange={(e) => {
                  const next = [...(content.exercises?.questions ?? [])];
                  next[i] = { ...q, explanation: e.target.value };
                  updateQuestions(next);
                }} /></Field>
              </div>
            </Card>
          ))}
          <Button variant="light" size="sm" onClick={addQuestion} className="self-start">
            <Plus size={14} /> Add Question
          </Button>
        </VStack>
      </SectionCard>

      <HStack justify="end">
        <Button variant="primary" onClick={handleSave} loading={saving}>
          {!saving && <Save size={16} />}
          Save Lesson
        </Button>
      </HStack>
    </VStack>
  );
}
