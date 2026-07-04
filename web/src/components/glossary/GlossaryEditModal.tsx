"use client";

import { useEffect, useState } from "react";
import type { GlossaryTerm } from "@/lib/glossary";
import { getTermRendering, normalizeGlossaryTerm } from "@/lib/glossary";

interface GlossaryEditModalProps {
  term: GlossaryTerm;
  saving?: boolean;
  error?: string;
  onSave: (hv: string, vi: string) => void;
  onClose: () => void;
}

export function GlossaryEditModal({
  term,
  saving = false,
  error,
  onSave,
  onClose,
}: GlossaryEditModalProps) {
  const normalized = normalizeGlossaryTerm(term);
  const initialHv = getTermRendering(normalized, "hv");
  const initialVi = getTermRendering(normalized, "vi");

  const [hv, setHv] = useState(initialHv);
  const [vi, setVi] = useState(initialVi);

  useEffect(() => {
    setHv(initialHv);
    setVi(initialVi);
  }, [term.zh, initialHv, initialVi]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const trimmedHv = hv.trim();
  const trimmedVi = vi.trim();
  const unchanged = trimmedHv === initialHv && trimmedVi === initialVi;
  const canSave =
    !saving && trimmedHv.length > 0 && trimmedVi.length > 0 && !unchanged;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-xl bg-panel shadow-xl">
        <div className="shrink-0 border-b border-border px-4 py-3">
          <h3 className="text-sm font-semibold">Edit glossary term</h3>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted">
              Chinese
            </label>
            <div className="font-han rounded-md border border-border bg-gray-50 px-3 py-2 text-sm font-semibold">
              {term.zh}
            </div>
          </div>

          <div>
            <label
              htmlFor="glossary-hv"
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted"
            >
              Hán-Việt
            </label>
            <input
              id="glossary-hv"
              type="text"
              value={hv}
              onChange={(e) => setHv(e.target.value)}
              disabled={saving}
              className="font-vi w-full rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="glossary-vi"
              className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-muted"
            >
              Thuần Việt
            </label>
            <input
              id="glossary-vi"
              type="text"
              value={vi}
              onChange={(e) => setVi(e.target.value)}
              disabled={saving}
              className="font-vi w-full rounded-md border border-border px-3 py-2 text-sm disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-border px-3 py-1.5 text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(trimmedHv, trimmedVi)}
            disabled={!canSave}
            className="rounded-md bg-accent px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
