---
name: translate-buddhist-text
description: >-
  Translates Buddhist Chinese source to readable Vietnamese plain text following
  glossary vi entries and style guide, line-aligned with source. Use when translating chapters,
  refining .hv.md to .vi.md, or when the user asks for Chinese-to-Vietnamese translation.
---

# Translate Buddhist Text (Thuần Việt)

## Prerequisites

1. Read `CONTEXT.md` and `docs/style-guide.md`
2. Source: `web/data/sources/{series}/{volume}/ch{NN}.zh.md`
3. Glossary: `web/data/glossary/terms.yaml`, `web/data/glossary/{series}.yaml`
4. Optional base: `web/data/translations/{series}/{volume}/ch{NN}.hv.md` (terminology anchor)

## Output

| File | Path |
|------|------|
| Translation | `web/data/translations/{series}/{volume}/ch{NN}.vi.md` |
| Log | `notes/{series}-translation-ch{NN}.md` |

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

## Translation rules

- Apply glossary `vi` forms strictly for `.vi.md`; never substitute `hv` unless `vi` equals `hv` in YAML
- When `.hv.md` exists: use it for syntax reference; terminology must come from glossary `vi`
- Preserve enumerations (一者…二者…) in count and order
- Scripture formulas: see `docs/style-guide.md` §4
- Uncertain readings: inline `[?]`; explain in `notes/`

## Blank-line dedupe (before save)

Agents sometimes insert an extra empty line between paragraphs. Before writing `.vi.md`:

1. Walk source and output line by line.
2. If output has **2+ consecutive empty lines** where source has **one**, delete the extra empty line(s).
3. Re-check line count still matches source after dedupe.

## Workflow

```
- [ ] Load source + glossary (+ optional .hv.md)
- [ ] Translate line by line from source
- [ ] Self-check: glossary `vi` compliance + line count parity
- [ ] Dedupe blank lines: collapse any run of 2+ consecutive empty lines to match source at that position
- [ ] Write plain-text .vi.md
- [ ] Write log to notes/
```

## Next step

Run **review-translation** skill or `/reviewer` subagent.

See [examples.md](examples.md).

Agent reference: `.cursor/agents/translator.md`
