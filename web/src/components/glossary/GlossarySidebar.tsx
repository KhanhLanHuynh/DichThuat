"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";
import type { GlossaryTerm } from "@/lib/glossary";
import {
  filterTerms,
  getTermRendering,
  normalizeGlossaryTerm,
} from "@/lib/glossary";

const STORAGE_KEY = "dichthuat-glossary-expanded";

interface GlossarySidebarProps {
  terms: GlossaryTerm[];
  activeTerms: GlossaryTerm[];
  onEditTerm?: (term: GlossaryTerm) => void;
  onAddTerm?: () => void;
}

export function GlossarySidebar({
  terms,
  activeTerms,
  onEditTerm,
  onAddTerm,
}: GlossarySidebarProps) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "false") setExpanded(false);
  }, []);

  const toggleExpanded = () => {
    setExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const activeZh = new Set(activeTerms.map((t) => t.zh));
  const filtered = filterTerms(terms, search);

  const sorted = [...filtered].sort((a, b) => {
    const aActive = activeZh.has(a.zh) ? 0 : 1;
    const bActive = activeZh.has(b.zh) ? 0 : 1;
    return aActive - bActive;
  });

  const activeCount = activeTerms.length;

  return (
    <aside
      className={`flex shrink-0 flex-col overflow-hidden border-l border-border bg-panel transition-[width] duration-200 ${
        expanded ? "w-56 lg:w-72" : "w-10"
      }`}
    >
      {expanded ? (
        <>
          <div className="border-b border-border p-3">
            <div className="mb-2 flex items-center justify-between gap-1">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Glossary
              </h2>
              <div className="flex shrink-0 items-center gap-0.5">
                {onAddTerm && (
                  <button
                    type="button"
                    onClick={onAddTerm}
                    title="Add term"
                    aria-label="Add term"
                    className="rounded p-0.5 text-muted hover:bg-gray-100 hover:text-accent"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={toggleExpanded}
                  aria-expanded={expanded}
                  aria-label="Collapse glossary"
                  title="Collapse glossary"
                  className="shrink-0 rounded p-0.5 text-muted hover:bg-gray-100 hover:text-foreground"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms…"
              className="w-full rounded-md border border-border px-2 py-1.5 text-xs"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {sorted.slice(0, 50).map((term) => {
              const normalized = normalizeGlossaryTerm(term);
              const vi = getTermRendering(normalized, "vi");
              const hv = getTermRendering(normalized, "hv");
              const showHv = hv !== vi;

              return (
                <div
                  key={term.zh}
                  className={`group mb-2 rounded-lg border p-2 ${
                    activeZh.has(term.zh)
                      ? "border-accent bg-accent-light"
                      : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <div className="font-han text-sm font-semibold">
                        {term.zh}
                      </div>
                      {onEditTerm && (
                        <button
                          type="button"
                          onClick={() => onEditTerm(term)}
                          title="Edit term"
                          className="shrink-0 rounded p-0.5 text-muted opacity-0 transition-opacity hover:bg-gray-100 hover:text-accent group-hover:opacity-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="font-vi text-xs text-accent">{vi}</div>
                    {showHv && (
                      <div className="font-vi text-[11px] text-muted">
                        Hán-Việt: {hv}
                      </div>
                    )}
                    {term.sanskrit && (
                      <div className="text-[10px] italic text-muted">
                        {term.sanskrit}
                      </div>
                    )}
                    {term.notes && (
                      <div className="mt-1 text-[10px] text-muted">
                        {term.notes}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {sorted.length === 0 && (
              <p className="p-2 text-xs text-muted">No terms match.</p>
            )}
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center py-3">
          <button
            type="button"
            onClick={toggleExpanded}
            aria-expanded={expanded}
            aria-label="Expand glossary"
            title="Expand glossary"
            className="rounded p-1 text-muted hover:bg-gray-100 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {activeCount > 0 && (
            <span
              className="mt-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white"
              title={`${activeCount} active term${activeCount === 1 ? "" : "s"}`}
            >
              {activeCount}
            </span>
          )}
        </div>
      )}
    </aside>
  );
}
