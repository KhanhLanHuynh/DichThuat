# Quy trình dịch thuật

## Giai đoạn 1 — Chuẩn bị nguồn

1. Tạo `web/data/sources/{series}/{volume}/ch{NN}.zh.md` — YAML frontmatter + **thân bài plain text** (một đoạn một dòng nếu có thể), hoặc tải lên qua web **Upload**
2. Chạy skill **segment-source** nếu chia từ file dài
3. Tùy chọn: subagent **source-analyst** để tóm tắt cấu trúc

## Giai đoạn 2 — Glossary

1. Chạy **build-glossary** trên chương mới
2. Gộp vào `glossary/terms.yaml` hoặc `glossary/{series}.yaml`
3. Giải quyết xung đột thuật ngữ trước khi dịch

## Giai đoạn 3 — Hán-Việt

1. Giải quyết hết thuật ngữ `pending` trong glossary
2. Gọi subagent **sino-vietnamese-translator** hoặc skill **translate-sino-vietnamese**
3. Đầu ra: `web/data/translations/{series}/{volume}/ch{NN}.hv.md` — **plain text, cùng số dòng với thân nguồn**
4. Nhật ký: `notes/{series}-hanviet-ch{NN}.md`

## Giai đoạn 4 — Dịch thuần Việt

1. Gọi subagent **translator** (dùng `.hv.md` làm nền thuật ngữ khi có)
2. Đầu ra: `web/data/translations/{series}/{volume}/ch{NN}.vi.md` — **plain text, cùng số dòng với thân nguồn**
3. Metadata (`status`, `revision`): ghi trong `notes/`, không trong file dịch

## Giai đoạn 5 — Duyệt

1. Chạy subagent **reviewer** (chỉ đọc)
2. Kiểm tra **line parity** (số dòng dịch = số dòng nguồn)
3. Sửa theo báo cáo; đặt `status: reviewed` trong nhật ký `notes/`

## Giai đoạn 6 — Xuất bản / Lưu trữ

1. Chuyển câu hỏi mở vào `notes/`
2. Gắn phiên bản trong nhật ký: `revision: 2`

## Giá trị status (trong `notes/`)

| status | Ý nghĩa |
|--------|---------|
| draft | Nháp AI hoặc người đầu tiên |
| reviewed | Đã kiểm tra thuật ngữ và giáo lý |
| approved | Sẵn sàng dùng bên ngoài |

## Checklist mỗi chương

- [ ] Frontmatter nguồn đầy đủ
- [ ] Glossary cập nhật (không còn pending)
- [ ] `.hv.md` plain text, số dòng khớp nguồn
- [ ] `.vi.md` plain text, số dòng khớp nguồn
- [ ] Không có heading/subsection thêm vào file dịch
- [ ] Không còn `[?]` chưa giải thích trong `notes/`
- [ ] Đã qua reviewer
