"use client";

import { EditorPane } from "./EditorPane";
import { ScrollSyncProvider } from "./ScrollSyncContext";
import { ParagraphNav, type ParagraphViewMode } from "../paragraphs/ParagraphNav";
import { countChineseChars, countVietnameseWords } from "@/lib/paragraphs";
import { Group, Panel, Separator } from "react-resizable-panels";

interface TranslationWorkspaceProps {
  viewMode: ParagraphViewMode;
  zhParagraph: string;
  hvParagraph: string;
  viParagraph: string;
  paragraphIndex: number;
  totalParagraphs: number;
  atFirstContent: boolean;
  atLastContent: boolean;
  syncScroll: boolean;
  onHvChange: (v: string) => void;
  onViChange: (v: string) => void;
  onSyncScrollChange: (v: boolean) => void;
  onPrev: () => void;
  onNext: () => void;
  onContext?: () => void;
}

const handleClassName =
  "bg-border transition-colors hover:bg-accent data-[separator]:active:bg-accent";

export function TranslationWorkspace({
  viewMode,
  zhParagraph,
  hvParagraph,
  viParagraph,
  paragraphIndex,
  totalParagraphs,
  atFirstContent,
  atLastContent,
  syncScroll,
  onHvChange,
  onViChange,
  onSyncScrollChange,
  onPrev,
  onNext,
  onContext,
}: TranslationWorkspaceProps) {
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
                  badge="read-only"
                  value={zhParagraph}
                  readOnly
                  fontClass="font-han"
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
                  badge="draft"
                  value={hvParagraph}
                  onChange={onHvChange}
                  fontClass="font-vi"
                  footerStats={`${countVietnameseWords(hvParagraph)} words · UTF-8`}
                />
              </Panel>
            </Group>
          </Panel>
          <Separator className={`my-1 h-1 ${handleClassName}`} />
          <Panel defaultSize="45%" minSize="15%" className="min-h-0">
            <EditorPane
              key={`vi-${viewMode}-${paragraphIndex}`}
              paneId="vi"
              label="VI-LATN"
              sublabel="Modern Vietnamese"
              badge="final"
              value={viParagraph}
              onChange={onViChange}
              fontClass="font-vi"
              footerStats={`${countVietnameseWords(viParagraph)} words · UTF-8`}
            />
          </Panel>
        </Group>
      </ScrollSyncProvider>
    </div>
  );
}
