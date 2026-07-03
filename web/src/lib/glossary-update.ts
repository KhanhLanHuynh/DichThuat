import fs from "fs/promises";
import path from "path";
import { resolveContentPath } from "./content-root";
import type { GlossaryTerm } from "./glossary";
import { parseGlossaryYaml } from "./glossary";
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
