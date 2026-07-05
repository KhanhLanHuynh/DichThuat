"use client";

interface StatusBarProps {
  projectName: string;
  sourceEdition?: string;
  zhChars: number;
  viWords: number;
  footnoteCount?: number;
  synced: boolean;
  alignmentWarning?: string;
  footnoteWarning?: string;
}

export function StatusBar({
  projectName,
  sourceEdition,
  zhChars,
  viWords,
  footnoteCount = 0,
  synced,
  alignmentWarning,
  footnoteWarning,
}: StatusBarProps) {
  return (
    <footer className="flex h-9 shrink-0 items-center justify-between border-t border-border bg-panel px-4 text-xs text-muted">
      <div className="flex items-center gap-3">
        <span>
          Project: <strong className="font-medium text-foreground">{projectName}</strong>
        </span>
        {sourceEdition && <span>Ref: {sourceEdition}</span>}
        <span>ZH {zhChars.toLocaleString()} chars</span>
        <span>VI {viWords.toLocaleString()} words</span>
        {footnoteCount > 0 && (
          <span>{footnoteCount} footnote{footnoteCount === 1 ? "" : "s"}</span>
        )}
        {alignmentWarning && (
          <span className="text-amber-600">⚠ {alignmentWarning}</span>
        )}
        {footnoteWarning && (
          <span className="text-amber-600">⚠ {footnoteWarning}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 ${synced ? "text-green-600" : "text-amber-600"}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${synced ? "bg-green-500" : "bg-amber-500"}`} />
          {synced ? "All changes saved" : "Unsaved changes"}
        </span>
      </div>
    </footer>
  );
}
