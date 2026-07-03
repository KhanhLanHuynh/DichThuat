"use client";

import { getContextParagraphIndices } from "@/lib/paragraphs";

interface ContextModalProps {
  paragraphIndex: number;
  zhParagraphs: string[];
  hvParagraphs: string[];
  viParagraphs: string[];
  totalParagraphs: number;
  onClose: () => void;
}

export function ContextModal({
  paragraphIndex,
  zhParagraphs,
  hvParagraphs,
  viParagraphs,
  totalParagraphs,
  onClose,
}: ContextModalProps) {
  const indices = getContextParagraphIndices(
    paragraphIndex,
    totalParagraphs,
    zhParagraphs
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-panel shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">
            Context — Para {paragraphIndex + 1}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-muted hover:bg-gray-100"
          >
            Close
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {indices.map((i) => (
            <div
              key={i}
              className={`mb-3 rounded-lg border p-3 ${
                i === paragraphIndex
                  ? "border-accent bg-accent-light"
                  : "border-border"
              }`}
            >
              <div className="mb-1 text-[10px] font-semibold text-muted">
                Para {i + 1}
              </div>
              <div className="font-han whitespace-pre-wrap text-sm">
                {zhParagraphs[i]?.trim() || "(empty)"}
              </div>
              {hvParagraphs[i]?.trim() && (
                <div className="font-vi mt-1 whitespace-pre-wrap text-xs text-muted">
                  {hvParagraphs[i]}
                </div>
              )}
              {viParagraphs[i]?.trim() && (
                <div className="font-vi mt-1 whitespace-pre-wrap text-xs">
                  {viParagraphs[i]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
