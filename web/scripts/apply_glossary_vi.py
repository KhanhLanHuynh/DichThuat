#!/usr/bin/env python3
"""Apply safe glossary hv→vi replacements to .vi.md (curated pairs only)."""
from __future__ import annotations

import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# Safe replacements for ch01 re-run (hv → vi where layers differ)
SAFE_REPLACEMENTS: list[tuple[str, str]] = [
    ("Bà Già Bà", "Thế Tôn"),
    ("Ba La Đề Mộc Xoa", "giới bổn"),
    ("trong Tỳ Ni có nói", "trong luật Tăng có nói"),
    ("Trong kinh Tu Đa La,", "Trong kinh,"),
    ("Trong giáo A Hàm của Phật và trong Tỳ Ni có nói Ba La Đề Mộc Xoa",
     "Trong giáo A Hàm của Phật và trong luật Tăng có nói giới bổn"),
    ("nghe trong kinh Tu Đa La Như Lai", "nghe trong kinh Như Lai"),
    ("nhân phi nhân", "người và phi người"),
    ("như thành Càn Thát Bà,", "như thành ma mị,"),
    ("ngục A Tỳ", "địa ngục A Tỳ"),
]


def main() -> None:
    trans_dir = ROOT / "web/data/translations/sheng-tianwang/vol01"
    vi_src = trans_dir / "ch01.vi - Copy.md"
    hv_src = trans_dir / "ch01.hv - Copy.md"
    vi_path = trans_dir / "ch01.vi.md"
    hv_path = trans_dir / "ch01.hv.md"

    shutil.copy2(vi_src, vi_path)
    shutil.copy2(hv_src, hv_path)

    text = vi_path.read_text(encoding="utf-8")
    total = 0
    for hv, vi in sorted(SAFE_REPLACEMENTS, key=lambda x: len(x[0]), reverse=True):
        text, n = re.subn(re.escape(hv), vi, text)
        total += n

    if not text.endswith("\n"):
        text += "\n"
    vi_path.write_text(text, encoding="utf-8", newline="\n")
    print(f"Wrote {vi_path.name} and {hv_path.name}; {total} targeted vi fixes")


if __name__ == "__main__":
    main()
