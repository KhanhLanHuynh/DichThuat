---
name: build-glossary
description: Extracts Chinese Buddhist terms from source files and updates glossary YAML. Use when starting a new series, new chapter, or when the user asks to build or update the terminology glossary.
---

# Build Glossary

## Input

- Source file(s) under `web/data/sources/`
- Existing `web/data/glossary/terms.yaml` and optional `web/data/glossary/{series}.yaml`

## Workflow

1. Scan source for:
   - Doctrinal compounds (般若, 菩提, 涅槃, etc.)
   - Proper names (菩薩名, 地名)
   - Repeated phrases with fixed translation
2. For each term, check existing glossary — do not duplicate
3. Propose entries with `zh`, `hv`, `vi`, `notes`, optional `sanskrit`
4. Write to appropriate YAML file

## Entry Format

```yaml
- zh: "五蘊"
  hv: "ngũ uẩn"          # Hán-Việt — for .hv.md
  vi: "ngũ uẩn"          # Thuần Việt — for .vi.md (same when established compound)
  notes: "Five aggregates; pañca-skandha"
  sanskrit: "skandha"
  doctrine: true

- zh: "修多羅"
  hv: "Tu Đa La"
  vi: "kinh"
  sanskrit: "sūtra"
  doctrine: true
  notes: "hv = transliteration; vi = readable gloss"
```

## hv vs vi

| Field | Layer | Guidance |
|-------|-------|----------|
| `hv` | `.hv.md` | Âm dịch; character-mapped Hán-Việt; mandatory exact form |
| `vi` | `.vi.md` | Readable thuần Việt; keep doctrinal proper nouns; gloss descriptive terms |

When unsure, set `vi` equal to `hv` and add `status: pending` for curator review.

## Transliteration Style

- Do NOT use hyphens (`-`) to join syllables in `hv` or `vi` values.
- Write multi-syllable transliterations as separate words, capitalizing each syllable (Title Case):
  - `A-nan` → `A Nan`
  - `bát-nhã-ba-la-mật` → `Bát Nhã Ba La Mật`
- Plain Hán-Việt words keep natural casing (e.g. `bố thí`, `trì giới`, `long vương`).
- Hyphens in `sanskrit` and `notes` are unaffected.

## Priority

| Priority | Term type |
|----------|-----------|
| High | Doctrinal technical terms |
| Medium | Proper names |
| Low | Common words (only if non-obvious) |

## Output

- Update `web/data/glossary/{series}.yaml` for series-specific terms
- Update `web/data/glossary/terms.yaml` for cross-series defaults
- Report: new terms added, `hv`/`vi` pairs needing review, conflicts

## Conflicts

If two valid renderings exist for the same layer, list both in notes and set `status: pending` — do not translate until resolved.
