const API_URL = "https://coding-api-enum.onrender.com";

let currentChapter = 0;
let currentStep    = 0;
let allSteps       = [];

// ── 추적 상태 ────────────────────────────────────────────────
let studentNickname = '';
let sessionName     = COURSE.title || 'default';
let stepStartTime   = null;
let stepAttempts    = {};

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

// ── 스텝 렌더 (비동기 fetch 적용) ──────────────────────────────
async function renderStep(ci, si) {
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
            <span class="content-text">${formatTaskText(t)}</span>
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

  // 에디터 초기화 및 로딩 문구 설정
  const editorEl = document.getElementById('code-editor-wrap');
  editorEl.innerHTML = '';
  const textarea = document.createElement('textarea');
  textarea.id = 'code-editor';
  textarea.spellcheck = false;
  textarea.autocomplete = 'off';
  textarea.value = "# R 코드를 서버에서 불러오는 중..."; // 임시 로딩 메시지
  editorEl.appendChild(textarea);

  // 하이라이트 및 단축키 초기화
  initHighlight();
  setupShortcuts();

  // ⭐️ [핵심 추가] 외부 R 파일 비동기로 읽어와 주입하기
  try {
    if (step.starter_path) {
      const response = await fetch(step.starter_path);
      if (!response.ok) {
        throw new Error(`파일을 찾을 수 없습니다. (Status: ${response.status})`);
      }
      const rCode = await response.text();
      textarea.value = rCode;
    } else {
      // 호환성을 위해 기존 starter 문자열 방식도 남겨둡니다.
      textarea.value = step.starter || '';
    }
  } catch (error) {
    console.error("R 실습 코드 로드 실패:", error);
    textarea.value = `# [오류] R 실습 코드를 불러오지 못했습니다.\n# 경로를 확인해주세요: ${step.starter_path}`;
  }

  // 코드가 로드된 후 하이라이트 한 번 더 갱신
  updateHighlight();

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

  // 타이머 리셋
  stepStartTime = Date.now();
  const gIdxKey = getCurrentGlobalIdx();
  if (!stepAttempts[gIdxKey]) stepAttempts[gIdxKey] = 0;
}

function goStep(globalIdx) {
  const s = allSteps[globalIdx];
  renderStep(s.chapterIdx, s.stepIdx);
}

// ── 코드 초기화 (비동기 fetch 적용) ──────────────────────────
async function resetCode() {
  const step = COURSE.chapters[currentChapter].steps[currentStep];
  const editor = document.getElementById('code-editor');
  if (editor) {
    editor.value = "# 코드를 다시 불러오는 중...";
    updateHighlight();

    try {
      if (step.starter_path) {
        const response = await fetch(step.starter_path);
        if (!response.ok) throw new Error();
        editor.value = await response.text();
      } else {
        editor.value = step.starter || '';
      }
    } catch (e) {
      editor.value = `# [오류] 초기화 실패 — 경로를 확인하세요: ${step.starter_path}`;
    }
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
  let out = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  out = out.replace(/(#[^\n]*)/g, '\x00CMT\x01$1\x02');
  out = out.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '\x00STR\x01$1\x02');

  const kw = /\b(if|else|for|while|repeat|break|next|return|function|in|TRUE|FALSE|NULL|NA|NaN|Inf|T|F)\b/g;
  out = out.replace(kw, '\x00KW\x01$1\x02');

  const bi = /\b(library|require|print|cat|paste0?|c|list|data\.frame|matrix|vector|length|nrow|ncol|dim|str|summary|head|tail|class|typeof|is\.na|which|seq|rep|mean|median|sd|var|sum|min|max|range|table|subset|merge|rbind|cbind|apply|l?sapply|mapply|do\.call|read\.csv|write\.csv|readRDS|saveRDS|setwd|getwd|ggplot|aes|geom_\w+|facet_\w+|labs|theme\w*|filter|select|mutate|arrange|group_by|summaris[ez]|left_join|right_join|inner_join|full_join|pivot_\w+|rename|pull|slice|distinct|count|matchit|causal_forest|average_treatment_effect|DoubleMLPLR|DoubleMLIRM|lrn)\b/g;
  out = out.replace(bi, '\x00BI\x01$1\x02');

  // 숫자 하이라이트: 이미 마킹된 토큰(주석·문자열 등) 안의 숫자는 건드리지 않음
  out = out.replace(/(\x00[A-Z]+\x01[\s\S]*?\x02)|\b(\d+\.?\d*(?:[eE][+-]?\d+)?L?)\b/g,
    (m, token, num) => token ? token : '\x00NUM\x01' + num + '\x02');
  out = out.replace(/(&lt;-|-&gt;|&lt;&lt;-|%&gt;%|\|&gt;|%in%|%\*%|==|!=|&lt;=|&gt;=|&&|\|\||!(?!=)|\+(?!\x00)|-(?!\x00)|\*|\/|\^|::|:(?!:))/g, '\x00OP\x01$1\x02');

  out = out.replace(/\b([a-zA-Z_.][a-zA-Z0-9_.]*)(?=\s*\()/g, (m, name) => {
    if (m.includes('\x00')) return m;
    return `\x00FN\x01${name}\x02`;
  });

  out = out
    .replace(/\x00CMT\x01([\s\S]*?)\x02/g, '<span class="hl-cmt">$1</span>')
    .replace(/\x00STR\x01([\s\S]*?)\x02/g, '<span class="hl-str">$1</span>')
    .replace(/\x00KW\x01(.*?)\x02/g,       '<span class="hl-kw">$1</span>')
    .replace(/\x00BI\x01(.*?)\x02/g,       '<span class="hl-bi">$1</span>')
    .replace(/\x00NUM\x01(.*?)\x02/g,      '<span class="hl-num">$1</span>')
    .replace(/\x00OP\x01(.*?)\x02/g,       '<span class="hl-op">$1</span>')
    .replace(/\x00FN\x01(.*?)\x02/g,       '<span class="hl-fn">$1</span>');

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
      
      // ── 📊 그래프 표시용 HTML 엘리먼트 가져오기 ──
      const plotWrap = document.getElementById('output-plot-wrap');
      const plotImg  = document.getElementById('output-plot');

      // ⭐️ [트릭 감지] 콘솔 출력물에 그래프 데이터가 숨겨져 있는지 확인
      if (out.includes("|||PLOT_START|||")) {
        const parts = out.split("|||PLOT_START|||");
        const consoleText = parts[0].trim(); // 마커 앞쪽의 순수 텍스트 결과
        const base64Data  = parts[1].split("|||PLOT_END|||")[0].trim(); // 마커 안쪽의 이미지 데이터

        // 1. 텍스트 결과 창에 출력
        outEl.innerHTML = consoleText
          ? `<span class="out-ok">${escHtml(consoleText)}</span>`
          : `<span class="out-ok">✓ 실행 완료 (그래프가 아래에 표시됩니다)</span>`;

        // 2. 숨겨진 이미지를 복원해서 띄우기
        if (plotWrap && plotImg) {
          plotImg.src = "data:image/png;base64," + base64Data;
          plotWrap.style.display = "block"; // 숨겨져 있던 그래프 상자 노출
        }
      } else {
        // 그래프 데이터가 없는 일반 코드일 때는 이미지 상자를 깔끔하게 숨김
        if (plotWrap) plotWrap.style.display = "none";
        
        outEl.innerHTML = out
          ? `<span class="out-ok">${escHtml(out)}</span>`
          : `<span class="out-ok">(출력 없음 — print()로 확인해보세요)</span>`;
      }

      status.textContent = '✓ 실행 완료';
      status.className   = 'output-status status-ok';

      const step = COURSE.chapters[currentChapter].steps[currentStep];
      const gIdx = getCurrentGlobalIdx();
      stepAttempts[gIdx] = (stepAttempts[gIdx] || 0) + 1;

      trackEvent('attempt', gIdx, step.title, stepAttempts[gIdx], 0);

      if (step.check(out, code)) {
        markAllTasks();
        const timeSpent = stepStartTime ? (Date.now() - stepStartTime) / 1000 : 0;
        trackEvent('complete', gIdx, step.title, stepAttempts[gIdx], timeSpent);
        runBtn.textContent = '다음 단계 →';
        runBtn.classList.add('next-mode');
        runBtn.onclick  = () => showImplication(step);
        runBtn.disabled = false;
      } else {
        runBtn.textContent = '▶ 실행';
        runBtn.disabled    = false;
      }
    } else {
      // 에러가 났을 때도 혹시 남아있을지 모를 이전 그래프는 숨겨줍니다.
      const plotWrap = document.getElementById('output-plot-wrap');
      if (plotWrap) plotWrap.style.display = "none";

      outEl.innerHTML    = `<span class="out-err">${escHtml(data.error || '알 수 없는 오류')}</span>`;
      status.textContent = '✗ 오류';
      status.className   = 'output-status status-err';
      runBtn.textContent = '▶ 실행';
      runBtn.disabled    = false;
    }

  } catch (e) {
    // 연결 실패 시에도 이미지 상자는 숨김
    const plotWrap = document.getElementById('output-plot-wrap');
    if (plotWrap) plotWrap.style.display = "none";

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

function formatTaskText(text) {
  return text.replace(/`([^`]+)`/g, '<code style="background: #2d2d2d; padding: 2px 4px; border-radius: 4px; color: #ff79c6; font-family: monospace;">$1</code>');
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

  if (window.MathJax) {
    MathJax.typesetPromise();
  }
}

function nextStep() {
  // 1. 모달 닫기 (closeModal 함수가 정의되어 있다면 호출)
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.style.display = 'none';

  // 2. 실습 단계 이동 로직
  const gIdx = getCurrentGlobalIdx();
  
  if (gIdx < allSteps.length - 1) {
    goStep(gIdx + 1); // 실제 다음 단계로 이동하는 함수
    console.log("다음 단계로 이동합니다.");
  } else {
    console.log("마지막 단계입니다.");
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

// ── 이벤트 추적 ──────────────────────────────────────────────
async function trackEvent(eventType, stepIdx, stepTitle, attempt, timeSpent) {
  if (!studentNickname) return;
  try {
    await fetch(`${API_URL}/track`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname:    studentNickname,
        session:     sessionName,
        step_idx:    stepIdx,
        step_title:  stepTitle,
        event_type:  eventType,
        attempt:     attempt,
        time_spent:  timeSpent
      })
    });
  } catch(e) { /* 추적 실패는 조용히 무시 */ }
}

// ── 닉네임 팝업 ──────────────────────────────────────────────
function showNicknameModal() {
  document.getElementById('nickname-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('nickname-input').focus(), 100);
}

function submitNickname() {
  const input = document.getElementById('nickname-input').value.trim();
  if (!input) {
    document.getElementById('nickname-error').style.display = 'block';
    return;
  }
  studentNickname = input;
  document.getElementById('nickname-overlay').style.display = 'none';
  trackEvent('join', 0, 'session_start', 0, 0);
}

function handleNicknameKey(e) {
  if (e.key === 'Enter') submitNickname();
}

// ── 테마 전환 ────────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> 라이트 모드'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> 다크 모드';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── 시작 ─────────────────────────────────────────────────────
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  buildStepList();
  renderStep(0, 0);
  // showNicknameModal();  ← 닉네임 기능 비활성화 중
});