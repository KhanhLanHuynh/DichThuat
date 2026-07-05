"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookMarked, Eye, Pencil } from "lucide-react";
import { EditorPane, type EditorPaneHandle } from "./EditorPane";
import { FootnoteEditPopover } from "./FootnoteEditPopover";
import { FootnotePreview } from "./FootnotePreview";
import { ScrollSyncProvider, type ScrollPaneId } from "./ScrollSyncContext";
import { ParagraphNav, type ParagraphViewMode } from "../paragraphs/ParagraphNav";
import {
  countChineseChars,
  countVietnameseWords,
  joinParagraphs,
} from "@/lib/paragraphs";
import {
  appendFootnoteDefinition,
  collectFootnoteRefs,
  insertFootnoteMarker,
  nextFootnoteId,
  parseFootnoteDefinitions,
  updateFootnoteDefinition,
} from "@/lib/footnotes";
import { Group, Panel, Separator } from "react-resizable-panels";

interface TranslationWorkspaceProps {
  viewMode: ParagraphViewMode;
  zhParagraph: string;
  hvParagraph: string;
  viParagraph: string;
  viParagraphs: string[];
  viFootnotes: string;
  onHvChange: (v: string) => void;
  onViChange: (v: string) => void;
  onViFootnotesChange: (block: string) => void;
  onFootnoteDelete: (id: string) => void;
  paragraphIndex: number;
  totalParagraphs: number;
  atFirstContent: boolean;
  atLastContent: boolean;
  syncScroll: boolean;
  onSyncScrollChange: (v: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onContext?: () => void;
  onInsertFootnoteRef?: React.MutableRefObject<(() => void) | null>;
}

const handleClassName =
  "bg-border transition-colors hover:bg-accent data-[separator]:active:bg-accent";

type ViViewMode = "edit" | "preview";

interface OpenFootnote {
  id: string;
  anchor: DOMRect;
}

export function TranslationWorkspace({
  viewMode,
  zhParagraph,
  hvParagraph,
  viParagraph,
  viParagraphs,
  viFootnotes,
  onHvChange,
  onViChange,
  onViFootnotesChange,
  onFootnoteDelete,
  paragraphIndex,
  totalParagraphs,
  atFirstContent,
  atLastContent,
  syncScroll,
  onSyncScrollChange,
  onPrev,
  onNext,
  onContext,
  onInsertFootnoteRef,
}: TranslationWorkspaceProps) {
  const [fontSizes, setFontSizes] = useState<Record<ScrollPaneId, number>>({
    zh: 15,
    hv: 15,
    vi: 15,
  });
  const [viViewMode, setViViewMode] = useState<ViViewMode>("edit");
  const [openFootnote, setOpenFootnote] = useState<OpenFootnote | null>(null);
  const viEditorRef = useRef<EditorPaneHandle>(null);
  const pendingOpenRef = useRef<{ id: string; markerPos: number } | null>(null);

  const referencedIds = useMemo(
    () => [...collectFootnoteRefs(joinParagraphs(viParagraphs))],
    [viParagraphs]
  );

  const footnoteDefs = useMemo(
    () => parseFootnoteDefinitions(viFootnotes),
    [viFootnotes]
  );

  const setFontSize = (paneId: ScrollPaneId, size: number) => {
    setFontSizes((s) => ({ ...s, [paneId]: size }));
  };

  const handleFootnoteClick = useCallback((id: string, anchor: DOMRect) => {
    setOpenFootnote({ id, anchor });
  }, []);

  const handleInsertFootnote = useCallback(() => {
    if (viViewMode === "preview") return;
    const sel = viEditorRef.current?.getSelection();
    if (!sel) return;

    const bodyText = joinParagraphs(viParagraphs);
    const id = nextFootnoteId(bodyText, viFootnotes);
    const newParagraph = insertFootnoteMarker(
      viParagraph,
      sel.from,
      sel.to,
      id
    );
    pendingOpenRef.current = { id, markerPos: sel.to };
    onViChange(newParagraph);
    onViFootnotesChange(appendFootnoteDefinition(viFootnotes, id));
    setViViewMode("edit");
  }, [
    viViewMode,
    viParagraphs,
    viFootnotes,
    viParagraph,
    onViChange,
    onViFootnotesChange,
  ]);

  useEffect(() => {
    const pending = pendingOpenRef.current;
    if (!pending) return;
    requestAnimationFrame(() => {
      const coords = viEditorRef.current?.getCoordsAtPos(pending.markerPos);
      if (coords) {
        setOpenFootnote({ id: pending.id, anchor: coords });
      }
      pendingOpenRef.current = null;
    });
  }, [viParagraph]);

  useEffect(() => {
    if (onInsertFootnoteRef) {
      onInsertFootnoteRef.current = handleInsertFootnote;
    }
  }, [handleInsertFootnote, onInsertFootnoteRef]);

  const openFootnoteText =
    footnoteDefs.find((d) => d.id === openFootnote?.id)?.text ?? "";

  const viHeaderActions = (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleInsertFootnote}
        disabled={viViewMode === "preview"}
        title="Insert footnote (Ctrl+Shift+F)"
        className="flex h-6 items-center gap-1 rounded border border-border px-1.5 text-[10px] font-medium hover:bg-gray-50 disabled:opacity-40"
      >
        <BookMarked className="h-3 w-3" />
        <span className="hidden sm:inline">Insert footnote</span>
      </button>
      <button
        type="button"
        onClick={() =>
          setViViewMode((m) => (m === "edit" ? "preview" : "edit"))
        }
        title={viViewMode === "edit" ? "Preview footnotes" : "Edit"}
        className="flex h-6 items-center gap-1 rounded border border-border px-1.5 text-[10px] font-medium hover:bg-gray-50"
      >
        {viViewMode === "edit" ? (
          <>
            <Eye className="h-3 w-3" />
            <span className="hidden sm:inline">Preview</span>
          </>
        ) : (
          <>
            <Pencil className="h-3 w-3" />
            <span className="hidden sm:inline">Edit</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ParagraphNav
        viewMode={viewMode}
        paragraphIndex={paragraphIndex}
        total={totalParagraphs}
        atFirstContent={atFirstContent}
        atLastContent={atLastContent}
        syncScroll={syncScroll}
        onSyncScrollChange={onSyncScrollChange}
        onPrev={onPrev}
        onNext={onNext}
        onContext={onContext}
      />
      <ScrollSyncProvider enabled={viewMode === "all" && syncScroll}>
        <Group
          id="dichthuat-workspace-v"
          orientation="vertical"
          className="min-h-0 flex-1 p-2"
        >
          <Panel defaultSize="55%" minSize="20%" className="min-h-0">
            <Group
              id="dichthuat-workspace-h"
              orientation="horizontal"
              className="h-full"
            >
              <Panel defaultSize="50%" minSize="15%" className="min-h-0 pr-1">
                <EditorPane
                  key={`zh-${viewMode}-${paragraphIndex}`}
                  paneId="zh"
                  label="ZH-HANS"
                  sublabel="Classical Chinese"
                  value={zhParagraph}
                  readOnly
                  fontClass="font-han"
                  fontSize={fontSizes.zh}
                  onFontSizeChange={(size) => setFontSize("zh", size)}
                  footerStats={`${countChineseChars(zhParagraph)} chars · UTF-8`}
                />
              </Panel>
              <Separator className={`mx-0.5 w-1 ${handleClassName}`} />
              <Panel defaultSize="50%" minSize="15%" className="min-h-0 pl-1">
                <EditorPane
                  key={`hv-${viewMode}-${paragraphIndex}`}
                  paneId="hv"
                  label="VI-HÁN"
                  sublabel="Sino-Vietnamese Translit"
                  value={hvParagraph}
                  onChange={onHvChange}
                  fontClass="font-vi"
                  fontSize={fontSizes.hv}
                  onFontSizeChange={(size) => setFontSize("hv", size)}
                  footerStats={`${countVietnameseWords(hvParagraph)} words · UTF-8`}
                />
              </Panel>
            </Group>
          </Panel>
          <Separator className={`my-1 h-1 ${handleClassName}`} />
          <Panel defaultSize="45%" minSize="15%" className="min-h-0">
            {viViewMode === "edit" ? (
              <EditorPane
                ref={viEditorRef}
                key={`vi-${viewMode}-${paragraphIndex}`}
                paneId="vi"
                label="VI-LATN"
                sublabel="Modern Vietnamese"
                value={viParagraph}
                onChange={onViChange}
                fontClass="font-vi"
                fontSize={fontSizes.vi}
                onFontSizeChange={(size) => setFontSize("vi", size)}
                footerStats={`${countVietnameseWords(viParagraph)} words · UTF-8`}
                headerActions={viHeaderActions}
                onFootnoteClick={handleFootnoteClick}
              />
            ) : (
              <div className="flex h-full min-h-0 flex-col rounded-lg border border-border bg-panel font-vi">
                <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
                  <div>
                    <div className="text-xs font-semibold">VI-LATN</div>
                    <div className="text-[10px] text-muted">Preview</div>
                  </div>
                  {viHeaderActions}
                </div>
                <FootnotePreview
                  bodyParagraphs={
                    viewMode === "all" ? viParagraphs : [viParagraph]
                  }
                  footnoteBlock={viFootnotes}
                  className="min-h-0 flex-1 font-vi"
                  onFootnoteClick={handleFootnoteClick}
                />
              </div>
            )}
          </Panel>
        </Group>
      </ScrollSyncProvider>
      {openFootnote && (
        <FootnoteEditPopover
          id={openFootnote.id}
          text={openFootnoteText}
          anchor={openFootnote.anchor}
          referenced={referencedIds.includes(openFootnote.id)}
          onChange={(text) =>
            onViFootnotesChange(
              updateFootnoteDefinition(viFootnotes, openFootnote.id, text)
            )
          }
          onDelete={() => onFootnoteDelete(openFootnote.id)}
          onClose={() => setOpenFootnote(null)}
        />
      )}
    </div>
  );
}
