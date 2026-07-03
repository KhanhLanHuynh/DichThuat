"use client";

import { useState } from "react";
import type { GlossaryTerm } from "@/lib/glossary";
import { filterTerms } from "@/lib/glossary";

interface GlossarySidebarProps {
  terms: GlossaryTerm[];
  activeTerms: GlossaryTerm[];
}

export function GlossarySidebar({
  terms,
  activeTerms,
}: GlossarySidebarProps) {
  const [search, setSearch] = useState("");

  const activeZh = new Set(activeTerms.map((t) => t.zh));
  const filtered = filterTerms(terms, search);

  const sorted = [...filtered].sort((a, b) => {
    const aActive = activeZh.has(a.zh) ? 0 : 1;
    const bActive = activeZh.has(b.zh) ? 0 : 1;
    return aActive - bActive;
  });

  return (
    <aside className="flex w-56 shrink-0 flex-col border-l border-border bg-panel lg:w-72">
      <div className="border-b border-border p-3">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Glossary
        </h2>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search terms…"
          className="w-full rounded-md border border-border px-2 py-1.5 text-xs"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sorted.slice(0, 50).map((term) => (
          <div
            key={term.zh}
            className={`mb-2 rounded-lg border p-2 ${
              activeZh.has(term.zh)
                ? "border-accent bg-accent-light"
                : "border-border"
            }`}
          >
            <div>
              <div className="font-han text-sm font-semibold">{term.zh}</div>
              <div className="font-vi text-xs text-accent">{term.vi}</div>
              {term.sanskrit && (
                <div className="text-[10px] italic text-muted">{term.sanskrit}</div>
              )}
              {term.notes && (
                <div className="mt-1 text-[10px] text-muted">{term.notes}</div>
              )}
            </div>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="p-2 text-xs text-muted">No terms match.</p>
        )}
      </div>
    </aside>
  );
}
