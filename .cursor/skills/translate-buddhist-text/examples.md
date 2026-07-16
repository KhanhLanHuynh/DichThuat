# Translation Examples (Thuần Việt / `.vi.md`)

Plain-text output: one source line → one translation line. No Markdown headings.

**Glossary:** use the `vi` column from YAML for every bound term. Use `hv` only when `vi` equals `hv` in the glossary.

## Example 1 — Single line

**Source line 1:**

```
觀自在菩薩行深般若波羅蜜多時，照見五蘊皆空，度一切苦厄。
```

**Output line 1:**

```
Bồ tát Quán Tự Tại, khi hành sâu Bát nhã ba la mật, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.
```

## Example 2 — Q&A (two source lines)

**Source:**

```
舍利弗問：「云何是涅槃？」
佛答：「寂滅為涅槃。」
```

**Output (line 1):**

```
Xá Lợi Phất hỏi: «Niết Bàn là gì?»
```

**Output (line 2):**

```
Phật đáp: «Tịch diệt tức là Niết bàn.»
```

## Example 5 — Buddha direct address (`.vi.md`)

**Source:**

```
佛告勝天王言：「大王！善哉，善哉！」
```

**Wrong:** Phật bảo Thắng Thiên Vương rằng: 「Đại vương! Thiện thay, thiện thay!」

**Correct:** Phật bảo Thắng Thiên Vương rằng: 「Này Đại vương! Thiện thay, thiện thay!」

## Example 3 — hv ≠ vi (glossary split)

**Source:** 爾時，婆伽婆在…

**Wrong (copied `hv`):** Nhĩ thì, Bà Già Bà ở…

**Correct (`vi`):** Thời ấy, Thế Tôn ở…

## Example 4 — Uncertainty

**Source line:** 知見障

**Output line:** chướng tri kiến [?]

**Note in `notes/`:** Bản khác作「知障」.

## Example 6 — HV residue / DIFF (`.vi.md`)

**Source:** 而白佛言：「…自性離故…體性清淨…」

**Wrong:** … nhi bạch Phật ngôn: 「… vì tự tính ly … có thể tính Thanh Tịnh…」

**Correct:** … bạch Phật rằng: 「… vì tự tánh vốn lìa … thể tánh Thanh Tịnh…」

(Use glossary `vi`; drop 而/`nhi`; 離 → `lìa` not bare `ly`; 體性 ≠ “có thể tính”.)

## Example 7 — Single locative (安置…中)

**Source:** 於生死海皆悉安置般若波羅蜜中

**Wrong:** đều an trí họ giữa biển sinh tử vào trong Bát nhã ba la mật

**Correct:** giữa biển sinh tử, đều an trí họ vào trong Bát nhã ba la mật

