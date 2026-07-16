---
name: build-glossary
description: Extracts Chinese Buddhist terms from source files and updates glossary YAML. Use when starting a new series, new chapter, or when the user asks to build or update the terminology glossary.
---

# Build Glossary

Reference: `docs/BẢNG QUY TẮC Chat GPT tongHop.md`, `.cursor/rules/glossary.mdc`

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
  hv: "ngũ uẩn"
  vi: "ngũ uẩn"
  notes: "Five aggregates; pañca-skandha"
  sanskrit: "skandha"
  doctrine: true

- zh: "菩薩摩訶薩"
  hv: "Đại Bồ tát"
  vi: "Đại Bồ tát"
  compound: true
  notes: "Semantic compound; not character-by-character"

- zh: "比丘"
  hv: "Tỳ kheo"
  vi: "Tỳ kheo"
  alt_vi: ["nam cư sĩ"]

- zh: "修多羅"
  hv: "Tu Đa La"
  vi: "kinh"
  sanskrit: "sūtra"
  doctrine: true
  notes: "hv = transliteration; vi = readable gloss"
```

## Term categories

| Category | Policy |
|----------|--------|
| Phật hiệu / Bồ tát / Thanh văn | Hán Việt; capitalize honorifics |
| Tăng đoàn | Tỳ kheo, Sa di, Ưu bà tắc — `alt_vi` for nam/nữ cư sĩ |
| Quả vị / pháp tu / giáo lý | Hán Việt per terminology doc |
| Compounds | `compound: true` when semantic unit (般若波羅蜜, 菩薩摩訶薩) |

## hv vs vi

| Field | Layer | Guidance |
|-------|-------|----------|
| `hv` | `.hv.md` | Âm dịch or `compound` unit; mandatory exact form |
| `vi` | `.vi.md` | Prefer established Hán Việt; gloss only when popularizing |
| `alt_vi` | vi | Forbidden synonyms (Giác hữu tình, nam cư sĩ, …) |
| `compound` | both | Overrides word-by-word in `.hv.md` |

When unsure, set `vi` equal to `hv` and add `status: pending` for curator review.

## Soften HV-identical `vi` (addendum)

If a draft or review shows an entry with `vi` == `hv` that is only a connective / list closer / speech formula (白佛言, 如是等, 離垢, …), prefer a readable `vi` when Thuan Viet / prior chapters already use one — keep `hv` as âm dịch. Do **not** leave `vi` HV-identical solely because auto-extract copied `.hv.md`.

Register frequent doctrinal singles early (聲聞, 辟支佛, 二乘, 體性, 自性, …) so `.vi.md` cannot invent forms.

## Transliteration Style

- Do NOT use hyphens (`-`) to join syllables in `hv` or `vi` values.
- Capitalization per terminology doc:
  - Honorifics: `Như Lai`, `Đại Bồ tát`, `Tam Bảo`
  - Compounds: `Bát nhã ba la mật`, `ba la mật`
  - Common nouns lowercase: `chúng sinh`, `trí tuệ`, `bố thí`
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
