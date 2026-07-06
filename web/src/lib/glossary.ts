import YAML from "yaml";

export type GlossaryLayer = "hv" | "vi";

export interface GlossaryTerm {
  zh: string;
  /** Hán-Việt reading — mandatory for `.hv.md` (âm dịch). */
  hv?: string;
  /** Thuần Việt reading — mandatory for `.vi.md` (readable Vietnamese). */
  vi: string;
  notes?: string;
  sanskrit?: string;
  doctrine?: boolean;
  tags?: string[];
  status?: string;
  alt_vi?: string[];
  compound?: boolean;
}

export interface GlossaryData {
  series?: string;
  terms: GlossaryTerm[];
}

/** Normalized term with both hv and vi guaranteed. */
export type NormalizedGlossaryTerm = GlossaryTerm & { hv: string; vi: string };

/** Normalize legacy entries that only had `vi` (formerly Hán-Việt). */
export function normalizeGlossaryTerm(term: GlossaryTerm): NormalizedGlossaryTerm {
  const hv = term.hv?.trim() || term.vi?.trim() || "";
  const vi = term.vi?.trim() || term.hv?.trim() || "";
  return { ...term, hv, vi };
}

/** Rendering for a translation layer. */
export function getTermRendering(
  term: GlossaryTerm,
  layer: GlossaryLayer
): string {
  const normalized = normalizeGlossaryTerm(term);
  return layer === "hv" ? normalized.hv : normalized.vi;
}

export function parseGlossaryYaml(raw: string): GlossaryTerm[] {
  const all: GlossaryTerm[] = [];
  const chunks = raw.split(/(?=^series:)/m).filter((c) => c.trim());
  const toParse = chunks.length > 0 ? chunks : [raw];
  for (const chunk of toParse) {
    try {
      const parsed = YAML.parse(chunk) as GlossaryData | null;
      if (parsed?.terms && Array.isArray(parsed.terms)) {
        all.push(...parsed.terms.map(normalizeGlossaryTerm));
      }
    } catch {
      /* skip invalid chunk */
    }
  }
  return dedupeTerms(all);
}

export function dedupeByZh(terms: GlossaryTerm[]): GlossaryTerm[] {
  const map = new Map<string, GlossaryTerm>();
  for (const t of terms) {
    if (t?.zh) map.set(t.zh, normalizeGlossaryTerm(t));
  }
  return [...map.values()];
}

function dedupeTerms(terms: GlossaryTerm[]): GlossaryTerm[] {
  return dedupeByZh(terms);
}

/** Longest-match term finder in Chinese text. */
export function findTermsInText(
  text: string,
  terms: GlossaryTerm[]
): GlossaryTerm[] {
  const sorted = [...terms].sort((a, b) => b.zh.length - a.zh.length);
  const found: GlossaryTerm[] = [];
  const used = new Set<string>();
  for (const term of sorted) {
    if (!term.zh || used.has(term.zh)) continue;
    if (text.includes(term.zh)) {
      found.push(term);
      used.add(term.zh);
    }
  }
  return found;
}

export function formatGlossarySnippet(
  terms: GlossaryTerm[],
  layer: GlossaryLayer
): string {
  if (terms.length === 0) return "(no matching glossary terms)";
  const label = layer === "hv" ? "Hán-Việt" : "Thuần Việt";
  return terms
    .map((t) => {
      const rendering = getTermRendering(t, layer);
      return `${t.zh} → ${rendering} (${label})`;
    })
    .join("\n");
}

export function filterTerms(
  terms: GlossaryTerm[],
  query: string
): GlossaryTerm[] {
  if (!query.trim()) return terms;
  const q = query.toLowerCase();
  return terms.filter((t) => {
    const normalized = normalizeGlossaryTerm(t);
    return (
      t.zh.includes(query) ||
      normalized.hv.toLowerCase().includes(q) ||
      normalized.vi.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q) ||
      t.sanskrit?.toLowerCase().includes(q)
    );
  });
}
