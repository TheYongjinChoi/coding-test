// ============================================================
// 수업 내용 편집 파일 — 여기만 수정하면 됩니다
// check: (out, code) => 정답 조건 (out=출력, code=작성한 코드)
// hint: 정답 아닐 때 보여줄 힌트 (없으면 null)
// ============================================================

const COURSE = {
  title: "R 코딩 실습",
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
          starter: `# 변수에 값을 저장해보세요\n\n`,
          check: (out, code) => code.includes('<-') && out.length > 0,
          hint: null,
          implication: `변수 할당(<code>&lt;-</code>)은 R의 핵심이에요. Python의 <code>=</code>과 달리 R은 방향성을 명시합니다. 변수에 저장된 값은 이후 분석 파이프라인 전체에서 재사용되며, 이것이 재현 가능한 연구(reproducible research)의 출발점이에요.`,
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
          starter: `# 벡터를 만들고 기본 통계를 구해보세요\n\n`,
          check: (out, code) => code.includes('c(') && code.includes('mean(') && out.length > 0,
          hint: null,
          success: "벡터를 자유롭게 다루고 있어요!"
        }
      ]
    },
    {
      id: 2,
      title: "인과추론 기초",
      color: "#185FA5",
      steps: [
        {
          title: "MatchIt으로 매칭",
          concept: `<code>MatchIt</code> 패키지로 성향점수 매칭을 할 수 있어요.<br><br>
<code>matchit(formula, data, method)</code> 로 매칭 객체를 만들고<br>
<code>summary()</code> 로 결과를 확인해요.`,
          tasks: [
            "<code>library(MatchIt)</code> 로 패키지를 불러오세요",
            "예시 데이터로 <code>matchit()</code> 을 실행하세요",
            "<code>summary(m.out)</code> 로 결과를 확인하세요"
          ],
          starter: `library(MatchIt)

# 예시 데이터
data(lalonde)

# treatment ~ 공변량 으로 매칭
m.out <- matchit(treat ~ age + educ + race,
                 data   = lalonde,
                 method = "nearest")

`,
          check: (out, code) => code.includes('matchit(') && out.length > 0,
          hint: null,
          success: "매칭 완료! MatchIt을 사용할 수 있어요."
        },
        {
          title: "DoubleML 기초",
          concept: `<code>DoubleML</code>은 Chernozhukov et al. (2018)의<br>
Double/Debiased ML을 R로 구현한 패키지예요.<br><br>
<code>DoubleMLPLR</code>: Partially Linear Regression<br>
<code>DoubleMLIRM</code>: Interactive Regression Model`,
          tasks: [
            "<code>library(DoubleML)</code>, <code>library(mlr3learners)</code> 불러오기",
            "<code>DoubleMLData</code> 객체 생성하기",
            "<code>DoubleMLPLR</code> 모델 적합 후 <code>$fit()</code> 실행하기"
          ],
          starter: `library(DoubleML)
library(mlr3)
library(mlr3learners)

set.seed(42)
n <- 500
X <- matrix(rnorm(n * 5), n, 5)
d <- X[,1] + rnorm(n)
y <- 0.5 * d + X[,2] + rnorm(n)
df <- data.frame(y = y, d = d, X)

# DoubleMLData 객체 생성
dml_data <- DoubleMLData$new(df,
  y_col  = "y",
  d_cols = "d"
)

# Learner 설정 (Lasso)
lrn_l <- lrn("regr.cv_glmnet")
lrn_m <- lrn("regr.cv_glmnet")

# PLR 모델
dml_plr <- DoubleMLPLR$new(dml_data, ml_l = lrn_l, ml_m = lrn_m)

`,
          check: (out, code) => code.includes('DoubleMLPLR') && code.includes('$fit()') || code.includes('dml_plr$fit'),
          hint: null,
          success: "DoubleML 실행 성공!"
        }
      ]
    },
    {
      id: 3,
      title: "Causal Forest",
      color: "#854F0B",
      steps: [
        {
          title: "grf로 Causal Forest",
          concept: `<code>grf</code> 패키지의 <code>causal_forest()</code>로<br>
이질적 처치효과(HTE)를 추정할 수 있어요.<br><br>
<code>average_treatment_effect()</code> 로 ATE를,<br>
<code>predict()</code> 로 개별 CATE를 구해요.`,
          tasks: [
            "<code>library(grf)</code> 불러오기",
            "<code>causal_forest(X, Y, W)</code> 실행하기",
            "<code>average_treatment_effect()</code> 로 ATE 확인하기"
          ],
          starter: `library(grf)

set.seed(42)
n <- 1000
X <- matrix(rnorm(n * 5), n, 5)
W <- rbinom(n, 1, 0.5)
Y <- 2 * W + X[,1] + rnorm(n)

# Causal Forest 적합
cf <- causal_forest(X, Y, W)

# ATE 추정

`,
          check: (out, code) => code.includes('causal_forest(') && code.includes('average_treatment_effect(') && out.length > 0,
          hint: null,
          success: "Causal Forest 완료! CATE 추정까지 해봤어요."
        }
      ]
    }
  ]
};
