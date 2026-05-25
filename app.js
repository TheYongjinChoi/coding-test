// ============================================================
// 앱 로직 — 수정 불필요
// ============================================================

let webR = null;
let currentChapter = 0;
let currentStep = 0;
let allSteps = [];  // 전체 스텝을 평탄하게 모아둠

// 전체 스텝 목록 생성
function buildStepList() {
  allSteps = [];
  COURSE.chapters.forEach((ch, ci) => {
    ch.steps.forEach((st, si) => {
      allSteps.push({ chapterIdx: ci, stepIdx: si, chapter: ch, step: st });
    });
  });
}

// 현재 전체 인덱스
function getCurrentGlobalIdx() {
  return allSteps.findIndex(
    s => s.chapterIdx === currentChapter && s.stepIdx === currentStep
  );
}

// ── WebR 초기화 ──────────────────────────────────────────────
async function initWebR() {
  const fill = document.getElementById('loading-fill');
  const sub  = document.getElementById('loading-sub');

  fill.style.width = '20%';
  sub.textContent = 'WebR 엔진을 불러오는 중...';

  webR = new WebR();
  await webR.init();

  fill.style.width = '60%';
  sub.textContent = 'dplyr / ggplot2 패키지 설치 중 (첫 방문 시 시간이 걸려요)...';

  try {
    await webR.installPackages(['dplyr', 'ggplot2'], { quiet: true });
  } catch(e) {
    console.warn('패키지 설치 실패 (무시):', e);
  }

  fill.style.width = '100%';
  sub.textContent = '준비 완료!';

  await new Promise(r => setTimeout(r, 500));

  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('main').style.display = 'flex';

  buildStepList();
  renderStep(currentChapter, currentStep);
}

// ── 스텝 렌더 ────────────────────────────────────────────────
function renderStep(ci, si) {
  currentChapter = ci;
  currentStep    = si;

  const ch   = COURSE.chapters[ci];
  const step = ch.steps[si];
  const gIdx = getCurrentGlobalIdx();

  // 헤더
  document.getElementById('chapter-badge').textContent =
    `Chapter ${ch.id} · ${ch.title}`;
  document.getElementById('chapter-badge').style.background =
    ch.color + '22';
  document.getElementById('chapter-badge').style.color = ch.color;
  document.getElementById('lesson-title').textContent = step.title;

  // 네비게이션 (전체 스텝)
  const nav = document.getElementById('steps-nav');
  nav.innerHTML = allSteps.map((s, idx) => {
    const isDone    = idx < gIdx;
    const isActive  = idx === gIdx;
    const dotColor  = s.chapter.color;
    let cls = 'step-dot';
    if (isActive) cls += ' active';
    if (isDone)   cls += ' done';
    const label = isDone
      ? `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`
      : idx + 1;
    return `<div class="${cls}" style="${isActive ? `background:${dotColor};border-color:${dotColor};` : ''}"
      onclick="goStep(${idx})" title="${s.chapter.title}: ${s.step.title}">${label}</div>`;
  }).join('');

  // 미션 바디
  const body = document.getElementById('mission-body');
  body.innerHTML = `
    <div class="mission-section">
      <div class="mission-label">개념</div>
      <div class="mission-text">${step.concept}</div>
    </div>
    <div class="mission-section">
      <div class="mission-label">할 일</div>
      <div class="task-box">
        ${step.tasks.map((t, ti) => `
          <div class="task-item" id="task-item-${ti}">
            <div class="task-check" id="task-check-${ti}"></div>
            <span>${t}</span>
          </div>`).join('')}
      </div>
    </div>
  `;

  // 에디터
  document.getElementById('code-editor').value = step.starter;

  // 출력 초기화
  const outEl = document.getElementById('output-body');
  outEl.innerHTML = '<span class="output-placeholder">코드를 실행하면 결과가 여기에 나타나요.</span>';
  document.getElementById('output-status').textContent = '';
  document.getElementById('output-status').className = 'output-status';

  // 힌트 초기화
  const hb = document.getElementById('hint-bubble');
  hb.classList.remove('visible');
  hb.innerHTML = '';

  // 성공 모달 닫기
  document.getElementById('modal-overlay').style.display = 'none';
}

function goStep(globalIdx) {
  const s = allSteps[globalIdx];
  renderStep(s.chapterIdx, s.stepIdx);
}

function resetCode() {
  const step = COURSE.chapters[currentChapter].steps[currentStep];
  document.getElementById('code-editor').value = step.starter;
}

// ── 코드 실행 ────────────────────────────────────────────────
async function runCode() {
  if (!webR) return;

  const code   = document.getElementById('code-editor').value;
  const outEl  = document.getElementById('output-body');
  const runBtn = document.getElementById('run-btn');
  const status = document.getElementById('output-status');

  runBtn.disabled = true;
  runBtn.textContent = '실행 중...';
  outEl.innerHTML = '<span class="output-placeholder">실행 중...</span>';
  status.textContent = '';

  let outputLines = [];

  try {
    // output capture
    await webR.evalRVoid(`
      .webr_output_buffer <- character(0)
      .old_cat   <- cat
      .old_print <- print
    `);

    const shelter = await new webR.Shelter();
    const result  = await shelter.captureR(code, { withAutoprint: true });

    // 출력 조합
    result.output.forEach(item => {
      if (item.type === 'stdout' || item.type === 'message') {
        outputLines.push(item.data);
      }
    });

    const outputText = outputLines.join('\n').trim();

    if (outputText) {
      outEl.innerHTML = `<span class="out-ok">${escHtml(outputText)}</span>`;
    } else {
      outEl.innerHTML = `<span class="out-ok">(출력 없음 — 변수를 print()로 확인해보세요)</span>`;
    }

    status.textContent = '✓ 실행 완료';
    status.className = 'output-status status-ok';

    shelter.purge();

    // 정답 체크
    const step = COURSE.chapters[currentChapter].steps[currentStep];
    if (step.check(outputText)) {
      setTimeout(() => showSuccess(step), 500);
    } else {
      // 태스크 체크 시각화 (간략)
      markTasks(code, outputText);
    }

  } catch(err) {
    outEl.innerHTML = `<span class="out-err">${escHtml(String(err))}</span>`;
    status.textContent = '✗ 오류';
    status.className = 'output-status status-err';
  }

  runBtn.disabled = false;
  runBtn.textContent = '▶ 실행';
}

function markTasks(code, output) {
  const step = COURSE.chapters[currentChapter].steps[currentStep];
  step.tasks.forEach((_, i) => {
    const el = document.getElementById(`task-check-${i}`);
    if (!el) return;
    // 단순 휴리스틱: 출력이 있고 코드에 관련 키워드가 있으면 체크
    const done = output.length > 0 && code.length > step.starter.length + 5;
    if (done && i === 0) {
      el.classList.add('done');
      el.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>`;
    }
  });
}

function showSuccess(step) {
  const gIdx = getCurrentGlobalIdx();
  const isLast = gIdx === allSteps.length - 1;

  document.getElementById('modal-title').textContent = step.success;
  document.getElementById('modal-sub').textContent = isLast
    ? '모든 실습을 완료했어요! 🎉'
    : '다음 단계로 넘어가볼까요?';

  const btn = document.querySelector('.modal-next-btn');
  btn.textContent = isLast ? '완료' : '다음 →';

  document.getElementById('modal-overlay').style.display = 'flex';
}

function nextStep() {
  const gIdx = getCurrentGlobalIdx();
  if (gIdx < allSteps.length - 1) {
    goStep(gIdx + 1);
  } else {
    document.getElementById('modal-overlay').style.display = 'none';
    alert('모든 실습 완료! 수고했어요 🎉');
  }
}

// ── AI 힌트 ──────────────────────────────────────────────────
async function getHint() {
  const step = COURSE.chapters[currentChapter].steps[currentStep];
  const hb   = document.getElementById('hint-bubble');
  const code = document.getElementById('code-editor').value;

  hb.innerHTML = '<span class="hint-loading">힌트 생성 중...</span>';
  hb.classList.add('visible');

  // API 키 없어도 내장 힌트로 폴백
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: 'R 코딩을 가르치는 소크라테스식 튜터. 답을 직접 알려주지 않고 생각을 유도하는 질문 형태의 힌트를 한국어로 3문장 이내로만 제공.',
        messages: [{
          role: 'user',
          content: `수업 주제: ${step.title}\n학생 현재 코드:\n${code}\n\n힌트를 줘.`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.map(b => b.text || '').join('') || step.hint;
    hb.innerHTML = text;
  } catch(e) {
    hb.innerHTML = step.hint;
  }
}

// ── 유틸 ─────────────────────────────────────────────────────
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// 시작
window.addEventListener('load', initWebR);
