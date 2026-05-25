# r-coding-api

R 코딩 실습 앱의 백엔드 서버입니다. Plumber로 R 코드를 실행하고 결과를 반환해요.

---

## Render.com 배포 방법 (단계별)

### 1단계 — 이 폴더를 GitHub repo로 만들기

1. github.com → New repository → 이름: `r-coding-api` → **Public** → Create
2. 파일 3개 업로드: `Dockerfile`, `plumber.R`, `packages.R`
3. Commit changes

### 2단계 — Render.com 가입 및 배포

1. https://render.com → **Get Started for Free**
2. GitHub 계정으로 로그인
3. 대시보드 → **New** → **Web Service**
4. GitHub repo 선택: `r-coding-api`
5. 설정:
   - **Name**: r-coding-api (자유)
   - **Runtime**: Docker  ← 이게 핵심!
   - **Instance Type**: Free
6. **Create Web Service** 클릭
7. 빌드 시작 (패키지 설치로 10~20분 소요)
8. 완료 후 URL 확인: `https://r-coding-api-xxxx.onrender.com`

### 3단계 — 프론트엔드에 API URL 연결

`r-coding-class/app.js` 첫 줄 수정:
```javascript
const API_URL = "https://r-coding-api-xxxx.onrender.com";  // 실제 URL로
```

그 다음 `r-coding-class` 파일 4개를 GitHub Pages에 올리면 완성.

---

## 주의사항

- Render 무료 티어는 **15분 미사용 시 슬립** → 첫 요청이 30초 정도 느릴 수 있어요
- 슬립 방지하려면 유료 플랜 ($7/월) 또는 UptimeRobot으로 5분마다 핑
- R 패키지 빌드가 오래 걸리는 건 정상이에요 (첫 배포만)

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /health | 서버 상태 확인 |
| POST | /run | R 코드 실행 (body: `{"code": "..."}`) |
