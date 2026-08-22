// ============================================================
//  courses.js — 세션 레지스트리 · 진척도 저장소 (마스터/실습 공용)
//  lessons/*.js 가 registerCourse() 로 자기 자신을 등록합니다.
// ============================================================

const API_URL = "https://coding-api-enum.onrender.com";

/* 마스터 페이지에 표시할 순서와 부가 정보.
   여기에 한 줄 추가하고 lessons/<id>.js 를 만들면 세션이 늘어납니다. */
const SESSION_ORDER = [
  { id: "workflow", est: "60분", note: "OHIE 데이터로 훈련·테스트 분할부터 Lasso·Ridge까지" },
  { id: "nn",       est: "75분", note: "역전파를 직접 구현한 뒤 Keras로 같은 모형을 만듭니다" },
  { id: "ensemble", est: "60분", note: "의사결정트리에서 배깅·랜덤포레스트·부스팅까지" },
];

window.COURSES = {};
function registerCourse(course) { window.COURSES[course.id] = course; }

/* ── 진척도 (브라우저 localStorage) ───────────────────────── */
const PROGRESS_KEY = "kapae-progress-v2";
const STUDENT_KEY  = "kapae-student-id";
const SID_KEY      = "kapae-sid";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}; }
  catch (e) { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(p)); } catch (e) {}
}
function sessionProgress(id) {
  const p = loadProgress();
  return p[id] || { done: [], updated: null };
}
function markStepDone(id, stepIdx) {
  const p = loadProgress();
  const s = p[id] || { done: [], updated: null };
  if (!s.done.includes(stepIdx)) s.done.push(stepIdx);
  s.done.sort((a, b) => a - b);
  s.updated = new Date().toISOString();
  p[id] = s;
  saveProgress(p);
}
function resetSessionProgress(id) {
  const p = loadProgress();
  delete p[id];
  saveProgress(p);
}
/* 잠금 규칙: 0번 단계와 "이미 완료한 단계 + 1"까지만 열립니다. */
function unlockedUpTo(id) {
  const done = sessionProgress(id).done;
  let idx = 0;
  while (done.includes(idx)) idx++;
  return idx;
}
function countSteps(course) {
  return course.chapters.reduce((n, ch) => n + ch.steps.length, 0);
}

/* ── 수강자 ID · 세션 식별자 ─────────────────────────────── */
function getStudentId() { return localStorage.getItem(STUDENT_KEY) || ""; }
function setStudentId(v) { localStorage.setItem(STUDENT_KEY, v.trim()); }
function getSid() {
  let sid = localStorage.getItem(SID_KEY);
  if (!sid) {
    sid = "s-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    localStorage.setItem(SID_KEY, sid);
  }
  return sid;
}

/* ── 테마 ────────────────────────────────────────────────── */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  const btn = document.getElementById("theme-btn");
  if (!btn) return;
  btn.innerHTML = theme === "dark"
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> 라이트 모드'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> 다크 모드';
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
}
