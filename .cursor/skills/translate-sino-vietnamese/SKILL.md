---
name: translate-sino-vietnamese
description: >-
  Produces Hán-Việt (Sino-Vietnamese) plain-text translations from Chinese source
  using glossary readings, line-aligned with source. Use after glossary-curator,
  before thuần Việt translation, or when the user asks for Hán-Việt or han-viet output.
---

# Translate Sino-Vietnamese (Hán-Việt)

## Prerequisites

1. Glossary-curator has run — zero `pending` terms in relevant YAML
2. Source: `web/data/sources/{series}/{volume}/ch{NN}.zh.md`
3. Glossary: `web/data/glossary/terms.yaml`, `web/data/glossary/{series}.yaml`

If prerequisites fail: stop and run **build-glossary** / glossary-curator first.

## Output

| File | Path |
|------|------|
| Translation | `web/data/translations/{series}/{volume}/ch{NN}.hv.md` |
| Log | `notes/{series}-hanviet-ch{NN}.md` |

## Plain-text rules (mandatory)

```
- [ ] Read source body only (skip YAML frontmatter)
- [ ] Output line count = source body line count
- [ ] Line N in output translates line N in source
- [ ] Blank lines match source blank lines (no consecutive duplicate empty lines)
- [ ] No # headings, no ## subsections, no editorial intro blocks
- [ ] Do not split one source line into multiple lines
- [ ] Do not merge multiple source lines into one line
```

## Lexical rules

**Âm dịch, not nghĩa dịch** — map each character/compound to established Hán-Việt reading in source order.

| Type | Rule |
|------|------|
| Glossary term | Exact `vi` from YAML |
| Number | Hán-Việt per character (ngũ bách, thất vạn nhị thiên) — no Arabic, no thuần Việt numbers |
| Proper name | Full transliteration, source order (耆闍崛山 → Kỳ Xà Quật Sơn) |
| Function word | Standard Hán-Việt (之 chi, 而 nhi, 以 dĩ, 故 cố, …) |
| Mantra | Transliterate only |

Minimize thuần Việt. Do not add classifiers or connectives absent from the source.

## Blank-line dedupe (before save)

Agents sometimes insert an extra empty line between paragraphs. Before writing `.hv.md`:

1. Walk source and output line by line.
2. If output has **2+ consecutive empty lines** where source has **one**, delete the extra empty line(s).
3. Re-check line count still matches source after dedupe.

## Workflow

```
- [ ] Load glossary + source
- [ ] Translate line by line from source
- [ ] Self-check: glossary compliance + line count parity
- [ ] Dedupe blank lines: collapse any run of 2+ consecutive empty lines to match source at that position
- [ ] Write plain-text .hv.md
- [ ] Write log to notes/
```

## Example

**Source line:** 色不異空，空不異色；色即是空，空即是色。

**Output line:** Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc.

## Next step

Run **translate-buddhist-text** (or `/translator`) for `.vi.md` refinement.

Agent reference: `.cursor/agents/sino-vietnamese-translator.md`
