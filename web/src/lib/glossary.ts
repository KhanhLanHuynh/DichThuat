import YAML from "yaml";

export interface GlossaryTerm {
  zh: string;
  vi: string;
  notes?: string;
  sanskrit?: string;
  doctrine?: boolean;
  tags?: string[];
  status?: string;
}

export interface GlossaryData {
  series?: string;
  terms: GlossaryTerm[];
}

export function parseGlossaryYaml(raw: string): GlossaryTerm[] {
  const all: GlossaryTerm[] = [];
  const chunks = raw.split(/(?=^series:)/m).filter((c) => c.trim());
  const toParse = chunks.length > 0 ? chunks : [raw];
  for (const chunk of toParse) {
    try {
      const parsed = YAML.parse(chunk) as GlossaryData | null;
      if (parsed?.terms && Array.isArray(parsed.terms)) {
        all.push(...parsed.terms);
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
    if (t?.zh) map.set(t.zh, t);
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

export function filterTerms(
  terms: GlossaryTerm[],
  query: string
): GlossaryTerm[] {
  if (!query.trim()) return terms;
  const q = query.toLowerCase();
  return terms.filter(
    (t) =>
      t.zh.includes(query) ||
      t.vi.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q) ||
      t.sanskrit?.toLowerCase().includes(q)
  );
}
