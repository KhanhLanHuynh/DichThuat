---
name: review-translation
description: >-
  Reviews Vietnamese Buddhist translations against glossary, style guide, and source
  fidelity including line alignment. Use when proofreading drafts, QA checks, or before
  marking a chapter as reviewed.
---

# Review Translation

## Inputs

- Source: `web/data/sources/.../*.zh.md` (body only for line count)
- Draft: `web/data/translations/.../*.vi.md` and/or `*.hv.md`
- `web/data/glossary/terms.yaml`, `docs/style-guide.md`, `docs/BẢNG QUY TẮC Chat GPT tongHop.md`

## Checklist

### Line alignment (Critical)
- [ ] Translation line count = source body line count
- [ ] No added Markdown headings or editorial subsections
- [ ] No split/merged paragraphs vs source
- [ ] No consecutive duplicate empty lines (blank-line runs match source)

### Terminology
- [ ] `.hv.md`: all glossary `hv` forms correct; no `vi` where `hv` differs
- [ ] `.vi.md`: all glossary `vi` forms correct; no `hv` where `vi` differs
- [ ] No unauthorized synonyms for registered terms
- [ ] No `alt_vi` forbidden forms (Giác hữu tình, nam cư sĩ, nữ cư sĩ)
- [ ] Compound terms match glossary (`Đại Bồ tát`, `Bát nhã ba la mật`)
- [ ] Proper names transliterated consistently
- [ ] Capitalization: honorifics vs common nouns per terminology doc
- [ ] Sutra titles: `{Name} Kinh` not `Kinh {Name}`

### Footnotes (`.vi.md`, when present)
- [ ] Inline `[^n]` on body lines only (no extra body lines)
- [ ] Each `[^n]` has a matching `[^n]:` definition after `<!-- footnotes -->`
- [ ] No orphan refs or empty definitions
- [ ] Footnote numbering restarts per chapter file

### Fidelity
- [ ] No omitted sentences or list items
- [ ] No added interpretation
- [ ] Ambiguities marked `[?]` with note in `notes/`

### Style
- [ ] Correct register (scripture vs commentary)
- [ ] Vietnamese punctuation (not Chinese)
- [ ] Buddha direct address: vocatives in Buddha's speech prefixed with `Này` (e.g. Này Đại vương)
- [ ] Spelling consistency (no alternating variants within series)

## Report

Write to `notes/{series}-review-ch{NN}.md`. Log `status: reviewed` there; translation files stay plain text.

```markdown
## Review: {file path}

### Critical (must fix)
- Line X: ...

### Suggestions
- ...

### Glossary gaps
- zh: "..." → propose hv: "..." / vi: "..."
```

## After review

Mark reviewed in the log only when no Critical items remain.

Agent reference: `.cursor/agents/reviewer.md`
