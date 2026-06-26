"use client";

import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { Input } from "@/design-system/input";
import { Textarea } from "@/design-system/textarea";
import { Select } from "@/design-system/select";
import { Button } from "@/design-system/button";
import { IconButton } from "@/design-system/icon-button";
import { VStack, HStack } from "@/design-system/stack";
import { actionGetMyDecks } from "@/modules/deck/deck-action";
import type { ActionOutputDeck } from "@/modules/deck/deck-action-dto";
import type {
  ArticleContent,
  DialogueContent,
  DialogueLine,
  ExerciseContent,
  ExerciseQuestion,
} from "@/modules/course/course-repository-dto";
import { parseArticleContent, parseDialogueContent, parseExerciseContent } from "../../components/ContentViewers";

// ============================================
// Article editor
// ============================================

export function ArticleContentEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (content: ArticleContent) => void;
}) {
  const [body, setBody] = useState(() => parseArticleContent(value).body);

  useEffect(() => {
    setBody(parseArticleContent(value).body);
  }, [value]);

  return (
    <VStack gap={1} align="stretch">
      <label className="text-sm font-medium text-gray-700">Body (Markdown)</label>
      <Textarea
        variant="bordered"
        rows={8}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={() => onChange({ body })}
        placeholder="Write the article content in Markdown..."
      />
    </VStack>
  );
}

// ============================================
// Dialogue editor
// ============================================

export function DialogueContentEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (content: DialogueContent) => void;
}) {
  const [lines, setLines] = useState<DialogueLine[]>(() => parseDialogueContent(value).lines);

  useEffect(() => {
    setLines(parseDialogueContent(value).lines);
  }, [value]);

  const emit = (next: DialogueLine[]) => {
    setLines(next);
    onChange({ lines: next });
  };

  const addLine = () =>
    emit([...lines, { speaker: "", text: "", translation: "" }]);

  const removeLine = (idx: number) => emit(lines.filter((_, i) => i !== idx));

  const moveLine = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= lines.length) return;
    const next = [...lines];
    [next[idx], next[target]] = [next[target], next[idx]];
    emit(next);
  };

  const updateLine = (idx: number, patch: Partial<DialogueLine>) =>
    emit(lines.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

  return (
    <VStack gap={3} align="stretch">
      <HStack justify="between" align="center">
        <label className="text-sm font-medium text-gray-700">Dialogue lines</label>
        <Button size="sm" variant="light" onClick={addLine}>
          <Plus size={14} />
          Add line
        </Button>
      </HStack>
      {lines.length === 0 && (
        <p className="text-sm text-gray-400">No lines yet. Click “Add line”.</p>
      )}
      {lines.map((line, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-md border border-gray-200 p-3"
        >
          <HStack gap={2} align="center">
            <Input
              variant="bordered"
              value={line.speaker}
              onChange={(e) => updateLine(idx, { speaker: e.target.value })}
              placeholder="Speaker"
              containerClassName="w-40"
            />
            <span className="flex-1 text-xs text-gray-400">Line {idx + 1}</span>
            <IconButton size={16} onClick={() => moveLine(idx, -1)} disabled={idx === 0}>
              <ChevronUp size={16} />
            </IconButton>
            <IconButton
              size={16}
              onClick={() => moveLine(idx, 1)}
              disabled={idx === lines.length - 1}
            >
              <ChevronDown size={16} />
            </IconButton>
            <IconButton
              tone="danger"
              size={16}
              onClick={() => removeLine(idx)}
            >
              <Trash2 size={16} />
            </IconButton>
          </HStack>
          <Textarea
            variant="bordered"
            rows={2}
            value={line.text}
            onChange={(e) => updateLine(idx, { text: e.target.value })}
            placeholder="Text"
          />
          <Input
            variant="bordered"
            value={line.translation ?? ""}
            onChange={(e) => updateLine(idx, { translation: e.target.value })}
            placeholder="Translation (optional)"
          />
        </div>
      ))}
    </VStack>
  );
}

// ============================================
// Memorize editor (deck selector)
// ============================================

export function MemorizeContentEditor({
  value,
  deckId,
  onChange,
}: {
  value: unknown;
  deckId: number | null;
  onChange: (content: unknown, deckId: number | null) => void;
}) {
  const [decks, setDecks] = useState<ActionOutputDeck[]>([]);
  const [selected, setSelected] = useState<string>(deckId ? String(deckId) : "");

  useEffect(() => {
    actionGetMyDecks().then((res) => {
      if (res.success && res.data) setDecks(res.data);
    });
  }, []);

  void value;

  return (
    <VStack gap={1} align="stretch">
      <label className="text-sm font-medium text-gray-700">Linked deck</label>
      <Select
        variant="bordered"
        value={selected}
        onChange={(e) => {
          const v = e.target.value;
          setSelected(v);
          onChange({}, v ? Number(v) : null);
        }}
      >
        <option value="">— Select a deck —</option>
        {decks.map((deck) => (
          <option key={deck.id} value={deck.id}>
            {deck.name} ({deck.cardCount ?? 0} cards)
          </option>
        ))}
      </Select>
      <p className="text-xs text-gray-400">
        Students will study this deck in memorize mode.
      </p>
    </VStack>
  );
}

// ============================================
// Exercise editor
// ============================================

export function ExerciseContentEditor({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (content: ExerciseContent) => void;
}) {
  const [questions, setQuestions] = useState<ExerciseQuestion[]>(() =>
    parseExerciseContent(value).questions
  );

  useEffect(() => {
    setQuestions(parseExerciseContent(value).questions);
  }, [value]);

  const emit = (next: ExerciseQuestion[]) => {
    setQuestions(next);
    onChange({ questions: next });
  };

  const addQuestion = () =>
    emit([
      ...questions,
      { type: "MULTIPLE_CHOICE", question: "", options: ["", ""], answer: 0 },
    ]);

  const removeQuestion = (idx: number) => emit(questions.filter((_, i) => i !== idx));

  const updateQuestion = (idx: number, patch: Partial<ExerciseQuestion>) =>
    emit(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const updateOption = (qIdx: number, optIdx: number, text: string) => {
    const q = questions[qIdx];
    if (!q.options) return;
    const options = q.options.map((o, i) => (i === optIdx ? text : o));
    updateQuestion(qIdx, { options });
  };

  const addOption = (qIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { options: [...(q.options ?? []), ""] });
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    const q = questions[qIdx];
    if (!q.options || q.options.length <= 1) return;
    updateQuestion(qIdx, { options: q.options.filter((_, i) => i !== optIdx) });
  };

  return (
    <VStack gap={3} align="stretch">
      <HStack justify="between" align="center">
        <label className="text-sm font-medium text-gray-700">Questions</label>
        <Button size="sm" variant="light" onClick={addQuestion}>
          <Plus size={14} />
          Add question
        </Button>
      </HStack>
      {questions.length === 0 && (
        <p className="text-sm text-gray-400">No questions yet. Click “Add question”.</p>
      )}
      {questions.map((q, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-2 rounded-md border border-gray-200 p-3"
        >
          <HStack gap={2} align="center">
            <Select
              variant="bordered"
              value={q.type}
              onChange={(e) =>
                updateQuestion(idx, {
                  type: e.target.value as ExerciseQuestion["type"],
                  answer: e.target.value === "MULTIPLE_CHOICE" ? 0 : "",
                })
              }
              containerClassName="w-40"
            >
              <option value="MULTIPLE_CHOICE">Multiple choice</option>
              <option value="FILL_BLANK">Fill in the blank</option>
            </Select>
            <span className="flex-1 text-xs text-gray-400">Question {idx + 1}</span>
            <IconButton tone="danger" size={16} onClick={() => removeQuestion(idx)}>
              <Trash2 size={16} />
            </IconButton>
          </HStack>

          <Textarea
            variant="bordered"
            rows={2}
            value={q.question}
            onChange={(e) => updateQuestion(idx, { question: e.target.value })}
            placeholder="Question text"
          />

          {q.type === "MULTIPLE_CHOICE" ? (
            <VStack gap={1} align="stretch">
              <span className="text-xs font-medium text-gray-500">
                Options (select the correct one)
              </span>
              {(q.options ?? []).map((opt, oi) => (
                <HStack key={oi} gap={2} align="center">
                  <input
                    type="radio"
                    name={`answer-${idx}`}
                    checked={Number(q.answer) === oi}
                    onChange={() => updateQuestion(idx, { answer: oi })}
                    className="h-4 w-4 cursor-pointer accent-primary-500"
                  />
                  <Input
                    variant="bordered"
                    value={opt}
                    onChange={(e) => updateOption(idx, oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    containerClassName="flex-1"
                  />
                  <IconButton
                    tone="danger"
                    size={16}
                    onClick={() => removeOption(idx, oi)}
                    disabled={(q.options?.length ?? 0) <= 1}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </HStack>
              ))}
              <Button size="sm" variant="ghost" onClick={() => addOption(idx)}>
                <Plus size={14} />
                Add option
              </Button>
            </VStack>
          ) : (
            <VStack gap={1} align="stretch">
              <span className="text-xs font-medium text-gray-500">Correct answer</span>
              <Input
                variant="bordered"
                value={typeof q.answer === "string" ? q.answer : ""}
                onChange={(e) => updateQuestion(idx, { answer: e.target.value })}
                placeholder="The correct answer"
              />
            </VStack>
          )}

          <Textarea
            variant="bordered"
            rows={2}
            value={q.explanation ?? ""}
            onChange={(e) => updateQuestion(idx, { explanation: e.target.value })}
            placeholder="Explanation (optional)"
          />
        </div>
      ))}
    </VStack>
  );
}
