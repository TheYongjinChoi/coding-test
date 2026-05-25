// ============================================================
// 수업 내용을 여기서 편집하세요
// 각 lesson 안에 steps 배열을 추가하면 단계가 늘어납니다
// ============================================================

const COURSE = {
  title: "R 기초 실습",
  chapters: [
    {
      id: 1,
      title: "기초 문법",
      color: "#1D9E75",
      steps: [
        {
          title: "변수에 값 저장하기",
          concept: `R에서는 <code>&lt;-</code> 기호로 변수에 값을 저장해요.<br><br>
예: <code>x &lt;- 10</code> 은 x에 10을 저장한다는 뜻이에요.<br>
저장한 값을 보려면 변수 이름만 입력하거나 <code>print(x)</code> 를 쓰면 돼요.`,
          tasks: [
            "<code>name</code> 변수에 자신의 이름(문자열)을 저장하세요",
            "<code>age</code> 변수에 나이(숫자)를 저장하세요",
            "두 변수를 출력해보세요"
          ],
          starter: `# 변수에 값을 저장해보세요

`,
          check: (out) => out.length > 0 && (out.includes('"') || /\d+/.test(out)),
          hint: "R에서 변수에 문자열을 저장할 때는 따옴표를 사용해요. name <- '홍길동' 처럼요. 숫자는 따옴표 없이 그냥 쓰면 돼요. 지금 화면에서 <- 기호가 어떤 역할을 하는지 생각해보세요. 변수에 저장한 뒤, 그 값을 보려면 어떻게 해야 할까요?",
          success: "변수 저장 완료! 기초가 탄탄해지고 있어요."
        },
        {
          title: "벡터 만들기",
          concept: `R의 핵심 자료구조는 <strong>벡터</strong>예요.<br><br>
<code>c()</code> 함수로 여러 값을 묶을 수 있어요.<br>
예: <code>scores &lt;- c(85, 90, 78, 92)</code>`,
          tasks: [
            "<code>scores</code> 벡터에 숫자 5개를 저장하세요",
            "<code>length(scores)</code> 로 길이를 확인하세요",
            "<code>mean(scores)</code> 로 평균을 구해보세요"
          ],
          starter: `# 벡터를 만들고 기본 통계를 구해보세요

`,
          check: (out) => /\d+\.?\d*/.test(out) && out.split('\n').length >= 2,
          hint: "c() 함수는 'combine'의 줄임말이에요. c(1, 2, 3) 처럼 쉼표로 값을 구분해서 넣어보세요. 벡터를 만든 뒤, 길이와 평균을 각각 다른 줄에서 출력해보면 어떨까요?",
          success: "벡터를 자유롭게 다루고 있어요!"
        },
        {
          title: "조건문 if/else",
          concept: `조건에 따라 다른 코드를 실행할 수 있어요.<br><br>
<pre><code>if (조건) {
  # 참일 때
} else {
  # 거짓일 때
}</code></pre>`,
          tasks: [
            "<code>score</code> 변수에 점수를 저장하세요",
            "70점 이상이면 <code>합격</code>, 아니면 <code>불합격</code>을 출력하세요",
            "다른 점수로도 테스트해보세요"
          ],
          starter: `# 점수에 따라 합격/불합격을 출력해보세요

`,
          check: (out) => out.includes("합격") || out.includes("불합격"),
          hint: "if 조건문의 괄호 안에는 TRUE/FALSE로 판단할 수 있는 표현이 들어가요. 숫자 비교는 >= (이상), <= (이하), == (같음) 등을 쓰면 돼요. print() 함수로 문자열을 출력할 때는 따옴표를 잊지 마세요.",
          success: "조건문을 완벽하게 이해했어요!"
        }
      ]
    },
    {
      id: 2,
      title: "데이터 다루기",
      color: "#185FA5",
      steps: [
        {
          title: "데이터프레임 만들기",
          concept: `데이터프레임은 R의 핵심 데이터 구조예요. 엑셀의 표처럼 행과 열로 이루어져 있어요.<br><br>
<code>data.frame()</code> 으로 만들고, <code>$</code> 로 열에 접근해요.`,
          tasks: [
            "이름과 점수 열을 가진 데이터프레임을 만드세요",
            "<code>df$name</code> 으로 이름 열을 출력해보세요",
            "<code>nrow(df)</code> 로 행 수를 확인하세요"
          ],
          starter: `# 학생 데이터프레임을 만들어보세요

`,
          check: (out) => out.length > 5,
          hint: "data.frame()은 여러 벡터를 합쳐서 표를 만들어요. data.frame(name = c('A', 'B'), score = c(80, 90)) 처럼 열 이름과 벡터를 쌍으로 넣어요. 만든 뒤에 $ 기호로 원하는 열만 꺼낼 수 있어요.",
          success: "데이터프레임 마스터!"
        },
        {
          title: "dplyr로 필터링",
          concept: `<code>dplyr</code> 패키지를 쓰면 데이터를 훨씬 쉽게 다룰 수 있어요.<br><br>
<code>filter()</code> 는 조건에 맞는 행만 골라내요.<br>
<code>%&gt;%</code> 파이프로 연결해요.`,
          tasks: [
            "<code>library(dplyr)</code> 로 패키지를 불러오세요",
            "점수가 80 이상인 학생만 필터링하세요",
            "결과를 출력해보세요"
          ],
          starter: `# dplyr로 데이터를 필터링해보세요
df <- data.frame(
  name  = c("김민준", "이서연", "박지호", "최예린", "정우성"),
  score = c(92, 75, 88, 63, 95)
)

`,
          check: (out) => out.includes("김민준") || out.includes("박지호") || out.includes("정우성"),
          hint: "library(dplyr)로 패키지를 먼저 불러온 뒤, df %>% filter(score >= 80) 처럼 파이프(%>%)로 연결해요. filter 안의 조건은 남기고 싶은 행의 조건이에요. 80점 이상인 학생이 몇 명인지 생각해보면서 결과를 예측해보세요.",
          success: "dplyr 필터링 완료!"
        }
      ]
    },
    {
      id: 3,
      title: "시각화",
      color: "#993556",
      steps: [
        {
          title: "ggplot2 기본 산점도",
          concept: `<code>ggplot2</code>는 R 시각화의 표준이에요.<br><br>
레이어를 <code>+</code> 로 쌓아가며 그래프를 만들어요.<br>
<code>aes()</code>: 어떤 데이터를 x, y에 → <code>geom_point()</code>: 점으로 표현`,
          tasks: [
            "<code>library(ggplot2)</code> 로 패키지를 불러오세요",
            "<code>ggplot()</code>으로 기본 산점도를 그려보세요",
            "제목을 <code>labs(title=)</code>으로 추가해보세요"
          ],
          starter: `# ggplot2로 산점도를 그려보세요
library(ggplot2)

df <- data.frame(
  x = c(1, 2, 3, 4, 5),
  y = c(2, 4, 3, 5, 6)
)

`,
          check: (out) => out.length >= 0,
          hint: "ggplot(data, aes(x=x, y=y)) + geom_point() 가 가장 기본 형태예요. 여기서 aes()는 데이터의 어떤 열을 x축/y축에 쓸지 지정하는 곳이에요. 제목은 마지막에 + labs(title='내 그래프') 처럼 추가하면 돼요.",
          success: "ggplot2 첫 걸음 완료!"
        }
      ]
    }
  ]
};
