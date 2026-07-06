# Glossary — Thuật ngữ Phật giáo

Sổ đăng ký thuật ngữ Hán → **Hán-Việt (`hv`)** + **thuần Việt (`vi`)**. Ghi đè theo bộ kinh nằm trong `{series}.yaml`.

Chuẩn thuật ngữ: [`docs/BẢNG QUY TẮC Chat GPT tongHop.md`](../../../docs/BẢNG%20QUY%20TẮC%20Chat%20GPT%20tongHop.md)

Corpus nằm trong `web/data/glossary/` (cùng `CONTENT_ROOT` với `sources/`, `translations/`, `projects/`).

## File

| File | Phạm vi |
|------|---------|
| `terms.yaml` | Mặc định / xuyên bộ kinh |
| `{series}.yaml` | Ghi đè cho một bộ kinh |

## Schema

```yaml
- zh: "般若"
  hv: "Bát nhã"
  vi: "Bát nhã"
  sanskrit: "prajñā"
  doctrine: true

- zh: "菩薩摩訶薩"
  hv: "Đại Bồ tát"
  vi: "Đại Bồ tát"
  compound: true

- zh: "比丘"
  hv: "Tỳ kheo"
  vi: "Tỳ kheo"
  alt_vi: ["nam cư sĩ"]
```

- **`hv`**: Hán-Việt — dùng khi dịch lớp `.hv.md` (âm dịch hoặc `compound`)
- **`vi`**: thuần Việt — ưu tiên Hán Việt đã phổ biến; gloss chỉ khi cần
- **`compound: true`**: một đơn vị glossary; ghi đè dịch từng chữ trong `.hv.md`
- **`alt_vi`**: dạng cấm — không dùng trong bản dịch (vd. Giác hữu tình, nam cư sĩ)
- Khi hai lớp giống nhau (tên riêng, thuật ngữ cố định), ghi cả hai
- Bản cũ chỉ có `vi` được coi là `hv` cho đến khi curator bổ sung `vi` riêng

## Cách dùng

| Bước | Tra cột |
|------|---------|
| Dịch Hán-Việt (`.hv.md`) | `hv` |
| Dịch thuần Việt (`.vi.md`) | `vi` |

Thêm thuật ngữ mới (`zh` + `hv` + `vi`) trước lần dùng đầu trong bản dịch.

Chạy `/glossary-curator` hoặc skill **build-glossary** để điền từ nguồn.

Migration: `python web/scripts/migrate_glossary_hv.py` thêm `hv` từ `vi` cũ nếu thiếu.
