# Glossary — Thuật ngữ Phật giáo

Sổ đăng ký thuật ngữ Hán → **Hán-Việt (`hv`)** + **thuần Việt (`vi`)**. Ghi đè theo bộ kinh nằm trong `{series}.yaml`.

Corpus nằm trong `web/data/glossary/` (cùng `CONTENT_ROOT` với `sources/`, `translations/`, `projects/`).

## File

| File | Phạm vi |
|------|---------|
| `terms.yaml` | Mặc định / xuyên bộ kinh |
| `{series}.yaml` | Ghi đè cho một bộ kinh |

## Schema

```yaml
- zh: "般若"
  hv: "Bát Nhã"    # bắt buộc cho .hv.md
  vi: "Bát Nhã"    # bắt buộc cho .vi.md
  sanskrit: "prajñā"
  doctrine: true
```

- **`hv`**: âm dịch Hán-Việt — dùng khi dịch lớp `.hv.md`
- **`vi`**: thuần Việt đọc được — dùng khi dịch lớp `.vi.md`
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
