"use client";

import React, { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { PageLayout } from "@/components/ui/PageLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/design-system/button";
import { actionReadText } from "@/modules/reading/reading-action";
import { ArrowUpDown, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ParagraphView } from "./components/ParagraphView";
import { ReadingInputForm } from "./components/ReadingInputForm";
import type { ParagraphData, HoverState } from "./reading-types";

type ParagraphSlot =
  | { status: "success"; data: ParagraphData }
  | { status: "error"; text: string; error: string; retrying: boolean };

export function ReadingClient() {
  const t = useTranslations("reading");
  const [targetLanguage, setTargetLanguage] = useState("Chinese");
  const [processing, setProcessing] = useState(false);
  const [paragraphSlots, setParagraphSlots] = useState<ParagraphSlot[]>([]);
  const [hovered, setHovered] = useState<HoverState | null>(null);
  const [progress, setProgress] = useState({ total: 0 });
  const abortRef = useRef(false);
  const retryAbortRef = useRef(false);

  const getHighlighted = (
    pIdx: number,
    sIdx: number,
    side: "source" | "target"
  ): Set<number> => {
    const indices = new Set<number>();
    if (!hovered || hovered.paragraphIdx !== pIdx || hovered.sentenceIdx !== sIdx) {
      return indices;
    }

    const slot = paragraphSlots[pIdx];
    if (!slot || slot.status !== "success") return indices;

    const sentence = slot.data.sentences[sIdx];
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
  };

  const handleTranslate = async () => {
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
    setParagraphSlots([]);
    setProgress({ total: 0 });

    const paragraphTexts = text
      .replace(/\r/g, "\n")
      .split("\n")
      .map((p) => p.replace(/^[\u3000 \t]+|[\u3000 \t]+$/g, ""))
      .filter(Boolean);
    setProgress({ total: paragraphTexts.length });

    const settled = await Promise.allSettled(
      paragraphTexts.map((paraText) => {
        if (abortRef.current) return Promise.resolve(null);
        return actionReadText({
          text: paraText,
          targetLanguage: trimmedTarget,
        });
      })
    );

    const slots: ParagraphSlot[] = [];
    for (let i = 0; i < settled.length; i++) {
      if (abortRef.current) break;
      const outcome = settled[i];
      if (outcome.status === "fulfilled" && outcome.value?.success && outcome.value.data) {
        slots.push({
          status: "success",
          data: {
            sentences: outcome.value.data.sentences,
            sourceLanguage: outcome.value.data.sourceLanguage,
            targetLanguage: outcome.value.data.targetLanguage,
          },
        });
      } else if (outcome.status === "fulfilled" && outcome.value) {
        const errorMsg = outcome.value.message || t("translationFailed");
        toast.error(errorMsg);
        slots.push({
          status: "error",
          text: paragraphTexts[i],
          error: errorMsg,
          retrying: false,
        });
      } else if (outcome.status === "rejected") {
        toast.error(t("translationFailed"));
        slots.push({
          status: "error",
          text: paragraphTexts[i],
          error: t("translationFailed"),
          retrying: false,
        });
      }
    }
    setParagraphSlots(slots);
    setProgress({ total: 0 });

    setProcessing(false);
  };

  const handleCancel = () => {
    abortRef.current = true;
    setProcessing(false);
  };

  const handleRetry = async (index: number) => {
    const slot = paragraphSlots[index];
    if (!slot || slot.status !== "error") return;

    retryAbortRef.current = false;
    setParagraphSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, retrying: true } : s))
    );

    try {
      const result = await actionReadText({
        text: slot.text,
        targetLanguage: targetLanguage.trim(),
      });

      if (retryAbortRef.current) return;

      if (result.success && result.data) {
        setParagraphSlots((prev) =>
          prev.map((s, i) =>
            i === index
              ? {
                  status: "success",
                  data: {
                    sentences: result.data!.sentences,
                    sourceLanguage: result.data!.sourceLanguage,
                    targetLanguage: result.data!.targetLanguage,
                  },
                }
              : s
          )
        );
      } else {
        const errorMsg = result.message || t("translationFailed");
        toast.error(errorMsg);
        setParagraphSlots((prev) =>
          prev.map((s, i) =>
            i === index ? { ...s, error: errorMsg, retrying: false } : s
          )
        );
      }
    } catch {
      if (retryAbortRef.current) return;
      toast.error(t("translationFailed"));
      setParagraphSlots((prev) =>
        prev.map((s, i) => (i === index ? { ...s, retrying: false } : s))
      );
    }
  };

  const handleCancelRetry = () => {
    retryAbortRef.current = true;
    setParagraphSlots((prev) =>
      prev.map((s) => (s.status === "error" && s.retrying ? { ...s, retrying: false } : s))
    );
  };

  const handleFlip = () => {
    setParagraphSlots((prev) =>
      prev.map((slot) =>
        slot.status === "success"
          ? {
              status: "success",
              data: {
                sourceLanguage: slot.data.targetLanguage,
                targetLanguage: slot.data.sourceLanguage,
                sentences: slot.data.sentences.map((s) => ({
                  sourceSentence: s.translatedSentence,
                  translatedSentence: s.sourceSentence,
                  sourceTokens: s.targetTokens,
                  targetTokens: s.sourceTokens,
                  alignments: s.alignments.map((a) => ({
                    sourceIndices: a.targetIndices,
                    targetIndices: a.sourceIndices,
                  })),
                })),
              },
            }
          : slot
      )
    );
    setHovered(null);
  };

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

        {paragraphSlots.some((s) => s.status === "success") && !processing && (
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

        {paragraphSlots.length > 0 && (
          <div className="space-y-8">
            {paragraphSlots.map((slot, pIdx) =>
              slot.status === "success" ? (
                <ParagraphView
                  key={pIdx}
                  paragraph={slot.data}
                  paragraphIdx={pIdx}
                  getHighlighted={getHighlighted}
                  onHover={setHovered}
                  hovered={hovered}
                />
              ) : (
                <div
                  key={pIdx}
                  className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950"
                >
                  <p className="mb-2 text-sm text-red-700 dark:text-red-300">
                    {t("paragraphError", { index: pIdx + 1 })}
                  </p>
                  <p className="mb-3 text-xs text-red-500 dark:text-red-400">
                    {slot.error}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="light"
                      size="sm"
                      onClick={() => handleRetry(pIdx)}
                      disabled={slot.retrying}
                    >
                      {slot.retrying ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}
                      {slot.retrying ? t("retrying") : t("retry")}
                    </Button>
                    {slot.retrying && (
                      <Button variant="light" size="sm" onClick={handleCancelRetry}>
                        {t("cancel")}
                      </Button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
