#!/usr/bin/env python3
"""Curate vi column in sheng-tianwang.yaml — safe rules only (no notes parsing)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SERIES_GLOSSARY = ROOT / "web/data/glossary/sheng-tianwang.yaml"
DEFAULT_GLOSSARY = ROOT / "web/data/glossary/terms.yaml"

ZH_VI: dict[str, str] = {
    "通達品第一": "Phẩm Thông Đạt thứ nhất",
    "通達品": "Phẩm Thông Đạt",
    "如是我聞": "Như thế này tôi nghe",
    "爾時": "Thời ấy",
    "一時": "Một thời",
    "大王": "Đại vương",
    "其名曰": "Tên như sau",
    "俱": "cùng",
    "修學一法，通達一切法": "tu học một pháp mà thông đạt vạn pháp",
    "僧伽藍": "Tăng già lam",
    "方便": "phương tiện",
    "五陰": "ngũ uẩn",
    "王舍大城耆闍崛山": "đại thành Vương Xá, núi Kỳ Xà Quật",
    "娑婆世界": "thế giới Ta Bà",
    "優禪尼國": "U Diên Ni quốc",
    "前後圍遶": "vây quanh trước sau",
    "還至": "trở về",
    "佛所": "chỗ Phật",
    "從面門入": "từ diện môn mà vào",
    "去此": "cách đây",
    "十恒河沙": "mười cõi nước nhiều như cát sông Hằng",
    "他佛土": "quốc thổ Phật khác",
    "諸梵天": "chư Phạm thiên",
    "諸阿修羅王": "chư A Tu La vương",
    "諸龍王": "chư long vương",
    "各將眷屬": "dẫn theo quyến thuộc",
    "不因飲食": "không nhờ ăn uống",
    "日月星光": "ánh sáng nhật nguyệt tinh quang",
    "至其佛所": "đến chỗ Phật ấy",
    "斯光明": "quang minh này",
    "以是因緣": "vì nhân duyên ấy",
    "今欲": "sắp",
    "圍遶": "vây quanh",
    "復有": "lại có",
    "靡有間隙": "chẳng còn khe hở",
    "況復": "huống chi",
    "尚無": "còn chẳng có",
    "其土": "nước ấy",
    "但資": "chỉ nhờ",
    "皆悉": "đều",
    "不現": "không hiện",
    "地平": "đất bằng",
    "如掌": "như lòng bàn tay",
    "右膝著地": "quỳ gối phải",
    "頭面作禮": "đầu mặt làm lễ",
    "而白佛言": "rồi bạch Phật rằng",
    "告": "bảo",
    "西方": "phương Tây",
    "東方": "phương Đông",
    "南方": "phương Nam",
    "北方": "phương Bắc",
    "上方": "phương Trên",
    "下方": "phương Dưới",
    "十方": "mười phương",
    "一乘": "nhất thừa",
    "正法": "chánh pháp",
    "修其法者": "tu hành pháp ấy",
    "已曾": "đã từng",
    "不斷": "không đoạn",
    "紹佛": "nối tiếp Phật",
    "雖現世間": "tuy hiện ở thế gian",
    "世法不染": "không bị thế pháp nhiễm ô",
    "地及": "đất và",
    "人非人": "người và phi người",
    "婆伽婆": "Thế Tôn",
}

HV_VI: dict[str, str] = {
    "Bà Già Bà": "Thế Tôn",
    "Ba La Đề Mộc Xoa": "giới bổn",
    "Tỳ Ni": "luật Tăng",
    "Tu Đa La": "kinh",
    "Thông Đạt Phẩm đệ nhất": "Phẩm Thông Đạt thứ nhất",
    "nhĩ thời": "Thời ấy",
    "Nhĩ thì": "Thời ấy",
    "Như thị ngã văn": "Như thế này tôi nghe",
    "Nhất thời": "Một thời",
    "kỳ danh viết": "Tên như sau",
    "kỳ danh vi": "Tên như sau",
    "tiền hậu vi nhiễu": "vây quanh trước sau",
    "hoàn chí": "trở về",
    "Phật sở": "chỗ Phật",
    "tòng diện môn nhập": "từ diện môn mà vào",
    "khứ thử": "cách đây",
    "thập Hằng Hà Sa": "mười cõi nước nhiều như cát sông Hằng",
    "tha Phật thổ": "quốc thổ Phật khác",
    "bất nhân ẩm thực": "không nhờ ăn uống",
    "mĩ hữu gian khích": "chẳng còn khe hở",
    "phục hữu": "lại có",
    "huống phục": "huống chi",
    "thượng vô": "còn chẳng có",
    "dĩ thị nhân duyên": "vì nhân duyên ấy",
    "kim dục": "sắp",
    "vi nhiễu": "vây quanh",
    "cá tương quyến thuộc": "dẫn theo quyến thuộc",
    "chí kỳ Phật sở": "đến chỗ Phật ấy",
    "tư quang minh": "quang minh này",
    "dĩ tằng": "đã từng",
    "thiệu Phật": "nối tiếp Phật",
    "tuy hiện thế gian": "tuy hiện ở thế gian",
    "địa cập": "đất và",
    "nhân phi nhân": "người và phi người",
    "nhân phi nhân đẳng": "người và phi người",
    "ngục A Tỳ": "địa ngục A Tỳ",
    "thành Càn Thát Bà": "thành ma mị",
}


def load_default_vi_overrides() -> dict[str, str]:
    raw = DEFAULT_GLOSSARY.read_text(encoding="utf-8")
    overrides: dict[str, str] = {}
    for b in re.split(r"(?=^  - zh:)", raw, flags=re.M)[1:]:
        zm = re.search(r'zh: "([^"]+)"', b)
        hm = re.search(r'^    hv: "([^"]+)"', b, re.M)
        vm = re.search(r'^    vi: "([^"]+)"', b, re.M)
        if zm and hm and vm and hm.group(1) != vm.group(1):
            overrides[zm.group(1)] = vm.group(1)
    return overrides


def propose_vi(zh: str, hv: str, vi: str, defaults: dict[str, str]) -> str:
    if zh in ZH_VI:
        return ZH_VI[zh]
    if zh in defaults:
        return defaults[zh]
    if hv in HV_VI:
        return HV_VI[hv]
    if hv.endswith(" quán") and not hv.startswith("quán "):
        stem = hv[:-5].strip()
        if len(stem) >= 2:
            return f"quán {stem}"
    if hv.startswith("ngục "):
        return f"địa ngục {hv[5:]}"
    return vi


def apply_curation() -> tuple[int, int]:
    defaults = load_default_vi_overrides()
    raw = SERIES_GLOSSARY.read_text(encoding="utf-8")
    lines = raw.splitlines(keepends=True)
    out: list[str] = []
    changed = curated = 0
    i = 0

    while i < len(lines):
        line = lines[i]
        if not re.match(r"^  - zh:", line):
            out.append(line)
            i += 1
            continue

        block = [line]
        i += 1
        zh_m = re.search(r'zh: "([^"]+)"', line)
        zh = zh_m.group(1) if zh_m else ""
        hv = vi = ""
        vi_idx = -1

        while i < len(lines) and not re.match(r"^  - zh:", lines[i]):
            block.append(lines[i])
            if m := re.match(r'^    hv: "([^"]+)"', lines[i]):
                hv = m.group(1)
            if m := re.match(r'^    vi: "([^"]+)"', lines[i]):
                vi = m.group(1)
                vi_idx = len(block) - 1
            i += 1

        new_vi = propose_vi(zh, hv, vi, defaults)
        if new_vi != vi and vi_idx >= 0:
            block[vi_idx] = f'    vi: "{new_vi}"\n'
            changed += 1
            if new_vi != hv:
                curated += 1

        out.extend(block)

    text = "".join(out)
    if not text.endswith("\n"):
        text += "\n"
    SERIES_GLOSSARY.write_text(text, encoding="utf-8", newline="\n")
    return changed, curated


if __name__ == "__main__":
    c, d = apply_curation()
    print(f"Updated {c} vi fields ({d} differ from hv)")
