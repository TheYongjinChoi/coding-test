// ============================================================
//  app.js — 실습 화면 컨트롤러
//  · ?session=<id> 로 세션을 고르고 lessons/<id>.js 의 내용을 실행합니다.
//  · 빈칸을 모두 정확히 채워야 다음 단계가 열립니다.
//  · tracker(R 채점 스크립트)가 연결된 세션은 서버 채점을,
//    아직 연결되지 않은 세션은 blanks 기반 자체 채점을 씁니다.
// ============================================================

let COURSE      = null;
let SESSION_ID  = "";
let allSteps    = [];
let currentIdx  = 0;

let studentId     = "";
let sid           = "";
let trackerReady  = false;     // 서버에 tracker가 실제로 로드되었는가
let stepStartTime = null;
let stepAttempts  = {};
let lastResult    = null;      // { passed, blanks:[bool|null], feedback }

/* ══════════════════════════════════════════════════════════
   부팅
══════════════════════════════════════════════════════════ */
async function boot() {
  applyTheme(localStorage.getItem("theme") || "dark");

  const params = new URLSearchParams(location.search);
  SESSION_ID = params.get("session") || SESSION_ORDER[0].id;
  COURSE = COURSES[SESSION_ID];

  if (!COURSE) {
    document.getElementById("mission-body").innerHTML =
      `<p class="out-err">'${SESSION_ID}' 세션을 찾을 수 없습니다. <a href="index.html">실습 목록으로 돌아가기</a></p>`;
    return;
  }

  studentId = getStudentId();
  if (!studentId) {
    studentId = "anonymous";
  }
  sid = getSid();

  document.getElementById("session-label").textContent =
    COURSE.label ? `${COURSE.label} · ${COURSE.title}` : COURSE.title;
  document.getElementById("footer-right").textContent =
    COURSE.tracker ? "정답 확인: 서버 채점 사용" : "정답 확인: 브라우저 채점 사용";

  buildStepList();

  // 이어하기: 마지막으로 열린 단계에서 시작
  const wanted = parseInt(params.get("step"), 10);
  const openAt = Number.isInteger(wanted) ? wanted : unlockedUpTo(SESSION_ID);
  renderStep(Math.min(openAt, allSteps.length - 1));

  initRSession();
}

function buildStepList() {
  allSteps = [];
  COURSE.chapters.forEach((ch, ci) => {
    ch.steps.forEach((st, si) => {
      allSteps.push({ chapterIdx: ci, stepIdx: si, chapter: ch, step: st });
    });
  });
}

/* R 세션(단계 간 객체가 유지되는 실행 환경)을 서버에 만듭니다. */
async function initRSession(isRetry = false) {
  try {
    const res = await fetch(`${API_URL}/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sid, session: SESSION_ID, tracker: COURSE.tracker, student: studentId
      })
    });
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    trackerReady = !!unbox(data.tracker);
    if (COURSE.tracker && !trackerReady) {
      toast("서버 채점 스크립트를 불러오지 못해 브라우저 채점으로 진행합니다.");
    }
  } catch (e) {
    // 배정된 서버가 응답하지 않으면 다음 서버로 넘깁니다.
    if (!isRetry && failoverApi()) {
      toast("실행 서버를 바꿨습니다. 「데이터 준비」 단계부터 다시 실행해 주세요.");
      return initRSession(true);
    }
    toast("R 서버 연결이 지연되고 있습니다. 첫 실행이 느릴 수 있습니다.");
  }
}

/* ══════════════════════════════════════════════════════════
   단계 렌더
══════════════════════════════════════════════════════════ */
async function renderStep(idx) {
  currentIdx = idx;
  const { chapter: ch, step } = allSteps[idx];
  const unlocked = unlockedUpTo(SESSION_ID);

  document.getElementById("chapter-badge").textContent = ch.title;
  document.getElementById("chapter-badge").style.background = ch.color + "22";
  document.getElementById("chapter-badge").style.color = ch.color;
  document.getElementById("lesson-title").textContent = step.title;

  renderNav(idx, unlocked);
  renderMission(step);

  // 에디터
  const wrap = document.getElementById("code-editor-wrap");
  wrap.innerHTML = "";
  const ta = document.createElement("textarea");
  ta.id = "code-editor";
  ta.spellcheck = false;
  ta.autocomplete = "off";
  ta.value = "# 실습 코드를 불러오는 중...";
  wrap.appendChild(ta);
  initHighlight();
  setupShortcuts();
  ta.value = await fetchStarter(step);
  updateHighlight();

  // 출력 초기화
  document.getElementById("output-body").innerHTML =
    '<span class="output-placeholder">코드를 실행하면 결과가 여기에 나타나요.</span>';
  document.getElementById("output-plots").innerHTML = "";
  setStatus("", "");
  document.getElementById("modal-overlay").style.display = "none";

  const runBtn = document.getElementById("run-btn");
  runBtn.textContent = "▶ 전체 실행";
  runBtn.onclick = () => runCode("all");
  runBtn.disabled = false;
  runBtn.classList.remove("next-mode");

  // 이미 완료한 단계라면 바로 다음으로 넘어갈 수 있게 표시
  if (sessionProgress(SESSION_ID).done.includes(idx) && idx < allSteps.length - 1) {
    document.getElementById("mission-body").insertAdjacentHTML("afterbegin",
      `<div class="notice done-notice">이미 완료한 단계입니다.
         <button class="link-btn" onclick="goStep(${idx + 1})">다음 단계로 이동 →</button></div>`);
  }

  lastResult = null;
  stepStartTime = Date.now();
  if (!stepAttempts[idx]) stepAttempts[idx] = 0;

  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();
}

async function fetchStarter(step) {
  if (!step.starter_path) return step.starter || "";
  try {
    const res = await fetch(step.starter_path);
    if (!res.ok) throw new Error(res.status);
    return await res.text();
  } catch (e) {
    return `# [오류] 실습 코드를 불러오지 못했습니다.\n# 경로 확인: ${step.starter_path}`;
  }
}

function renderNav(idx, unlocked) {
  const nav = document.getElementById("steps-nav");
  const done = sessionProgress(SESSION_ID).done;
  nav.innerHTML = allSteps.map((s, i) => {
    const isDone   = done.includes(i);
    const isActive = i === idx;
    const isLocked = i > unlocked;
    const cls = "step-dot" + (isActive ? " active" : "") + (isDone ? " done" : "") + (isLocked ? " locked" : "");
    const label = isLocked
      ? `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`
      : isDone
        ? `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`
        : i + 1;
    const style = isActive ? `background:${s.chapter.color};border-color:${s.chapter.color};` : "";
    return `<div class="${cls}" style="${style}" onclick="goStep(${i})"
              title="${s.chapter.title} · ${s.step.title}">${label}</div>`;
  }).join("");
}

function renderMission(step) {
  const isFill = step.mode === "fill" && step.blanks && step.blanks.length > 0;
  const body = document.getElementById("mission-body");

  const tasksHtml = isFill
    ? step.blanks.map((b, i) => `
        <div class="task-item" id="task-row-${i}">
          <div class="task-check" id="task-check-${i}"></div>
          <span class="content-text task-code">${escHtml(b.line)}</span>
        </div>`).join("")
    : `<div class="task-item">
         <div class="task-check" id="task-check-0"></div>
         <span class="content-text">아래 코드를 그대로 실행하고 결과를 확인하세요.</span>
       </div>`;

  body.innerHTML = `
    <div class="mission-section">
      <div class="mission-label">개념</div>
      <div class="mission-text content-text">${step.concept || ""}</div>
    </div>

    <div class="mission-section">
      <div class="mission-label">${isFill ? "채워야 할 빈칸" : "할 일"}</div>
      <div class="task-box">${tasksHtml}</div>
      ${isFill ? `<div class="task-note">빈칸을 모두 정확히 채워야 다음 단계가 열립니다.<br>중간 확인은 <kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>(현재 줄만 실행), 채점은 <b>전체 실행</b>입니다.</div>` : ""}
    </div>

    <div class="mission-section" id="feedback-section" style="display:none;">
      <div class="mission-label">채점 결과</div>
      <div class="feedback-box" id="feedback-box"></div>
    </div>

    ${step.hint ? `
    <div class="mission-section">
      <div class="mission-label">힌트</div>
      <div class="hint-box content-text">${step.hint}</div>
    </div>` : ""}

    <div class="shortcut-divider"></div>
    <div class="mission-section">
      <div class="mission-label">단축키</div>
      <div class="shortcut-list">
        <div class="shortcut-group-label">코드 입력</div>
        <div class="shortcut-item"><span class="shortcut-desc">할당 연산자 &lt;-</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Alt</kbd><kbd>-</kbd></span><span class="shortcut-keys-row"><kbd>Option</kbd><kbd>-</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">파이프 %&gt;%</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>M</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>M</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">들여쓰기 / 내어쓰기</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Tab</kbd><kbd>⇧</kbd><kbd>Tab</kbd></span></span></div>
        <div class="shortcut-group-label">실행</div>
        <div class="shortcut-item"><span class="shortcut-desc">현재 줄 실행 (채점 안 함)</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>Enter</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>Enter</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">전체 실행 + 채점</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>Enter</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>Enter</kbd></span></span></div>
        <div class="shortcut-group-label">편집</div>
        <div class="shortcut-item"><span class="shortcut-desc">주석 토글</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>C</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>C</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">줄 삭제 / 복제</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>D</kbd></span><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>D</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">줄 위/아래 이동</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Alt</kbd><kbd>↑↓</kbd></span></span></div>
      </div>
    </div>`;
}

function goStep(i) {
  if (i < 0 || i >= allSteps.length) return;
  if (i > unlockedUpTo(SESSION_ID)) {
    toast("이전 단계를 먼저 완료해야 열립니다.");
    return;
  }
  renderStep(i);
}

async function resetCode() {
  const { step } = allSteps[currentIdx];
  const editor = document.getElementById("code-editor");
  if (!editor) return;
  editor.value = "# 코드를 다시 불러오는 중...";
  updateHighlight();
  editor.value = await fetchStarter(step);
  updateHighlight();
}

/* ══════════════════════════════════════════════════════════
   실행 + 채점
══════════════════════════════════════════════════════════ */
/* mode = "all"      → 전체 실행 + 채점 (실행 버튼, Ctrl/Cmd + Shift + Enter)
   mode = "fragment" → 선택 영역 또는 커서가 있는 줄만 실행, 채점하지 않음
                       (Ctrl/Cmd + Enter — RStudio·Positron과 같은 동작) */
async function runCode(mode = "all") {
  const editor = document.getElementById("code-editor");
  const outEl  = document.getElementById("output-body");
  const runBtn = document.getElementById("run-btn");
  const { step } = allSteps[currentIdx];
  if (!editor) return;

  const partial = mode === "fragment";
  let code = editor.value;

  if (partial) {
    const frag = getRunFragment(editor);
    code = frag.text;
    if (!code.trim()) return;
    // RStudio처럼 실행한 줄 다음으로 커서를 옮깁니다.
    editor.selectionStart = editor.selectionEnd = frag.end;
    syncScroll();
  }

  if (!code.trim()) return;

  if (code.includes("_____")) {
    outEl.innerHTML = `<span class="out-err">${partial
      ? "실행하려는 줄에 빈칸(_____)이 남아 있습니다."
      : "빈칸(_____)이 아직 남아 있습니다. 왼쪽 목록을 보고 모두 채운 뒤 실행하세요."}</span>`;
    setStatus("✗ 빈칸 남음", "status-err");
    return;
  }

  const prevLabel = runBtn.textContent;
  const prevClick = runBtn.onclick;
  runBtn.disabled = true;
  runBtn.textContent = partial ? "부분 실행 중..." : "실행 중...";
  outEl.innerHTML = '<span class="output-placeholder">R 서버에서 실행 중...</span>';
  document.getElementById("output-plots").innerHTML = "";
  setStatus("", "");

  let data;
  try {
    const res = await fetch(`${API_URL}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code, sid, session: SESSION_ID, tracker: COURSE.tracker, student: studentId
      })
    });
    data = await res.json();
  } catch (e) {
    outEl.innerHTML = `<span class="out-err">서버 연결 실패 — API_URL을 확인해주세요.\n${escHtml(String(e))}</span>`;
    setStatus("✗ 연결 오류", "status-err");
    runBtn.disabled = false;
    runBtn.textContent = prevLabel;
    runBtn.onclick = prevClick;
    return;
  }

  stepAttempts[currentIdx] = (stepAttempts[currentIdx] || 0) + 1;
  renderOutput(data);

  if (!unbox(data.success)) {
    setStatus("✗ 오류", "status-err");
    runBtn.disabled = false; runBtn.textContent = prevLabel;
    runBtn.onclick = prevClick;
    if (!partial) trackEvent("attempt", step, false);
    return;
  }

  // 부분 실행은 결과만 보여 주고 채점하지 않습니다.
  if (partial) {
    setStatus("✓ 부분 실행 완료", "status-ok");
    runBtn.disabled = false;
    runBtn.textContent = prevLabel;
    runBtn.onclick = prevClick;
    return;
  }

  setStatus("✓ 실행 완료", "status-ok");

  const result = await grade(step, code, data.output || "");
  lastResult = result;
  paintTasks(step, result);
  paintFeedback(result);
  trackEvent("attempt", step, result.passed);

  if (result.passed) {
    markStepDone(SESSION_ID, currentIdx);
    renderNav(currentIdx, unlockedUpTo(SESSION_ID));
    trackEvent("complete", step, true);
    runBtn.textContent = currentIdx === allSteps.length - 1 ? "세션 완료 →" : "다음 단계 →";
    runBtn.classList.add("next-mode");
    runBtn.onclick = () => showImplication(step);
  } else {
    runBtn.textContent = "▶ 전체 실행";
    runBtn.classList.remove("next-mode");
    runBtn.onclick = () => runCode("all");
  }
  runBtn.disabled = false;
}

/* 채점: ① 빈칸 대조(브라우저) ② tracker check(서버, 있을 때만) */
async function grade(step, code, out) {
  const norm = normCode(code);
  const blanks = (step.blanks || []).map(b => b.answer ? b.answer.test(norm) : null);
  const blanksOk = blanks.every(v => v !== false);

  let feedback = null, serverPassed = null;
  if (trackerReady && step.checkId) {
    try {
      const res = await fetch(`${API_URL}/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid, session: SESSION_ID, check_id: step.checkId })
      });
      const d = await res.json();
      if (unbox(d.available)) { serverPassed = !!unbox(d.passed); feedback = unbox(d.feedback); }
    } catch (e) { /* 서버 채점 실패 시 브라우저 채점만 사용 */ }
  }

  // 사용자 정의 검사(lessons 파일에서 check 함수를 직접 쓴 경우)
  let customOk = true;
  if (typeof step.check === "function") {
    try { customOk = !!step.check(out, code); } catch (e) { customOk = false; }
  }

  const passed = blanksOk && customOk && (serverPassed === null ? true : serverPassed);
  return { passed, blanks, feedback, serverPassed };
}

function paintTasks(step, result) {
  const n = (step.blanks && step.blanks.length) ? step.blanks.length : 1;
  for (let i = 0; i < n; i++) {
    const el  = document.getElementById(`task-check-${i}`);
    const row = document.getElementById(`task-row-${i}`);
    if (!el) continue;
    const ok = (step.blanks && step.blanks.length) ? result.blanks[i] !== false : result.passed;
    el.classList.toggle("done", !!ok);
    el.classList.toggle("wrong", ok === false);
    el.innerHTML = ok
      ? `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`
      : `<svg width="10" height="10" viewBox="0 0 10 10"><line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.8"/><line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.8"/></svg>`;
    if (row) row.classList.toggle("is-wrong", ok === false);
  }
}

function paintFeedback(result) {
  const sec = document.getElementById("feedback-section");
  const box = document.getElementById("feedback-box");
  if (!sec || !box) return;
  const parts = [];
  if (result.feedback) parts.push(`<pre class="feedback-pre">${escHtml(result.feedback)}</pre>`);
  if (!result.passed) {
    const wrong = result.blanks.filter(v => v === false).length;
    parts.push(wrong
      ? `<p class="feedback-bad">아직 ${wrong}개의 빈칸이 정답과 다릅니다. 위 목록에서 ✕ 표시된 줄을 다시 보세요.</p>`
      : `<p class="feedback-bad">결과가 정답과 다릅니다. 개념 설명을 다시 읽고 수정해 보세요.</p>`);
  } else {
    parts.push(`<p class="feedback-good">정답입니다. 다음 단계로 넘어가세요.</p>`);
  }
  box.innerHTML = parts.join("");
  sec.style.display = "block";
}

function renderOutput(data) {
  const outEl = document.getElementById("output-body");
  const plots = document.getElementById("output-plots");

  if (!unbox(data.success)) {
    outEl.innerHTML = `<span class="out-err">${escHtml(unbox(data.error) || "알 수 없는 오류")}</span>`;
    plots.innerHTML = "";
    return;
  }

  let text = Array.isArray(data.output) ? data.output.join("\n") : String(data.output || "");
  let inline = [];

  // 구버전 API 호환: 출력 안에 그래프가 마커로 들어오는 경우
  while (text.includes("|||PLOT_START|||")) {
    const [head, rest] = text.split("|||PLOT_START|||");
    const [b64, tail]  = rest.split("|||PLOT_END|||");
    inline.push(b64.trim());
    text = (head + (tail || "")).trim();
  }

  outEl.innerHTML = text.trim()
    ? `<span class="out-ok">${escHtml(text.trim())}</span>`
    : `<span class="out-ok">(텍스트 출력 없음)</span>`;

  const imgs = [].concat(data.plots || [], inline).filter(Boolean);
  plots.innerHTML = imgs.map(b64 =>
    `<div class="plot-item"><img src="data:image/png;base64,${String(b64).replace(/\s/g, "")}" alt="R plot"></div>`
  ).join("");

  if (unbox(data.fresh) && currentIdx > 0) {
    toast("서버의 R 세션이 새로 만들어졌습니다. 「데이터 준비」 단계를 다시 실행해야 할 수 있습니다.");
  }
}

/* ══════════════════════════════════════════════════════════
   완료 모달 · 세션 종료
══════════════════════════════════════════════════════════ */
function showImplication(step) {
  const isLast = currentIdx === allSteps.length - 1;
  const impl   = (step.implication || "").trim();
  const next   = isLast ? null : allSteps[currentIdx + 1].step;

  document.getElementById("modal-title").textContent =
    step.success || "완료했습니다. 다음 단계로 넘어가세요.";

  // 내용이 없으면 빈 상자가 남지 않도록 아예 숨깁니다.
  const implEl = document.getElementById("modal-impl");
  implEl.innerHTML = impl;
  implEl.style.display = impl ? "block" : "none";

  const subEl = document.getElementById("modal-sub");
  subEl.textContent = isLast
    ? "이 세션의 모든 단계를 마쳤습니다. 실습 목록으로 돌아갑니다."
    : `다음 단계 — ${next.title}`;
  subEl.style.display = "block";

  document.getElementById("modal-next-btn").textContent = isLast ? "실습 목록으로 →" : "다음 단계 →";
  document.getElementById("modal-overlay").style.display = "flex";
  if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise();
}

function nextStep() {
  document.getElementById("modal-overlay").style.display = "none";
  if (currentIdx < allSteps.length - 1) {
    renderStep(currentIdx + 1);
  } else {
    location.href = `index.html?done=${encodeURIComponent(SESSION_ID)}`;
  }
}

/* ══════════════════════════════════════════════════════════
   유틸
══════════════════════════════════════════════════════════ */
function setStatus(text, cls) {
  const el = document.getElementById("output-status");
  el.textContent = text;
  el.className = "output-status " + (cls || "");
}

let toastTimer = null;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("visible"), 4000);
}

function escHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── 부분 실행 대상 찾기 ──────────────────────────────────────
   선택 영역이 있으면 그대로, 없으면 커서가 놓인 줄을 실행합니다.
   괄호가 열려 있거나 연산자로 끝나면 문장이 끝날 때까지 아래 줄을 붙입니다. */
function getRunFragment(el) {
  if (el.selectionStart !== el.selectionEnd) {
    return { text: el.value.slice(el.selectionStart, el.selectionEnd), end: el.selectionEnd };
  }
  const lines = el.value.split("\n");
  let pos = 0, idx = lines.length - 1;
  for (let i = 0; i < lines.length; i++) {
    if (pos + lines[i].length >= el.selectionStart) { idx = i; break; }
    pos += lines[i].length + 1;
  }
  // 빈 줄이면 아래로 내려가며 코드가 있는 첫 줄을 찾습니다.
  while (idx < lines.length - 1 && !stripRComments(lines[idx]).trim()) idx++;

  let j = idx, frag = lines[idx];
  while (j < lines.length - 1 && isIncomplete(frag)) { j++; frag += "\n" + lines[j]; }

  let end = 0;
  for (let i = 0; i <= j; i++) end += lines[i].length + 1;
  return { text: frag, end: Math.min(end, el.value.length) };
}

function isIncomplete(src) {
  const code = stripRComments(src);
  let depth = 0, q = null;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (q) {
      if (ch === "\\") i++;
      else if (ch === q) q = null;
    } else if (ch === '"' || ch === "'" || ch === "`") q = ch;
    else if ("([{".includes(ch)) depth++;
    else if (")]}".includes(ch)) depth--;
  }
  if (depth > 0 || q) return true;
  return /(<-|->|[+\-*/^,&|~=]|%[^%]*%|\|>)\s*$/.test(code.trimEnd());
}
function stripRComments(src) {
  return src.split("\n").map(line => {
    let out = "", q = null;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        out += ch;
        if (ch === "\\") { out += line[i + 1] || ""; i++; }
        else if (ch === q) q = null;
      } else {
        if (ch === '"' || ch === "'" || ch === "`") { q = ch; out += ch; }
        else if (ch === "#") break;
        else out += ch;
      }
    }
    return out;
  }).join("\n");
}

function normCode(src) {
  return stripRComments(src)
    .replace(/\s+/g, "")
    .replace(/(\d+\.\d*?)0+(?![\d])/g, "$1")
    .replace(/(\d+)\.(?![\d])/g, "$1");
}

/* ── 학습 이벤트 기록 ─────────────────────────────────────── */
async function trackEvent(eventType, step, passed) {
  try {
    await fetch(`${API_URL}/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname:   studentId,
        sid,
        session:    SESSION_ID,
        step_idx:   currentIdx,
        step_title: step.title,
        check_id:   step.checkId || "",
        event_type: eventType,
        attempt:    stepAttempts[currentIdx] || 1,
        passed:     !!passed,
        time_spent: stepStartTime ? (Date.now() - stepStartTime) / 1000 : 0
      })
    });
  } catch (e) { /* 기록 실패는 무시 */ }
}

/* ══════════════════════════════════════════════════════════
   에디터: 하이라이트 · 단축키 (기존 로직 유지)
══════════════════════════════════════════════════════════ */
function initHighlight() {
  const wrap = document.getElementById("code-editor-wrap");
  wrap.style.position = "relative";
  let hl = document.getElementById("hl-layer");
  if (!hl) {
    hl = document.createElement("pre");
    hl.id = "hl-layer";
    wrap.insertBefore(hl, wrap.firstChild);
  }
  const ta = document.getElementById("code-editor");
  ta.addEventListener("input", updateHighlight);
  ta.addEventListener("scroll", syncScroll);
  updateHighlight();
}

function syncScroll() {
  const ta = document.getElementById("code-editor");
  const hl = document.getElementById("hl-layer");
  if (hl) { hl.scrollTop = ta.scrollTop; hl.scrollLeft = ta.scrollLeft; }
}

function updateHighlight() {
  const ta = document.getElementById("code-editor");
  const hl = document.getElementById("hl-layer");
  if (!ta || !hl) return;
  hl.innerHTML = highlightR(ta.value) + "\n";
}

/* R 코드 하이라이트 — 한 번의 스캔으로 토큰을 나눕니다.
   (이전 방식은 주석·문자열 안에서 연산자·숫자가 다시 치환되어
    "OP →", "NUM 5개" 처럼 마커가 새어 나오는 문제가 있었습니다.) */
const R_BUILTINS = new Set(("library require print cat paste paste0 c list data.frame matrix vector length nrow ncol dim str summary head tail class typeof is.na which seq rep mean median sd var sum min max range table subset merge rbind cbind apply sapply lapply vapply mapply do.call read.csv write.csv readRDS saveRDS glimpse transmute mutate select filter arrange group_by summarise summarize drop_na model.matrix scale colMeans colSums rowMeans rnorm runif sample set.seed round sqrt exp log abs pmax pmin t solve as.vector as.numeric as.integer as.factor factor data.matrix lm glm predict coef resid fitted glmnet cv.glmnet rpart prune ranger randomForest xgboost xgb.DMatrix keras_model_sequential layer_dense layer_dropout compile fit evaluate ggplot aes labs theme element_text geom_line geom_point geom_col geom_bar geom_hline geom_vline facet_wrap facet_grid scale_x_log10 scale_y_continuous pivot_longer pivot_wider rename pull slice distinct count left_join expand.grid tibble matchit causal_forest DoubleMLPLR DoubleMLIRM lrn").split(" "));

const R_RULES = [
  { cls: "hl-blank", re: /_{3,}/y },
  { cls: "hl-cmt",   re: /#[^\n]*/y },
  { cls: "hl-str",   re: /"(?:[^"\\]|\\[\s\S])*"?|'(?:[^'\\]|\\[\s\S])*'?|`(?:[^`\\]|\\[\s\S])*`?/y },
  { cls: "hl-kw",    re: /\b(?:if|else|for|while|repeat|break|next|return|function|in|TRUE|FALSE|NULL|NA|NaN|Inf)\b/y },
  { cls: "hl-num",   re: /\b\d+\.?\d*(?:[eE][+-]?\d+)?L?\b/y },
  { cls: "ident",    re: /[a-zA-Z.][a-zA-Z0-9._]*/y },
  { cls: "hl-op",    re: /<<-|->>|<-|->|%[a-zA-Z*%|>^\/]*%|\|>|==|!=|<=|>=|&&|\|\||[-+*\/^<>!=&|:~$@]/y },
];

function highlightR(code) {
  let out = "", i = 0;
  const n = code.length;
  while (i < n) {
    let matched = false;
    for (const rule of R_RULES) {
      rule.re.lastIndex = i;
      const m = rule.re.exec(code);
      if (!m || m.index !== i || m[0].length === 0) continue;
      const text = m[0];
      let cls = rule.cls;
      if (cls === "ident") {
        const after = code.slice(i + text.length).match(/^\s*\(/);
        cls = after ? (R_BUILTINS.has(text) ? "hl-bi" : "hl-fn") : null;
      }
      out += cls ? `<span class="${cls}">${escHtml(text)}</span>` : escHtml(text);
      i += text.length;
      matched = true;
      break;
    }
    if (!matched) { out += escHtml(code[i]); i++; }
  }
  return out;
}

function setupShortcuts() {
  const editor = document.getElementById("code-editor");
  if (!editor) return;
  editor.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const ctrl = isMac ? e.metaKey : e.ctrlKey;
    const alt = e.altKey, shift = e.shiftKey, key = e.key;

    if (alt && key === "-")                            { e.preventDefault(); insertAtCursor(editor, " <- "); return; }
    if (ctrl && shift && (key === "M" || key === "m")) { e.preventDefault(); insertAtCursor(editor, " %>% "); return; }
    if (ctrl && shift && key === "Enter")              { e.preventDefault(); runCode("all"); return; }
    if (ctrl && !shift && key === "Enter")              { e.preventDefault(); runCode("fragment"); return; }
    if (ctrl && shift && (key === "C" || key === "c")) { e.preventDefault(); toggleComment(editor); return; }
    if (ctrl && !shift && (key === "d" || key === "D")){ e.preventDefault(); deleteLine(editor); return; }
    if (ctrl && shift && (key === "D" || key === "d")) { e.preventDefault(); duplicateLine(editor); return; }
    if (alt && key === "ArrowUp")                      { e.preventDefault(); moveLine(editor, -1); return; }
    if (alt && key === "ArrowDown")                    { e.preventDefault(); moveLine(editor, 1); return; }
    if (!shift && key === "Tab")                       { e.preventDefault(); insertAtCursor(editor, "  "); return; }
    if (shift && key === "Tab")                        { e.preventDefault(); unindentLine(editor); return; }
  });
}

function insertAtCursor(el, text) {
  const s = el.selectionStart, e = el.selectionEnd;
  el.value = el.value.slice(0, s) + text + el.value.slice(e);
  el.selectionStart = el.selectionEnd = s + text.length;
  el.focus(); updateHighlight();
}
function getLineInfo(el) {
  const val = el.value, pos = el.selectionStart;
  const start = val.lastIndexOf("\n", pos - 1) + 1;
  const end = val.indexOf("\n", pos);
  return { val, start, end: end === -1 ? val.length : end };
}
function toggleComment(el) {
  const { val, start, end } = getLineInfo(el);
  const line = val.slice(start, end);
  const newLine = line.startsWith("# ") ? line.slice(2) : line.startsWith("#") ? line.slice(1) : "# " + line;
  el.value = val.slice(0, start) + newLine + val.slice(end);
  el.selectionStart = el.selectionEnd = start + newLine.length;
  el.focus(); updateHighlight();
}
function deleteLine(el) {
  const { val, start, end } = getLineInfo(el);
  el.value = start > 0 ? val.slice(0, start - 1) + val.slice(end) : val.slice(end + 1);
  el.selectionStart = el.selectionEnd = Math.max(0, start - 1);
  el.focus(); updateHighlight();
}
function duplicateLine(el) {
  const { val, start, end } = getLineInfo(el);
  const line = val.slice(start, end);
  el.value = val.slice(0, end) + "\n" + line + val.slice(end);
  el.selectionStart = el.selectionEnd = end + 1 + line.length;
  el.focus(); updateHighlight();
}
function moveLine(el, dir) {
  const lines = el.value.split("\n");
  const pos = el.selectionStart;
  let count = 0, idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (count + lines[i].length >= pos) { idx = i; break; }
    count += lines[i].length + 1;
  }
  const target = idx + dir;
  if (target < 0 || target >= lines.length) return;
  [lines[idx], lines[target]] = [lines[target], lines[idx]];
  el.value = lines.join("\n");
  let newPos = 0;
  for (let i = 0; i < target; i++) newPos += lines[i].length + 1;
  el.selectionStart = el.selectionEnd = newPos + lines[target].length;
  el.focus(); updateHighlight();
}
function unindentLine(el) {
  const { val, start, end } = getLineInfo(el);
  const line = val.slice(start, end);
  const newLine = line.startsWith("  ") ? line.slice(2) : line.startsWith(" ") ? line.slice(1) : line;
  el.value = val.slice(0, start) + newLine + val.slice(end);
  el.selectionStart = el.selectionEnd = start + newLine.length;
  el.focus(); updateHighlight();
}

window.addEventListener("load", boot);
