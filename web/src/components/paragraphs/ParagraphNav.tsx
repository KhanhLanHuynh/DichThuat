"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export type ParagraphViewMode = "single" | "all";

interface ParagraphNavProps {
  viewMode: ParagraphViewMode;
  paragraphIndex: number;
  total: number;
  atFirstContent: boolean;
  atLastContent: boolean;
  syncScroll: boolean;
  onSyncScrollChange: (v: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onContext?: () => void;
}

export function ParagraphNav({
  viewMode,
  paragraphIndex,
  total,
  atFirstContent,
  atLastContent,
  syncScroll,
  onSyncScrollChange,
  onPrev,
  onNext,
  onContext,
}: ParagraphNavProps) {
  const navDisabled = viewMode === "all";

  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-b border-border bg-gray-50 px-3">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          disabled={navDisabled || atFirstContent}
          className="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="min-w-[7rem] text-center text-xs font-medium">
          {viewMode === "all" ? "All" : `Para ${paragraphIndex + 1} / ${total}`}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={navDisabled || atLastContent}
          className="rounded p-1 hover:bg-gray-200 disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <label
          className={`flex items-center gap-1.5 text-muted ${viewMode !== "all" ? "opacity-50" : ""}`}
          title={viewMode !== "all" ? "Available in All view" : undefined}
        >
          <input
            type="checkbox"
            checked={syncScroll}
            disabled={viewMode !== "all"}
            onChange={(e) => onSyncScrollChange(e.target.checked)}
            className="rounded"
          />
          Sync Scroll
        </label>
        {onContext && (
          <button
            type="button"
            onClick={onContext}
            className="rounded border border-border px-2 py-1 hover:bg-white"
          >
            Context
          </button>
        )}
      </div>
    </div>
  );
}
