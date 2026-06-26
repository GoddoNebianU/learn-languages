"use client";

import { useMemo, useState } from "react";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/design-system/badge";
import { VStack, HStack } from "@/design-system/stack";
import { Spinner } from "@/design-system/spinner";
import { SpeakButtons } from "@/components/ui/SpeakButtons";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import type { ActionOutputChapterItem } from "@/modules/course/course-action-dto";
import type { LessonContent, VocabularyItem, DialogueLine, ExerciseQuestion } from "@/modules/course/course-repository-dto";
import { getDictDefLang } from "@/shared/dictionary";

const RTL_LANGUAGES = ["uyghur", "arabic", "hebrew", "persian", "urdu", "pashto", "kurdish", "sindhi"];

interface LessonViewClientProps {
  lesson: ActionOutputChapterItem;
  courseTitle: string;
  courseId: number;
  courseLanguage?: string;
}

function parseLesson(content: unknown): LessonContent {
  if (!content || typeof content !== "object") return {};
  const c = content as Record<string, unknown>;
  const result: LessonContent = {};
  if (c.article && typeof c.article === "object" && typeof (c.article as { body?: unknown }).body === "string")
    result.article = { body: (c.article as { body: string }).body };
  if (c.dialogue && typeof c.dialogue === "object" && Array.isArray((c.dialogue as { lines?: unknown }).lines))
    result.dialogue = { lines: (c.dialogue as { lines: DialogueLine[] }).lines };
  if (c.vocabulary && typeof c.vocabulary === "object" && Array.isArray((c.vocabulary as { items?: unknown }).items))
    result.vocabulary = { items: (c.vocabulary as { items: VocabularyItem[] }).items };
  if (c.grammar && typeof c.grammar === "object" && typeof (c.grammar as { body?: unknown }).body === "string")
    result.grammar = { body: (c.grammar as { body: string }).body };
  if (c.exercises && typeof c.exercises === "object" && Array.isArray((c.exercises as { questions?: unknown }).questions))
    result.exercises = { questions: (c.exercises as { questions: ExerciseQuestion[] }).questions };
  return result;
}

function stripMarkdown(md: string): string {
  return md.replace(/[#*`>\-_~\[\]]/g, "").replace(/\|/g, " ").replace(/\n{2,}/g, ". ").trim();
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-gray-200 pb-2 text-lg font-bold text-gray-900">{children}</h2>;
}

function ClickableWords({ children, ql, dl }: { children: React.ReactNode; ql: string; dl: string }) {
  if (typeof children === "string") {
    return (
      <>
        {children.split(/(\s+)/).map((part, i) => {
          if (!part.trim()) return <span key={i}>{part}</span>;
          const clean = part.replace(/[^\p{L}\p{N}'’]/gu, "");
          if (!clean) return <span key={i}>{part}</span>;
          return (
            <Link
              key={i}
              href={`/dictionary?q=${encodeURIComponent(clean)}&ql=${encodeURIComponent(ql)}&dl=${encodeURIComponent(dl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer rounded px-0.5 hover:bg-primary-100 hover:text-primary-600 transition-colors"
            >
              {part}
            </Link>
          );
        })}
      </>
    );
  }
  if (Array.isArray(children)) {
    return <>{React.Children.map(children, (c, i) => <ClickableWords key={i} ql={ql} dl={dl}>{c}</ClickableWords>)}</>;
  }
  if (React.isValidElement(children)) {
    const el = children as React.ReactElement<{ children?: React.ReactNode }>;
    if (el.props.children === undefined) return children;
    return React.cloneElement(el, {}, <ClickableWords ql={ql} dl={dl}>{el.props.children}</ClickableWords>);
  }
  return <>{children}</>;
}

function ExerciseSection({ questions }: { questions: ExerciseQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});
  if (questions.length === 0) return null;

  return (
    <VStack gap={4} align="stretch">
      {questions.map((q, idx) => {
        const wasSubmitted = submitted[idx] ?? false;
        const correct = wasSubmitted && (
          q.type === "MULTIPLE_CHOICE"
            ? Number(answers[idx]) === Number(q.answer)
            : String(answers[idx] ?? "").trim().toLowerCase() === String(q.answer).trim().toLowerCase()
        );
        return (
          <VStack key={idx} gap={2} align="stretch">
            <HStack gap={2} align="center">
              <Badge variant="neutral">{q.type === "MULTIPLE_CHOICE" ? "Choice" : "Fill"}</Badge>
              <span className="text-sm font-semibold text-gray-800">{idx + 1}. {q.question}</span>
            </HStack>
            {q.type === "MULTIPLE_CHOICE" && q.options && (
              <VStack gap={1} align="stretch">
                {q.options.map((opt, oi) => {
                  const selected = answers[idx] === oi;
                  const showResult = wasSubmitted && selected;
                  const showCorrect = wasSubmitted && oi === Number(q.answer);
                  return (
                    <button key={oi} type="button" disabled={wasSubmitted}
                      onClick={() => setAnswers((p) => ({ ...p, [idx]: oi }))}
                      className={`flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        showResult ? (correct ? "border-success-300 bg-success-50" : "border-error-300 bg-error-50")
                        : showCorrect ? "border-success-300 bg-success-50"
                        : selected ? "border-primary-400 bg-primary-50" : "border-gray-200 hover:bg-gray-50"
                      } ${wasSubmitted ? "cursor-default" : "cursor-pointer"}`}
                    >
                      <span className="font-mono text-xs text-gray-500">{String.fromCharCode(65 + oi)}</span>
                      <span className="text-gray-800">{opt}</span>
                    </button>
                  );
                })}
              </VStack>
            )}
            {q.type === "FILL_BLANK" && (
              <input type="text" disabled={wasSubmitted}
                value={typeof answers[idx] === "string" ? (answers[idx] as string) : ""}
                onChange={(e) => setAnswers((p) => ({ ...p, [idx]: e.target.value }))}
                placeholder="Type your answer..."
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400 disabled:bg-gray-50"
              />
            )}
            <HStack gap={2} align="center">
              {!wasSubmitted ? (
                <button type="button" disabled={answers[idx] === undefined || answers[idx] === ""}
                  onClick={() => setSubmitted((p) => ({ ...p, [idx]: true }))}
                  className="rounded-md bg-primary-500 px-3 py-1 text-sm font-medium text-white disabled:opacity-40"
                >Check</button>
              ) : (
                <HStack gap={1} align="center">
                  {correct ? (
                    <HStack gap={1} align="center" className="text-success-600">
                      <CheckCircle2 size={16} /><span className="text-sm font-medium">Correct</span>
                    </HStack>
                  ) : (
                    <HStack gap={1} align="center" className="text-error-600">
                      <XCircle size={16} /><span className="text-sm font-medium">Answer: {String(q.answer)}</span>
                    </HStack>
                  )}
                  <button type="button"
                    onClick={() => { setSubmitted((p) => ({ ...p, [idx]: false })); setAnswers((p) => { const n = { ...p }; delete n[idx]; return n; }); }}
                    className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                  >Retry</button>
                </HStack>
              )}
            </HStack>
            {wasSubmitted && q.explanation && <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">{q.explanation}</p>}
          </VStack>
        );
      })}
    </VStack>
  );
}

export function LessonViewClient({ lesson, courseTitle, courseLanguage }: LessonViewClientProps) {
  const { speak, playOrReplay, isLoading } = useAudioPlayer();
  const content = useMemo(() => parseLesson(lesson.content), [lesson.content]);
  const isRTL = RTL_LANGUAGES.includes((courseLanguage || "").toLowerCase());
  const dir = isRTL ? "rtl" : "ltr";
  const ql = (courseLanguage || "").toLowerCase();
  const dl = typeof window !== "undefined" ? getDictDefLang() : "chinese";
  const proseClass = "prose prose-sm max-w-none text-gray-800 [&_p]:my-2 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-gray-50 [&_pre]:p-3 [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 [&_table]:border-collapse [&_th]:border [&_th]:border-gray-300 [&_th]:px-2 [&_th]:py-1 [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1";
  const markdownComponents = {
    p: ({ children }: { children?: React.ReactNode }) => <p><ClickableWords ql={ql} dl={dl}>{children}</ClickableWords></p>,
    li: ({ children }: { children?: React.ReactNode }) => <li><ClickableWords ql={ql} dl={dl}>{children}</ClickableWords></li>,
  };

  return (
    <VStack gap={8} align="stretch">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" dir={dir}>{lesson.title}</h1>
        <p className="mt-1 text-sm text-gray-400">{courseTitle}</p>
      </div>

      {/* Dialogue */}
      {content.dialogue && content.dialogue.lines.length > 0 && (
        <VStack gap={3} align="stretch">
          <HStack justify="between" align="center">
            <SectionTitle>Dialogue</SectionTitle>
            <SpeakButtons text={content.dialogue.lines.map((l) => l.text).join(". ")} playOrReplay={playOrReplay} regenerate={speak} isLoading={isLoading} />
          </HStack>
          <VStack gap={3} align="stretch">
            {content.dialogue.lines.map((line, i) => (
              <HStack key={i} gap={3} align="start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {line.speaker.charAt(0).toUpperCase() || "?"}
                </div>
                <VStack gap={0.5} align="stretch" className="flex-1">
                  <HStack gap={2} align="center">
                    <span className="text-xs font-semibold text-gray-700">{line.speaker}</span>
                    <SpeakButtons text={line.text} playOrReplay={playOrReplay} regenerate={speak} isLoading={isLoading} />
                  </HStack>
                  <p className="text-sm text-gray-800" dir={dir}>{line.text}</p>
                  {line.translation && <p className="text-xs italic text-gray-400">{line.translation}</p>}
                </VStack>
              </HStack>
            ))}
          </VStack>
        </VStack>
      )}

      {/* Article */}
      {content.article && content.article.body.trim() && (
        <VStack gap={3} align="stretch">
          <HStack justify="between" align="center">
            <SectionTitle>Article</SectionTitle>
            <SpeakButtons text={stripMarkdown(content.article.body)} playOrReplay={playOrReplay} regenerate={speak} isLoading={isLoading} />
          </HStack>
          <div dir={dir} className={proseClass}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{content.article.body}</ReactMarkdown>
          </div>
        </VStack>
      )}

      {/* Vocabulary */}
      {content.vocabulary && content.vocabulary.items.length > 0 && (
        <VStack gap={3} align="stretch">
          <SectionTitle>Vocabulary</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Word</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Pronunciation</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Translation</th>
                  <th className="py-2 px-3 text-left font-semibold text-gray-700">Example</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {content.vocabulary.items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 px-3 font-medium text-gray-900" dir={dir}>{item.word}</td>
                    <td className="py-2 px-3 text-gray-500">{item.pronunciation || "—"}</td>
                    <td className="py-2 px-3 text-gray-700">{item.translation}</td>
                    <td className="py-2 px-3 text-gray-500" dir={dir}>{item.example || "—"}</td>
                    <td className="py-2 px-3">
                      <SpeakButtons text={item.word} playOrReplay={playOrReplay} regenerate={speak} isLoading={isLoading} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VStack>
      )}

      {/* Grammar */}
      {content.grammar && content.grammar.body.trim() && (
        <VStack gap={3} align="stretch">
          <HStack justify="between" align="center">
            <SectionTitle>Grammar</SectionTitle>
            <SpeakButtons text={stripMarkdown(content.grammar.body)} playOrReplay={playOrReplay} regenerate={speak} isLoading={isLoading} />
          </HStack>
          <div className={proseClass}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content.grammar.body}</ReactMarkdown>
          </div>
        </VStack>
      )}

      {/* Exercises */}
      {content.exercises && content.exercises.questions.length > 0 && (
        <VStack gap={3} align="stretch">
          <SectionTitle>Exercises</SectionTitle>
          <ExerciseSection questions={content.exercises.questions} />
        </VStack>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Spinner size={14} /> Generating audio...
        </div>
      )}
    </VStack>
  );
}
