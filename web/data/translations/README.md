# Bản dịch tiếng Việt

Thư mục đầu ra các lớp dịch. Đường dẫn mirror `sources/` (vật lý: `web/data/translations/`).

## Các lớp

| Hậu tố | Lớp | Agent / skill | Thứ tự |
|--------|-----|---------------|--------|
| `.hv.md` | Hán-Việt | `translate-sino-vietnamese` / `/sino-vietnamese-translator` | Sau glossary |
| `.vi.md` | Thuần Việt | `translate-buddhist-text` / `/translator` | Sau `.hv.md` |

## Định dạng file dịch

- **Plain text body** — không YAML frontmatter, không `#` / `##` heading trong thân dịch
- **Một dòng nguồn = một dòng dịch** (cùng số dòng với thân `sources/.../*.zh.md`)
- **Footnotes (`.vi.md` only):** marker `[^n]` inline trên dòng dịch; định nghĩa sau `<!-- footnotes -->` ở cuối file; thêm qua web **Insert footnote** (`Ctrl+Shift+F`); đánh số lại từ `[^1]` mỗi chương
- Metadata và `status`: trong `notes/`, không trong file dịch

## Nhật ký

| Lớp | Đường dẫn |
|-----|-----------|
| Hán-Việt | `notes/{series}-hanviet-ch{NN}.md` |
| Thuần Việt | `notes/{series}-translation-ch{NN}.md` |
| Duyệt | `notes/{series}-review-ch{NN}.md` |
