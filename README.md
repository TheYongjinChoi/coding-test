# R 코딩 실습실

DataCamp 스타일 R 코딩 실습 페이지입니다.
WebR로 브라우저 안에서 R 코드가 실제 실행되고, Claude AI 힌트 기능이 포함되어 있습니다.

---

## 파일 구조

```
r-coding-class/
├── index.html   ← 메인 페이지 (건드리지 않아도 됨)
├── style.css    ← 디자인 (건드리지 않아도 됨)
├── app.js       ← 앱 로직 (건드리지 않아도 됨)
├── lessons.js   ← ✏️ 수업 내용 편집 파일 (여기만 수정)
└── README.md
```

---

## GitHub Pages로 배포하기 (링크 공유)

### 1단계 — GitHub 저장소 만들기
1. https://github.com 접속 → 로그인
2. 우측 상단 **+** → **New repository**
3. Repository name: `r-coding-class` (원하는 이름)
4. **Public** 선택 → **Create repository**

### 2단계 — 파일 올리기
1. 저장소 페이지에서 **uploading an existing file** 클릭
2. 이 폴더의 파일 4개를 모두 드래그 앤 드롭
   - `index.html`, `style.css`, `app.js`, `lessons.js`
3. **Commit changes** 클릭

### 3단계 — Pages 활성화
1. 저장소 → **Settings** 탭
2. 왼쪽 메뉴 **Pages**
3. Source: **Deploy from a branch**
4. Branch: **main** / `/ (root)` → **Save**
5. 1~2분 후 아래 주소로 접속 가능:

```
https://[내GitHub아이디].github.io/r-coding-class/
```

이 링크를 학생들에게 공유하면 됩니다. 설치 불필요, 링크 하나로 바로 접속.

---

## 수업 내용 편집하기

`lessons.js` 파일만 수정하면 됩니다.

### 새 챕터 추가

```javascript
{
  id: 4,
  title: "내 챕터 제목",
  color: "#8B5CF6",  // 아무 색깔
  steps: [
    {
      title: "스텝 제목",
      concept: `개념 설명 HTML. <code>코드</code> 태그 사용 가능.`,
      tasks: [
        "할 일 1",
        "할 일 2",
        "할 일 3"
      ],
      starter: `# 여기에 초기 코드\n\n`,
      check: (out) => out.includes("정답에 포함될 텍스트"),
      hint: "AI 없을 때 보여줄 기본 힌트 텍스트",
      success: "성공 메시지"
    }
  ]
}
```

### check 함수 작성 팁

```javascript
// 특정 텍스트가 출력에 포함되면 정답
check: (out) => out.includes("Hello"),

// 숫자가 출력되면 정답
check: (out) => /\d+/.test(out),

// 여러 조건
check: (out) => out.includes("합격") || out.includes("불합격"),

// 항상 정답 (자유 실습)
check: (out) => out.length > 0,
```

---

## AI 힌트 작동 방식

- Claude API를 호출해 소크라테스식 힌트를 생성합니다 (답을 직접 주지 않음)
- API 호출 실패 시 `lessons.js`의 `hint` 필드 텍스트를 대신 보여줍니다
- API 키는 별도 설정 없이 claude.ai 환경에서 자동 처리됩니다

---

## 기술 스택

| 역할 | 기술 |
|------|------|
| R 실행 (브라우저 내) | WebR |
| AI 힌트 | Claude API (claude-sonnet-4) |
| 배포 | GitHub Pages (무료) |
| 백엔드 | 없음 (완전 정적) |
