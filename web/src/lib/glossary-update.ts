import fs from "fs/promises";
import path from "path";
import { resolveContentPath } from "./content-root";
import type { GlossaryTerm } from "./glossary";
import { normalizeGlossaryTerm, parseGlossaryYaml } from "./glossary";
import { callGlossaryExtract } from "./ai/glossary-extract";

export function resolveSeriesGlossaryPath(series: string): string {
  return `glossary/${series}.yaml`;
}

async function readSeriesGlossaryRaw(series: string): Promise<string> {
  const relPath = resolveSeriesGlossaryPath(series);
  try {
    return await fs.readFile(resolveContentPath(relPath), "utf-8");
  } catch {
    return "";
  }
}

function formatTermYaml(term: GlossaryTerm): string {
  const lines: string[] = [`  - zh: ${JSON.stringify(term.zh)}`];
  if (term.hv) {
    lines.push(`    hv: ${JSON.stringify(term.hv)}`);
  }
  lines.push(`    vi: ${JSON.stringify(term.vi)}`);
  if (term.sanskrit) {
    lines.push(`    sanskrit: ${JSON.stringify(term.sanskrit)}`);
  }
  if (term.doctrine) {
    lines.push(`    doctrine: true`);
  }
  if (term.status) {
    lines.push(`    status: ${JSON.stringify(term.status)}`);
  }
  if (term.notes) {
    lines.push(`    notes: ${JSON.stringify(term.notes)}`);
  }
  return lines.join("\n");
}

export async function appendSeriesGlossaryTerms(
  series: string,
  newTerms: GlossaryTerm[]
): Promise<GlossaryTerm[]> {
  if (newTerms.length === 0) return [];

  const relPath = resolveSeriesGlossaryPath(series);
  const fullPath = resolveContentPath(relPath);

  const existingRaw = await readSeriesGlossaryRaw(series);
  const existingTerms = existingRaw.trim()
    ? parseGlossaryYaml(existingRaw)
    : [];
  const existingZh = new Set(existingTerms.map((t) => t.zh));

  const toAdd = newTerms.filter((t) => t.zh && !existingZh.has(t.zh));
  if (toAdd.length === 0) return [];

  const date = new Date().toISOString().slice(0, 10);
  const block = [
    "",
    `  # Auto-added from HV translation ${date}`,
    ...toAdd.map((t) => formatTermYaml(t)),
    "",
  ].join("\n");

  if (!existingRaw.trim()) {
    const header = [
      `# Glossary — ${series}`,
      `# Scope: series-specific terms`,
      "",
      `series: ${series}`,
      "",
      "terms:",
      block.trimEnd(),
      "",
    ].join("\n");
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, header, "utf-8");
  } else {
    await fs.appendFile(fullPath, block, "utf-8");
  }

  return toAdd;
}

export interface ExtractNewGlossaryTermsInput {
  zhParagraphs: string[];
  hvParagraphs: string[];
  existingTerms: GlossaryTerm[];
  series: string;
}

export async function extractNewGlossaryTerms(
  input: ExtractNewGlossaryTermsInput
): Promise<GlossaryTerm[]> {
  const linePairs: { zh: string; hv: string }[] = [];
  const len = Math.max(
    input.zhParagraphs.length,
    input.hvParagraphs.length
  );

  for (let i = 0; i < len; i++) {
    const zh = input.zhParagraphs[i] ?? "";
    const hv = input.hvParagraphs[i] ?? "";
    if (!zh.trim() || !hv.trim()) continue;
    linePairs.push({ zh, hv });
  }

  if (linePairs.length === 0) return [];

  return callGlossaryExtract({
    linePairs,
    existingTerms: input.existingTerms,
    series: input.series,
  });
}

export interface UpdateGlossaryFromHanVietInput {
  zhParagraphs: string[];
  hvParagraphs: string[];
  existingTerms: GlossaryTerm[];
  series: string;
}

export interface UpdateGlossaryFromHanVietResult {
  added: GlossaryTerm[];
  warning?: string;
}

async function readGlossaryRaw(relPath: string): Promise<string> {
  try {
    return await fs.readFile(resolveContentPath(relPath), "utf-8");
  } catch {
    return "";
  }
}

function parseYamlScalar(raw: string): string {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed) as string;
  } catch {
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  }
}

function zhFromTermLine(line: string): string | null {
  const m = line.match(/^  - zh:\s*(.+)$/);
  if (!m) return null;
  return parseYamlScalar(m[1]);
}

function isTermStartLine(line: string): boolean {
  return /^  - zh:/.test(line);
}

function isHvLine(line: string): boolean {
  return /^    hv:/.test(line);
}

function isViLine(line: string): boolean {
  return /^    vi:/.test(line);
}

function formatFieldLine(key: "hv" | "vi", value: string): string {
  return `    ${key}: ${JSON.stringify(value)}`;
}

function glossaryFileContainsTerm(raw: string, zh: string): boolean {
  if (!raw.trim()) return false;
  const terms = parseGlossaryYaml(raw);
  return terms.some((t) => t.zh === zh);
}

/** Find the glossary file that owns a term (series-specific wins over shared). */
export async function findGlossaryFileForTerm(
  glossaryPaths: string[],
  zh: string
): Promise<string | null> {
  for (const relPath of [...glossaryPaths].reverse()) {
    const raw = await readGlossaryRaw(relPath);
    if (glossaryFileContainsTerm(raw, zh)) return relPath;
  }
  return null;
}

function updateTermBlockInRaw(
  raw: string,
  zh: string,
  hv: string,
  vi: string
): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  let i = 0;
  let found = false;

  while (i < lines.length) {
    const line = lines[i];
    if (!isTermStartLine(line)) {
      out.push(line);
      i++;
      continue;
    }

    const blockZh = zhFromTermLine(line);
    const block: string[] = [line];
    i++;

    while (i < lines.length && !isTermStartLine(lines[i])) {
      block.push(lines[i]);
      i++;
    }

    if (blockZh === zh) {
      found = true;
      let hvIdx = block.findIndex((l, idx) => idx > 0 && isHvLine(l));
      let viIdx = block.findIndex((l, idx) => idx > 0 && isViLine(l));

      const hvLine = formatFieldLine("hv", hv);
      const viLine = formatFieldLine("vi", vi);

      if (hvIdx >= 0) {
        block[hvIdx] = hvLine;
      } else if (viIdx >= 0) {
        block.splice(viIdx, 0, hvLine);
        viIdx++;
      } else {
        block.splice(1, 0, hvLine);
      }

      viIdx = block.findIndex((l, idx) => idx > 0 && isViLine(l));
      if (viIdx >= 0) {
        block[viIdx] = viLine;
      } else {
        const newHvIdx = block.findIndex((l, idx) => idx > 0 && isHvLine(l));
        block.splice(newHvIdx + 1, 0, viLine);
      }
    }

    out.push(...block);
  }

  if (!found) {
    throw new Error(`Glossary term not found: ${zh}`);
  }

  let result = out.join("\n");
  if (!result.endsWith("\n")) result += "\n";
  return result;
}

/** Update hv/vi for an existing term in the glossary file that owns it. */
export async function updateGlossaryTerm(
  glossaryPaths: string[],
  zh: string,
  hv: string,
  vi: string
): Promise<GlossaryTerm> {
  const relPath = await findGlossaryFileForTerm(glossaryPaths, zh);
  if (!relPath) {
    throw new Error(`Glossary term not found: ${zh}`);
  }

  const fullPath = resolveContentPath(relPath);
  const raw = await readGlossaryRaw(relPath);
  const updated = updateTermBlockInRaw(raw, zh, hv.trim(), vi.trim());
  await fs.writeFile(fullPath, updated, "utf-8");

  const terms = parseGlossaryYaml(updated);
  const term = terms.find((t) => t.zh === zh);
  if (!term) {
    throw new Error(`Failed to read updated term: ${zh}`);
  }
  return normalizeGlossaryTerm(term);
}

export async function updateGlossaryFromHanViet(
  input: UpdateGlossaryFromHanVietInput
): Promise<UpdateGlossaryFromHanVietResult> {
  try {
    const extracted = await extractNewGlossaryTerms({
      zhParagraphs: input.zhParagraphs,
      hvParagraphs: input.hvParagraphs,
      existingTerms: input.existingTerms,
      series: input.series,
    });

    if (extracted.length === 0) {
      return { added: [] };
    }

    const added = await appendSeriesGlossaryTerms(input.series, extracted);
    return { added };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Glossary update failed";
    console.error("[glossary-update]", message);
    return { added: [], warning: message };
  }
}
