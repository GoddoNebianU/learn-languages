"use client";

import React, { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { actionReadText } from "@/modules/reading/reading-action";
import { Loader2, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

import { ParagraphView } from "./components/ParagraphView";
import { ReadingInputForm } from "./components/ReadingInputForm";
import type { ParagraphData, HoverState } from "./reading-types";

export function ReadingClient() {
  const t = useTranslations("reading");
  const [targetLanguage, setTargetLanguage] = useState("Chinese");
  const [processing, setProcessing] = useState(false);
  const [paragraphs, setParagraphs] = useState<ParagraphData[]>([]);
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const abortRef = useRef(false);

  const getHighlighted = useCallback(
    (pIdx: number, sIdx: number, side: "source" | "target"): Set<number> => {
      const indices = new Set<number>();
      if (!hovered || hovered.paragraphIdx !== pIdx || hovered.sentenceIdx !== sIdx) {
        return indices;
      }

      const paragraph = paragraphs[pIdx];
      if (!paragraph) return indices;

      const sentence = paragraph.sentences[sIdx];
      if (!sentence) return indices;

      for (const alignment of sentence.alignments) {
        const hoveredField =
          hovered.side === "source" ? alignment.sourceIndices : alignment.targetIndices;
        const resultField =
          side === "source" ? alignment.sourceIndices : alignment.targetIndices;

        if (hoveredField.includes(hovered.localIdx)) {
          for (const idx of resultField) {
            indices.add(idx);
          }
        }
      }

      return indices;
    },
    [hovered, paragraphs]
  );

  const handleTranslate = useCallback(async () => {
    const textarea = document.getElementById("reading-input") as HTMLTextAreaElement | null;
    const text = textarea?.value?.trim();
    if (!text) {
      toast.error(t("emptyText"));
      return;
    }

    const trimmedTarget = targetLanguage.trim();
    if (!trimmedTarget) {
      toast.error(t("emptyTargetLanguage"));
      return;
    }
    setTargetLanguage(trimmedTarget);

    abortRef.current = false;
    setProcessing(true);
    setParagraphs([]);
    setProgress({ current: 0, total: 0 });

    const paragraphTexts = text
      .replace(/\r/g, "\n")
      .split("\n")
      .map((p) => p.replace(/^[\u3000 \t]+|[\u3000 \t]+$/g, ""))
      .filter(Boolean);
    setProgress({ current: 0, total: paragraphTexts.length });

    const results: ParagraphData[] = [];

    for (let i = 0; i < paragraphTexts.length; i++) {
      if (abortRef.current) break;

      try {
        const res = await actionReadText({
          text: paragraphTexts[i],
          targetLanguage: trimmedTarget,
        });

        if (res.success && res.data) {
          results.push({
            sentences: res.data.sentences,
            sourceLanguage: res.data.sourceLanguage,
            targetLanguage: res.data.targetLanguage,
          });
          setParagraphs([...results]);
        } else {
          toast.error(res.message || t("translationFailed"));
        }
      } catch {
        toast.error(t("translationFailed"));
      }
      setProgress({ current: i + 1, total: paragraphTexts.length });
    }

    setProcessing(false);
  }, [targetLanguage, t]);

  const handleCancel = useCallback(() => {
    abortRef.current = true;
    setProcessing(false);
  }, []);

  const handleFlip = useCallback(() => {
    setParagraphs((prev) =>
      prev.map((para) => ({
        sourceLanguage: para.targetLanguage,
        targetLanguage: para.sourceLanguage,
        sentences: para.sentences.map((s) => ({
          sourceSentence: s.translatedSentence,
          translatedSentence: s.sourceSentence,
          sourceTokens: s.targetTokens,
          targetTokens: s.sourceTokens,
          alignments: s.alignments.map((a) => ({
            sourceIndices: a.targetIndices,
            targetIndices: a.sourceIndices,
          })),
        })),
      }))
    );
    setHovered(null);
  }, []);

  return (
    <PageLayout>
      <PageHeader title={t("title")} subtitle={t("description")} />

      <div className="mx-auto max-w-3xl space-y-6">
        <ReadingInputForm
          targetLanguage={targetLanguage}
          onTargetLanguageChange={setTargetLanguage}
          processing={processing}
          progress={progress}
          onTranslate={handleTranslate}
          onCancel={handleCancel}
        />

        {paragraphs.length > 0 && !processing && (
          <div className="flex justify-end">
            <button
              onClick={handleFlip}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <ArrowUpDown size={16} />
              {t("flip")}
            </button>
          </div>
        )}

        {paragraphs.length > 0 && (
          <div className="space-y-8">
            {paragraphs.map((para, pIdx) => (
              <ParagraphView
                key={pIdx}
                paragraph={para}
                paragraphIdx={pIdx}
                getHighlighted={getHighlighted}
                onHover={setHovered}
                hovered={hovered}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
