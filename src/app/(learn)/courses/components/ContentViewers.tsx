"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/design-system/button";
import { Badge } from "@/design-system/badge";
import { VStack, HStack } from "@/design-system/stack";
import type {
  ArticleContent,
  DialogueContent,
  DialogueLine,
  ExerciseContent,
  ExerciseQuestion,
} from "@/modules/course/course-repository-dto";

// ============================================
// Content parsers (safe parsing of `unknown` JSON)
// ============================================

export function parseArticleContent(content: unknown): ArticleContent {
  if (content && typeof content === "object" && "body" in content) {
    const body = (content as { body: unknown }).body;
    if (typeof body === "string") return { body };
  }
  return { body: "" };
}

export function parseDialogueContent(content: unknown): DialogueContent {
  if (content && typeof content === "object" && "lines" in content) {
    const lines = (content as { lines: unknown }).lines;
    if (Array.isArray(lines)) {
      const parsed: DialogueLine[] = [];
      for (const line of lines) {
        if (
          line &&
          typeof line === "object" &&
          "speaker" in line &&
          "text" in line &&
          typeof (line as { speaker: unknown }).speaker === "string" &&
          typeof (line as { text: unknown }).text === "string"
        ) {
          const l = line as { speaker: string; text: string; translation?: unknown };
          parsed.push({
            speaker: l.speaker,
            text: l.text,
            translation:
              typeof l.translation === "string" ? l.translation : undefined,
          });
        }
      }
      return { lines: parsed };
    }
  }
  return { lines: [] };
}

export function parseExerciseContent(content: unknown): ExerciseContent {
  if (content && typeof content === "object" && "questions" in content) {
    const questions = (content as { questions: unknown }).questions;
    if (Array.isArray(questions)) {
      const parsed: ExerciseQuestion[] = [];
      for (const q of questions) {
        if (
          q &&
          typeof q === "object" &&
          "type" in q &&
          "question" in q &&
          "answer" in q &&
          typeof (q as { question: unknown }).question === "string"
        ) {
          const qq = q as {
            type: unknown;
            question: string;
            options?: unknown;
            answer: unknown;
            explanation?: unknown;
          };
          const type =
            qq.type === "MULTIPLE_CHOICE" || qq.type === "FILL_BLANK"
              ? qq.type
              : "MULTIPLE_CHOICE";
          const options = Array.isArray(qq.options)
            ? qq.options.filter((o): o is string => typeof o === "string")
            : undefined;
          const answer: number | string =
            typeof qq.answer === "number" || typeof qq.answer === "string"
              ? qq.answer
              : 0;
          parsed.push({
            type,
            question: qq.question,
            options,
            answer,
            explanation: typeof qq.explanation === "string" ? qq.explanation : undefined,
          });
        }
      }
      return { questions: parsed };
    }
  }
  return { questions: [] };
}

// ============================================
// Article viewer (markdown)
// ============================================

export function ArticleViewer({ content }: { content: unknown }) {
  const { body } = useMemo(() => parseArticleContent(content), [content]);
  if (!body.trim()) {
    return <p className="text-sm text-gray-400">This article has no content yet.</p>;
  }
  return (
    <div className="prose prose-sm max-w-none text-gray-800 [&_p]:my-2 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-gray-50 [&_pre]:p-3 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}

// ============================================
// Dialogue viewer (chat-like)
// ============================================

export function DialogueViewer({ content }: { content: unknown }) {
  const { lines } = useMemo(() => parseDialogueContent(content), [content]);
  if (lines.length === 0) {
    return <p className="text-sm text-gray-400">This dialogue has no lines yet.</p>;
  }
  return (
    <VStack gap={3} align="stretch">
      {lines.map((line, i) => (
        <HStack key={i} gap={3} align="start">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
            {line.speaker.charAt(0).toUpperCase() || "?"}
          </div>
          <VStack gap={0.5} align="stretch" className="flex-1">
            <span className="text-xs font-semibold text-gray-700">{line.speaker}</span>
            <p className="text-sm text-gray-800">{line.text}</p>
            {line.translation && (
              <p className="text-xs italic text-gray-400">{line.translation}</p>
            )}
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}

// ============================================
// Memorize viewer (link to deck)
// ============================================

export function MemorizeViewer({ deckId }: { deckId: number | null }) {
  if (!deckId) {
    return <p className="text-sm text-gray-400">No deck linked to this lesson.</p>;
  }
  return (
    <VStack gap={3} align="start">
      <p className="text-sm text-gray-600">
        Study the flashcards for this lesson in memorize mode.
      </p>
      <Button href={`/memorize?deck_id=${deckId}`} variant="primary" pill>
        Start studying
        <ArrowRight size={16} />
      </Button>
    </VStack>
  );
}

// ============================================
// Exercise viewer (interactive quiz)
// ============================================

export function ExerciseViewer({ content }: { content: unknown }) {
  const { questions } = useMemo(() => parseExerciseContent(content), [content]);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  if (questions.length === 0) {
    return <p className="text-sm text-gray-400">This exercise has no questions yet.</p>;
  }

  const isCorrect = (q: ExerciseQuestion, idx: number): boolean => {
    const userAnswer = answers[idx];
    if (userAnswer === undefined) return false;
    if (q.type === "MULTIPLE_CHOICE") {
      return Number(userAnswer) === Number(q.answer);
    }
    return String(userAnswer).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  };

  return (
    <VStack gap={6} align="stretch">
      {questions.map((q, idx) => {
        const opts = q.options ?? [];
        const wasSubmitted = submitted[idx] ?? false;
        const correct = isCorrect(q, idx);
        return (
          <VStack key={idx} gap={2} align="stretch">
            <HStack gap={2} align="center">
              <Badge variant="neutral">{q.type === "MULTIPLE_CHOICE" ? "Choice" : "Fill"}</Badge>
              <span className="text-sm font-semibold text-gray-800">
                {idx + 1}. {q.question}
              </span>
            </HStack>

            {q.type === "MULTIPLE_CHOICE" ? (
              <VStack gap={1} align="stretch">
                {opts.map((opt, oi) => {
                  const selected = answers[idx] === oi;
                  const showResult = wasSubmitted && selected;
                  const showCorrect = wasSubmitted && oi === Number(q.answer);
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={wasSubmitted}
                      onClick={() => setAnswers((p) => ({ ...p, [idx]: oi }))}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        showResult
                          ? correct
                            ? "border-success-300 bg-success-50"
                            : "border-error-300 bg-error-50"
                          : showCorrect
                            ? "border-success-300 bg-success-50"
                            : selected
                              ? "border-primary-400 bg-primary-50"
                              : "border-gray-200 hover:bg-gray-50"
                      } ${wasSubmitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="font-mono text-xs text-gray-500">
                        {String.fromCharCode(65 + oi)}
                      </span>
                      <span className="text-gray-800">{opt}</span>
                    </button>
                  );
                })}
              </VStack>
            ) : (
              <input
                type="text"
                disabled={wasSubmitted}
                value={typeof answers[idx] === "string" ? (answers[idx] as string) : ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [idx]: e.target.value }))}
                placeholder="Type your answer..."
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:bg-gray-50"
              />
            )}

            <HStack gap={2} align="center">
              {!wasSubmitted ? (
                <Button
                  size="sm"
                  variant="primary"
                  disabled={answers[idx] === undefined || answers[idx] === ""}
                  onClick={() => setSubmitted((p) => ({ ...p, [idx]: true }))}
                >
                  Check
                </Button>
              ) : (
                <HStack gap={1} align="center">
                  {correct ? (
                    <HStack gap={1} align="center" className="text-success-600">
                      <CheckCircle2 size={16} />
                      <span className="text-sm font-medium">Correct</span>
                    </HStack>
                  ) : (
                    <HStack gap={1} align="center" className="text-error-600">
                      <XCircle size={16} />
                      <span className="text-sm font-medium">
                        Incorrect — answer: {String(q.answer)}
                      </span>
                    </HStack>
                  )}
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => {
                      setSubmitted((p) => ({ ...p, [idx]: false }));
                      setAnswers((p) => {
                        const next = { ...p };
                        delete next[idx];
                        return next;
                      });
                    }}
                  >
                    Retry
                  </Button>
                </HStack>
              )}
            </HStack>

            {wasSubmitted && q.explanation && (
              <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {q.explanation}
              </p>
            )}
          </VStack>
        );
      })}
    </VStack>
  );
}
