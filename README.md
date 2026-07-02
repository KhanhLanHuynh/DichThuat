# DichThuat — Dịch kinh Phật (Hán → Việt)

Không gian làm việc dịch tài liệu Phật giáo với hỗ trợ AI, thuật ngữ nhất quán và duyệt bởi con người.

## Bắt đầu nhanh

1. Tải lên hoặc đặt bản gốc Hán vào `web/data/sources/{series}/{volume}/` (hoặc dùng **Upload** trong web app)
2. Đăng ký thuật ngữ trong `glossary/terms.yaml` (hoặc dùng skill glossary)
3. Yêu cầu Cursor dịch một chương — rules và skills tự nạp
4. Duyệt kết quả trong `web/data/translations/`; dùng subagent reviewer để QA

## Cấu trúc thư mục

```
DichThuat/
├── CONTEXT.md              # Bối cảnh dự án (đọc trước)
├── README.md
│
├── .cursor/
│   ├── rules/              # Quy tắc dịch (tự áp dụng)
│   ├── skills/             # Quy trình: dịch, duyệt, glossary
│   └── agents/             # Subagents: translator, reviewer, v.v.
│
├── docs/
│   ├── style-guide.md      # Thuật ngữ và ví dụ văn phong
│   └── workflow.md         # Quy trình dịch end-to-end
│
├── web/
│   ├── data/
│   │   ├── sources/        # Văn bản gốc Hán (.zh.md)
│   │   ├── translations/   # Đầu ra Hán-Việt (.hv.md) và thuần Việt (.vi.md)
│   │   └── projects/       # Manifest dự án (web app)
│   └── ...                 # Next.js translation workbench
├── parallel/               # Đối chiếu song song để duyệt
├── glossary/               # Thuật ngữ dùng chung (terms.yaml)
├── references/             # Kinh tạng, từ điển, bản dịch trước
└── notes/                  # Ghi chú dịch giả, câu hỏi mở
```

## Subagents

| Agent | Gọi | Mục đích |
|-------|-----|----------|
| `source-analyst` | `/source-analyst` | Phân tích cấu trúc trước khi dịch |
| `glossary-curator` | `/glossary-curator` | Trích và duy trì thuật ngữ |
| `sino-vietnamese-translator` | `/sino-vietnamese-translator` | Nháp Hán-Việt (`.hv.md`) — sau glossary |
| `translator` | `/translator` | Tinh chỉnh thuần Việt (`.vi.md`) |
| `reviewer` | `/reviewer` | QA thuật ngữ và giáo lý |

## Skills

- **translate-sino-vietnamese** — Lớp Hán-Việt sau glossary (`.hv.md`)
- **translate-buddhist-text** — Quy trình dịch cả chương (`.vi.md`)
- **build-glossary** — Trích thuật ngữ từ nguồn vào `glossary/`
- **review-translation** — Kiểm tra nháp theo glossary và style guide
- **segment-source** — Chia văn bản dài thành file chương

## Quy ước

- File nguồn: UTF-8, `.zh.md` — YAML frontmatter + thân plain text
- File dịch: UTF-8, `.hv.md` / `.vi.md` — **plain text**, cùng số dòng với thân nguồn
- Một dòng gốc = một dòng dịch (không thêm heading hay subsection)
- Metadata (`status`, `revision`): trong `notes/`
- Xem `CONTEXT.md` và `docs/style-guide.md` về chuẩn thuật ngữ
