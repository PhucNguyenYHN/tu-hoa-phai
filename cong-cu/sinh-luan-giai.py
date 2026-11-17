import io, json, re, os, unicodedata, html, sys

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SITE = "https://phucnguyenyhn.github.io/tu-hoa-phai/"
tocs = {b: json.load(io.open(os.path.join(root, "toc-%s.json" % b), encoding="utf-8")) for b in ("sach1", "sach2")}
cache = {}


def page(b, p):
    k = (b, p)
    if k not in cache:
        f = os.path.join(root, "text", b, "%04d.txt" % p)
        t = unicodedata.normalize("NFC", io.open(f, encoding="utf-8").read()) if os.path.exists(f) else ""
        t = "\n".join(l for l in t.split("\n") if not re.search(r"TRUNG CHÂU|KHÂM THIÊN BÍ|THIÊN CƠ LUẬN|^\d{1,3}$", l.strip()))
        cache[k] = t
    return cache[k]


def clip(s, n=700):
    if len(s) <= n:
        return s
    c = s[:n]
    k = max(c.rfind(". "), c.rfind("; "), c.rfind(": "))
    return (c[:k + 1] if k > n * 0.5 else c) + " …"


def seg(b, p0, p1, pattern, n=800, stop=None, title="", skip_head=True):
    """Tìm pattern trong các trang p0..p1; trả về đoạn chữ ngay sau pattern (hoặc từ pattern)."""
    txt = ""
    marks = []
    for p in range(p0, p1 + 1):
        t = re.sub(r"\s*\n\s*", " ", page(b, p)).strip()
        marks.append((len(txt), p))
        txt += t + " "
    m = re.search(pattern, txt)
    if not m:
        return None
    pg = p0
    for off, p in marks:
        if off <= m.start():
            pg = p
    body = txt[m.end():] if skip_head else txt[m.start():]
    if stop:
        ms = re.search(stop, body[5:])
        if ms:
            body = body[:ms.start() + 5]
    return dict(title=title, page=pg, book=b, text=clip(body.strip(), n))


def heading_page(b, prefix):
    """Trang chứa tiêu đề mục: tra mục lục, nếu thiếu thì tìm giữa hai mục lân cận."""
    t = tocs[b]
    for x in t:
        if x[1].startswith(prefix + " "):
            return x[1], x[2]
    parent, idx = prefix.rsplit(".", 1)
    lo, hi = 1, None
    for x in t:
        mm = re.match(r"(%s)\.(\d+)\s" % re.escape(parent), x[1])
        if mm:
            k = int(mm.group(2))
            if k < int(idx):
                lo = max(lo, x[2])
            elif k > int(idx) and (hi is None or x[2] < hi):
                hi = x[2]
    hi = hi or lo + 6
    for p in range(lo, hi + 1):
        if re.search(r"%s\.?\s+Hóa" % re.escape(prefix), page(b, p)):
            return prefix, p
    return None


OVERRIDE = {"4.5.5": (227, r"nh\] ở cung tài bạch\s+", "4.5.5 Hóa Kị [năm sinh] ở cung tài bạch")}


def excerpt_section(b, prefix, n=800):
    if b == "sach1" and prefix in OVERRIDE:
        p0, pat, title = OVERRIDE[prefix]
        return seg(b, p0, p0 + 2, pat, n, title=title)
    hp = heading_page(b, prefix)
    if not hp:
        return None
    title, p0 = hp
    r = seg(b, p0, p0 + 2, r"%s\.?\s+Hóa [^.]{0,50}?(?:cung \w+(?: \w+)?)\s" % re.escape(prefix), n, title=title)
    if not r:
        r = seg(b, p0, p0 + 2, r"%s\.?\s+(?:\S+\s+){1,7}?(?=[A-ZĐ][a-zà-ỹ]+ )" % re.escape(prefix), n, title=title)
    if not r:
        r = seg(b, p0, p0 + 2, r"%s\.?\s+" % re.escape(prefix), n, title=title)
    return r


# ============ sinh du-lieu/luan-giai.json ============
CH = {"mệnh": "1", "huynh đệ": "2", "phu thê": "3", "tử nữ": "4", "tài bạch": "5", "tật ách": "6", "thiên di": "7",
      "nô bộc": "8", "quan lộc": "9", "điền trạch": "10", "phúc đức": "11", "phụ mẫu": "12"}
HM = {"loc": ("Hóa Lộc", "2"), "quyen": ("Hóa Quyền", "3"), "khoa": ("Hóa Khoa", "4"), "ki": ("Hóa Kị", "5")}
CHUC = list(CH)
OUT = {"_ghi_chu": "Đoạn trích sách theo từng mục để app tra theo lá số. Trích tự động từ chữ OCR đã sửa; mỗi mục có sách (book), trang (page), tiêu đề (title), chữ (text). Sinh bởi cong-cu/sinh-luan-giai.py."}
stat = {}


def pack(e):
    return None if not e else dict(b=e["book"][-1], p=e["page"], t=e["title"], x=e["text"])


# 1. Tứ Hóa năm sinh: Hóa × cung chức (Chương 4)
OUT["tuhoa_nam"] = {}
for h, (ten, c) in HM.items():
    OUT["tuhoa_nam"][h] = {}
    for chuc in CHUC:
        OUT["tuhoa_nam"][h][chuc] = pack(excerpt_section("sach1", "4.%s.%s" % (c, CH[chuc]), 900))
stat["tuhoa_nam"] = sum(1 for h in OUT["tuhoa_nam"].values() for v in h.values() if v)

# 2. Phi hóa: cung phát × hóa × cung nhận (Chương 5.5) ; tự hóa lấy Chương 6
OUT["phi_hoa"] = {}
miss = []
for src in CHUC:
    sec = heading_page("sach1", "5.5.%s" % CH[src])
    for h, (ten, c) in HM.items():
        for tgt in CHUC:
            ex = None
            if sec and src != tgt:
                title, p0 = sec
                pat = r"(?i:(?:Cung\s+)?%s\s+(?:phi\s+)?%s\s+nh[ậâa]p\s+cung\s+%s\s*[:;.])" % (re.escape(src), ten.replace("Hóa", "[Hh][óo]a"), re.escape(tgt))
                ex = seg("sach1", p0, p0 + 22, pat, 560, stop=r"(?i:(?:Cung )?[a-zà-ỹ ]{3,12} (?:phi )?hóa [^:]{3,12} nh[ậâa]p cung)|\(\d\) Cung [a-zà-ỹ ]{3,12} phi", title=title)
            if not ex and src == tgt:
                pat = r"[^.]{0,80}cung %s[^.]{0,60}tự %s" % (re.escape(src), ten.replace("Hóa", "[Hh]óa"))
                ex = seg("sach1", 457, 570, pat, 520, title="Chương 6 Cung tự hóa", skip_head=False)
            if ex:
                OUT["phi_hoa"]["%s|%s|%s" % (src, h, tgt)] = pack(ex)
            else:
                miss.append((src, h, tgt))


def all_matches(b, p0, p1, pattern, n, stop, title):
    """mọi chỗ khớp pattern trong p0..p1: [(vị trí, trang, đoạn chữ)]"""
    txt, marks = "", []
    for p in range(p0, p1 + 1):
        marks.append((len(txt), p))
        txt += re.sub(r"\s*\n\s*", " ", page(b, p)).strip() + " "
    res = []
    for m in re.finditer(pattern, txt):
        pg = p0
        for off, p in marks:
            if off <= m.start():
                pg = p
        body = txt[m.end():]
        ms = re.search(stop, body[5:])
        if ms:
            body = body[:ms.start() + 5]
        res.append((m.start(), dict(title=title, page=pg, book=b, text=clip(body.strip(), n))))
    return res


# vá các dòng OCR làm hỏng tên Hóa: ghép theo thứ tự trong sách (Lộc, Quyền, Khoa, Kị)
STOPX = r"(?i:(?:Cung )?[a-zà-ỹ ]{3,12} (?:phi )?hóa\W{0,2}\w{0,6}\s*nh[ậâa]p\s*cung)|\(\d\) Cung [a-zà-ỹ ]{3,12} phi"
HORDER = ["loc", "quyen", "khoa", "ki"]
fixed = 0
for src in CHUC:
    sec = heading_page("sach1", "5.5.%s" % CH[src])
    if not sec:
        continue
    title, p0 = sec
    for tgt in CHUC:
        if src == tgt:
            continue
        gone = [h for h in HORDER if "%s|%s|%s" % (src, h, tgt) not in OUT["phi_hoa"]]
        if not gone:
            continue
        loose = r"(?i:(?:Cung\s+)?%s\s+(?:phi\s+)?h[óo]a\W{0,2}\w{0,6}\W{0,2}\s*nh[ậâa]p\s*cung\s+%s\s*[:;.])" % (re.escape(src), re.escape(tgt))
        found = all_matches("sach1", p0, p0 + 22, loose, 560, STOPX, title)
        # bỏ những chỗ đã gán cho Hóa khác (so theo trang + đoạn chữ)
        used = set((v["p"], v["x"][:40]) for k, v in OUT["phi_hoa"].items() if k.startswith(src + "|") and k.endswith("|" + tgt))
        found = [f for f in found if (f[1]["page"], f[1]["text"][:40]) not in used]
        if len(found) == len(gone):
            for h, (pos, e) in zip(gone, found):
                OUT["phi_hoa"]["%s|%s|%s" % (src, h, tgt)] = pack(e)
                fixed += 1
miss = [(s, h, t) for s in CHUC for h in HORDER for t in CHUC if "%s|%s|%s" % (s, h, t) not in OUT["phi_hoa"]]
print("vá thêm:", fixed)
stat["phi_hoa"] ="%d/%d" % (len(OUT["phi_hoa"]), 12 * 4 * 12)

# 3. Sao: ý tượng cơ bản (Q2 chương 4)
STAR = {"Tử Vi": "4.1.1", "Thiên Cơ": "4.2.1", "Thái Dương": "4.3", "Vũ Khúc": "4.4.1", "Thiên Đồng": "4.5.1", "Liêm Trinh": "4.6.1",
        "Thiên Phủ": "4.7.1", "Thái Âm": "4.8.1", "Tham Lang": "4.9.1", "Cự Môn": "4.10", "Thiên Tướng": "4.11.1", "Thiên Lương": "4.12.1",
        "Thất Sát": "4.13.1", "Phá Quân": "4.14.1", "Văn Xương": "4.15.1", "Văn Khúc": "4.16.1", "Tả Phụ": "4.17.1", "Hữu Bật": "4.18.2",
        "Lộc Tồn": "4.18.1", "Đà La": "4.19.1", "Kình Dương": "4.19.2", "Linh Tinh": "4.19.3", "Hỏa Tinh": "4.19.4", "Địa Kiếp": "4.19.5",
        "Địa Không": "4.19.5", "Thiên Hình": "4.22.1", "Thiên Diêu": "4.22.1", "Hồng Loan": "4.23", "Thiên Hỷ": "4.23"}
OUT["sao"] = {}
for s, pre in STAR.items():
    e = excerpt_section("sach2", pre, 650)
    if not e:
        hp = heading_page("sach2", pre)
        e = dict(book="sach2", page=hp[1], title=hp[0], text="") if hp else None
    OUT["sao"][s] = pack(e)
stat["sao"] = "%d/%d" % (sum(1 for v in OUT["sao"].values() if v and v["x"]), len(STAR))

# 4. Cục × chi cung Mệnh (Q1 2.2.x)
CUCSEC = {"Kim4": 43, "Thổ5": 45, "Hỏa6": 47, "Mộc3": 49, "Thủy2": 51}
CHI = ["Tí", "Sửu", "Dần", "Mão", "Thìn", "Tị", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"]
CUCNAME = {"Kim4": "Kim tứ cục", "Thổ5": "Thổ ngũ cục", "Hỏa6": "Hỏa lục cục", "Mộc3": "Mộc tam cục", "Thủy2": "Thủy nhị cục"}
OUT["cuc"] = {}
for cuc, p0 in CUCSEC.items():
    OUT["cuc"][cuc] = {}
    for chi in CHI:
        nm = {"Kim4": "Kim tứ cục", "Thổ5": "Thổ ngũ cục", "Hỏa6": "Hỏa lục cục", "Mộc3": "Mộc tam cục", "Thủy2": "Thủy nhị cục"}[cuc]
        e = seg("sach1", p0, p0 + 2, r"%s ở cung [^.]{0,40}\b%s\b[^.]{0,80}can cung mệnh là[^.]*\." % (nm, chi), 1000, stop=r"\(\d\) |2\.2\.\d|2\.3\.", title="Cung mệnh của người %s" % nm, skip_head=False)
        if not e:
            e = seg("sach1", p0, p0 + 2, r"\(\d\) [^:]{0,30}: [^.]{0,60}cung [^.]{0,30}\b%s\b[^.]*\." % chi, 700, stop=r"\(\d\) ", title="Cung mệnh của người %s" % nm, skip_head=False)
        if not e:
            e = seg("sach1", p0, p0 + 1, r"Cung mệnh của người [^.]{0,20}cục\s+", 600, title="Cung mệnh của người %s" % cuc)
        OUT["cuc"][cuc][chi] = pack(e)
stat["cuc"] = sum(1 for c in OUT["cuc"].values() for v in c.values() if v)

# 5. Lai nhân cung: 12 nhân duyên (2.3.2) + 7.6
OUT["lai_nhan"] = {}
for chuc in CHUC:
    e = seg("sach1", 607, 609, r"- Lai nhân cung ở cung [^:]{0,80}%s[^:]{0,60}:" % re.escape(chuc), 600, stop=r"- Lai nhân cung ở cung", title="7.6 Lai nhân cung ở 12 cung", skip_head=False)
    OUT["lai_nhan"][chuc] = pack(e)
OUT["lai_nhan_chung"] = [pack(seg("sach1", 54, 56, r"- Lai nhân cung ở cung mệnh,", 500, stop=r"- Lai nhân cung ở cung", title="2.3.1 Ý nghĩa của lai nhân cung", skip_head=False)),
                         pack(seg("sach1", 605, 608, r"Phàm lai nhân cung ở các cung mệnh, tài, quan,", 700, title="7.6 Quan hệ giữa tứ hóa năm sinh và lai nhân cung", skip_head=False))]
stat["lai_nhan"] = sum(1 for v in OUT["lai_nhan"].values() if v)

# 6. Cung Thân (Q2 1.10.1)
OUT["than"] = {}
for chuc in CHUC:
    e = seg("sach2", 74, 79, r"\(\d\) Cung thân đồng cung với cung %s:" % re.escape(chuc), 500, stop=r"\(\d\) Cung thân|1\.10\.\d", title="1.10.1 Vị trí cung thân", skip_head=False)
    OUT["than"][chuc] = pack(e)
stat["than"] = sum(1 for v in OUT["than"].values() if v)

dst = os.path.join(root, "du-lieu", "luan-giai.json")
io.open(dst, "w", encoding="utf-8").write(json.dumps(OUT, ensure_ascii=False, separators=(",", ":")))
print(json.dumps(stat, ensure_ascii=False))
print("thiếu phi hóa:", len(miss), miss[:12])
print("kích thước:", os.path.getsize(dst))
