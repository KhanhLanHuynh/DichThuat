"use client";

import { useRef } from "react";
import {
  Save,
  Languages,
  User,
  ChevronDown,
  Upload,
  Trash2,
  Download,
  Loader2,
} from "lucide-react";
import {
  translatePhaseLabel,
  type TranslatePhase,
} from "@/components/editor/TranslateOverlay";

interface TopBarProps {
  title: string;
  subtitle?: string;
  lastSaved?: string;
  saving?: boolean;
  sourceFiles: string[];
  selectedSource: string;
  sourceLabel: (path: string) => string;
  loadingSource?: boolean;
  uploading?: boolean;
  removing?: boolean;
  canRemoveSource?: boolean;
  onSourceChange: (path: string) => void;
  onSourceUpload: (file: File) => Promise<void>;
  onSourceRemove: () => Promise<void>;
  onSave: () => void;
  onExportHtml?: () => void;
  onTranslateHv: () => void;
  onTranslateVi: () => void;
  translatingLayer?: "hv" | "vi" | null;
  translateProgress?: { index: number; total: number } | null;
  translateStatus?: TranslatePhase;
  username?: string;
}

export function TopBar({
  title,
  subtitle,
  lastSaved,
  saving,
  sourceFiles,
  selectedSource,
  sourceLabel,
  loadingSource,
  uploading,
  removing,
  canRemoveSource,
  onSourceChange,
  onSourceUpload,
  onSourceRemove,
  onSave,
  onExportHtml,
  onTranslateHv,
  onTranslateVi,
  translatingLayer,
  translateProgress,
  translateStatus,
  username,
}: TopBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const translateDisabled = translatingLayer !== null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await onSourceUpload(file);
  };

  const progressLabel =
    translateProgress && translateProgress.total > 0
      ? ` ${translateProgress.index + 1}/${translateProgress.total}`
      : "";

  const translateTitle =
    translateStatus !== undefined
      ? translatePhaseLabel(translateStatus)
      : undefined;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-panel px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
          DT
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="truncate text-xs text-muted">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".zh.md,text/markdown"
          className="hidden"
          aria-hidden
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loadingSource || saving || uploading || removing}
          title="Upload source file (.zh.md)"
          aria-label="Upload source file"
          className="hidden h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50 sm:flex"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <div className="relative hidden sm:block">
          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={loadingSource || saving || uploading || removing}
            title="Source file"
            aria-label="Source file"
            className="h-8 max-w-[14rem] min-w-[10rem] appearance-none rounded-md border border-border bg-white py-0 pl-2.5 pr-8 text-xs font-medium text-foreground hover:bg-gray-50 disabled:opacity-50"
          >
            {sourceFiles.map((file) => (
              <option key={file} value={file}>
                {sourceLabel(file)}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted"
            aria-hidden
          />
        </div>
        <button
          type="button"
          onClick={onSourceRemove}
          disabled={
            !canRemoveSource ||
            loadingSource ||
            saving ||
            uploading ||
            removing
          }
          title="Remove current source file"
          aria-label="Remove current source file"
          className="hidden h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 sm:flex"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {removing ? "Removing…" : "Remove"}
        </button>
        <div className="hidden items-center gap-1 sm:flex">
          {onExportHtml && (
            <button
              type="button"
              onClick={onExportHtml}
              disabled={saving}
              title="Export VI as HTML preview"
              className="flex h-8 items-center gap-1 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              .html
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onTranslateHv}
          disabled={translateDisabled}
          title={translatingLayer === "hv" ? translateTitle : undefined}
          className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {translatingLayer === "hv" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          {translatingLayer === "hv"
            ? `Hán-Việt…${progressLabel}`
            : "Hán-Việt"}
        </button>
        <button
          type="button"
          onClick={onTranslateVi}
          disabled={translateDisabled}
          title={translatingLayer === "vi" ? translateTitle : undefined}
          className="flex items-center gap-1.5 rounded-md border border-accent bg-white px-3 py-1.5 text-xs font-medium text-accent hover:bg-blue-50 disabled:opacity-50"
        >
          {translatingLayer === "vi" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Languages className="h-3.5 w-3.5" />
          )}
          {translatingLayer === "vi"
            ? `Thuần Việt…${progressLabel}`
            : "Thuần Việt"}
        </button>
        <div className="flex items-center gap-2 border-l border-border pl-3">
          {lastSaved && (
            <span className="hidden text-xs text-muted lg:inline">
              Saved {new Date(lastSaved).toLocaleString()}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <User className="h-4 w-4" />
            {username ?? "Guest"}
          </div>
        </div>
      </div>
    </header>
  );
}
