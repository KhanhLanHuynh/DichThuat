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
- `web/data/glossary/terms.yaml`, `docs/style-guide.md`

## Checklist

### Line alignment (Critical)
- [ ] Translation line count = source body line count
- [ ] No added Markdown headings or editorial subsections
- [ ] No split/merged paragraphs vs source
- [ ] No consecutive duplicate empty lines (blank-line runs match source)

### Terminology
- [ ] All glossary terms used correctly
- [ ] No unauthorized synonyms for registered terms
- [ ] Proper names transliterated consistently

### Fidelity
- [ ] No omitted sentences or list items
- [ ] No added interpretation
- [ ] Ambiguities marked `[?]` with note in `notes/`

### Style
- [ ] Correct register (scripture vs commentary)
- [ ] Vietnamese punctuation (not Chinese)

## Report

Write to `notes/{series}-review-ch{NN}.md`. Log `status: reviewed` there; translation files stay plain text.

```markdown
## Review: {file path}

### Critical (must fix)
- Line X: ...

### Suggestions
- ...

### Glossary gaps
- zh: "..." → propose vi: "..."
```

## After review

Mark reviewed in the log only when no Critical items remain.

Agent reference: `.cursor/agents/reviewer.md`
