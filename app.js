const API_URL = "https://coding-api-enum.onrender.com";

let currentChapter = 0;
let currentStep    = 0;
let allSteps       = [];

function buildStepList() {
  allSteps = [];
  COURSE.chapters.forEach((ch, ci) => {
    ch.steps.forEach((st, si) => {
      allSteps.push({ chapterIdx: ci, stepIdx: si, chapter: ch, step: st });
    });
  });
}

function getCurrentGlobalIdx() {
  return allSteps.findIndex(
    s => s.chapterIdx === currentChapter && s.stepIdx === currentStep
  );
}

// ── 스텝 렌더 ────────────────────────────────────────────────
function renderStep(ci, si) {
  currentChapter = ci;
  currentStep    = si;

  const ch   = COURSE.chapters[ci];
  const step = ch.steps[si];
  const gIdx = getCurrentGlobalIdx();

  document.getElementById('chapter-badge').textContent =
    `Chapter ${ch.id} · ${ch.title}`;
  document.getElementById('chapter-badge').style.background = ch.color + '22';
  document.getElementById('chapter-badge').style.color      = ch.color;
  document.getElementById('lesson-title').textContent = step.title;

  // 네비게이션
  const nav = document.getElementById('steps-nav');
  nav.innerHTML = allSteps.map((s, idx) => {
    const isDone   = idx < gIdx;
    const isActive = idx === gIdx;
    let cls = 'step-dot' + (isActive ? ' active' : '') + (isDone ? ' done' : '');
    const label = isDone
      ? `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`
      : idx + 1;
    return `<div class="${cls}"
      style="${isActive ? `background:${s.chapter.color};border-color:${s.chapter.color};` : ''}"
      onclick="goStep(${idx})"
      title="${s.chapter.title}: ${s.step.title}">${label}</div>`;
  }).join('');

  // 미션
  const body = document.getElementById('mission-body');
  body.innerHTML = `
    <div class="mission-section">
      <div class="mission-label">개념</div>
      <div class="mission-text content-text">${step.concept}</div>
    </div>
    <div class="mission-section">
      <div class="mission-label">할 일</div>
      <div class="task-box">
        ${step.tasks.map((t, ti) => `
          <div class="task-item">
            <div class="task-check" id="task-check-${ti}"></div>
            <span class="content-text">${t}</span>
          </div>`).join('')}
      </div>
    </div>
    ${step.hint ? `
    <div class="mission-section">
      <div class="mission-label">힌트</div>
      <div class="hint-box content-text">${step.hint}</div>
    </div>` : ''}
    <div class="shortcut-divider"></div>
    <div class="mission-section">
      <div class="mission-label">단축키</div>
      <div class="shortcut-list">
        <div class="shortcut-group-label">코드 입력</div>
        <div class="shortcut-item"><span class="shortcut-desc">할당 연산자 &lt;-</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Alt</kbd><kbd>-</kbd></span><span class="shortcut-keys-row"><kbd>Option</kbd><kbd>-</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">파이프 %&gt;%</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>M</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>M</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">들여쓰기</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Tab</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">내어쓰기</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>⇧</kbd><kbd>Tab</kbd></span></span></div>
        <div class="shortcut-group-label">실행</div>
        <div class="shortcut-item"><span class="shortcut-desc">현재 줄 실행</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>Enter</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>Enter</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">전체 실행</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>Enter</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>Enter</kbd></span></span></div>
        <div class="shortcut-group-label">편집</div>
        <div class="shortcut-item"><span class="shortcut-desc">주석 토글</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>C</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>C</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">줄 삭제</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>D</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>D</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">줄 복제</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Ctrl</kbd><kbd>⇧</kbd><kbd>D</kbd></span><span class="shortcut-keys-row"><kbd>⌘</kbd><kbd>⇧</kbd><kbd>D</kbd></span></span></div>
        <div class="shortcut-item"><span class="shortcut-desc">줄 위/아래 이동</span><span class="shortcut-keys"><span class="shortcut-keys-row"><kbd>Alt</kbd><kbd>↑↓</kbd></span><span class="shortcut-keys-row"><kbd>Option</kbd><kbd>↑↓</kbd></span></span></div>
      </div>
    </div>
  `;

  // 에디터 초기화
  const editorEl = document.getElementById('code-editor-wrap');
  editorEl.innerHTML = '';
  const textarea = document.createElement('textarea');
  textarea.id = 'code-editor';
  textarea.spellcheck = false;
  textarea.autocomplete = 'off';
  textarea.value = step.starter;
  editorEl.appendChild(textarea);

  // 하이라이트 초기화
  initHighlight();
  setupShortcuts();

  document.getElementById('output-body').innerHTML =
    '<span class="output-placeholder">코드를 실행하면 결과가 여기에 나타나요.</span>';
  document.getElementById('output-status').textContent = '';
  document.getElementById('output-status').className   = 'output-status';
  document.getElementById('modal-overlay').style.display = 'none';

  // 실행 버튼 복원
  const runBtn = document.getElementById('run-btn');
  runBtn.textContent = '▶ 실행';
  runBtn.onclick = runCode;
  runBtn.disabled = false;
  runBtn.classList.remove('next-mode');
}

function goStep(globalIdx) {
  const s = allSteps[globalIdx];
  renderStep(s.chapterIdx, s.stepIdx);
}

function resetCode() {
  const step = COURSE.chapters[currentChapter].steps[currentStep];
  const editor = document.getElementById('code-editor');
  if (editor) {
    editor.value = step.starter;
    updateHighlight();
  }
}

// ── 코드 하이라이트 ──────────────────────────────────────────
function initHighlight() {
  const wrap = document.getElementById('code-editor-wrap');
  wrap.style.position = 'relative';

  // 하이라이트 레이어
  let hl = document.getElementById('hl-layer');
  if (!hl) {
    hl = document.createElement('pre');
    hl.id = 'hl-layer';
    wrap.insertBefore(hl, wrap.firstChild);
  }

  const textarea = document.getElementById('code-editor');
  textarea.addEventListener('input',  updateHighlight);
  textarea.addEventListener('scroll', syncScroll);
  updateHighlight();
}

function syncScroll() {
  const ta = document.getElementById('code-editor');
  const hl = document.getElementById('hl-layer');
  if (hl) {
    hl.scrollTop  = ta.scrollTop;
    hl.scrollLeft = ta.scrollLeft;
  }
}

function updateHighlight() {
  const ta  = document.getElementById('code-editor');
  const hl  = document.getElementById('hl-layer');
  if (!ta || !hl) return;
  hl.innerHTML = highlightR(ta.value) + '\n';
}

function highlightR(code) {
  const keywords  = /\b(if|else|for|while|repeat|break|next|return|function|in|TRUE|FALSE|NULL|NA|NaN|Inf|T|F)\b/g;
  const builtins  = /\b(library|require|install\.packages|print|cat|paste|paste0|c|list|data\.frame|matrix|vector|length|nrow|ncol|dim|str|summary|head|tail|class|typeof|is\.na|which|seq|rep|mean|median|sd|var|sum|min|max|range|table|subset|merge|rbind|cbind|apply|lapply|sapply|mapply|do\.call|Reduce|Filter|Map|read\.csv|write\.csv|readRDS|saveRDS|setwd|getwd|ls|rm|source|options|Sys\.time|proc\.time|system\.time|ggplot|aes|geom_point|geom_line|geom_bar|geom_histogram|facet_wrap|labs|theme|filter|select|mutate|arrange|group_by|summarise|summarize|left_join|right_join|inner_join|full_join|pivot_longer|pivot_wider|rename|pull|slice|distinct|count|matchit|causal_forest|average_treatment_effect|DoubleMLPLR|DoubleMLIRM|DoubleMLData\$new|lrn|lrn\$new)\b/g;
  const strings   = /(["'`])((?:\\.|(?!\1)[^\\])*)\1/g;
  const numbers   = /\b(\d+\.?\d*([eE][+-]?\d+)?L?)\b/g;
  const comments  = /(#.*$)/gm;
  const operators = /(<-|->|<<-|->>|%>%|\|>|%in%|%\*%|==|!=|<=|>=|&&|\|\||!|\+|-|\*|\/|\^|::|:|~)/g;
  const funcCall  = /\b([a-zA-Z_.][a-zA-Z0-9_.]*)(?=\s*\()/g;

  // 순서 중요: 먼저 escape, 그 다음 순차 치환
  let out = escHtml(code);

  // 문자열 (먼저)
  out = out.replace(/(&#34;|&#39;|`)((?:\\.|(?!\1)[^\\])*)\1/g,
    (m) => `<s-str>${m}</s-str>`);

  // 주석
  out = out.replace(/(#.*$)/gm, (m) => `<s-cmt>${m}</s-cmt>`);

  // 키워드
  out = out.replace(keywords, (m) => `<s-kw>${m}</s-kw>`);

  // 내장 함수
  out = out.replace(builtins, (m) => `<s-bi>${m}</s-bi>`);

  // 숫자
  out = out.replace(numbers, (m) => `<s-num>${m}</s-num>`);

  // 연산자
  out = out.replace(/(&lt;-|-&gt;|&lt;&lt;-|-&gt;&gt;|%&gt;%|\|&gt;|%in%|%\*%|==|!=|&lt;=|&gt;=|&amp;&amp;|\|\||!|\+|-|\*|\/|\^|::|:|~)/g,
    (m) => `<s-op>${m}</s-op>`);

  // 함수 호출
  out = out.replace(/\b([a-zA-Z_.][a-zA-Z0-9_.]*)(?=\s*\()/g, (m, name) => {
    if (m.includes('<s-')) return m;
    return `<s-fn>${name}</s-fn>`;
  });

  // 태그 치환
  out = out
    .replace(/<s-str>(.*?)<\/s-str>/gs, '<span class="hl-str">$1</span>')
    .replace(/<s-cmt>(.*?)<\/s-cmt>/gs, '<span class="hl-cmt">$1</span>')
    .replace(/<s-kw>(.*?)<\/s-kw>/g,    '<span class="hl-kw">$1</span>')
    .replace(/<s-bi>(.*?)<\/s-bi>/g,    '<span class="hl-bi">$1</span>')
    .replace(/<s-num>(.*?)<\/s-num>/g,  '<span class="hl-num">$1</span>')
    .replace(/<s-op>(.*?)<\/s-op>/g,    '<span class="hl-op">$1</span>')
    .replace(/<s-fn>(.*?)<\/s-fn>/g,    '<span class="hl-fn">$1</span>');

  return out;
}

// ── 코드 실행 ────────────────────────────────────────────────
async function runCode() {
  const editor = document.getElementById('code-editor');
  const code   = editor ? editor.value.trim() : '';
  const outEl  = document.getElementById('output-body');
  const runBtn = document.getElementById('run-btn');
  const status = document.getElementById('output-status');

  if (!code) return;

  runBtn.disabled    = true;
  runBtn.textContent = '실행 중...';
  outEl.innerHTML    = '<span class="output-placeholder">R 서버에서 실행 중...</span>';
  status.textContent = '';

  try {
    const res  = await fetch(`${API_URL}/run`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code })
    });
    const data = await res.json();

    if (data.success) {
      const raw = data.output;
      const out = (Array.isArray(raw) ? raw.join('\n') : String(raw || '')).trim();
      outEl.innerHTML = out
        ? `<span class="out-ok">${escHtml(out)}</span>`
        : `<span class="out-ok">(출력 없음 — print()로 확인해보세요)</span>`;
      status.textContent = '✓ 실행 완료';
      status.className   = 'output-status status-ok';

      const step = COURSE.chapters[currentChapter].steps[currentStep];
      if (step.check(out, code)) {
        markAllTasks();
        // 실행 버튼 → 다음 단계 버튼으로 교체
        runBtn.textContent = '다음 단계 →';
        runBtn.classList.add('next-mode');
        runBtn.onclick  = () => showImplication(step);
        runBtn.disabled = false;
      } else {
        runBtn.textContent = '▶ 실행';
        runBtn.disabled    = false;
      }
    } else {
      outEl.innerHTML    = `<span class="out-err">${escHtml(data.error || '알 수 없는 오류')}</span>`;
      status.textContent = '✗ 오류';
      status.className   = 'output-status status-err';
      runBtn.textContent = '▶ 실행';
      runBtn.disabled    = false;
    }

  } catch (e) {
    outEl.innerHTML    = `<span class="out-err">서버 연결 실패 — API_URL을 확인해주세요.\n${escHtml(String(e))}</span>`;
    status.textContent = '✗ 연결 오류';
    status.className   = 'output-status status-err';
    runBtn.textContent = '▶ 실행';
    runBtn.disabled    = false;
  }
}

function markAllTasks() {
  const step = COURSE.chapters[currentChapter].steps[currentStep];
  step.tasks.forEach((_, i) => {
    const el = document.getElementById(`task-check-${i}`);
    if (!el) return;
    el.classList.add('done');
    el.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="currentColor" stroke-width="1.8" fill="none"/></svg>`;
  });
}

// ── 함의 모달 ────────────────────────────────────────────────
function showImplication(step) {
  const gIdx   = getCurrentGlobalIdx();
  const isLast = gIdx === allSteps.length - 1;
  const impl   = step.implication || step.success;

  document.getElementById('modal-title').textContent   = step.success;
  document.getElementById('modal-impl').innerHTML      = impl;
  document.getElementById('modal-sub').textContent     = isLast ? '모든 실습을 완료했어요! 🎉' : '';
  document.querySelector('.modal-next-btn').textContent = isLast ? '완료' : '다음 단계 →';
  document.getElementById('modal-overlay').style.display = 'flex';
}

function nextStep() {
  const gIdx = getCurrentGlobalIdx();
  document.getElementById('modal-overlay').style.display = 'none';
  if (gIdx < allSteps.length - 1) {
    goStep(gIdx + 1);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── 단축키 구현 ──────────────────────────────────────────────
function setupShortcuts() {
  const editor = document.getElementById('code-editor');
  if (!editor) return;
  editor.addEventListener('keydown', (e) => {
    const isMac = navigator.platform.toUpperCase().includes('MAC');
    const ctrl  = isMac ? e.metaKey : e.ctrlKey;
    const alt   = e.altKey;
    const shift = e.shiftKey;
    const key   = e.key;

    if (alt && key === '-')                              { e.preventDefault(); insertAtCursor(editor, ' <- '); return; }
    if (ctrl && shift && (key === 'M' || key === 'm'))  { e.preventDefault(); insertAtCursor(editor, ' %>% '); return; }
    if (ctrl && !shift && key === 'Enter')              { e.preventDefault(); runCode(); return; }
    if (ctrl && shift && key === 'Enter')               { e.preventDefault(); runCode(); return; }
    if (ctrl && shift && (key === 'C' || key === 'c'))  { e.preventDefault(); toggleComment(editor); return; }
    if (ctrl && !shift && (key === 'd' || key === 'D')) { e.preventDefault(); deleteLine(editor); return; }
    if (ctrl && shift && (key === 'D' || key === 'd'))  { e.preventDefault(); duplicateLine(editor); return; }
    if (alt && key === 'ArrowUp')                       { e.preventDefault(); moveLine(editor, -1); return; }
    if (alt && key === 'ArrowDown')                     { e.preventDefault(); moveLine(editor,  1); return; }
    if (!shift && key === 'Tab')                        { e.preventDefault(); insertAtCursor(editor, '  '); return; }
    if (shift && key === 'Tab')                         { e.preventDefault(); unindentLine(editor); return; }
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
  const start = val.lastIndexOf('\n', pos - 1) + 1;
  const end   = val.indexOf('\n', pos);
  return { val, start, end: end === -1 ? val.length : end };
}

function toggleComment(el) {
  const { val, start, end } = getLineInfo(el);
  const line    = val.slice(start, end);
  const newLine = line.startsWith('# ') ? line.slice(2) : line.startsWith('#') ? line.slice(1) : '# ' + line;
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
  el.value = val.slice(0, end) + '\n' + line + val.slice(end);
  el.selectionStart = el.selectionEnd = end + 1 + line.length;
  el.focus(); updateHighlight();
}

function moveLine(el, dir) {
  const lines = el.value.split('\n');
  const pos   = el.selectionStart;
  let count = 0, idx = 0;
  for (let i = 0; i < lines.length; i++) {
    if (count + lines[i].length >= pos) { idx = i; break; }
    count += lines[i].length + 1;
  }
  const target = idx + dir;
  if (target < 0 || target >= lines.length) return;
  [lines[idx], lines[target]] = [lines[target], lines[idx]];
  el.value = lines.join('\n');
  let newPos = 0;
  for (let i = 0; i < target; i++) newPos += lines[i].length + 1;
  el.selectionStart = el.selectionEnd = newPos + lines[target].length;
  el.focus(); updateHighlight();
}

function unindentLine(el) {
  const { val, start, end } = getLineInfo(el);
  const line    = val.slice(start, end);
  const newLine = line.startsWith('  ') ? line.slice(2) : line.startsWith(' ') ? line.slice(1) : line;
  el.value = val.slice(0, start) + newLine + val.slice(end);
  el.selectionStart = el.selectionEnd = start + newLine.length;
  el.focus(); updateHighlight();
}

// 시작
window.addEventListener('load', () => {
  buildStepList();
  renderStep(0, 0);
});
