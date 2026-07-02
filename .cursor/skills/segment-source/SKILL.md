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

## OCR cleanup

- Fix obvious errors only; log uncertain fixes in `notes/{series}-ocr.md`
- Preserve original paragraph breaks

## Deliverable

- List of created files with line counts
- Next: **build-glossary**
