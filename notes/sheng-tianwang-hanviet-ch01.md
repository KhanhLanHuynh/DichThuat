---
type: hanviet-translation-log
series: sheng-tianwang
source: sources/sheng-tianwang/vol01/ch01.zh.md
output: translations/sheng-tianwang/vol01/ch01.hv.md
agent: sino-vietnamese-translator
date: 2026-07-01
revision: 2
---

# Nhật ký dịch Hán-Việt: 通達品第一 (Phẩm Thông Đạt thứ nhất)

## Tóm tắt

Tái sinh lớp **Hán-Việt** (`.hv.md`) theo quy tắc plain-text, line-aligned: 53 dòng đối chiếu 53 dòng nguồn; không YAML, không heading Markdown, không tiểu mục biên tập. Mười ba-la-mật giữ công thức *vô nhị vô biệt, tự tính ly cố*.

## Chỉ số

| Chỉ số | Giá trị |
|--------|---------|
| source_lines | 53 |
| output_lines | 53 |
| line_parity | ✓ |
| markdown_headings_in_output | 0 |
| glossary_terms_used | ~120 (series + default) |
| chỗ [?] | 2 |

## Tuân thủ glossary

| zh | vi kỳ vọng | trạng thái |
|----|------------|------------|
| 般若波羅蜜 | Bát Nhã Ba La Mật | ✓ |
| 闍那波羅蜜 | trí Ba La Mật | ✓ (tách 智 vs 般若) |
| 檀那/尸羅/羼提/毘梨耶/禪/方便/願/力 + Ba La Mật | theo `sheng-tianwang.yaml` | ✓ |
| 無二無別，自性離故 | vô nhị vô biệt, tự tính ly cố | ✓ (mọi đoạn ba-la-mật) |
| 四萬二千 / 七萬二千 | tứ vạn nhị thiên / thất vạn nhị thiên | ✓ |
| 勝天王 / 鉢婆羅 | Thắng Thiên Vương / Bát Bà La | ✓ |
| 化兜率陀王 | Hóa Đâu Suất Đà vương | ✓ (OCR 𦙽→化) |

## Sửa OCR (đọc theo CBETA T09n0651, không ghi footnote trong .hv.md)

| Vị trí | Nguồn | Đọc | Hán-Việt |
|--------|-------|-----|----------|
| Hội tràng | 𦙽兜率陀王 | 化兜率陀王 | Hóa Đâu Suất Đà vương |
| 恭敬檀 | 不令彼勌 | 不令彼倦 | bất lệnh bỉ quyện |
| 尸羅 | 車𤦲 | 車渠 | xa cừ |
| 羼提 | 盲𪾼 | 盲瞽 | manh cổ |
| 禪 | 如𥍽 | 如劍 | như kiếm |

## Chỗ [?] cần `/reviewer`

1. **羼提 (dòng 39 nguồn):** 「父母國王，我則須忍；餘可以威，即便加惡。」 — câu cú khó; dịch theo nghĩa tâm niệm tương phản (nhẫn có chọn lựa) đặt cạnh 不擇境界. Inline: `[?]` tại *dư khả dĩ uy, tức tiện gia ác [?]*.

2. **尼坻 (dòng 49 nguồn):** 「菩薩發願不為有樂，出離三界，求二乘道」 — hiểu 不為 thống lãnh cả ba vế. Inline: *bất vi hữu lạc, xuất ly tam giới, cầu Nhị thừa đạo [?]*.

## Thay đổi so với revision 1

- Xóa toàn bộ cấu trúc Markdown (171 dòng → 53 dòng).
- Mỗi đoạn nguồn = một dòng Hán-Việt (kể cả 9 tiểu loại đàn trong một đoạn 檀).
- Chèn đúng 3 dòng trống còn thiếu (sau đại Tỳ Kheo / 爾時世尊 / 東方去此) để khớp blank-line positions nguồn.

## Bước tiếp theo

- `/translator`: tinh luyện `.vi.md` từ bản `.hv.md` này.
- `/reviewer`: thẩm 2 chỗ `[?]` và phân biệt 智 vs 般若.
