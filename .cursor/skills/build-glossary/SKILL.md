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
3. Propose entries with `zh`, `vi`, `notes`, optional `sanskrit`
4. Write to appropriate YAML file

## Entry Format

```yaml
- zh: "五蘊"
  vi: "ngũ uẩn"
  notes: "Five aggregates; pañca-skandha"
  sanskrit: "skandha"
  doctrine: true
```

## Vietnamese Transliteration Style

- Do NOT use hyphens (`-`) to join syllables in `vi` values.
- Write multi-syllable transliterations as separate words, capitalizing each syllable (Title Case):
  - `A-nan` → `A Nan`
  - `bát-nhã-ba-la-mật` → `Bát Nhã Ba La Mật`
  - `Bồ-tát Văn-thù-sư-lợi` → `Bồ Tát Văn Thù Sư Lợi`
- Applies to every `vi` value — proper names and doctrinal compounds alike.
- Plain Hán-Việt words that were never hyphenated keep their existing casing (e.g. `bố thí`, `trì giới`, `long vương`).
- Hyphens in `sanskrit` and Sanskrit/Pāli citations inside `notes` are unaffected — leave them as-is.

## Priority

| Priority | Term type |
|----------|-----------|
| High | Doctrinal technical terms |
| Medium | Proper names |
| Low | Common words (only if non-obvious) |

## Output

- Update `web/data/glossary/{series}.yaml` for series-specific terms
- Update `web/data/glossary/terms.yaml` for cross-series defaults
- Report: new terms added, conflicts needing human decision

## Conflicts

If two valid Vietnamese renderings exist, list both in notes and set `status: pending` — do not translate until resolved.
