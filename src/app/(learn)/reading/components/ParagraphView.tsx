"use client";

import React from "react";
import type { ParagraphData, HoverState } from "../reading-types";

interface ParagraphViewProps {
  paragraph: ParagraphData;
  paragraphIdx: number;
  getHighlighted: (pIdx: number, sIdx: number, side: "source" | "target") => Set<number>;
  onHover: (state: HoverState | null) => void;
  hovered: HoverState | null;
}

export function ParagraphView({
  paragraph,
  paragraphIdx,
  getHighlighted,
  onHover,
  hovered,
}: ParagraphViewProps) {
  const { sentences, sourceLanguage, targetLanguage } = paragraph;

  return (
    <div
      className="space-y-1.5"
      onMouseLeave={() => {
        if (hovered?.paragraphIdx === paragraphIdx) onHover(null);
      }}
    >
      {sentences.map((sentence, sIdx) => {
        const highlightedSource = getHighlighted(paragraphIdx, sIdx, "source");
        const highlightedTarget = getHighlighted(paragraphIdx, sIdx, "target");

        return (
          <div key={sIdx}>
            <div className="text-base text-gray-900">
              {sentence.sourceTokens.map((token) => {
                const isHighlighted = highlightedSource.has(token.index);
                const isHovered =
                  hovered?.paragraphIdx === paragraphIdx &&
                  hovered?.sentenceIdx === sIdx &&
                  hovered?.localIdx === token.index &&
                  hovered?.side === "source";

                return (
                  <span
                    key={token.index}
                    className={`cursor-pointer rounded-sm ${
                      isHighlighted ? "bg-yellow-200/40" : ""
                    } ${isHovered ? "bg-blue-200/50" : ""}`}
                    onMouseEnter={() =>
                      onHover({
                        paragraphIdx,
                        sentenceIdx: sIdx,
                        localIdx: token.index,
                        side: "source",
                      })
                    }
                    onClick={() => {
                      const q = encodeURIComponent(token.text);
                      const ql = encodeURIComponent(sourceLanguage);
                      const dl = encodeURIComponent(targetLanguage);
                      window.open(`/dictionary?q=${q}&ql=${ql}&dl=${dl}`, "_blank");
                    }}
                  >
                    {token.text}{" "}
                  </span>
                );
              })}
            </div>
            <div className="text-sm text-gray-400">
              {sentence.targetTokens.map((token) => {
                const isHighlighted = highlightedTarget.has(token.index);
                const isHovered =
                  hovered?.paragraphIdx === paragraphIdx &&
                  hovered?.sentenceIdx === sIdx &&
                  hovered?.localIdx === token.index &&
                  hovered?.side === "target";

                return (
                  <span
                    key={token.index}
                    className={`cursor-pointer rounded-sm ${
                      isHighlighted ? "bg-yellow-200/40" : ""
                    } ${isHovered ? "bg-blue-200/50" : ""}`}
                    onMouseEnter={() =>
                      onHover({
                        paragraphIdx,
                        sentenceIdx: sIdx,
                        localIdx: token.index,
                        side: "target",
                      })
                    }
                    onClick={() => {
                      const q = encodeURIComponent(token.text);
                      const ql = encodeURIComponent(targetLanguage);
                      const dl = encodeURIComponent(sourceLanguage);
                      window.open(`/dictionary?q=${q}&ql=${ql}&dl=${dl}`, "_blank");
                    }}
                  >
                    {token.text}{" "}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
