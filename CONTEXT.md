# DichThuat — Bối cảnh dự án

## Mục đích

DichThuat là không gian làm việc để dịch kinh điển Phật giáo từ **tiếng Hán (文言文 / 白話文)** sang **tiếng Việt**, với thuật ngữ nhất quán, nguồn truy vết được và bản dịch có thể duyệt lại.

## Đối tượng đọc

- Chính: hành giả và học giả Phật giáo Việt Nam
- Phụ: dịch giả duy trì bản song ngữ Hán–Việt

## Triết lý dịch thuật

1. **Trung thành hơn trôi chảy** — Giữ nguyên nghĩa giáo lý; không diễn giải làm mất các phân biệt kỹ thuật.
2. **Từ vựng Phật giáo Việt Nam đã có** — Ưu tiên thuật ngữ trong kinh tạng Việt Nam (thường là Hán-Việt hoặc Sanskrit/Pali qua tiếng Việt).
3. **Nhất quán** — Một thuật ngữ Hán → một `hv` (Hán-Việt) và một `vi` (thuần Việt) cho mỗi bộ kinh (xem `web/data/glossary/`).
4. **Minh bạch** — Ghi chú đọc bản mơ hồ, dị thể (異體字) và lựa chọn dịch giả trong chú thích cuối trang hoặc `notes/`.
5. **Giữ cấu trúc** — Giữ số chương, ngắt câu kệ và dấu hiệu đối thoại khớp với bản gốc.

## Loại văn bản nguồn

| Loại | Nhãn Hán | Cách xử lý |
|------|----------|------------|
| Kinh | 經 | Văn trang, nhịp điệu; giữ đối câu |
| Luận / chú giải | 論 / 疏 / 註 | Giọng giải nghĩa; câu dài hơn được |
| Luật | 律 | Chính xác pháp lý; giữ cấu trúc danh sách |
| Truyện / tiểu sử | 傳 / 錄 | Mạch tường thuật; giữ kính ngữ |
| Chú giải hiện đại | 白話 | Có thể đơn giản hóa; vẫn ánh xạ thuật ngữ vào glossary |

## Quy ước thuật ngữ chính (tiếng Việt)

| Khái niệm | Tiếng Việt ưu tiên | Tránh |
|-----------|-------------------|-------|
| Phật | Phật | Đức Phật (trừ khi ngữ cảnh cần kính xưng) |
| Bồ-tát | Bồ-tát | — |
| A-la-hán | A-la-hán | — |
| Pháp (giáo lý) | pháp / Pháp | đạo (mơ hồ) |
| Pháp (các hiện tượng) | các pháp / chúng sinh | — |
| Tăng-già | Tăng-già / chúng Tăng | — |
| Niết-bàn | Niết-bàn | — |
| Kinh | kinh | — |
| Tam-ma-đề | tam-ma-đề | — |
| Không | không / tánh không | — |
| Chân như | chân như | — |
| Duyên khởi | duyên khởi | — |

Glossary đầy đủ: `web/data/glossary/terms.yaml` (`hv` cho `.hv.md`, `vi` cho `.vi.md`). Cập nhật trước khi dịch bộ kinh mới.

## Đặt tên file

Corpus (nguồn và dịch) nằm trong `web/data/`; đường dẫn logic:

```
web/data/sources/{series}/{volume}/ch{NN}.zh.md      # YAML frontmatter + plain-text body
web/data/translations/{series}/{volume}/ch{NN}.hv.md   # Hán-Việt — plain text, line-aligned
web/data/translations/{series}/{volume}/ch{NN}.vi.md   # Thuần Việt — plain text, line-aligned
web/data/glossary/terms.yaml                         # Thuật ngữ mặc định
web/data/glossary/{series}.yaml                      # Ghi đè theo bộ kinh
parallel/{series}/{volume}/ch{NN}.parallel.md
notes/{series}-*-ch{NN}.md                    # metadata, status, logs
```

Manifest dự án web: `web/data/projects/{id}.yaml` (đường dẫn `source:`/`hv:`/`vi:`/`glossary:` dùng dạng logic `sources/...`, `translations/...`, `glossary/...`).

Ví dụ: `web/data/sources/avatamsaka/vol01/ch01.zh.md` → `web/data/translations/avatamsaka/vol01/ch01.vi.md` (cùng số dòng thân bài)

## Tóm tắt quy trình

1. **Phân đoạn / tải lên** — Chia nguồn thành file chương (`web/data/sources/`) hoặc tải lên qua web **Upload**
2. **Glossary** — Trích và đăng ký thuật ngữ cho chương/bộ kinh
3. **Hán-Việt** — Soạn bản nháp Hán-Việt (`.hv.md`) qua `/sino-vietnamese-translator`
4. **Dịch** — Tinh chỉnh sang tiếng Việt đọc được (`.vi.md`) qua `/translator`
5. **Duyệt** — Kiểm tra thuật ngữ, giáo lý và khớp Hán-Việt/vi
6. **Đối chiếu** — Tùy chọn: file song song để duyệt dễ hơn

Xem `docs/workflow.md` để biết từng bước chi tiết.

## Không được làm

- Không bịa giáo lý hoặc giải thích đoạn mơ hồ mà không đánh dấu `[?]` hoặc chú thích
- Không trộn Hán giản thể với phồn thể mà không ghi chú
- Không dùng tiếng Việt đời thường cho kinh trang nghiêm trừ khi bản gốc là bạch thoại
- Không commit API key hoặc bản scan thủ công riêng tư

## Tích hợp Cursor

| Thành phần | Vị trí | Vai trò |
|------------|--------|---------|
| Rules | `.cursor/rules/` | Chuẩn dịch luôn bật và theo loại file |
| Skills | `.cursor/skills/` | Quy trình từng bước (dịch, duyệt, glossary) |
| Subagents | `.cursor/agents/` | source-analyst, glossary-curator, sino-vietnamese-translator, translator, reviewer |
| Web workbench | `web/` | Editor, upload, machine translate; corpus in `web/data/` |
| Hướng dẫn phong cách | `docs/style-guide.md` | Ví dụ chi tiết và trường hợp đặc biệt |

Khi bắt đầu phiên, nêu **tên bộ kinh**, **chương** và chế độ **nháp** hay **duyệt**.
