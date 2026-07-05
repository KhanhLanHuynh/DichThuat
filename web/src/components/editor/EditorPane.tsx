"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ChevronDown } from "lucide-react";
import { Annotation, EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, highlightActiveLine } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";
import { footnoteClickExtension, type FootnoteClickHandler } from "@/lib/footnote-editor";
import {
  useScrollSyncRegister,
  type ScrollPaneId,
} from "./ScrollSyncContext";

const DEFAULT_FONT_SIZE_OPTIONS = [12, 13, 14, 15, 16, 18, 20, 22, 24];

export interface EditorSelection {
  from: number;
  to: number;
  text: string;
}

export interface EditorPaneHandle {
  getSelection: () => EditorSelection | null;
  getCoordsAtPos: (pos: number) => DOMRect | null;
  focus: () => void;
}

interface EditorPaneProps {
  label: string;
  sublabel: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  fontClass?: string;
  footerStats?: string;
  paneId?: ScrollPaneId;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontSizeOptions?: number[];
  headerActions?: React.ReactNode;
  onFootnoteClick?: (id: string, anchor: DOMRect) => void;
}

/** Marks programmatic doc replacements so they do not fire onChange. */
const externalSync = Annotation.define<boolean>();

export const EditorPane = forwardRef<EditorPaneHandle, EditorPaneProps>(
  function EditorPane(
    {
      label,
      sublabel,
      value,
      onChange,
      readOnly,
      fontClass = "",
      footerStats,
      paneId,
      fontSize,
      onFontSizeChange,
      fontSizeOptions = DEFAULT_FONT_SIZE_OPTIONS,
      headerActions,
      onFootnoteClick,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const onChangeRef = useRef(onChange);
    const onFootnoteClickRef = useRef<FootnoteClickHandler | null>(
      onFootnoteClick ?? null
    );
    const [cmScrollEl, setCmScrollEl] = useState<HTMLElement | null>(null);

    onChangeRef.current = onChange;
    onFootnoteClickRef.current = onFootnoteClick ?? null;

    useScrollSyncRegister(paneId, cmScrollEl);

    useImperativeHandle(ref, () => ({
      getSelection: () => {
        const view = viewRef.current;
        if (!view) return null;
        const { from, to } = view.state.selection.main;
        if (from === to) return null;
        return {
          from,
          to,
          text: view.state.sliceDoc(from, to),
        };
      },
      focus: () => {
        viewRef.current?.focus();
      },
      getCoordsAtPos: (pos: number) => {
        const view = viewRef.current;
        if (!view) return null;
        const coords = view.coordsAtPos(pos);
        if (!coords) return null;
        return new DOMRect(
          coords.left,
          coords.top,
          coords.right - coords.left,
          coords.bottom - coords.top
        );
      },
    }));

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
          ...(onFootnoteClick !== undefined
            ? footnoteClickExtension(onFootnoteClickRef)
            : []),
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
      <div
        className={`flex h-full min-h-0 flex-col rounded-lg border border-border bg-panel ${fontClass}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <div className="min-w-0">
            <div className="text-xs font-semibold">{label}</div>
            <div className="text-[10px] text-muted">{sublabel}</div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            <div className="relative">
              <select
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                aria-label={`${label} font size`}
                className="h-6 appearance-none rounded border border-border bg-white py-0 pl-1.5 pr-5 text-[10px] font-medium text-foreground hover:bg-gray-50"
              >
                {fontSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-muted"
                aria-hidden
              />
            </div>
          </div>
        </div>
        <div ref={containerRef} className="min-h-0 flex-1 overflow-hidden" />
        <div className="shrink-0 border-t border-border px-3 py-1.5 text-[10px] text-muted">
          {footerStats ?? "UTF-8"}
        </div>
      </div>
    );
  }
);
