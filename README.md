# coding-test — 코딩 실습실 (프런트엔드)

GitHub Pages에 올려서 쓰는 정적 사이트입니다. 학생은 패키지를 설치하지 않고
브라우저에서 R 코드를 작성·실행하고, 빈칸 채우기 과제를 단계별로 통과합니다.

실행은 별도 저장소의 R 서버(`coding-api`)가 담당합니다.

## 구조

```
index.html          마스터 페이지 — 실습 세션 목록, 진척도, 서버 상태
practice.html       실습 화면 — ?session=<id> 로 세션을 지정
courses.js          세션 레지스트리 · 진척도(localStorage) · 테마
app.js              실습 화면 컨트롤러 (실행 · 채점 · 잠금 · 이동)
style.css           공용 스타일
lessons/
  workflow.js       1강. 통계적 학습의 워크플로와 정규화 회귀
  nn.js             2강. 신경망
  ensemble.js       3강. 트리 기반 앙상블
snippets/
  workflow/*.R      단계별 시작 코드(빈칸 포함)
  nn/*.R
  ensemble/*.R
```

흐름: `index.html` → 세션 카드 클릭 → `practice.html?session=<id>` →
마지막 단계 완료 → `index.html?done=<id>` 로 복귀.

## 단계 잠금 규칙

- `courses.js`의 `unlockedUpTo()`가 "완료한 단계 + 1"까지만 열어 줍니다.
- 빈칸(`_____`)이 남아 있으면 실행 자체가 막힙니다.
- 실행이 성공해도 `blanks[].answer` 정규식이 하나라도 어긋나면 단계는 완료되지 않고,
  왼쪽 목록에서 틀린 줄에 ✕가 표시됩니다.
- 진척도는 브라우저 `localStorage`에 저장됩니다(수강자 ID별 서버 저장은 `/track`).

## lessons 파일 형식

```js
registerCourse({
  id: "workflow",
  title: "1강. …",
  subtitle: "…",
  color: "#1D9E75",
  tracker: "https://.../tracker1-1_workflow.R",   // 없으면 null
  chapters: [{
    id: 1.1, title: "Part 1. …", color: "#1D9E75",
    steps: [{
      title: "Task 1-1. …",
      mode: "fill",                 // "fill" = 빈칸 채우기, "run" = 실행만
      checkId: "task1-1-split",     // tracker의 check("id") 와 동일. 없으면 null
      starter_path: "snippets/workflow/03-task1-1-split.R",
      concept: "<p>…</p>",          // 왼쪽 '개념' 영역 HTML
      blanks: [                     // 빈칸 한 줄 = 채점 항목 하나
        { line: "train_id <- _____(", answer: /train_id<\-sample\(/ }
      ],
      hint: null,
      success: "…",                 // 완료 모달 제목
      implication: null             // 완료 모달 본문(해석). MathJax \\( \\) 사용 가능
    }]
  }]
});
```

`answer` 정규식은 **주석과 공백을 모두 제거하고 소수점 표기를 통일한 코드**와 대조합니다
(`app.js`의 `normCode()`). 그래서 들여쓰기나 줄바꿈이 달라도 통과합니다.
답이 여러 개 허용되어야 하면 정규식을 직접 넓히면 됩니다.
예: `/train_id<\-(sample|base::sample)\(/`

`answer: null`이면 그 줄은 채점하지 않고, 코드가 오류 없이 실행되면 통과 처리합니다.

## tracker(R 채점 스크립트) 연결

1. 세션의 `tracker`에 R 스크립트 URL을 넣습니다.
2. 서버가 학생별 R 환경에 그 스크립트를 `source()` 하고, 있으면 `set_student()`를 호출합니다.
3. 코드 실행이 끝나면 앱이 `/check`를 호출해 `check("<checkId>")`를 서버에서 실행하고,
   출력에 `✅`/`정답입니다`가 있으면 통과, `❌`/`다시 확인`이면 실패로 처리하며
   스크립트가 돌려준 힌트를 '채점 결과'에 그대로 보여 줍니다.
4. tracker가 없거나(`null`) 불러오지 못하면 **자동으로 브라우저 채점으로 내려갑니다.**
   `ensemble`이 지금 이 상태입니다. 나중에 `tracker_ensemble.R`을 만들고
   `lessons/ensemble.js`의 `tracker`와 각 단계 `checkId`만 채우면 그대로 붙습니다.

## 세션 추가

1. `lessons/<id>.js` 작성 → `registerCourse({ id: "<id>", … })`
2. `courses.js`의 `SESSION_ORDER`에 한 줄 추가
3. `index.html`과 `practice.html`에 `<script src="lessons/<id>.js"></script>` 한 줄 추가

## API 주소

`courses.js` 첫 줄의 `API_URL`을 배포된 서버 주소로 맞춰 주세요.
