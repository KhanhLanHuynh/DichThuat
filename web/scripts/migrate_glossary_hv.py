#!/usr/bin/env python3
"""Add hv: from legacy vi: when missing. Preserves UTF-8 and comments."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT = [
    ROOT / "web/data/glossary/terms.yaml",
    ROOT / "web/data/glossary/sheng-tianwang.yaml",
]


def migrate_content(raw: str) -> tuple[str, int]:
    lines = raw.splitlines(keepends=True)
    out: list[str] = []
    changed = 0
    i = 0
    while i < len(lines):
        line = lines[i]
        if not re.match(r"^  - zh:", line):
            out.append(line)
            i += 1
            continue

        block = [line]
        i += 1
        has_hv = False
        vi_line: str | None = None
        vi_idx = -1

        while i < len(lines) and not re.match(r"^  - zh:", lines[i]):
            block.append(lines[i])
            if re.match(r"^    hv:", lines[i]):
                has_hv = True
            m = re.match(r"^    vi:\s*(.+)$", lines[i].rstrip("\n"))
            if m:
                vi_line = lines[i]
                vi_idx = len(block) - 1
            i += 1

        if not has_hv and vi_line:
            m = re.match(r"^    vi:\s*(.+)$", vi_line.rstrip("\n"))
            if m:
                hv_val = m.group(1)
                eol = "\n" if vi_line.endswith("\n") else ""
                block.insert(vi_idx, f"    hv: {hv_val}{eol}")
                changed += 1

        out.extend(block)

    return "".join(out), changed


def migrate_file(path: Path) -> int:
    raw = path.read_text(encoding="utf-8")
    out, changed = migrate_content(raw)
    if changed == 0:
        print(f"No changes: {path}")
        return 0
    if not out.endswith("\n"):
        out += "\n"
    path.write_text(out, encoding="utf-8", newline="\n")
    print(f"Migrated {changed} terms in {path}")
    return changed


def main() -> None:
    targets = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else DEFAULT
    for p in targets:
        migrate_file(p)


if __name__ == "__main__":
    main()
