"use client";

import {
  paragraphPreview,
  singleLayerBadges,
} from "@/lib/paragraphs";
import type { ParagraphViewMode } from "./ParagraphNav";

interface ParagraphSidebarProps {
  zhParagraphs: string[];
  hvParagraphs: string[];
  viParagraphs: string[];
  viewMode: ParagraphViewMode;
  activeIndex: number;
  search: string;
  onSearchChange: (q: string) => void;
  onSelectAll: () => void;
  onSelect: (index: number) => void;
}

export function ParagraphSidebar({
  zhParagraphs,
  hvParagraphs,
  viParagraphs,
  viewMode,
  activeIndex,
  search,
  onSearchChange,
  onSelectAll,
  onSelect,
}: ParagraphSidebarProps) {
  const q = search.toLowerCase();
  const total = Math.max(
    zhParagraphs.length,
    hvParagraphs.length,
    viParagraphs.length
  );

  const items = Array.from({ length: total }, (_, index) => {
    const zh = zhParagraphs[index] ?? "";
    const hv = hvParagraphs[index] ?? "";
    const vi = viParagraphs[index] ?? "";
    return { zh, hv, vi, index };
  }).filter(({ zh, hv, vi, index }) => {
    const hasContent =
      zh.trim().length > 0 || hv.trim().length > 0 || vi.trim().length > 0;
    if (!hasContent) return false;
    if (!q) return true;
    const preview = zh.trim() || hv.trim() || vi.trim();
    return (
      zh.toLowerCase().includes(q) ||
      hv.toLowerCase().includes(q) ||
      vi.toLowerCase().includes(q) ||
      preview.toLowerCase().includes(q) ||
      String(index + 1).includes(q)
    );
  });

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-panel lg:w-64">
      <div className="border-b border-border p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Paragraphs
        </h2>
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter paragraphs…"
          className="w-full rounded-md border border-border px-2 py-1.5 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <button
          type="button"
          onClick={onSelectAll}
          className={`mb-2 w-full rounded-md border px-2 py-2 text-left transition-colors ${
            viewMode === "all"
              ? "border-accent bg-accent-light"
              : "border-transparent hover:bg-gray-50"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase text-muted">
              All
            </span>
          </div>
          <div className="mt-0.5 text-xs text-muted">{total} lines</div>
        </button>

        {items.map(({ zh, hv, vi, index }) => {
          const badges = singleLayerBadges(zh, hv, vi);
          const previewText =
            zh.trim() ? zh : hv.trim() ? hv : vi;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(index)}
              className={`mb-1 w-full rounded-md border px-2 py-2 text-left transition-colors ${
                viewMode === "single" && activeIndex === index
                  ? "border-accent bg-accent-light"
                  : "border-transparent hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase text-muted">
                  Para {index + 1}
                </span>
                {badges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded bg-gray-200 px-1 py-0.5 text-[9px] font-semibold text-muted"
                  >
                    {badge}
                  </span>
                ))}
              </div>
              <div className="font-han mt-0.5 line-clamp-2 text-xs leading-relaxed">
                {paragraphPreview(previewText, 60)}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
