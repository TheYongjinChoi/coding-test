#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_lessons.py — qmd 실습 파일을 코딩 플랫폼용 자산으로 변환합니다.

  qmd (정본)
    ├─ snippets/<session>/NN-<checkId>.R   학생에게 보여줄 시작 코드(빈칸 포함)
    └─ lessons/<session>.js                개념 HTML · 빈칸 채점 규칙 · checkId

추가로 tracker R 스크립트를 받아 qmd의 check("id") 와 대조합니다.
어느 한쪽에만 있는 id는 표로 보고하고, 모든 id가 tracker에 있을 때만
lessons 의 tracker 필드를 채웁니다. 그래서 id를 바꿔도 조용히 어긋나지 않습니다.

사용법
  python3 tools/build_lessons.py --qmd-dir ~/.../kapae2026-exercise
  python3 tools/build_lessons.py --qmd-dir ... --only workflow --no-tracker-check

손으로 다듬은 hint · success · implication 은 재생성해도 보존됩니다
(기존 lessons/<session>.js 에서 단계 제목으로 찾아 다시 넣습니다).
"""

import argparse
import difflib
import json
import os
import re
import sys
import urllib.request

# ── 세션 등록부 ──────────────────────────────────────────────
#  세션을 늘리려면 여기에 한 줄 추가하고 qmd 파일명을 적으면 됩니다.
#  tracker 가 아직 없으면 None 으로 두세요. 플랫폼이 자체 채점으로 돌아갑니다.
RAW = "https://raw.githubusercontent.com/TheYongjinChoi/kapae2026-exercise/main/tracker"

SESSIONS = [
    dict(id="workflow", label="1일차 1강", qmd="1-1Workflow_sol.qmd",
         title="통계적 학습의 워크플로와 정규화 회귀",
         subtitle="OLS · Lasso · Ridge", color="#1D9E75",
         tracker=f"{RAW}/tracker_d1-1_workflow.R"),
    dict(id="nn", label="1일차 2강", qmd="1-2NN_sol.qmd",
         title="신경망",
         subtitle="순전파·역전파 직접 구현 · Keras", color="#185FA5",
         tracker=f"{RAW}/tracker_d1-2_nn.R"),
    dict(id="ensemble", label="1일차 3강", qmd="03Ensemble_sol.qmd",
         title="트리 기반 앙상블",
         subtitle="의사결정트리 · 배깅 · 랜덤포레스트 · 부스팅", color="#854F0B",
         tracker=f"{RAW}/tracker_d1-3_ensemble.R"),
    dict(id="weights", label="1일차 4강", qmd="1-4Weights_sol.qmd",
         title="가중치와 인과추론 복습",
         subtitle="성향점수 · IPW", color="#534AB7",
         tracker=None),
    dict(id="dml", label="2일차 1강", qmd="2-1DML_sol.qmd",
         title="이중 기계학습",
         subtitle="Neyman 직교성 · 교차적합", color="#D4537E",
         tracker=None),
]


# ══════════════════════════════════════════════════════════════
#  1. qmd 파싱
# ══════════════════════════════════════════════════════════════
def parse_qmd(path):
    lines = open(path, encoding="utf-8").read().split("\n")
    items, buf = [], []
    i = 0
    if lines and lines[0].strip() == "---":
        j = 1
        while j < len(lines) and lines[j].strip() != "---":
            j += 1
        i = j + 1

    in_callout = 0

    def flush():
        if buf:
            t = "\n".join(buf).strip()
            if t:
                items.append({"type": "text", "text": t})
            buf.clear()

    while i < len(lines):
        L = lines[i]
        if L.startswith("```{r"):
            flush()
            j = i + 1
            while j < len(lines) and not lines[j].startswith("```"):
                j += 1
            body = lines[i + 1:j]
            items.append({
                "type": "chunk",
                "opts": [x for x in body if x.startswith("#|")],
                "code": "\n".join(x for x in body if not x.startswith("#|")),
                "line": i + 1,
            })
            i = j + 1
            continue
        if L.startswith("```"):
            j = i + 1
            while j < len(lines) and not lines[j].startswith("```"):
                j += 1
            buf.extend(lines[i:j + 1])
            i = j + 1
            continue
        if L.startswith("::: ") or L.strip() == ":::":
            in_callout = max(0, in_callout - 1) if L.strip() == ":::" else in_callout + 1
            i += 1
            continue
        m = re.match(r"^(#{1,3})\s+(.*)$", L)
        if m and not L.startswith("# ──") and "════" not in L:
            flush()
            items.append({"type": "h" + str(len(m.group(1))),
                          "text": m.group(2).strip(), "callout": in_callout > 0})
            i += 1
            continue
        buf.append(L)
        i += 1
    flush()
    return items


def is_eval_false(c):
    return any("eval: false" in o for o in c["opts"])


def is_echo_false(c):
    return any("echo: false" in o for o in c["opts"])


def strip_grading_block(code):
    """학생 화면에서는 감출 채점 줄과 안내 배너를 제거합니다."""
    out = []
    for l in code.split("\n"):
        s = l.strip()
        if "════" in l or "정답 확인 및 리포트" in l or "코드 작성이 완료되면" in l:
            continue
        if re.match(r'^\s*check\("', l):
            continue
        if re.match(r"^\s*#\s*(Windows|Mac):", l):
            continue
        if s.startswith("#") and "코드 블록 전체 실행" in s:
            continue
        out.append(l)
    while out and not out[0].strip():
        out.pop(0)
    while out and not out[-1].strip():
        out.pop()
    return "\n".join(out)


def clean_for_web(code):
    """로컬 전용 코드를 웹 실행 환경에 맞게 바꿉니다."""
    lines, out, skip = code.split("\n"), [], 0
    for i, l in enumerate(lines):
        if skip:
            skip -= 1
            continue
        s = l.strip()
        if s.startswith("set_student("):
            continue
        if "tracker" in s and (s.startswith("source(") or s.startswith("# source(")):
            continue
        if s in ("# 정답과 진척도 확인을 위한 코드",
                 "# 정답과 진척도 확인을 위한 함수 불러오기"):
            continue
        if s.startswith("file_path <-"):
            out.append('file_path <- DATA("ohie_all6m.rds")   # 서버에 준비된 실습 데이터')
            j = i + 1
            if j < len(lines) and lines[j].strip().startswith("if (!file.exists"):
                depth, k = 0, j
                while k < len(lines):
                    depth += lines[k].count("{") - lines[k].count("}")
                    k += 1
                    if depth <= 0 and k > j:
                        break
                skip = k - j
            continue
        out.append(l)
    return re.sub(r"\n{3,}", "\n\n", "\n".join(out)).strip() + "\n"


# ══════════════════════════════════════════════════════════════
#  2. 마크다운 → HTML
# ══════════════════════════════════════════════════════════════
def md2html(md):
    md = md.replace("***", "").replace("<br>", "")
    md = re.sub(r"<!--.*?-->", "", md, flags=re.S)
    md = re.sub(r"\$\$(.+?)\$\$", lambda m: r"\\[" + m.group(1) + r"\\]", md, flags=re.S)
    md = re.sub(r"(?<!\$)\$([^$\n]+?)\$(?!\$)", lambda m: r"\\(" + m.group(1) + r"\\)", md)

    html, stack, para, base = [], [], [], [None]
    incode, codebuf = False, []

    def inline(t):
        t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
        t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
        return re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)

    def closep():
        if para:
            html.append("<p>" + inline(" ".join(para).strip()) + "</p>")
            para.clear()

    def closelists(level=0):
        while len(stack) > level:
            html.append("</li></" + stack.pop() + ">")

    for L in md.split("\n"):
        if L.strip().startswith("```"):
            if incode:
                closep(); closelists()
                esc = "\n".join(codebuf).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                html.append("<pre class='concept-code'>" + esc + "</pre>")
                codebuf, incode = [], False
            else:
                closep(); incode = True
            continue
        if incode:
            codebuf.append(L)
            continue

        m = re.match(r"^(\s*)[-*]\s+(.*)$", L)
        n = re.match(r"^(\s*)(\d+)\.\s+(.*)$", L)
        if m or n:
            closep()
            indent = len((m or n).group(1))
            if not stack or base[0] is None:
                base[0] = indent
            level = 1 if indent <= base[0] else 2
            tag = "ul" if m else "ol"
            txt = m.group(2) if m else n.group(3)
            if len(stack) < level:
                while len(stack) < level:
                    html.append("<" + tag + ">")
                    stack.append(tag)
                html.append("<li>" + inline(txt))
            else:
                closelists(level)
                html.append("</li><li>" + inline(txt))
            continue

        if not L.strip():
            closep(); closelists(); base[0] = None
            continue
        if stack:
            html[-1] += " " + inline(L.strip())
        else:
            para.append(L.strip())

    closep(); closelists()
    return "\n".join(html)


# ══════════════════════════════════════════════════════════════
#  3. 빈칸 정답 규칙 생성
# ══════════════════════════════════════════════════════════════
def strip_r_comments(code):
    out = []
    for l in code.split("\n"):
        res, q, i = [], None, 0
        while i < len(l):
            ch = l[i]
            if q:
                res.append(ch)
                if ch == "\\":
                    if i + 1 < len(l):
                        res.append(l[i + 1]); i += 1
                elif ch == q:
                    q = None
            else:
                if ch in "\"'`":
                    q = ch; res.append(ch)
                elif ch == "#":
                    break
                else:
                    res.append(ch)
            i += 1
        out.append("".join(res))
    return "\n".join(out)


def norm(code):
    c = re.sub(r"\s+", "", strip_r_comments(code))
    c = re.sub(r"(\d+\.\d*?)0+(?![\d])", r"\1", c)
    return re.sub(r"(\d+)\.(?![\d])", r"\1", c)


def build_blanks(starter, solution):
    if not solution:
        return []
    slines, olines = starter.split("\n"), solution.split("\n")
    sm = difflib.SequenceMatcher(None, [norm(l) for l in slines], [norm(l) for l in olines])
    pairs = []
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag not in ("replace", "delete"):
            continue
        blanks_s = [i for i in range(i1, i2) if "_____" in slines[i]]
        if not blanks_s:
            continue
        cand = [j for j in range(j1, j2)
                if olines[j].strip() and not olines[j].strip().startswith("#")]
        if len(blanks_s) == len(cand):
            pairs += list(zip(blanks_s, cand))
        else:
            for i in blanks_s:
                best, score = None, 0.0
                for j in cand:
                    r = difflib.SequenceMatcher(
                        None, slines[i].replace("_____", ""), olines[j]).ratio()
                    if r > score:
                        best, score = j, r
                pairs.append((i, best if score > 0.4 else None))

    lookup = dict(pairs)
    blanks = []
    for i, l in enumerate(slines):
        if "_____" not in l:
            continue
        j = lookup.get(i)
        blanks.append({
            "line": l.strip(),
            "answer": re.escape(norm(olines[j])).replace("/", r"\/") if j is not None else None,
        })
    return blanks


# ══════════════════════════════════════════════════════════════
#  4. 세션 구성
# ══════════════════════════════════════════════════════════════
def build_session(meta, qmd_path):
    items = parse_qmd(qmd_path)
    chapters, cur, pending_h2, pending_text = [], None, None, []

    def close():
        if cur and cur["steps"]:
            chapters.append(cur)

    for it in items:
        if it["type"] == "h1":
            close()
            cur = {"title": it["text"], "steps": []}
            pending_h2, pending_text = None, []
            continue
        if cur is None:
            continue
        if it["type"] in ("h2", "h3"):
            if it.get("callout"):
                pending_text.append("### " + it["text"])
            else:
                pending_h2, pending_text = it["text"], []
            continue
        if it["type"] == "text":
            pending_text.append(it["text"])
            continue

        code = it["code"]
        if is_echo_false(it):
            if cur["steps"]:
                cur["steps"][-1]["solution"] = code.strip()
            continue
        ids = re.findall(r'check\("([^"]+)"\)', code)
        cur["steps"].append({
            "title": pending_h2 or cur["title"],
            "concept": md2html("\n\n".join(pending_text)),
            "starter": strip_grading_block(code),
            "checkId": ids[0] if ids and ids[0] != "task" else None,
            "fill": is_eval_false(it),
            "solution": None,
        })
        pending_text = []
    close()

    for ch in chapters:
        for st in ch["steps"]:
            st["blanks"] = build_blanks(st["starter"], st["solution"]) if st["fill"] else []
    return chapters


def slug(step, chapter_title):
    if step.get("checkId"):
        return re.sub(r"[^0-9a-zA-Z\-]", "-", step["checkId"]).lower()
    m = re.search(r"Task\s*([0-9\-]+)", step["title"])
    if m:
        return "task" + m.group(1).strip("-")
    return "setup" if "준비" in chapter_title else "run"


# ══════════════════════════════════════════════════════════════
#  5. 손으로 고친 문구 보존
# ══════════════════════════════════════════════════════════════
def read_overrides(path):
    """기존 lessons/<id>.js 에서 단계 제목별 hint·success·implication 을 회수합니다."""
    if not os.path.exists(path):
        return {}
    src = open(path, encoding="utf-8").read()
    found, title = {}, None
    for line in src.split("\n"):
        m = re.match(r'\s*title: (".*"),\s*$', line)
        if m:
            try:
                title = json.loads(m.group(1))
            except Exception:
                title = None
            continue
        if title is None:
            continue
        m = re.match(r"\s*(hint|success|implication): (.+?),?\s*$", line)
        if m:
            found.setdefault(title, {})[m.group(1)] = m.group(2).rstrip(",")
    return found


# ══════════════════════════════════════════════════════════════
#  6. tracker 대조
# ══════════════════════════════════════════════════════════════
def fetch(url, timeout=15):
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.read().decode("utf-8")
    except Exception as e:
        return None


def cross_check(meta, check_ids, enabled):
    """qmd 의 checkId 와 tracker 가 정의한 id 를 대조합니다."""
    if not meta["tracker"]:
        return {"url": None, "ok": False, "missing": [], "extra": [], "note": ""}
    if not enabled:
        # 오프라인 빌드: 대조는 못 하지만 등록부의 설정값을 그대로 신뢰합니다.
        return {"url": meta["tracker"], "ok": True, "missing": [], "extra": [],
                "note": "대조 건너뜀"}
    body = fetch(meta["tracker"])
    if body is None:
        return {"url": meta["tracker"], "ok": False, "missing": [], "extra": [],
                "note": "받지 못함"}
    declared = set(re.findall(r'"([a-zA-Z][a-zA-Z0-9._\-]*)"\s*=', body))
    declared |= set(re.findall(r'rules\[\["([^"]+)"\]\]', body))
    missing = [i for i in check_ids if i not in body]
    extra = sorted(d for d in declared if d not in check_ids and "-" in d)
    return {"url": meta["tracker"], "ok": not missing, "missing": missing,
            "extra": extra, "note": ""}


# ══════════════════════════════════════════════════════════════
#  7. 출력
# ══════════════════════════════════════════════════════════════
def emit(meta, chapters, out_dir, tracker_ok):
    snip_dir = os.path.join(out_dir, "snippets", meta["id"])
    os.makedirs(snip_dir, exist_ok=True)
    os.makedirs(os.path.join(out_dir, "lessons"), exist_ok=True)

    lesson_path = os.path.join(out_dir, "lessons", f"{meta['id']}.js")
    keep = read_overrides(lesson_path)

    n, prev_title, js_chapters = 0, None, []
    for ci, ch in enumerate(chapters):
        steps = []
        for st in ch["steps"]:
            title = st["title"] + (" — 결과 확인" if prev_title == st["title"] else "")
            prev_title = st["title"]
            n += 1
            fname = f"{n:02d}-{slug(st, ch['title'])}.R"
            with open(os.path.join(snip_dir, fname), "w", encoding="utf-8") as f:
                f.write(clean_for_web(st["starter"]))
            steps.append(dict(st, title=title,
                              starter_path=f"snippets/{meta['id']}/{fname}"))
        js_chapters.append({"title": ch["title"], "steps": steps})

    J = lambda o: json.dumps(o, ensure_ascii=False)
    L = ["// " + "=" * 60,
         f"//  {meta['label']} — {meta['title']}",
         "//  tools/build_lessons.py 가 qmd 에서 생성합니다. 직접 고치면 다음 실행 때 덮어씁니다.",
         "//  단, hint · success · implication 은 제목으로 찾아 보존합니다.",
         "// " + "=" * 60, "",
         "registerCourse({",
         f"  id: {J(meta['id'])},",
         f"  label: {J(meta['label'])},",
         f"  title: {J(meta['title'])},",
         f"  subtitle: {J(meta['subtitle'])},",
         f"  color: {J(meta['color'])},",
         f"  tracker: {J(meta['tracker']) if tracker_ok else 'null'},",
         "  chapters: ["]

    for ci, ch in enumerate(js_chapters):
        L += ["    {", f"      title: {J(ch['title'])},",
              f"      color: {J(meta['color'])},", "      steps: ["]
        for st in ch["steps"]:
            k = keep.get(st["title"], {})
            L += ["        {",
                  f"          title: {J(st['title'])},",
                  f"          mode: {J('fill' if st['fill'] else 'run')},",
                  f"          checkId: {J(st['checkId'])},",
                  f"          starter_path: {J(st['starter_path'])},",
                  f"          concept: {J(st['concept'])},"]
            if st["blanks"]:
                L.append("          blanks: [")
                for b in st["blanks"]:
                    ans = f"/{b['answer']}/" if b["answer"] else "null"
                    L.append(f"            {{ line: {J(b['line'])}, answer: {ans} }},")
                L.append("          ],")
            else:
                L.append("          blanks: [],")
            L += [f"          hint: {k.get('hint', 'null')},",
                  f"          success: {k.get('success', J('완료했습니다. 다음 단계로 넘어가세요.'))},",
                  f"          implication: {k.get('implication', 'null')}",
                  "        },"]
        L += ["      ]", "    },"]
    L += ["  ]", "});", ""]

    open(lesson_path, "w", encoding="utf-8").write("\n".join(L))
    return n, len(keep)


# ══════════════════════════════════════════════════════════════
#  8. 자체 검증
# ══════════════════════════════════════════════════════════════
def verify(chapters):
    bad, total, blank_null = [], 0, 0
    for ch in chapters:
        for st in ch["steps"]:
            if not st["blanks"] or not st["solution"]:
                continue
            target = norm(st["solution"])
            for b in st["blanks"]:
                total += 1
                if b["answer"] is None:
                    blank_null += 1
                    continue
                if not re.search(b["answer"].replace(r"\/", "/"), target):
                    bad.append((st["title"], b["line"]))
    return total, blank_null, bad


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--qmd-dir", required=True, help="qmd 실습 파일이 있는 폴더")
    ap.add_argument("--out", default=".", help="coding-test 저장소 경로 (기본: 현재 폴더)")
    ap.add_argument("--only", help="세션 id 하나만 처리")
    ap.add_argument("--no-tracker-check", action="store_true",
                    help="tracker 대조를 건너뜁니다 (오프라인)")
    a = ap.parse_args()

    rows, failed = [], False
    for meta in SESSIONS:
        if a.only and meta["id"] != a.only:
            continue
        qmd = os.path.join(os.path.expanduser(a.qmd_dir), meta["qmd"])
        if not os.path.exists(qmd):
            rows.append((meta["id"], "-", "-", "qmd 없음 — 건너뜀"))
            continue

        chapters = build_session(meta, qmd)
        ids = [st["checkId"] for ch in chapters for st in ch["steps"] if st["checkId"]]
        tc = cross_check(meta, ids, not a.no_tracker_check)
        total, nulls, bad = verify(chapters)
        n, kept = emit(meta, chapters, os.path.expanduser(a.out), tc["ok"])

        note = []
        if tc["url"] is None:
            note.append("tracker 없음 → 자체 채점")
        elif tc["ok"]:
            note.append("tracker 연결 (대조 건너뜀)" if tc["note"]
                        else f"tracker 연결 ({len(ids)}개 id 일치)")
        else:
            note.append(f"tracker 미연결: {tc['note'] or 'id ' + ', '.join(tc['missing'][:3]) + ' 없음'}")
            failed = True
        if tc["extra"]:
            note.append(f"tracker에만 있는 id: {', '.join(tc['extra'][:3])}")
        if bad:
            note.append(f"정답 규칙 불일치 {len(bad)}건")
            failed = True
        if nulls:
            note.append(f"미대응 빈칸 {nulls}개")
        if kept:
            note.append(f"기존 문구 {kept}개 보존")

        rows.append((meta["id"], f"{n}단계", f"빈칸 {total}", " · ".join(note)))
        for t, l in bad:
            print(f"    [불일치] {meta['id']} / {t} / {l}", file=sys.stderr)

    w = max(len(r[0]) for r in rows) if rows else 8
    print()
    for r in rows:
        print(f"  {r[0].ljust(w)}  {r[1]:>6}  {r[2]:>8}   {r[3]}")
    print()
    if failed:
        print("  ⚠ 확인이 필요한 항목이 있습니다. 위 메시지를 보세요.")
        sys.exit(1)
    print("  모두 정상입니다.")


if __name__ == "__main__":
    main()
