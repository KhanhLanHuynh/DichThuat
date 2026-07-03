"use client";

import { Loader2 } from "lucide-react";

export type TranslatePhase =
  | "connecting"
  | "preparing"
  | "translating"
  | "glossary"
  | "applying";

const PHASE_MESSAGES: Record<TranslatePhase, string> = {
  connecting: "Đang kết nối…",
  preparing: "Đang chuẩn bị ngữ cảnh và thuật ngữ…",
  translating: "Đang gọi Cursor để dịch (có thể mất vài phút)…",
  glossary: "Đang cập nhật từ điển thuật ngữ…",
  applying: "Đang áp dụng bản dịch…",
};

const LAYER_TITLES: Record<"hv" | "vi", string> = {
  hv: "Đang dịch Hán-Việt",
  vi: "Đang dịch Thuần Việt",
};

interface TranslateOverlayProps {
  layer: "hv" | "vi";
  phase: TranslatePhase;
  progress?: { index: number; total: number } | null;
}

export function translatePhaseLabel(phase: TranslatePhase): string {
  return PHASE_MESSAGES[phase];
}

export function TranslateOverlay({
  layer,
  phase,
  progress,
}: TranslateOverlayProps) {
  const progressLabel =
    progress && progress.total > 0
      ? `Đoạn ${progress.index + 1} / ${progress.total}`
      : null;

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-border bg-panel px-8 py-6 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden />
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            {LAYER_TITLES[layer]}
          </p>
          <p className="mt-1 text-xs text-muted">{PHASE_MESSAGES[phase]}</p>
          {progressLabel && (
            <p className="mt-2 text-xs font-medium text-accent">
              {progressLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
