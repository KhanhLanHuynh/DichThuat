export interface AlignmentResult {
  aligned: boolean;
  zhCount: number;
  hvCount: number;
  viCount: number;
  message?: string;
}

/** One physical line = one paragraph block (line-aligned with source). */
export function splitParagraphs(content: string): string[] {
  const normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized.trim()) return [""];
  const lines = normalized.split("\n").map((line) => line.trimEnd());
  if (lines.length > 1 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

/** Join line blocks; trim trailing empty padding slots. */
export function joinParagraphs(paragraphs: string[]): string {
  const trimmed = [...paragraphs];
  while (trimmed.length > 0 && !trimmed[trimmed.length - 1].trim()) {
    trimmed.pop();
  }
  return trimmed.join("\n");
}

/** Pad or trim paragraph array to target length. */
export function padParagraphs(
  paragraphs: string[],
  targetLength: number
): string[] {
  const result = [...paragraphs];
  while (result.length < targetLength) result.push("");
  return result.slice(0, targetLength);
}

/** Split full editor text back into line-aligned paragraph slots. */
export function paragraphsFromFullText(
  fullText: string,
  targetLineCount: number
): string[] {
  return padParagraphs(splitParagraphs(fullText), targetLineCount).slice(
    0,
    targetLineCount
  );
}

export function checkAlignment(
  zh: string[],
  hv: string[],
  vi: string[]
): AlignmentResult {
  const zhCount = zh.length;
  const hvCount = hv.length;
  const viCount = vi.length;
  const aligned = zhCount === hvCount && zhCount === viCount;
  let message: string | undefined;
  if (!aligned) {
    message = `ZH ${zhCount} · HV ${hvCount} · VI ${viCount}`;
  }
  return { aligned, zhCount, hvCount, viCount, message };
}

export function countChineseChars(text: string): number {
  return [...text.replace(/\s/g, "")].length;
}

export function countVietnameseWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function paragraphPreview(text: string, maxLen = 48): string {
  const firstLine = text.trim().split("\n")[0] ?? "";
  const t = firstLine.trim();
  if (!t) return "(empty)";
  return t.length > maxLen ? `${t.slice(0, maxLen)}…` : t;
}

/** Indices where any of ZH/HV/VI has non-empty content. */
export function getContentParagraphIndices(
  zhParagraphs: string[],
  hvParagraphs: string[],
  viParagraphs: string[]
): number[] {
  const len = Math.max(
    zhParagraphs.length,
    hvParagraphs.length,
    viParagraphs.length
  );
  return Array.from({ length: len }, (_, i) => i).filter(
    (i) =>
      (zhParagraphs[i] ?? "").trim().length > 0 ||
      (hvParagraphs[i] ?? "").trim().length > 0 ||
      (viParagraphs[i] ?? "").trim().length > 0
  );
}

/** Pad all arrays to the same length (max of inputs). */
export function alignParagraphArrays(
  zh: string[],
  hv: string[],
  vi: string[]
): { zh: string[]; hv: string[]; vi: string[] } {
  const len = Math.max(zh.length, hv.length, vi.length);
  return {
    zh: padParagraphs(zh, len),
    hv: padParagraphs(hv, len),
    vi: padParagraphs(vi, len),
  };
}

export function prevContentParagraphIndex(
  zhParagraphs: string[],
  hvParagraphs: string[],
  viParagraphs: string[],
  current: number
): number {
  const indices = getContentParagraphIndices(
    zhParagraphs,
    hvParagraphs,
    viParagraphs
  );
  const pos = indices.indexOf(current);
  if (pos <= 0) return indices[0] ?? 0;
  return indices[pos - 1];
}

export function nextContentParagraphIndex(
  zhParagraphs: string[],
  hvParagraphs: string[],
  viParagraphs: string[],
  current: number
): number {
  const indices = getContentParagraphIndices(
    zhParagraphs,
    hvParagraphs,
    viParagraphs
  );
  const pos = indices.indexOf(current);
  if (pos < 0) return indices[0] ?? 0;
  if (pos >= indices.length - 1) {
    return indices[indices.length - 1] ?? current;
  }
  return indices[pos + 1];
}

export function isZhParagraphEmpty(
  zhParagraphs: string[],
  index: number
): boolean {
  return (zhParagraphs[index] ?? "").trim().length === 0;
}

export function nearestNonEmptyZhIndex(
  zhParagraphs: string[],
  start: number,
  direction: -1 | 1,
  total: number
): number | null {
  for (let i = start; i >= 0 && i < total; i += direction) {
    if (!isZhParagraphEmpty(zhParagraphs, i)) return i;
  }
  return null;
}

/** Previous / current / next indices for context modal; skips blank ZH lines. */
export function getContextParagraphIndices(
  paragraphIndex: number,
  totalParagraphs: number,
  zhParagraphs: string[]
): number[] {
  const prev = nearestNonEmptyZhIndex(
    zhParagraphs,
    paragraphIndex - 1,
    -1,
    totalParagraphs
  );
  const next = nearestNonEmptyZhIndex(
    zhParagraphs,
    paragraphIndex + 1,
    1,
    totalParagraphs
  );
  const indices: number[] = [];
  if (prev !== null && prev !== paragraphIndex) indices.push(prev);
  indices.push(paragraphIndex);
  if (next !== null && next !== paragraphIndex) indices.push(next);
  return indices;
}

/** Badges for sidebar when only one column has content at this index. */
export function singleLayerBadges(
  zh: string,
  hv: string,
  vi: string
): ("ZH" | "HV" | "VI")[] {
  const hasZh = zh.trim().length > 0;
  const hasHv = hv.trim().length > 0;
  const hasVi = vi.trim().length > 0;
  const count = [hasZh, hasHv, hasVi].filter(Boolean).length;
  if (count !== 1) return [];
  if (hasZh) return ["ZH"];
  if (hasHv) return ["HV"];
  return ["VI"];
}
