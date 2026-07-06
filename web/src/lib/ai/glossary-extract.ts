import type { GlossaryTerm } from "@/lib/glossary";
import { runCursorAgent } from "./translate";

const MAX_TERMS = 30;

const SYSTEM_PROMPT = `You extract Buddhist Chinese terminology pairs from aligned source/Hán-Việt translation lines.

Return ONLY valid JSON: { "terms": [ { "zh", "hv", "vi?", "notes?", "sanskrit?", "doctrine?", "compound?", "alt_vi?" } ] }

Rules:
- Include ONLY terms NOT already in the provided existing glossary (by zh key).
- Priority: doctrinal compounds, proper names, titles, fixed phrases, Sanskrit transliterations.
- Skip common function words (之, 而, 以, 故, 說, 見, 得) unless part of a fixed compound.
- hv must be the exact Hán-Việt reading used in the translation (âm dịch or compound unit).
- vi (optional): thuần Việt gloss when it differs from hv; omit or equal hv when the same.
- Prefer established Hán Việt; capitalization per terminology doc (Bát nhã ba la mật, Đại Bồ tát, Tỳ kheo).
- compound: true for semantic units (菩薩摩訶薩, 般若波羅蜜) that override word-by-word.
- alt_vi for forbidden forms (e.g. Giác hữu tình, nam cư sĩ for 比丘).
- Monastic ranks: Tỳ kheo, Sa di, Ưu bà tắc — not nam/nữ cư sĩ.
- No hyphens in hv/vi.
- doctrine: true for doctrinal technical terms.
- Maximum ${MAX_TERMS} new terms per response.
- If no new terms, return { "terms": [] }.
- Do NOT use tools to edit files; respond in the message only.`.trim();

const VI_SYSTEM_PROMPT = `You extract Buddhist Chinese terminology from aligned source/Hán-Việt/thuần Việt translation lines.

Return ONLY valid JSON: { "terms": [ { "zh", "hv", "vi", "notes?", "sanskrit?", "doctrine?", "compound?", "alt_vi?" } ] }

Rules:
- Include ONLY terms NOT already in the provided existing glossary (by zh key).
- Priority: doctrinal compounds, proper names, titles, fixed phrases, Sanskrit transliterations.
- Skip common function words (之, 而, 以, 故, 說, 見, 得) unless part of a fixed compound.
- vi must be the exact thuần Việt reading used in the VI line.
- hv must be the exact Hán-Việt reading from the HV reference line (same paragraph).
- Capitalization per terminology doc (Bát nhã ba la mật, ba la mật, Bồ tát, Đại Bồ tát).
- compound: true for semantic compounds; alt_vi for forbidden synonyms.
- No hyphens in hv/vi.
- doctrine: true for doctrinal technical terms.
- Maximum ${MAX_TERMS} new terms per response.
- If no new terms, return { "terms": [] }.
- Do NOT use tools to edit files; respond in the message only.`.trim();

export interface LinePair {
  zh: string;
  hv: string;
}

export interface ViLinePair {
  zh: string;
  hv: string;
  vi: string;
}

export interface ExtractGlossaryInput {
  linePairs: LinePair[];
  existingTerms: GlossaryTerm[];
  series: string;
}

interface RawExtractedTerm {
  zh?: string;
  hv?: string;
  vi?: string;
  notes?: string;
  sanskrit?: string;
  doctrine?: boolean;
}

interface ExtractResponse {
  terms?: RawExtractedTerm[];
}

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenceMatch?.[1] ?? trimmed).trim();
}

export async function callGlossaryExtract(
  input: ExtractGlossaryInput
): Promise<GlossaryTerm[]> {
  const existingZh = new Set(input.existingTerms.map((t) => t.zh));
  const zhFull = input.linePairs.map((p) => p.zh).join("\n");

  const pairsText = input.linePairs
    .map((p, i) => `${i + 1}. ZH: ${p.zh}\n   HV: ${p.hv}`)
    .join("\n\n");

  const existingList =
    input.existingTerms.length > 0
      ? input.existingTerms.map((t) => t.zh).join(", ")
      : "(none)";

  const user = `Series: ${input.series}

Existing glossary zh keys (do NOT re-propose these):
${existingList}

Aligned source / Hán-Việt lines:
${pairsText}

Extract new terminology pairs (max ${MAX_TERMS}):`;

  const content = await runCursorAgent(SYSTEM_PROMPT, user);
  let parsed: ExtractResponse;
  try {
    parsed = JSON.parse(extractJsonObject(content)) as ExtractResponse;
  } catch {
    return [];
  }

  const raw = Array.isArray(parsed.terms) ? parsed.terms : [];
  const validated: GlossaryTerm[] = [];

  for (const item of raw) {
    const zh = item.zh?.trim();
    const hv = (item.hv ?? item.vi)?.trim();
    if (!zh || !hv) continue;
    if (existingZh.has(zh)) continue;
    if (!zhFull.includes(zh)) continue;
    if (!validateHvInTranslation(zh, hv, input.linePairs)) continue;

    const vi = normalizeVi(item.vi?.trim() || hv);

    validated.push({
      zh,
      hv: normalizeVi(hv),
      vi,
      notes: item.notes?.trim() || "auto-extracted from HV translation",
      sanskrit: item.sanskrit?.trim() || undefined,
      doctrine: item.doctrine === true ? true : undefined,
      status: "draft",
    });

    if (validated.length >= MAX_TERMS) break;
  }

  return validated;
}

export interface ExtractGlossaryFromViInput {
  linePairs: ViLinePair[];
  existingTerms: GlossaryTerm[];
  series: string;
}

export async function callGlossaryExtractFromVi(
  input: ExtractGlossaryFromViInput
): Promise<GlossaryTerm[]> {
  const existingZh = new Set(input.existingTerms.map((t) => t.zh));
  const zhFull = input.linePairs.map((p) => p.zh).join("\n");

  const pairsText = input.linePairs
    .map(
      (p, i) =>
        `${i + 1}. ZH: ${p.zh}\n   HV: ${p.hv}\n   VI: ${p.vi}`
    )
    .join("\n\n");

  const existingList =
    input.existingTerms.length > 0
      ? input.existingTerms.map((t) => t.zh).join(", ")
      : "(none)";

  const user = `Series: ${input.series}

Existing glossary zh keys (do NOT re-propose these):
${existingList}

Aligned source / Hán-Việt / thuần Việt lines:
${pairsText}

Extract new terminology triples (max ${MAX_TERMS}):`;

  const content = await runCursorAgent(VI_SYSTEM_PROMPT, user);
  let parsed: ExtractResponse;
  try {
    parsed = JSON.parse(extractJsonObject(content)) as ExtractResponse;
  } catch {
    return [];
  }

  const raw = Array.isArray(parsed.terms) ? parsed.terms : [];
  const validated: GlossaryTerm[] = [];

  for (const item of raw) {
    const zh = item.zh?.trim();
    const hv = item.hv?.trim();
    const vi = item.vi?.trim();
    if (!zh || !hv || !vi) continue;
    if (existingZh.has(zh)) continue;
    if (!zhFull.includes(zh)) continue;
    if (!validateHvInTranslation(zh, hv, input.linePairs)) continue;
    if (!validateViInTranslation(zh, vi, input.linePairs)) continue;

    validated.push({
      zh,
      hv: normalizeVi(hv),
      vi: normalizeVi(vi),
      notes: item.notes?.trim() || "auto-extracted from VI translation",
      sanskrit: item.sanskrit?.trim() || undefined,
      doctrine: item.doctrine === true ? true : undefined,
      status: "draft",
    });

    if (validated.length >= MAX_TERMS) break;
  }

  return validated;
}

function normalizeVi(vi: string): string {
  return vi.replace(/-/g, " ").replace(/\s+/g, " ").trim();
}

/** Reading must appear in the target line of a pair whose zh contains zh. */
function validateReadingInLine(
  zh: string,
  reading: string,
  linePairs: { zh: string; line: string }[]
): boolean {
  const readingLower = reading.toLowerCase();
  const readingWords = readingLower.split(/\s+/).filter(Boolean);

  for (const pair of linePairs) {
    if (!pair.zh.includes(zh)) continue;
    const lineLower = pair.line.toLowerCase();
    if (lineLower.includes(readingLower)) return true;
    if (
      readingWords.length > 1 &&
      readingWords.every((w) => lineLower.includes(w))
    ) {
      return true;
    }
  }
  return false;
}

/** hv (or its lowercase form) must appear in an HV line that contains zh. */
function validateHvInTranslation(
  zh: string,
  hv: string,
  linePairs: Pick<LinePair, "zh" | "hv">[]
): boolean {
  return validateReadingInLine(
    zh,
    hv,
    linePairs.map((p) => ({ zh: p.zh, line: p.hv }))
  );
}

/** vi must appear in a VI line that contains zh. */
function validateViInTranslation(
  zh: string,
  vi: string,
  linePairs: ViLinePair[]
): boolean {
  return validateReadingInLine(
    zh,
    vi,
    linePairs.map((p) => ({ zh: p.zh, line: p.vi }))
  );
}
