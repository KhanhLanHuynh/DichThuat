---
type: glossary-curation
series: sheng-tianwang
source: web/data/sources/sheng-tianwang/vol01/ch01.zh.md
curated_at: 2026-07-04
agent: glossary-curator
---

# Glossary Curation: 通達品第一 (ch01)

## Summary

Curated **hv / vi** split in `web/data/glossary/sheng-tianwang.yaml`: migrated legacy `hv` from `vi`, then set distinct **thuần Việt** (`vi`) for 47 formula and descriptive terms. Added **婆伽婆** (hv `Bà Già Bà` → vi `Thế Tôn`). Re-generated `ch01.vi.md` from draft with 7 glossary-driven fixes.

## Statistics

| Metric | Value |
|--------|-------|
| terms_total | 361 |
| hv=vi (proper names, pāramitā compounds) | ~314 |
| vi curated (≠ hv) | 48 |
| pending_human | 0 |
| conflicts | 0 |

## vi curated (sample)

| zh | hv | vi |
|----|----|-----|
| 通達品第一 | Thông Đạt Phẩm đệ nhất | Phẩm Thông Đạt thứ nhất |
| 爾時 | nhĩ thời | Thời ấy |
| 婆伽婆 | Bà Già Bà | Thế Tôn |
| 如是我聞 | Như thị ngã văn | Như thế này tôi nghe |
| 一時 | Nhất thời | Một thời |
| 人非人 | nhân phi nhân | người và phi người |
| 前後圍遶 | tiền hậu vi nhiễu | vây quanh trước sau |
| 十恒河沙 | thập Hằng Hà Sa | mười cõi nước nhiều như cát sông Hằng |
| 娑婆世界 | Ta Bà thế giới | thế giới Ta Bà |
| 修多羅 | Tu Đa La | kinh (default glossary) |
| 毘尼 | Tỳ Ni | luật Tăng (default glossary) |
| 波羅提木叉 | Ba La Đề Mộc Xoa | giới bổn (default glossary) |

## hv = vi (intentional)

- Bodhisattva / arhat / deity proper names (Bồ Tát …, A La Hán, …)
- Ten pāramitā compounds (`bố thí Ba La Mật`, `Bát Nhã Ba La Mật`, …)
- Buddha titles and epithets in ten-honorific lists (Ứng Cung, Chánh Biến Tri, …)

## Translation re-run

| File | Action |
|------|--------|
| `translations/sheng-tianwang/vol01/ch01.hv.md` | Promoted from `ch01.hv - Copy.md` |
| `translations/sheng-tianwang/vol01/ch01.vi.md` | Regenerated; applied vi fixes: Thế Tôn, giới bổn, luật Tăng, kinh, người và phi người, thành ma mị, địa ngục A Tỳ |

## Remaining work

- **~314 draft auto-added terms** still have `vi` = `hv`; curate incrementally when those compounds appear in `.vi.md` refinement (avoid bulk note→vi — English notes polluted vi in first pass).
- **Source ch01.zh.md** is truncated (~16 body lines vs 53 in translation); align segmentation when full chapter source is imported.
- Run `/translator` on new chapters after glossary pass.

## Recommended next steps

1. [ ] Import / segment full ch01 source to match 53-line translation
2. [ ] `/sino-vietnamese-translator` if `.hv.md` needs refresh from full source
3. [ ] `/translator` + `/reviewer` on `ch01.vi.md` after source parity fixed
4. [ ] Curate `vi` for high-frequency auto-added draft terms as they appear in review
