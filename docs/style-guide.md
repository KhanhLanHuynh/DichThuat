# Hướng dẫn phong cách — Dịch kinh Phật Hán → Việt

## 1. Các lớp thuật ngữ

Glossary đăng ký **hai cột** cho mỗi thuật ngữ Hán:

| Cột | Lớp dịch | Khi dùng | Ví dụ |
|-----|----------|----------|-------|
| `hv` | Hán-Việt (âm dịch) | `.hv.md` | 菩提 → Bồ Đề; 修多羅 → Tu Đa La |
| `vi` | Thuần Việt | `.vi.md` | 菩提 → Bồ Đề; 修多羅 → kinh |

| Loại | `hv` | `vi` |
|------|------|------|
| Thuật ngữ giáo lý / danh hiệu | Hán-Việt chuẩn | Thường giữ nguyên hoặc thuần Việt đọc được |
| Từ thông dụng, liên kết câu | Âm dịch từng chữ | Nói / giảng / khai (tùy ngữ cảnh) |
| Âm dịch tên riêng | A Di Đà | A Di Đà |

Khi `hv` và `vi` tranh nhau, theo `web/data/glossary/terms.yaml` — **không** dùng `hv` trong `.vi.md` trừ khi `vi` trùng `hv`.

## 2. Kính xưng và danh hiệu

| Hán | Việt |
|-----|------|
| 佛 | Phật |
| 世尊 | Thế Tôn |
| 如來 | Như Lai |
| 菩薩 | Bồ-tát |
| 羅漢 | A-la-hán |
| 法師 | pháp sư |

## 3. Lỗi thường gặp

| Hán | Sai | Đúng | Ghi chú |
|-----|-----|------|---------|
| 法 | đạo | pháp / Pháp | 法 = pháp/giáo lý, không phải "tôn giáo" |
| 無 | không có | không | phủ định bản thể học |
| 心 | lòng | tâm | trong ngữ cảnh A-tỳ-đạm |
| 眾生 | người | chúng sanh | |
| 修行 | tu hành | tu tập / hành trì | tùy bộ kinh |

## 4. Mẫu câu kinh điển

**Công thức mở đầu**

```
爾時 → Thời ấy,
世尊...說 → Thế Tôn... thuyết
```

**Kệ song song** — giữ số dòng; nhịp điệu tùy chọn nhưng phải rõ nghĩa.

**Danh sách** — giữ số lượng và thứ tự:

```
所謂：一者...二者... → gọi là: một là... hai là...
```

## 5. Chú thích cuối trang (`.vi.md` only)

Dùng cho:

- Dị bản (校勘)
- Thuật ngữ kỹ thuật chưa dịch lần đầu
- Chú thích độc giả (註解) khi người dùng yêu cầu

**Quy tắc:**

- Marker inline trên **cùng dòng** dịch: `…từ ngữ[^1]…` (không thêm dòng body).
- Định nghĩa nằm sau delimiter `<!-- footnotes -->` ở cuối file (web editor chèn tự động khi lưu).
- **Một chương = một dãy số** (`[^1]`, `[^2]`, …); mỗi `.vi.md` bắt đầu lại từ `[^1]`.
- Thêm chú thích trong web workbench: chọn cụm trong VI → **Insert footnote** (`Ctrl+Shift+F`).
- **Không** dùng footnote trong `.hv.md` — OCR/校勘 ghi trong `notes/`.
- Máy dịch / agent **không** tự thêm footnote; thêm sau khi dịch xong.

```markdown
Thời ấy, Thế Tôn…[^1]

<!-- footnotes -->
[^1]: Bản khác作「空」.
```

## 6. Định dạng đối chiếu song song

Trong `parallel/*.parallel.md`:

```markdown
| Hán | Việt |
|-----|------|
| 觀自在菩薩 | Bồ-tát Quán Tự Tại |
```

## 7. Ví dụ

### Văn kinh

**Nguồn:** 色不異空，空不異色；色即是空，空即是色。

**Dịch:** Sắc không khác không, không không khác sắc; sắc tức là không, không tức là sắc.

### Hỏi–đáp

**Nguồn:** 文殊師利問曰：...

**Dịch:** Văn-thù Sư-lợi hỏi: ...

### Phật xưng hô trực tiếp (`.vi.md`)

Khi **Phật / Như Lai / Thế Tôn / 婆伽婆 / 世尊** nói **trực tiếp** với đối thoại và câu mở đầu bằng xưng hô (呼), thêm **`Này`** trước danh hiệu hoặc tên:

| Nguồn | Dịch (trong lời dẫn) |
|-------|----------------------|
| 佛告勝天王言：「大王！…」 | Phật bảo Thắng Thiên Vương rằng: 「**Này** Đại vương!…」 |
| 「善男子！…」 | 「**Này** thiện nam tử!…」 |

- Chỉ áp dụng lời Phật (không áp dụng Bồ Tát, đệ tử, v.v.).
- Chỉ khi nguồn có xưng hô mở đầu; không thêm nếu đã có `Này`.
- **Không** áp dụng cho `.hv.md` (Hán-Việt giữ sát nguồn).
