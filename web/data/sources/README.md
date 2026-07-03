# Văn bản nguồn tiếng Hán

Đặt file nguồn tại đây dưới dạng Markdown (`.zh.md`), hoặc tải lên qua **Upload** trong web app.

## Bố cục

```
sources/{series}/{volume}/ch{NN}.zh.md
```

(Đường dẫn logic; vật lý nằm trong `web/data/sources/`.)

## Ví dụ

Xem `sources/_examples/heart-sutra/ch01.zh.md` làm mẫu tối thiểu.

## Frontmatter

```yaml
---
title: "Tiêu đề chương"
series: series-id
volume: "01"
chapter: "01"
source_edition: "CBETA / Taisho / khác"
script: traditional
---
```
