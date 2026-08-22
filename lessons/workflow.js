// ============================================================
//  1강 실습 — 통계적 학습의 워크플로와 정규화 회귀
//  자동 생성 후 손으로 다듬는 파일입니다. 개념/힌트/성공 메시지는 여기서 수정하세요.
//  blanks[].answer 는 채점용 정규식(공백·주석 제거 후 비교)입니다.
// ============================================================

registerCourse({
  id: "workflow",
  title: "1강. 통계적 학습의 워크플로와 정규화 회귀",
  subtitle: "OLS · Lasso · Ridge",
  color: "#1D9E75",
  tracker: "https://raw.githubusercontent.com/TheYongjinChoi/kapae2026-exercise/main/tracker1-1_workflow.R",   // null 이면 클라이언트 채점만 사용
  chapters: [
    {
      id: 1.0,
      title: "데이터 준비",
      color: "#1D9E75",
      steps: [
        {
          title: "데이터 불러오기",
          mode: "run",
          checkId: null,
          starter_path: "snippets/workflow/01-setup.R",
          concept: "<p>아래 코드를 실행하세요. RDS 파일을 불러오고 이번 실습에 필요한 변수만 선택합니다. 그리고 결과변수의 분포를 확인합니다.</p>\n<ul>\n<li><code>glmnet</code>은 Lasso, Ridge, Elastic Net을 실행하는 패키지입니다.\n</li><li><code>required_vars</code>에 이번 실습에서 사용할 변수 이름을 모아 둡니다. 결과변수 하나와 예측변수 여러 개가 함께 들어 있습니다.\n</li><li>분석에 사용할 데이터는 <code>df</code>에 저장이 되어 있습니다.\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "변수 전처리",
          mode: "run",
          checkId: null,
          starter_path: "snippets/workflow/02-setup.R",
          concept: "<p>아래 코드를 실행하세요. <code>transmute()</code>로 분석에 사용할 변수를 한 번에 정리하고, 그 결과를 <code>model_df</code>에 저장합니다. 계수를 읽을 때 편하도록 변수 이름을 알아보기 쉽게 바꾸겠습니다.</p>\n<ul>\n<li>결과변수 <code>rx_num</code>을 맨 앞에 둡니다.\n</li><li>범주가 순서 없이 여러 개인 변수(<code>treatment</code>, <code>edu</code>)는 <code>factor()</code>로 변환합니다. 나머지 이진변수와 순서형, 연속형 변수는 숫자형으로 둡니다.\n</li><li><code>age</code>는 조사 시점(2009년)에서 출생연도를 빼서 연령으로 변환합니다.\n</li><li>실습 편의상 <code>drop_na()</code>로 결측이 하나라도 있는 행을 제거합니다. 하지만 실무에서는 결측치 비율이 높고 무작위 결측이 아닌 경우 통계적 대치(imputation)을 고려해야 합니다.\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 1.1,
      title: "Part 1. 통계적 학습의 워크플로",
      color: "#1D9E75",
      steps: [
        {
          title: "Task 1-1. 훈련테스트 분할",
          mode: "fill",
          checkId: "task1-1-split",
          starter_path: "snippets/workflow/03-task1-1-split.R",
          concept: "<p>전체 데이터를 훈련 데이터 80%와 테스트 데이터 20%로 무작위 분할합니다.</p>\n<ul>\n<li>먼저 <code>set.seed()</code>로 실행할 때마다 같은 분할이 재현되도록 난수를 고정합니다.\n</li><li><code>sample()</code> 함수를 사용해 전체 행 번호 중 훈련 데이터에 포함할 행 번호를 무작위로 추출합니다.\n<ul>\n<li><code>nrow()</code> 함수는 인수로 지정된 데이터프레임의 전체 관측치 수를 반환합니다. 관측치의 행 번호는 1부터 전체 관측치 수까지이므로 <code>1:nrow(model_df)</code>를 사용해 모든 행 번호를 만듭니다.\n</li><li>다음으로 <code>size</code> 인수에 추출할 행의 개수를 지정합니다. 여기에서는 80%를 훈련 데이터로 사용하기로 했으므로 전체 관측치 수에 <code>0.80</code>을 곱해 계산합니다. 행의 개수는 정수여야 하므로 <code>round()</code> 함수로 가장 가까운 정수로 반올림합니다.\n</li><li>추출된 행 번호는 <code>train_id</code>라는 객체에 저장합니다. <code>sample()</code>은 기본적으로 비복원 추출이므로 같은 행이 중복해서 뽑히지 않습니다.\n</li></ul>\n</li><li>이후 원 데이터 <code>model_df</code>에서 <code>train_id</code>에 포함된 행을 선택해 <code>train_data</code>를 만듭니다. 반대로 행 번호 앞에 음수 기호를 붙인 <code>-train_id</code>를 사용하면 해당 행들을 제외할 수 있으므로, 훈련 데이터에 포함되지 않은 나머지 행을 선택해 <code>test_data</code>를 만듭니다.\n</li></ul>",
          blanks: [
            { line: "train_id <- _____(", answer: /train_id<\-sample\(/ },
            { line: "1:_____(_____),", answer: /1:nrow\(model_df\),/ },
            { line: "size = round(_____ * nrow(model_df))", answer: /size=round\(0\.8\*nrow\(model_df\)\)/ },
            { line: "train_data <- model_df[_____, ]", answer: /train_data<\-model_df\[train_id,\]/ },
            { line: "test_data  <- model_df[_____, ]", answer: /test_data<\-model_df\[\-train_id,\]/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 1-2. 모델 정의",
          mode: "fill",
          checkId: "task1-2-ols",
          starter_path: "snippets/workflow/04-task1-2-ols.R",
          concept: "<p>먼저 OLS를 사용해 6개월 시점의 처방약 개수 <code>rx_num</code>을 예측합니다. 정규화 회귀와 비교할 기준모형이므로 앞에서 전처리한 예측변수를 모두 넣습니다.</p>\n<p>\\\\[ \\widehat{\\text{rx\\_num}}_i = \\beta_0 + \\beta_1 x_{i1} + \\cdots + \\beta_p x_{ip} \\\\]</p>\n<p><code>lm()</code> 함수를 사용해 훈련 데이터에 OLS 회귀모형을 적합합니다. <code>lm()</code> 함수의 첫 번째 인수는 공식입니다. 공식에서 <code>~</code> 왼쪽에는 결과변수, 오른쪽에는 설명변수를 작성합니다.</p>\n<ul>\n<li>예측하려는 결과변수 <code>rx_num</code>를 좌변에 지정합니다. \n</li><li>결과변수를 제외한 나머지 변수 전체를 예측변수로 사용하라는 의미로 공식의 우변에 <code>.</code>를 지정합니다.\n</li><li><code>data</code> 인수에는 모델 학습에 사용할 훈련 데이터 <code>train_data</code>를 지정합니다.\n</li><li>학습된 모델을 <code>ols_model</code>에 저장합니다.\n</li></ul>\n<p>마지막으로 <code>summary()</code> 함수를 사용해 회귀분석 결과를 출력합니다.</p>",
          blanks: [
            { line: "ols_model <- _____(_____ ~ ., data = _____)", answer: /ols_model<\-lm\(rx_num\~\.,data=train_data\)/ },
            { line: "summary(_____)", answer: /summary\(ols_model\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 1-3. 예측값 계산과 평가",
          mode: "fill",
          checkId: "task1-3-predict",
          starter_path: "snippets/workflow/05-task1-3-predict.R",
          concept: "<p><code>predict()</code> 함수에 학습된 모델과 테스트 데이터를 입력해 예측값을 계산합니다. 이 함수는 학습된 모델을 새로운 데이터에 적용해 예측값을 계산합니다.</p>\n<ul>\n<li>첫 번째 인수로 <code>ols_model</code>에 저장된 학습된 OLS 모델을 불러옵니다.\n</li><li>두 번째 인수 <code>newdata</code>에 <code>test_data</code>에 저장된 테스트 데이터를 할당합니다.\n</li><li>계산한 예측값은 <code>pred_ols</code>에 저장합니다.\n</li></ul>\n<p>다음으로 실제값과 예측값의 차이를 RMSE로 계산합니다.</p>\n<ul>\n<li>RMSE의 정의상 <code>test_data$rx_num</code>에는 테스트 데이터의 실제값과 예측된 결과인 <code>pred_ols</code>의 차이를 입력하고, 그 제곱의 평균을 계산합니다.\n</li><li>계산된 평균을 <code>sqrt()</code>에 입력하여 제곱근을 취합니다.\n</li><li>계산한 값은 <code>rmse_ols</code>에 저장하고 출력해서 계산된 RMSE의 값을 확인합니다.\n</li></ul>",
          blanks: [
            { line: "pred_ols <- _____(_____, newdata = _____)", answer: null },
            { line: "rmse_ols <- _____(_____((test_data$_____ - _____)^_____))", answer: /rmse_ols<\-sqrt\(mean\(\(test_data\$rx_num\-pred_ols\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 1.2,
      title: "Part 2. 정규화 회귀를 적용한 학습 워크플로",
      color: "#1D9E75",
      steps: [
        {
          title: "Task 2-1. Lasso와 Ridge를 위한 행렬 만들기",
          mode: "fill",
          checkId: "task2-1-matrix",
          starter_path: "snippets/workflow/06-task2-1-matrix.R",
          concept: "<p><code>lm()</code>과 <code>glm()</code>은 공식(<code>y ~ x1 + x2</code>)과 데이터프레임을 그대로 사용하지만, <code>glmnet()</code>은 예측변수 <code>x</code>는 행렬로 받고, 결과변수 벡터 <code>y</code>를 따로 받습니다. 따라서 데이터프레임을 행렬로 바꾸는 단계가 한 번 필요합니다.</p>\n<ol>\n<li><strong>행렬 변환:</strong> <code>model.matrix()</code> 함수를 사용해서 데이터프레임을 행렬로 변환하고, 이를 <code>x_all</code>에 저장하고, 결과변수 <code>rx_num</code>열은 <code>y_all</code>에 저장합니다.\n</li></ol>\n<ul>\n<li><code>model.matrix()</code> 함수는 공식을 입력하면 행렬로 만들어줍니다. 앞서 lm()에 설정한 것과 마찬가지로 모형 수식의 좌변에 <code>rx_num ~ .</code>, 우변에 결과변수를 제외한 모든 변수를 예측변수로 사용하라는 의미로  <code>.</code>를 지정.\n</li><li><code>data</code> 인수에는 변환할 데이터로 <code>model_df</code>를 지정합니다.\n</li><li><code>model.matrix()</code> 함수는 factor 변수를 자동으로 더미변수로 펼쳐줍니다. 이걸 원핫인코딩? 예를 들어 <code>edu</code>는 네 개 범주이므로 기준 범주를 제외한 세 개의 더미변수가 만들어집니다. 기준 범주를 변경하는 옵션 가능한지?\n</li><li><code>model.matrix()</code>는 첫 열에 1로 채워진 Intercept 열을 만듭니다(확인해보고 싶으면 head() 함수를 사용하거나 오른쪽 변수 패널에서 데이터 프레임을 더블 클릭해서 확인). 불필요하니 <code>[, -1]</code>로 이 열을 제거합니다.\n</li></ul>\n<ol>\n<li><strong>훈련테스트 분할:</strong> 분할은 앞에서 만든 <code>train_id</code>를 그대로 재사용합니다.\n</li></ol>\n<ul>\n<li>예측변수 행렬 <code>x_all</code>에서 훈련 데이터는 <code>train_id</code>, 테스트 데이터는 <code>-train_id</code>로 추출하여, 각각 <code>x_train</code>과 <code>x_test</code>에 저장합니다.\n</li><li>같은 방식으로 결과변수 벡터 <code>y_all</code>에서 <code>y_train</code>과 <code>y_test</code>를 만듭니다.\n</li></ul>\n<p>마지막으로 <code>dim()</code> 함수로 훈련 행렬과 테스트 행렬의 크기를 확인합니다.</p>\n<p>여기에서 주의할 점은 행렬을 전체 데이터에서 한 번만 만들고 그 다음에 나눈다는 것입니다. 훈련 데이터와 테스트 데이터에서 따로 행렬을 만들면, 열의 개수나 순서가 달라져 오류가 발생할 수 있습니다.</p>",
          blanks: [
            { line: "x_all <- _____(rx_num ~ ., data = _____)[, -1]", answer: null },
            { line: "y_all <- model_df$_____", answer: null },
            { line: "x_train <- x_all[_____, ]", answer: /y_train<\-y_all\[train_id\]/ },
            { line: "x_test  <- x_all[_____, ]", answer: /y_test<\-y_all\[\-train_id\]/ },
            { line: "y_train <- y_all[_____]", answer: /y_train<\-y_all\[train_id\]/ },
            { line: "y_test  <- y_all[_____]", answer: /y_test<\-y_all\[\-train_id\]/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 2-2. Lasso 회귀와 페널티(람다) 튜닝",
          mode: "fill",
          checkId: "task2-2-lasso",
          starter_path: "snippets/workflow/07-task2-2-lasso.R",
          concept: "<p>Lasso는 잔차제곱합에 계수의 절댓값 합을 페널티로 더한 목적함수를 최소화합니다.</p>\n<p>\\\\[ \\hat{\\beta}^{\\text{lasso}} = \\arg\\min_{\\beta} \\left\\{ \\frac{1}{2n}\\sum_{i=1}^{n} \\left(y_i - \\beta_0 - \\sum_{j=1}^{p} x_{ij}\\beta_j\\right)^2 + \\lambda \\sum_{j=1}^{p} \\left|\\beta_j\\right| \\right\\} \\\\]</p>\n<p>정규화 회귀의 \\\\(\\lambda\\\\)는 데이터에서 추정되는 모수가 아니라 연구자가 정해야 하는 값입니다. 어떤 값이 적절한지 미리 알 수 없으므로 하나를 골라 적합하는 대신 넓은 범위의 후보를 모두 계산해 두고 그 중에서 오차가 가장 작은 값을 고르는 방식으로 튜닝을 합니다. <code>cv.glmnet()</code>은 교차검증으로 \\\\(\\lambda\\\\)별 예측오차까지 계산해 주므로, 앞으로의 예측과 평가에는 이 결과를 사용합니다.</p>\n<p>먼저 <code>set.seed()</code>로 난수를 고정합니다. 앞에서 한 번 고정했더라도 그 사이 <code>sample()</code>이 난수를 소비했기 때문에 난수를 사용하는 단계 바로 앞에서 다시 고정하는 것이 좋습니다.</p>\n<p><code>cv.glmnet()</code> 함수를 사용해 훈련 데이터에서 교차검증 Lasso 회귀를 수행합니다.</p>\n<ul>\n<li><code>x</code>와 <code>y</code>에 각각 훈련 데이터 행렬인 <code>x_train</code>과 <code>y_train</code>을 할당합니다.\n</li><li><code>alpha</code>: 페널티의 종류를 지정합니다. <code>1</code>이면 Lasso, <code>0</code>이면 Ridge, 0과 1 사이면 Elastic Net입니다.\n</li><li><code>family = \"gaussian\"</code>: 연속형 결과변수에 맞는 선형모형을 지정합니다. 이진 결과변수라면 <code>\"binomial\"</code>을 사용합니다.\n</li><li><code>nfolds</code>: 훈련 데이터를 열 겹으로 나누기 위해 <code>10</code>을 설정합니다. 아홉 겹으로 학습하고 남은 한 겹으로 평가하는 과정을 열 번 반복해 평균을 냅니다.\n</li><li><code>type.measure</code>: 겹마다 평가할 지표를 설정합니다. 연속형 결과변수이므로 평균제곱오차 <code>\"mse\"</code>를 지정합니다.\n</li><li>이 결과를 <code>cv_lasso</code>에 저장합니다.\n</li></ul>\n<p>다음으로 <code>plot()</code> 함수에 <code>sign.lambda = 1</code>을 지정해 교차검증 곡선(cross-validation curve)를 그립니다. 이 플롯의 X축 기본값이 \\\\(-\\log(\\lambda)\\\\)이기 때문에, 이 인수를 <code>1</code>로 지정해야 페널티가 강한 쪽이 오른쪽으로 유지됩니다.</p>\n<p>마지막으로 <code>\\\\(</code> 기호로 두 \\\\)\\lambda$를 꺼내 확인합니다.</p>\n<ul>\n<li><code>cv_lasso\\\\(lambda.min</code>: 교차검증 오차가 가장 작은 \\\\)\\lambda$입니다. 예측오차 자체를 최소화합니다.\n</li><li><code>cv_lasso\\\\(lambda.1se</code>: 최소 오차에서 표준오차 하나만큼 떨어진 범위 안에서 가장 큰 \\\\)\\lambda$입니다. 성능은 거의 같으면서 변수는 더 적게 남기는 선택입니다.\n</li></ul>",
          blanks: [
            { line: "cv_lasso <- _____(", answer: /cv_lasso<\-cv\.glmnet\(/ },
            { line: "alpha = _____,", answer: /alpha=1,/ },
            { line: "family = _____,", answer: /family="gaussian",/ },
            { line: "nfolds = _____,", answer: /nfolds=10,/ },
            { line: "type.measure = _____", answer: /type\.measure="mse"/ },
            { line: "cv_lasso$_____ # 교차검증 오차가 가장 작은 lambda", answer: /cv_lasso\$lambda\.min/ },
            { line: "cv_lasso$_____ # 최소 오차에서 표준오차 하나만큼 떨어진 범위 안에서 가장 큰 lambda", answer: /cv_lasso\$lambda\.1se/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 2-3. 예측과 평가",
          mode: "fill",
          checkId: "task2-3-eval",
          starter_path: "snippets/workflow/08-task2-3-eval.R",
          concept: "<p>문법이 약간 다르지만 Task 1-3와 동일한 함수를 사용하고 같은 순서로 예측값을 계산합니다. <code>predict()</code> 함수에 교차검증 결과와 테스트 데이터를 입력해 예측값을 계산해보겠습니다.</p>\n<ul>\n<li>첫 번째 인수로 <code>cv_lasso</code>에 저장된 교차검증 결과를 불러옵니다.\n</li><li><code>newx</code>에 테스트 데이터 행렬인 <code>x_test</code>를 할당합니다. <code>lm()</code>에서는 <code>newdata</code>에 데이터프레임을 넣었지만, <code>glmnet</code> 계열에서는 <code>newx</code>에 행렬을 지정합니다.\n</li><li><code>s</code>에 예측에 사용할 \\\\(\\lambda\\\\)를 지정합니다. <code>\"lambda.min\"</code>과 <code>\"lambda.1se\"</code> 두 경우를 각각 계산합니다.\n</li><li><code>predict()</code>는 한 열짜리 행렬을 반환하므로 <code>as.numeric()</code>으로 벡터로 변환합니다.\n</li><li>계산한 예측값을 각각 <code>pred_lasso_min</code>과 <code>pred_lasso_1se</code>에 저장합니다.\n</li></ul>\n<p>다음으로 실제값과 예측값의 차이를 RMSE로 계산해 <code>rmse_lasso_min</code>과 <code>rmse_lasso_1se</code>에 저장합니다.</p>\n<p>마지막으로 <code>cat()</code> 함수를 사용해 기준모형인 OLS의 RMSE와 나란히 출력합니다. 이 때 두 \\\\(\\lambda\\\\)에서 살아남은 변수의 개수도 함께 확인합니다. <code>coef()</code>에 <code>s</code>를 지정해 계수를 꺼내고, <code>!= 0</code>으로 0이 아닌 계수를 세되 절편은 세지 않도록 <code>1</code>을 뺍니다.</p>",
          blanks: [
            { line: "predict(_____, newx = _____, s = _____)", answer: /predict\(cv_lasso,newx=x_test,s="lambda\.min"\)/ },
            { line: "predict(cv_lasso, newx = x_test, s = _____)", answer: /predict\(cv_lasso,newx=x_test,s="lambda\.1se"\)/ },
            { line: "rmse_lasso_min <- _____(_____((y_test - _____)^2))", answer: /rmse_lasso_min<\-sqrt\(mean\(\(y_test\-pred_lasso_min\)\^2\)\)/ },
            { line: "rmse_lasso_1se <- _____(_____((y_test - _____)^2))", answer: /rmse_lasso_1se<\-sqrt\(mean\(\(y_test\-pred_lasso_1se\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 7. 계수 확인",
          mode: "fill",
          checkId: "task2-4-coef",
          starter_path: "snippets/workflow/09-task2-4-coef.R",
          concept: "<p><code>glmnet</code> 계열 결과는 계수를 보여주는 <code>summary()</code> 메서드를 제공하지 않습니다. <code>lm()</code>은 해가 하나뿐이라 계수, 표준오차, p값을 하나의 표로 정리할 수 있지만, <code>glmnet</code>은 \\\\(\\lambda\\\\)마다 다른 해를 100개 가까이 저장하고 있어 <code>coef(fit, s = ...)</code>로 어느 \\\\(\\lambda\\\\)의 해를 꺼낼지 지정해야 합니다. 표준오차와 p값도 통상적인 방식으로는 제공되지 않습니다.</p>\n<p>아래 실습에서는 <code>coef()</code> 함수를 사용하여 학습된 <code>glmnet()</code> 결과에서 계수를 확인해보겠습니다.</p>\n<ul>\n<li>첫 번째 인수로 <code>cv_lasso</code>에 저장된 교차검증 결과를 불러옵니다.\n</li><li><code>s = \"lambda.1se\"</code>로 어느 \\\\(\\lambda\\\\)에서의 계수를 꺼낼지 지정합니다. <code>s = \"lambda.min\"</code>으로 바꾸면 다른 해를 확인할 수 있습니다.\n</li><li>꺼낸 계수를 <code>lasso_coef</code>에 저장합니다.\n</li></ul>\n<p><code>coef()</code>가 반환하는 것은 데이터프레임이 아니라 행렬이므로, 다루기 쉽도록 <code>tibble()</code>로 정리해 <code>lasso_coef_df</code>에 저장합니다.</p>\n<ul>\n<li><code>term</code>: 변수 이름. <code>rownames()</code> 함수로 <code>lasso_coef</code>의 행 이름을 가져옵니다.\n</li><li><code>estimate</code>: 계수 추정값. <code>as.numeric()</code> 함수로 벡터로 변환합니다.\n</li></ul>\n<p>계수의 크기는 예측변수의 척도에 따라 달라집니다. 그러므로 계수에 해당 변수의 표준편차를 곱한 표준화 계수를 함께 계산합니다. 이 값은 예측변수가 1 표준편차만큼 변화할 때 예측값이 얼마나 달라지는지를 나타냅니다. 이를 위해 <code>apply()</code> 함수를 사용해 훈련 데이터 행렬의 열별 표준편차를 계산하고 <code>sd_x</code>에 저장합니다.</p>\n<ul>\n<li>첫 번째 인수에 <code>x_train</code>을 할당합니다.\n</li><li>두 번째 인수 <code>2</code>는 계산 방향을 지정합니다. <code>1</code>이면 행, <code>2</code>면 열 단위로 계산합니다.\n</li><li>세 번째 인수 <code>sd</code>는 각 열에 적용할 함수입니다.\n</li></ul>\n<p>마지막으로 계수표를 정리해 출력합니다.</p>\n<ul>\n<li><code>filter()</code>로 절편을 제외하고, 계수가 <code>0</code>이 아닌 변수만 남깁니다. 표에 나타나지 않는 변수는 Lasso가 모형에서 제외한 변수입니다.\n</li><li><code>mutate()</code>로 계수에 해당 변수의 표준편차를 곱해 <code>std_estimate</code> 열을 만듭니다.\n</li><li><code>arrange()</code>로 표준화 계수의 절댓값이 큰 순서로 정렬합니다.\n</li></ul>",
          blanks: [
            { line: "lasso_coef <- coef(_____, s = _____)", answer: /lasso_coef<\-coef\(cv_lasso,s="lambda\.1se"\)/ },
            { line: "term = _____(lasso_coef),", answer: /term=rownames\(lasso_coef\),/ },
            { line: "estimate = _____(lasso_coef)", answer: /estimate=as\.numeric\(lasso_coef\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 1.3,
      title: "Part 3 (선택사항). Ridge로 한 번 더 교체",
      color: "#1D9E75",
      steps: [
        {
          title: "Task 8. 교차검증과 평가",
          mode: "fill",
          checkId: "task3-1-ridge",
          starter_path: "snippets/workflow/10-task3-1-ridge.R",
          concept: "<p>앞 절과 코드가 동일하고 <code>alpha</code>만 1에서 0으로 바뀝니다.</p>\n<ul>\n<li><code>set.seed()</code>로 난수를 고정한 뒤, <code>cv.glmnet()</code>에 <code>x_train</code>, <code>y_train</code>, <code>alpha = 0</code>, <code>family = \"gaussian\"</code>, <code>nfolds = 10</code>, <code>type.measure = \"mse\"</code>를 지정해 <code>cv_ridge</code>에 저장합니다.\n</li><li><code>predict()</code>에 <code>newx = x_test</code>와 <code>s</code>를 지정해 <code>pred_ridge_min</code>과 <code>pred_ridge_1se</code>를 계산합니다.\n</li><li>RMSE를 계산해 <code>rmse_ridge_min</code>과 <code>rmse_ridge_1se</code>에 저장하고, <code>cat()</code>으로 앞서 계산한 값들과 나란히 출력합니다.\n</li></ul>",
          blanks: [
            { line: "x = _____,", answer: /x=x_train,/ },
            { line: "y = _____,", answer: /y=y_train,/ },
            { line: "alpha = _____,", answer: /alpha=0,/ },
            { line: "family = _____,", answer: /family="gaussian",/ },
            { line: "nfolds = _____,", answer: /nfolds=10,/ },
            { line: "type.measure = _____", answer: /type\.measure="mse"/ },
            { line: "pred_ridge_min <- _____(", answer: /pred_ridge_min<\-as\.numeric\(/ },
            { line: "predict(_____, newx = _____, s = _____)", answer: /predict\(cv_ridge,newx=x_test,s="lambda\.min"\)/ },
            { line: "predict(_____, newx = _____, s = _____)", answer: /predict\(cv_ridge,newx=x_test,s="lambda\.1se"\)/ },
            { line: "rmse_ridge_min <- _____(_____((_____ - _____)^2))", answer: /rmse_ridge_min<\-sqrt\(mean\(\(y_test\-pred_ridge_min\)\^2\)\)/ },
            { line: "rmse_ridge_1se <- _____(_____((_____ - _____)^2))", answer: /rmse_ridge_1se<\-sqrt\(mean\(\(y_test\-pred_ridge_1se\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "예측 성능 비교",
          mode: "run",
          checkId: null,
          starter_path: "snippets/workflow/11-run.R",
          concept: "<p>아래 코드를 실행하세요. 지금까지 계산한 RMSE를 한 표로 모읍니다. 먼저 비교의 최저 기준으로 예측변수를 하나도 쓰지 않고 훈련 데이터의 평균만으로 예측했을 때의 <code>영모형</code> RMSE를 계산해 <code>rmse_null</code>에 저장합니다. 어떤 모형이든 이 값보다 나아야 의미가 있습니다.</p>\n<ul>\n<li><code>model</code>: 모형 이름\n</li><li><code>변수수</code>: 각 모형이 실제로 사용한 예측변수의 개수. Lasso는 <code>coef()</code>로 0이 아닌 계수를 세고, Ridge와 OLS는 전체 예측변수 개수를 그대로 넣습니다.\n</li><li><code>rmse</code>: 앞에서 저장해 둔 값들\n</li><li><code>개선율</code>: 기준모형인 OLS 대비 RMSE가 몇 퍼센트 줄었는지 계산합니다.\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
  ]
});
