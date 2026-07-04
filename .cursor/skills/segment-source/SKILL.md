---
name: segment-source
description: >-
  Splits long Buddhist Chinese texts into chapter files under web/data/sources/ with YAML
  frontmatter and plain-text bodies. Use when importing a new text, OCR output,
  CBETA dump that needs structuring, or when web Upload is not used.
---

# Segment Source

## Input

- Raw text file or pasted content
- Target series/volume metadata from user

## Output

```
web/data/sources/{series}/{volume}/ch{NN}.zh.md
```

## File shape

- **Frontmatter**: YAML metadata only
- **Body**: plain text — one paragraph per line where possible (enables 1:1 translation lines)

## Frontmatter

```yaml
---
title: "..."
series: {series}
volume: "{volume}"
chapter: "{NN}"
source_edition: ""
---
```

## Segmentation rules

1. Split on natural boundaries: 卷, 品, 章, or user-specified markers
2. Keep 科判 / section titles as plain-text lines in the body (not Markdown `#` headings)
3. Mark verses with blank lines between couplets
4. Do not translate during segmentation

## Punctuation (source body)

Normalize full-width / Chinese punctuation to **ASCII forms** in the body before save (per `docs/2. So tay bien tap.md` §1.2.2). Apply on import, upload, OCR cleanup, and when editing existing sources.

**Replacement order:** multi-character marks first (`──`, `——`, `......`, `……`), then strip `《》`, then single-character swaps.

| From | To | Notes |
|------|-----|-------|
| `……` / `......` | `[...]` | ellipsis (省略號) |
| `──` / `——` | `–` | dash (破折號) |
| `《` / `》` | *(remove)* | book/chapter title wrappers — keep inner text |
| `，` | `,` | comma (逗號) |
| `、` | `,` | enumeration pause (頓號) |
| `。` / `．` | `.` | period (句號) |
| `？` | `?` | question (問號) |
| `！` | `!` | exclamation (嘆號) |
| `；` | `;` | semicolon (分號) |
| `：` | `:` | colon (冒號) |
| `（` | `(` | parenthesis |
| `）` | `)` | parenthesis |
| `「` / `」` | `"` | dialogue / quote (corner brackets) |
| `『` / `』` | `'` | nested quote |
| `“` / `”` | `"` | curved double quotes |
| `‘` / `’` | `'` | curved single quotes |
| `·` | `–` | title separator (間隔號), e.g. 華嚴經·十地品 → 華嚴經–十地品 |

**Keep unchanged:** `□` (missing character), `[ ]` (editorial 方括號), `< >` (page refs), `~` (date ranges). Do not insert spaces between Chinese characters.

## OCR cleanup

- Fix obvious errors only; log uncertain fixes in `notes/{series}-ocr.md`
- Preserve original paragraph breaks

## Deliverable

- List of created files with line counts
- Next: **build-glossary**
