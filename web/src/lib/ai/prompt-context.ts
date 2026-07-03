import { readRepoFile } from "@/lib/files";
import type { GlossaryTerm } from "@/lib/glossary";
import { findTermsInText } from "@/lib/glossary";

const HV_FILES = [
  ".cursor/skills/translate-sino-vietnamese/SKILL.md",
  ".cursor/agents/sino-vietnamese-translator.md",
  ".cursor/rules/project-core.mdc",
  ".cursor/rules/sino-vietnamese-style.mdc",
] as const;

const VI_FILES = [
  ".cursor/skills/translate-buddhist-text/SKILL.md",
  ".cursor/skills/translate-buddhist-text/examples.md",
  ".cursor/agents/translator.md",
  ".cursor/rules/project-core.mdc",
  ".cursor/rules/translation-style.mdc",
  "CONTEXT.md",
  "docs/style-guide.md",
] as const;

const OUTPUT_CONTRACT = `
OUTPUT CONTRACT (mandatory):
- Plain text only — no Markdown headings, no YAML, no commentary
- Translate exactly ONE source line; output ONE line only
- Mark uncertain readings inline as [?]
- Use glossary terms exactly as given
`.trim();

const HV_MODE = `MODE: Hán-Việt (âm dịch) — WORD-BY-WORD (逐字逐詞).
- Translate EACH source character (or glossary-bound compound) to ONE Hán-Việt reading, in STRICT source order.
- Do NOT reorder, skip, merge, or paraphrase. Do NOT use thuần Việt meaning words.
- Ordinals/numbers stay Hán-Việt per character: 第 → đệ, 一 → nhất, 二 → nhị (never "thứ nhất", "thứ hai", "phần một").
- Example: 通達品第一 → "Thông Đạt Phẩm đệ nhất" (NOT "Phẩm Thông Đạt thứ nhất", NOT "Phẩm Thông Đạt phần một").
- Example: 色不異空 → "Sắc bất dị không". Example: 爾時 → "Nhĩ thì".`;

const contextCache = new Map<string, string>();

export function stripFrontmatter(text: string): string {
  return text.replace(/^---[\s\S]*?---\s*/m, "").trim();
}

async function loadFiles(paths: readonly string[]): Promise<string> {
  const parts: string[] = [];
  for (const p of paths) {
    const raw = await readRepoFile(p);
    if (raw.trim()) parts.push(stripFrontmatter(raw));
  }
  return parts.join("\n\n---\n\n");
}

export async function loadPromptContext(layer: "hv" | "vi"): Promise<string> {
  const cached = contextCache.get(layer);
  if (cached) return cached;

  const files = layer === "hv" ? HV_FILES : VI_FILES;
  const context = await loadFiles(files);
  contextCache.set(layer, context);
  return context;
}

export function formatGlossarySnippet(terms: GlossaryTerm[]): string {
  if (terms.length === 0) return "(no matching glossary terms)";
  return terms.map((t) => `${t.zh} → ${t.vi}`).join("\n");
}

export function filterGlossaryForText(
  allTerms: GlossaryTerm[],
  text: string
): GlossaryTerm[] {
  return findTermsInText(text, allTerms);
}

export interface PromptInput {
  zhLine: string;
  hvLine?: string;
  glossary: GlossaryTerm[];
  series: string;
  sourcePath: string;
}

export async function buildHanVietPrompt(
  input: PromptInput
): Promise<{ system: string; user: string }> {
  const context = await loadPromptContext("hv");
  const glossarySnippet = formatGlossarySnippet(input.glossary);

  return {
    system: `${context}\n\n${OUTPUT_CONTRACT}\n\n${HV_MODE}`,
    user: `Series: ${input.series}
Source: ${input.sourcePath}

Glossary (mandatory for bound terms):
${glossarySnippet}

Translate this Classical Chinese line to Sino-Vietnamese (one line out):
${input.zhLine}`,
  };
}

const CHAPTER_OUTPUT_CONTRACT = `
CHAPTER OUTPUT CONTRACT (mandatory):
- Return ONLY a valid JSON array of strings — no markdown fences, no commentary, no file writes
- Array length MUST equal the source line count N exactly
- lines[i] translates source line i (0-based); use "" for blank source lines
- Each element is one plain-text translation line (no headings, no YAML)
- Mark uncertain readings inline as [?]
- Use glossary terms exactly as given
- Do NOT use tools to edit files; respond in the message only
`.trim();

export interface ChapterPromptInput {
  zhParagraphs: string[];
  hvParagraphs?: string[];
  glossary: GlossaryTerm[];
  series: string;
  sourcePath: string;
}

function formatNumberedLines(lines: string[]): string {
  return lines
    .map((line, i) => `${i + 1}. ${line === "" ? "(blank)" : line}`)
    .join("\n");
}

export async function buildHanVietChapterPrompt(
  input: ChapterPromptInput
): Promise<{ system: string; user: string }> {
  const context = await loadPromptContext("hv");
  const glossarySnippet = formatGlossarySnippet(input.glossary);
  const n = input.zhParagraphs.length;

  return {
    system: `${context}\n\n${CHAPTER_OUTPUT_CONTRACT}\n\n${HV_MODE}`,
    user: `Series: ${input.series}
Source: ${input.sourcePath}
Line count N: ${n}

Glossary (mandatory for bound terms):
${glossarySnippet}

Source lines (translate each to one Hán-Việt line, same order):
${formatNumberedLines(input.zhParagraphs)}

Return a JSON array of exactly ${n} strings.`,
  };
}

export async function buildVietnameseChapterPrompt(
  input: ChapterPromptInput
): Promise<{ system: string; user: string }> {
  const context = await loadPromptContext("vi");
  const glossarySnippet = formatGlossarySnippet(input.glossary);
  const hvParagraphs = input.hvParagraphs ?? [];
  const n = input.zhParagraphs.length;

  const paired = input.zhParagraphs
    .map((zh, i) => {
      const hv = hvParagraphs[i]?.trim() || "(none)";
      return `${i + 1}. ZH: ${zh || "(blank)"}\n   HV: ${hv}`;
    })
    .join("\n\n");

  return {
    system: `${context}\n\n${CHAPTER_OUTPUT_CONTRACT}\n\nMODE: Thuần Việt — readable Vietnamese faithful to source and glossary.`,
    user: `Series: ${input.series}
Source: ${input.sourcePath}
Line count N: ${n}

Glossary (mandatory for bound terms):
${glossarySnippet}

Aligned source / Hán-Việt lines:
${paired}

Return a JSON array of exactly ${n} Modern Vietnamese strings.`,
  };
}

export async function buildVietnamesePrompt(
  input: PromptInput
): Promise<{ system: string; user: string }> {
  const context = await loadPromptContext("vi");
  const glossarySnippet = formatGlossarySnippet(input.glossary);
  const hvRef = input.hvLine?.trim()
    ? input.hvLine
    : "(no Hán-Việt reference for this line)";

  return {
    system: `${context}\n\n${OUTPUT_CONTRACT}\n\nMODE: Thuần Việt — readable Vietnamese faithful to source and glossary.`,
    user: `Series: ${input.series}
Source: ${input.sourcePath}

Glossary (mandatory for bound terms):
${glossarySnippet}

Chinese:
${input.zhLine}

Hán-Việt reference (terminology anchor):
${hvRef}

Translate to Modern Vietnamese (one line out):`,
  };
}
