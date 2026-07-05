"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";

interface FootnoteEditPopoverProps {
  id: string;
  text: string;
  anchor: DOMRect;
  referenced: boolean;
  onChange: (text: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

const POPOVER_WIDTH = 288;
const GAP = 8;

function computePosition(anchor: DOMRect, popoverHeight: number) {
  let top = anchor.bottom + GAP;
  let left = anchor.left;

  if (left + POPOVER_WIDTH > window.innerWidth - GAP) {
    left = window.innerWidth - POPOVER_WIDTH - GAP;
  }
  if (left < GAP) left = GAP;

  if (top + popoverHeight > window.innerHeight - GAP) {
    top = anchor.top - popoverHeight - GAP;
  }
  if (top < GAP) top = GAP;

  return { top, left };
}

export function FootnoteEditPopover({
  id,
  text,
  anchor,
  referenced,
  onChange,
  onDelete,
  onClose,
}: FootnoteEditPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [position, setPosition] = useState(() =>
    computePosition(anchor, 120)
  );

  useLayoutEffect(() => {
    const el = popoverRef.current;
    if (!el) return;
    setPosition(computePosition(anchor, el.offsetHeight));
  }, [anchor, text]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      const el = popoverRef.current;
      if (el && !el.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [onClose]);

  const handleDelete = () => {
    if (referenced) {
      if (
        !confirm(
          `Delete footnote [^${id}] and remove all [^${id}] markers from the translation?`
        )
      ) {
        return;
      }
    }
    onDelete();
    onClose();
  };

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Edit footnote ${id}`}
      className="fixed z-50 w-72 rounded-lg border border-border bg-panel shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="font-mono text-xs font-semibold text-muted">
          [^{id}]
        </span>
        <button
          type="button"
          onClick={onClose}
          title="Close"
          className="rounded p-1 text-muted hover:bg-gray-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex gap-2 p-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="min-h-[3rem] flex-1 resize-y rounded border border-border px-2 py-1 text-xs leading-relaxed"
          placeholder="Footnote text…"
        />
        <button
          type="button"
          onClick={handleDelete}
          title={`Delete footnote ${id}`}
          className="shrink-0 self-start rounded p-1 text-muted hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>,
    document.body
  );
}
