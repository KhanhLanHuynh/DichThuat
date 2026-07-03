"use client";

import { useEffect, useRef, useState } from "react";
import { Annotation, EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import {
  useScrollSyncRegister,
  type ScrollPaneId,
} from "./ScrollSyncContext";

interface EditorPaneProps {
  label: string;
  sublabel: string;
  badge: "read-only" | "draft" | "final";
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontClass?: string;
  footerStats?: string;
  paneId?: ScrollPaneId;
}

const badgeStyles = {
  "read-only": "bg-gray-100 text-gray-600",
  draft: "bg-amber-50 text-amber-700",
  final: "bg-blue-50 text-blue-700",
};

const badgeLabels = {
  "read-only": "Read Only",
  draft: "Draft",
  final: "Final",
};

/** Marks programmatic doc replacements so they do not fire onChange. */
const externalSync = Annotation.define<boolean>();

export function EditorPane({
  label,
  sublabel,
  badge,
  value,
  onChange,
  readOnly,
  fontClass = "",
  footerStats,
  paneId,
}: EditorPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const [cmScrollEl, setCmScrollEl] = useState<HTMLElement | null>(null);

  onChangeRef.current = onChange;

  useScrollSyncRegister(paneId, cmScrollEl);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (!update.docChanged || !onChangeRef.current) return;
      if (update.transactions.some((tr) => tr.annotation(externalSync))) return;
      onChangeRef.current(update.state.doc.toString());
    });

    const state = EditorState.create({
      doc: value,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown(),
        EditorView.lineWrapping,
        EditorView.editable.of(!readOnly),
        EditorState.readOnly.of(!!readOnly),
        updateListener,
        EditorView.theme({
          "&": { height: "100%" },
          ".cm-scroller": { fontFamily: "inherit" },
          ".cm-content": { padding: "12px 8px" },
        }),
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    setCmScrollEl(view.scrollDOM);

    return () => {
      view.destroy();
      viewRef.current = null;
      setCmScrollEl(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readOnly]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        annotations: externalSync.of(true),
      });
    }
  }, [value]);

  return (
    <div className={`flex h-full min-h-0 flex-col rounded-lg border border-border bg-panel ${fontClass}`}>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <div>
          <div className="text-xs font-semibold">{label}</div>
          <div className="text-[10px] text-muted">{sublabel}</div>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${badgeStyles[badge]}`}
        >
          {badgeLabels[badge]}
        </span>
      </div>
      <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden" />
      <div className="shrink-0 border-t border-border px-3 py-1.5 text-[10px] text-muted">
        {footerStats ?? "UTF-8"}
      </div>
    </div>
  );
}
