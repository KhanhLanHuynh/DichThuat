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

**Word-by-word (逐字逐詞)** — translate **each Chinese character or bound compound** to its Hán-Việt reading **in strict source order**. Âm dịch, not nghĩa dịch.

| Principle | Rule |
|-----------|------|
| One-to-one mapping | Every source character (or glossary-bound compound) → one Hán-Việt unit; do not skip, merge, or reorder |
| No paraphrase | Do not replace with thuần Việt meaning (e.g. 第一 → *phần thứ nhất* is wrong; use **đệ nhất**) |
| No added words | No classifiers, connectives, or filler absent from the source |
| Glossary term | Exact `vi` from YAML |
| Number / ordinal | Hán-Việt per character in order (一 → nhất, 七萬二千 → thất vạn nhị thiên) — no Arabic, no thuần Việt numbers |
| Proper name | Full transliteration, source order (耆闍崛山 → Kỳ Xà Quật Sơn) |
| Function word | Standard Hán-Việt (之 chi, 而 nhi, 以 dĩ, 故 cố, …) |
| Mantra | Transliterate only |

Minimize thuần Việt. When unsure between a meaning-based phrase and a character reading, **always choose the character reading**.

## Blank-line dedupe (before save)

Agents sometimes insert an extra empty line between paragraphs. Before writing `.hv.md`:

1. Walk source and output line by line.
2. If output has **2+ consecutive empty lines** where source has **one**, delete the extra empty line(s).
3. Re-check line count still matches source after dedupe.

## Workflow

```
- [ ] Load glossary + source
- [ ] Translate line by line, **word-by-word** (one Hán-Việt unit per source character/compound)
- [ ] Self-check: glossary compliance + line count parity + no paraphrase
- [ ] Dedupe blank lines: collapse any run of 2+ consecutive empty lines to match source at that position
- [ ] Write plain-text .hv.md
- [ ] Write log to notes/
```

## Examples (word-by-word)

### Section / chapter title

| Source | Output | Character map |
|--------|--------|-----------------|
| 通達品第一 | Thông Đạt Phẩm đệ nhất | 通→Thông, 達→Đạt, 品→Phẩm, 第→đệ, 一→nhất |

Do not render titles as thuần Việt paraphrases (e.g. *Phẩm Thông Đạt, phần một*).

### Prose line

**Source:** 色不異空，空不異色；色即是空，空即是色。

**Output:** Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc.

| Source | Output | Notes |
|--------|--------|-------|
| 爾時 | Nhĩ thì | 爾→nhĩ, 時→thì — not *Thời ấy* |
| 七萬二千 | thất vạn nhị thiên | one reading per character |
| 觀自在菩薩 | Quán Tự Tại Bồ Tát | glossary order + word-by-word |

## Next step

Run **translate-buddhist-text** (or `/translator`) for `.vi.md` refinement.

Agent reference: `.cursor/agents/sino-vietnamese-translator.md`
