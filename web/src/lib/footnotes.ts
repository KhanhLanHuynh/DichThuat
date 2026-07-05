import { joinParagraphs, splitParagraphs } from "./paragraphs";

export const FOOTNOTES_MARKER = "<!-- footnotes -->";

/** Inline reference `[^id]` — not a definition line. */
const INLINE_REF_RE = /\[\^([\w-]+)\](?!:)/g;

const DEF_LINE_RE = /^\[\^([\w-]+)\]:\s(.*)$/;

export interface FootnoteDefinition {
  id: string;
  text: string;
}

export interface FootnoteValidation {
  ok: boolean;
  orphans: string[];
  unused: string[];
  empty: string[];
}

function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function extractTrailingFootnoteBlock(text: string): {
  bodyText: string;
  footnoteBlock: string;
} {
  const lines = normalizeNewlines(text).split("\n");
  let i = lines.length - 1;

  while (i >= 0 && lines[i].trimEnd() === "") i--;

  const footnoteLineIndices: number[] = [];

  while (i >= 0) {
    const trimmed = lines[i].trim();
    if (trimmed === "") {
      if (footnoteLineIndices.length > 0) {
        i--;
        continue;
      }
      break;
    }
    if (DEF_LINE_RE.test(trimmed)) {
      footnoteLineIndices.unshift(i);
      i--;
    } else {
      break;
    }
  }

  if (footnoteLineIndices.length === 0) {
    return { bodyText: text.replace(/\n+$/, ""), footnoteBlock: "" };
  }

  const firstFnIdx = footnoteLineIndices[0];
  let bodyEnd = firstFnIdx;
  while (bodyEnd > 0 && lines[bodyEnd - 1].trim() === "") bodyEnd--;

  return {
    bodyText: lines.slice(0, bodyEnd).join("\n"),
    footnoteBlock: footnoteLineIndices.map((idx) => lines[idx]).join("\n"),
  };
}

/** Split VI markdown body (post-frontmatter) into translation lines and footnote appendix. */
export function splitViBodyAndFootnotes(rawContent: string): {
  bodyParagraphs: string[];
  footnoteBlock: string;
} {
  const text = normalizeNewlines(rawContent);
  const markerIdx = text.indexOf(FOOTNOTES_MARKER);

  let bodyText: string;
  let footnoteBlock: string;

  if (markerIdx >= 0) {
    bodyText = text.slice(0, markerIdx).replace(/\n+$/, "");
    footnoteBlock = text
      .slice(markerIdx + FOOTNOTES_MARKER.length)
      .replace(/^\n+/, "")
      .replace(/\n+$/, "");
  } else {
    const extracted = extractTrailingFootnoteBlock(text);
    bodyText = extracted.bodyText;
    footnoteBlock = extracted.footnoteBlock;
  }

  return {
    bodyParagraphs: splitParagraphs(bodyText),
    footnoteBlock,
  };
}

/** Join body paragraphs with optional footnote appendix for save. */
export function joinViBodyAndFootnotes(
  bodyParagraphs: string[],
  footnoteBlock: string
): string {
  const body = joinParagraphs(bodyParagraphs);
  const trimmedFn = footnoteBlock.trim();
  if (!trimmedFn) return body;
  return `${body}\n\n${FOOTNOTES_MARKER}\n${trimmedFn}`;
}

/** Parse `[^id]: text` lines from the footnote block. */
export function parseFootnoteDefinitions(
  footnoteBlock: string
): FootnoteDefinition[] {
  const defs: FootnoteDefinition[] = [];
  for (const line of normalizeNewlines(footnoteBlock).split("\n")) {
    if (!line.trim()) continue;
    const match = line.match(DEF_LINE_RE);
    if (match) {
      defs.push({ id: match[1], text: match[2] ?? "" });
    }
  }
  return defs;
}

/** Serialize definitions back to footnote block text (no marker). */
export function serializeFootnoteBlock(defs: FootnoteDefinition[]): string {
  return defs.map((d) => `[^${d.id}]: ${d.text}`).join("\n");
}

export interface FootnoteRefMatch {
  id: string;
  from: number;
  to: number;
}

/** Find inline `[^id]` reference containing `pos`, if any. */
export function findFootnoteRefAtPos(
  bodyText: string,
  pos: number
): FootnoteRefMatch | null {
  const re = new RegExp(INLINE_REF_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(bodyText)) !== null) {
    const from = match.index;
    const to = from + match[0].length;
    if (pos >= from && pos <= to) {
      return { id: match[1], from, to };
    }
  }
  return null;
}

/** Collect inline `[^id]` references from body text. */
export function collectFootnoteRefs(bodyText: string): Set<string> {
  const refs = new Set<string>();
  const re = new RegExp(INLINE_REF_RE.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(bodyText)) !== null) {
    refs.add(match[1]);
  }
  return refs;
}

export function validateFootnoteRefs(
  bodyText: string,
  footnoteBlock: string
): FootnoteValidation {
  const defs = parseFootnoteDefinitions(footnoteBlock);
  const defIds = new Set(defs.map((d) => d.id));
  const refIds = collectFootnoteRefs(bodyText);

  const orphans = [...refIds].filter((id) => !defIds.has(id));
  const unused = [...defIds].filter((id) => !refIds.has(id));
  const empty = defs.filter((d) => !d.text.trim()).map((d) => d.id);

  return {
    ok: orphans.length === 0 && empty.length === 0,
    orphans,
    unused,
    empty,
  };
}

/** Collect all footnote ids (numeric and label) from body + definitions. */
function collectAllFootnoteIds(
  bodyText: string,
  footnoteBlock: string
): Set<string> {
  const ids = new Set<string>();
  for (const id of collectFootnoteRefs(bodyText)) ids.add(id);
  for (const def of parseFootnoteDefinitions(footnoteBlock)) ids.add(def.id);
  return ids;
}

/** Next numeric footnote id for auto-increment (per chapter). */
export function nextFootnoteId(bodyText: string, footnoteBlock: string): string {
  const ids = collectAllFootnoteIds(bodyText, footnoteBlock);
  let max = 0;
  for (const id of ids) {
    const n = parseInt(id, 10);
    if (!Number.isNaN(n) && n > max) max = n;
  }
  return String(max + 1);
}

/** Insert `[^id]` after selection end; preserves line (same paragraph). */
export function insertFootnoteMarker(
  paragraph: string,
  selectionStart: number,
  selectionEnd: number,
  id: string
): string {
  const marker = `[^${id}]`;
  return paragraph.slice(0, selectionEnd) + marker + paragraph.slice(selectionEnd);
}

/** Build full markdown source for preview/export (body + footnotes). */
export function buildViMarkdownForRender(
  bodyParagraphs: string[],
  footnoteBlock: string
): string {
  return joinViBodyAndFootnotes(bodyParagraphs, footnoteBlock);
}

/** Count footnote definitions in block. */
export function footnoteCount(footnoteBlock: string): number {
  return parseFootnoteDefinitions(footnoteBlock).length;
}

/** Append a new definition line to footnote block. */
export function appendFootnoteDefinition(
  footnoteBlock: string,
  id: string,
  text = ""
): string {
  const line = `[^${id}]: ${text}`;
  const trimmed = footnoteBlock.trim();
  return trimmed ? `${trimmed}\n${line}` : line;
}

/** Update or remove a definition by id. */
export function updateFootnoteDefinition(
  footnoteBlock: string,
  id: string,
  text: string
): string {
  const defs = parseFootnoteDefinitions(footnoteBlock);
  const idx = defs.findIndex((d) => d.id === id);
  if (idx >= 0) {
    defs[idx] = { id, text };
  } else {
    defs.push({ id, text });
  }
  return serializeFootnoteBlock(defs);
}

export function removeFootnoteDefinition(
  footnoteBlock: string,
  id: string
): string {
  const defs = parseFootnoteDefinitions(footnoteBlock).filter((d) => d.id !== id);
  return serializeFootnoteBlock(defs);
}

function inlineRefReForId(id: string): RegExp {
  return new RegExp(`\\[\\^${id}\\](?!:)`, "g");
}

/** Remove all inline `[^id]` markers from a single text string. */
export function removeFootnoteRefsFromText(text: string, id: string): string {
  return text.replace(inlineRefReForId(id), "");
}

/** Remove `[^id]` markers from each body paragraph (line-aligned). */
export function removeFootnoteRefsFromParagraphs(
  paragraphs: string[],
  id: string
): string[] {
  return paragraphs.map((p) => removeFootnoteRefsFromText(p, id));
}
