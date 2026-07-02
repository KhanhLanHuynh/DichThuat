# Tóm tắt cấu trúc: Kinh Thắng Thiên Vương Bát Nhã

> Phân tích từ `sources/sheng-tianwang/vol01/ch01.zh.md`  
> Quy trình: **segment-source** + **source-analyst**  
> Ngày: 2026-06-27

---

## 1. Tóm tắt nội dung

File nguồn là **một phần nhập liệu** của bộ *Kinh Thắng Thiên Vương Bát Nhã Ba La Mật* (勝天王般若波羅蜜經), gồm **Quyển 1, Phẩm 1 — 通達品第一** (Phẩm Thông Đạt), từ mở đầu *Như thị ngã văn* đến hết lời Phật về **Trí Ba La Mật** (闍那波羅蜜). Văn bản **kết thúc trọn vẹn một phẩm**, chưa có phẩm tiếp theo (顯相品第二).

**Thể loại:** Kinh đại thừa (般若部) — văn trang kinh điển, khung **hỏi–đáp** giữa Phật Thích Ca và **Thiên Vương Thắng Thiên** (勝天王; trong hội tràng xưng **鉢婆羅** Pravara).

**Nội dung chính:** Thiên Vương hỏi làm sao tu **một pháp** mà thông đạt **vạn pháp**; Phật đáp: **Bát Nhã Ba La Mật**. Toàn phẩm triển khai **mười Ba La Mật** (lục độ + phương tiện + nguyện + lực + trí), mỗi độ đều quy về quán **vô nhị vô biệt, tự tính ly** (無二無別，自性離故).

**Độ khó dịch:** 4/5 — kinh văn cổ, câu dài lồng nhau, mật độ thuật ngữ cao; chưa có thần chú trong phẩm này.

---

## 2. Loại văn bản và metadata

| Hạng mục | Giá trị |
|----------|---------|
| **Tên kinh** | 勝天王般若波羅蜜經 |
| **Tên khác** | 勝天王經、勝天王問般若經 |
| **Sanskrit** | *Pravara-deva-rāja-paripṛcchā* |
| **Dịch giả** | 陳優禪尼國王子月婆首那 (Nguyệt Bà Thủ Na), dịch năm Thiên Gia 6 (565) |
| **Tạng** | Đại Tạng T09 **n0651** (CBETA: `T09n0651`) |
| **Chữ Hán** | Chủ yếu **phồn thể**; lẫn vài **dị thể/giản** (花/華) |
| **Thể loại** | Kinh 經 — hội + đối thoại + giảng giải tu hành |
| **Quy mô bộ kinh đầy đủ** | **7 quyển (卷), 16 phẩm (品)** |

Tên file gốc `HieuDiem Moi` là nhãn nhập tạm (hiệu điểm mới), **không** dùng làm slug series.

---

## 3. Cây cấu trúc

```
勝天王般若波羅蜜經
└── 卷第一 (Quyển 1)
    └── 通達品第一 (Phẩm 1)
        ├── Mở kinh: 如是我聞…
        ├── Hội tràng
        │   ├── Tăng A La Hán (42.000, kể tên 15 vị)
        │   ├── Bồ Tát (72.000 + danh sách ~40 tên)
        │   └── Thiên–Long–A Tu La… chúng
        ├── Khung quang minh / mười phương Phật
        │   ├── 普光如來 / 離障菩薩 (Đông)
        │   └── Tám phương + trên/dưới (tóm lược)
        ├── Hỏi–đáp chính
        │   ├── 鉢婆羅 thiên vương xin hỏi
        │   └── Phật xưng 勝天王, khai Bát Nhã thông vạn pháp
        └── Mười Ba La Mật (ranh giới ngầm: 「大王！…」)
            ├── 檀那波羅蜜 (8 loại: 法/無畏/資生/不望報/大悲/恭敬/尊重/供養/無依止)
            ├── 尸羅波羅蜜
            ├── 羼提波羅蜜
            ├── 毘梨耶波羅蜜
            ├── 禪波羅蜜 (含 phân tam phẩm tham–sân–si)
            ├── 般若波羅蜜
            ├── 優波憍舍羅波羅蜜 (phương tiện)
            ├── 尼坻波羅蜜 (nguyện)
            ├── 婆羅波羅蜜 (lực)
            └── 闍那波羅蜜 (trí)
```

**Không có:** 科判 tường minh, **偈** (kệ), thần chú (陀羅尼), chú sách hiện văn.

**Ranh giới tự nhiên trong file hiện tại:** chỉ **1 phẩm**; ranh giới con là các đoạn mở bằng `「大王！菩薩摩訶薩學般若波羅蜜行…波羅蜜」` — chuyển thành `##` khi phân đoạn, **không tách file**.

---

## 4. Chỉ số định lượng (ước lượng)

| Chỉ số | Giá trị |
|--------|---------|
| Số dòng file | 53 |
| Số chữ Hán (thân bài) | ~9.500–11.000 |
| Số đoạn | ~12–15 |
| Tỷ lệ kệ | 0% |
| Khối hỏi–đáp | ~6–8 cặp |
| Liệt kê | Nhiều (8 loại bố thí; tam phẩm tham–sân–si; danh sách danh tính) |
| Thần chú | 0 |

---

## 5. Đề xuất phân file (segment-source)

### 5a. File import hiện tại (chỉ Phẩm 1)

| File đích | Nội dung |
|-----------|----------|
| `sources/sheng-tianwang/vol01/ch01.zh.md` | 通達品第一 (toàn bộ file) |

**Frontmatter đề xuất:**

```yaml
---
title: "通達品第一"
series: sheng-tianwang
volume: "vol01"
chapter: "01"
source_edition: "Taishō Shinshū Daizōkyō T09n0651 (CBETA); 陳月婆首那譯"
script: traditional
translator: "月婆首那"
---
```

**Cấu trúc Markdown nội bộ:**

- `# 通達品第一`
- `##` cho mười Ba La Mật (có thể `###` cho 8 loại bố thí)
- Giữ nguyên dấu hội thoại `「…」`
- Không dịch trong giai đoạn phân đoạn

### 5b. Kế hoạch khi nhập đủ bộ kinh (7 quyển / 16 phẩm)

| Volume | Chapter | Tiêu đề phẩm | File |
|--------|---------|--------------|------|
| vol01 | ch01 | 通達品第一 | `ch01.zh.md` ← **file hiện tại** |
| vol01 | ch02 | 顯相品第二 | `ch02.zh.md` |
| vol02 | ch03 | 法界品第三 | `ch03.zh.md` |
| vol02 | ch04 | 念處品第四 | `ch04.zh.md` |
| vol03 | ch05 | 法性品第五 | `ch05.zh.md` |
| vol04 | ch06 | 平等品第六 | `ch06.zh.md` |
| vol04 | ch07 | 現相品第七 | `ch07.zh.md` |
| vol05 | ch08 | 無所得品第八 | `ch08.zh.md` |
| vol05 | ch09 | 證勸品第九 | `ch09.zh.md` |
| vol06 | ch10 | 述德品第十 | `ch10.zh.md` |
| vol06 | ch11 | 現化品第十一 | `ch11.zh.md` |
| vol06 | ch12 | 陀羅尼品第十二 | `ch12.zh.md` |
| vol07 | ch13 | 勸誡品第十三 | `ch13.zh.md` |
| vol07 | ch14 | 二行品第十四 | `ch14.zh.md` |
| vol07 | ch15 | 讚嘆品第十五 | `ch15.zh.md` |
| vol07 | ch16 | 付囑品第十六 | `ch16.zh.md` |

**Quy tắc tách:** ranh giới **品** → 1 file/chapter; tiêu đề **卷** ghi trong frontmatter `volume`, không tách theo quyển nếu một quyển có 2 phẩm.

---

## 6. Metadata series

| Trường | Đề xuất |
|--------|---------|
| **series** | `sheng-tianwang` |
| **Tên hiển thị** | Kinh Thắng Thiên Vương Bát Nhã Ba La Mật |
| **volume (file hiện tại)** | `vol01` |
| **chapter** | `01` |
| **source_edition** | `T09n0651` / CBETA |
| **Quan hệ bản dịch khác** | Cùng bản gốc với *Đại Bát Nhã* T06n0220 quyển 566–573 (đệ lục hội), khác bản dịch |

---

## 7. Lỗi OCR cần sửa trước phân đoạn

| Vị trí | Trong file | Nên sửa thành | Ghi chú |
|--------|------------|---------------|---------|
| ~dòng 9 | 𦙽兜率陀王 | **化**兜率陀王 | Ký tự lạ (PUA/OCR); CBETA chuẩn |
| ~dòng 37 | 車**𤦲** | 車**渠** | Thất bảo |
| ~dòng 39 | 盲**𪾼** | 盲**瞽** | “Mù loà” |
| ~dòng 43 | 如**𥍽** | 如**劍** | Song song 如槊、如劍、如刀 |
| ~dòng 35 | 不令彼**勌** | 不令彼**倦** | Giản/dị thể |
| Nhiều chỗ | 蓮**花**意 | 蓮**華**意 | Thống nhất phồn thể |

Ghi log sửa chưa chắc vào `notes/sheng-tianwang-ocr.md`.

---

## 8. Thuật ngữ ưu tiên (cho build-glossary)

| Hán | Mức ưu tiên | Ghi chú |
|-----|-------------|---------|
| 般若波羅蜜 | Cao | Trục toàn phẩm |
| 優波憍舍羅 / 方便 | Cao | Ba La Mật thứ 7 |
| 尼坻 / 願 | Cao | *Pranidhāna* |
| 婆羅 / 力 | Cao | *Bala* |
| 闍那 / 智 | Cao | *Jñāna* — khác 般若 |
| 勝天王 / 鉢婆羅 | Cao | Nhân vật chính |
| 無二無別、自性離 | Cao | Công thức lặp — cần một cách dịch cố định |
| 阿耨多羅三藐三菩提 | Trung | Đã quen kinh điển |
| 陀羅尼 | Trung | Xuất hiện sớm trong hội tràng |

Cần file **`web/data/glossary/sheng-tianwang.yaml`** cho tên riêng Bồ Tát/Thiên vương và mười Ba La Mật.

---

## 9. Bước tiếp theo

1. **Sửa OCR** (4–5 chỗ trên)
2. **Chạy segment-source** → tạo `sources/sheng-tianwang/vol01/ch01.zh.md`
3. **Chạy build-glossary** trên `ch01`
4. **translate-sino-vietnamese** → lớp `.hv.md`
5. **translate-buddhist-text** → `.vi.md`; **review-translation** chú ý công thức *vô nhị vô biệt* và phân biệt 智 vs 般若

---

## Kết luận

File hiện tại = **trọn Phẩm 1 / Quyển 1** của bộ 16 phẩm. **Không cần tách nhiều chapter** — chỉ chuẩn hóa OCR rồi đặt vào `sources/sheng-tianwang/vol01/ch01.zh.md`. Khi nhập tiếp các quyển, tách theo **品** theo bảng mục 5b.
