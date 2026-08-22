// ============================================================
//  2강 실습 — 신경망
//  자동 생성 후 손으로 다듬는 파일입니다. 개념/힌트/성공 메시지는 여기서 수정하세요.
//  blanks[].answer 는 채점용 정규식(공백·주석 제거 후 비교)입니다.
// ============================================================

registerCourse({
  id: "nn",
  title: "2강. 신경망",
  subtitle: "순전파·역전파 직접 구현 · Keras",
  color: "#185FA5",
  tracker: "https://raw.githubusercontent.com/TheYongjinChoi/kapae2026-exercise/main/tracker_nn.R",   // null 이면 클라이언트 채점만 사용
  chapters: [
    {
      id: 2.0,
      title: "데이터 준비",
      color: "#185FA5",
      steps: [
        {
          title: "데이터 준비",
          mode: "run",
          checkId: null,
          starter_path: "snippets/nn/01-setup.R",
          concept: "<p>아래 데이터 및 변수 전처리 코드를 실행하세요. 마지막에 신경망에 필요한 두 가지를 추가합니다.</p>\n<ul>\n<li>설계행렬: 설계행렬: <code>keras</code>는 <code>y ~ x</code> 같은 공식을 이해하지 못하고 숫자 행렬만 받습니다. <code>model.matrix()</code>로 데이터프레임을 행렬로 변환하겠습니다. 이 과정에서 범주형 변수는 더미 변수로 바뀝니다. 다만 <code>model.matrix()</code>는 회귀모형용 함수라 1로만 채워진 절편 열을 자동으로 붙이는데, 이 열은 불필요하므로 제거합니다.\n</li><li>표준화: 앞서 <code>lm()</code>과 <code>glmnet()</code>에서는 변수를 원래 단위 그대로 넣었습니다. <code>lm()</code>은 변수 척도에 영향을 받지 않고, <code>glmnet()</code>은 내부에서 알아서 표준화를 해줍니다. 반면 신경망은 입력 척도에 민감해서 단위가 제각각이면 학습이 느려지거나 불안정해집니다. 그래서 이번에는 표준화를 사전에 해 주겠습니다.\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "영모형 RMSE 계산",
          mode: "run",
          checkId: null,
          starter_path: "snippets/nn/02-setup.R",
          concept: "<p>비교의 최저 기준으로 훈련 데이터의 평균만으로 예측한 영모형의 RMSE를 계산해 둡니다.</p>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 2.1,
      title: "Part 1. 선형회귀에 은닉층 넣어보기",
      color: "#185FA5",
      steps: [
        {
          title: "Task 1. 항등 활성화 은닉층 학습시키기",
          mode: "fill",
          checkId: "nn-01-identity",
          starter_path: "snippets/nn/03-nn-01-identity.R",
          concept: "<p>항등 활성화 함수를 이용해 수동으로 순전파와 역전파 알고리즘을 구현해 보겠습니다. 다음과 같은 단계로 구현이 됩니다.</p>\n<ol>\n<li>순전파: 현재 가중치로 예측값을 계산합니다.\n</li><li>역전파: 손실을 각 가중치로 미분해 기울기를 구합니다.\n</li><li>갱신: 기울기의 반대 방향으로 가중치를 조금 이동시킵니다.\n</li></ol>\n<p>아래 코드의 빈칸(<code>_____</code>)을 채워 완성하십시오. 주석에 각 줄이 무엇을 하는지 적혀 있으니 읽으면서 완성하시기 바랍니다.</p>\n<p><strong>초기화</strong></p>\n<ul>\n<li><code>W1</code>: 정규분포에서 무작위로 뽑는 함수 이름과, 필요한 값의 개수를 채웁니다. 예측변수마다 유닛마다 하나씩 필요하므로 <code>p × 은닉층 유닛 수</code>만큼입니다.\n</li><li><code>b1</code>: 0을 몇 번 반복할지 채웁니다. 은닉층 유닛 하나에 편향 하나입니다.\n</li><li><code>w2</code>: 몇 개를 뽑을지 채웁니다. 은닉층 유닛 5개를 받아 합치므로 유닛 수만큼입니다.\n</li></ul>\n<p><strong>반복문</strong></p>\n<ul>\n<li><code>for</code>: 몇 번 반복할지 채웁니다. 위에서 정의해 둔 객체 이름입니다.\n</li></ul>\n<p><strong>순전파</strong></p>\n<ul>\n<li><code>Z</code>: <code>x_train</code>과 행렬곱할 가중치 객체를 채웁니다. 입력에서 은닉층으로 가는 쪽입니다.\n</li><li><code>H</code>: 활성화 함수를 통과한 결과를 채웁니다. 여기서는 항등함수이므로 통과 전과 같습니다.\n</li><li><code>loss_history[iter]</code>: 실제값과 비교할 예측값 객체를 채웁니다.\n</li></ul>\n<p><strong>역전파</strong></p>\n<ul>\n<li><code>dpred</code>: 예측값에서 빼야 할 실제값 객체를 채웁니다. 훈련 데이터의 결과변수입니다.\n</li><li><code>grad_w2</code>: <code>t(H)</code>와 행렬곱할 객체를 채웁니다. 바로 위에서 계산한 값입니다.\n</li><li><code>dZ</code>: 항등함수는 도함수가 1이므로, 은닉층으로 전달된 값을 그대로 받습니다. 그 객체 이름을 채웁니다.\n</li><li><code>grad_W1</code>: 전치해서 <code>dZ</code>와 곱할 객체를 채웁니다. <code>W1</code>에 곱해지던 값입니다.\n</li></ul>\n<p><strong>갱신</strong></p>\n<ul>\n<li><code>W1</code>, <code>b2</code>: 각 파라미터에 대응하는 기울기 객체를 채웁니다. 이름이 짝을 이룹니다.\n</li></ul>",
          blanks: [
            { line: "W1 <- matrix(_____(p * _____, sd = 0.1), nrow = p)", answer: /W1<\-matrix\(rnorm\(p\*n_hidden,sd=0\.1\),nrow=p\)/ },
            { line: "b1 <- rep(0, _____)", answer: /b1<\-rep\(0,n_hidden\)/ },
            { line: "w2 <- rnorm(_____, sd = 0.1)", answer: /w2<\-rnorm\(n_hidden,sd=0\.1\)/ },
            { line: "for (iter in 1:_____) {   # 1부터 위에서 정의한 n_iter까지 반복합니다", answer: /for\(iterin1:n_iter\)\{/ },
            { line: "Z    <- x_train %*% _____ + rep(b1, each = n)", answer: /Z<\-x_train%\*%W1\+rep\(b1,each=n\)/ },
            { line: "H    <- _____", answer: /H<\-Z/ },
            { line: "loss_history[iter] <- mean((y_train - _____)^2)", answer: /loss_history\[iter\]<\-mean\(\(y_train\-pred\)\^2\)/ },
            { line: "dpred   <- 2 * (pred - _____) / n", answer: /dpred<\-2\*\(pred\-y_train\)\/n/ },
            { line: "grad_w2 <- as.vector(t(H) %*% _____)", answer: /grad_w2<\-as\.vector\(t\(H\)%\*%dpred\)/ },
            { line: "dZ <- _____", answer: /dZ<\-dH/ },
            { line: "grad_W1 <- t(_____) %*% dZ   # W1의 기울기: W1에 곱해지던 값이 x_train이므로 곱합니다.", answer: /grad_W1<\-t\(x_train\)%\*%dZ/ },
            { line: "W1 <- W1 - lr * _____", answer: /W1<\-W1\-lr\*grad_W1/ },
            { line: "b2 <- b2 - lr * _____", answer: /b2<\-b2\-lr\*grad_b2/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 2. ReLU로 바꾸기",
          mode: "fill",
          checkId: "nn-02-relu",
          starter_path: "snippets/nn/04-nn-02-relu.R",
          concept: "<p>Task 2의 코드에서 활성화 함수만 아래의 ReLU로 바꿔 보겠습니다. 나머지는 그대로입니다. ReLU는 입력이 0보다 크면 그 값을 그대로 내보내고, 0 이하이면 0을 내보냅니다.</p>\n<p>\\\\[ \\text{ReLU}(z) = \\max(0, z), \\qquad \\text{ReLU}'(z) = \\begin{cases} 1 &amp; z &gt; 0 \\\\ 0 &amp; z \\le 0 \\end{cases} \\\\]</p>\n<p>빈칸을 찾아 다음 세 곳을 수정하세요. 우선 루프 안 순전파에서 <code>Z</code>를 그대로 내보내지 말고 <code>pmax(Z, 0)</code>으로 감싸 <code>H</code>에 저장합니다.</p>\n<p>그리고 역전파에서 <code>dZ &lt;- dH</code>를 <code>dH * (Z &gt; 0)</code>을 적용한 결과가 <code>dZ</code>에 저장되도록 바꿉니다. 순전파가 함수를 적용하는 자리라면 역전파는 그 도함수를 곱하는 자리입니다. 우리가 구하려는 것은 손실을 <code>Z</code>로 미분한 값인데, <code>Z</code>는 활성화 함수를 거쳐 <code>H</code>가 된 뒤에야 예측에 반영되므로 연쇄법칙에 따라</p>\n<p>\\\\[\\frac{\\partial L}{\\partial Z} = \\frac{\\partial L}{\\partial H} \\times \\text{ReLU}'(Z)\\\\]</p>\n<p>가 됩니다. <code>(Z &gt; 0)</code>은 논리형 행렬을 반환하는데, <code>Z</code>의 값이 0보다 큰 경우 1, 그 외는 0으로 곱해집니다. 따라서 순전파에서 <code>Z</code>가 0 이하라 값이 활성화 함수를 통과하지 못한 유닛은 갱신 신호도 0이 되도록 하는 장치입니다.</p>\n<p>코드 완성 후 테스트 손실을 계산해 Task 2의 결과와 비교합니다.</p>",
          blanks: [
            { line: "H    <- _____(_____, 0)", answer: /H<\-pmax\(Z,0\)/ },
            { line: "dZ <- _____ * (_____ > 0)", answer: /dZ<\-dH\*\(Z>0\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 2.2,
      title: "Part 2. Keras로 구현하기",
      color: "#185FA5",
      steps: [
        {
          title: "Keras 준비",
          mode: "run",
          checkId: null,
          starter_path: "snippets/nn/05-run.R",
          concept: "<p>이번에는 Keras 활용해서 뉴럴 네트워크를 구현해 보겠습니다. Keras는 아래의 세 함수를 차례로 호출하는 방식으로 알고리즘을 구현합니다.</p>\n<p>| 함수 | 인수 | |:---|:---| | <code>keras_model_sequential()</code> | 층 수, 노드 수, 활성화 함수, 드롭아웃, 규제 | | <code>compile()</code> | 손실함수, 옵티마이저, 학습률, 평가지표 | | <code>fit()</code> | 배치 크기, 에폭 수, 검증 분할, 콜백 |</p>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 3. 1단계 구조 정의",
          mode: "fill",
          checkId: "nn-03-architecture",
          starter_path: "snippets/nn/06-nn-03-architecture.R",
          concept: "<ul>\n<li><code>keras_model_sequential()</code>에 <code>input_shape = ncol(x_train)</code>으로 입력변수 개수를 지정합니다.\n<ul>\n<li><code>layer_dense()</code>를 파이프로 이어 붙이면 층이 하나씩 추가됩니다. <code>units = 8</code>, <code>activation = \"relu\"</code>로 Part 2와 같은 은닉층을 만듭니다.\n</li><li>출력층은 <code>units = 1</code>입니다. 결과변수가 연속형이므로 <code>activation</code>을 지정하지 않습니다. 지정하지 않으면 항등함수가 됩니다.\n</li><li>완성된 모델을 <code>model</code>에 저장하고 <code>summary()</code>로 층별 파라미터 개수를 확인합니다.\n</li></ul>\n</li></ul>",
          blanks: [
            { line: "model <- _____(input_shape = ncol(_____)) |>", answer: /model<\-keras_model_sequential\(input_shape=ncol\(x_train\)\)\|>/ },
            { line: "layer_dense(units = _____, activation = _____) |>", answer: /layer_dense\(units=8,activation="relu"\)\|>/ },
            { line: "layer_dense(units = _____)", answer: /layer_dense\(units=1\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 4. 2단계 학습 방식 설정",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/nn/07-task4.R",
          concept: "<p><code>compile()</code> 함수로 학습 방식을 설정합니다.</p>\n<ul>\n<li><code>loss</code>: 무엇을 줄일지 정합니다. <code>\"mse\"</code>를 지정하면 Part 1에서 직접 계산하던 <code>mean((y_train - pred)^2)</code>와 같은 평균제곱오차가 됩니다.\n</li><li><code>optimizer</code>: 어떻게 줄일지 정합니다. <code>optimizer_adam()</code>을 지정합니다. Part 1에서는 기울기에 학습률을 곱해 그대로 빼는 순수한 경사하강법을 썼지만, Adam은 파라미터마다 최근 기울기를 반영해 보폭을 조절합니다.\n</li><li><code>learning_rate</code>: 한 번에 움직일 폭입니다. Part 1의 <code>lr</code>에 해당하며 여기서도 <code>0.01</code>로 지정합니다.\n</li><li><code>metrics</code>: 학습에는 쓰이지 않고 기록만 남는 지표입니다. <code>metric_root_mean_squared_error()</code>를 지정하면 손실의 제곱근이 함께 기록되어, 뒤에서 모형을 비교할 때 쓰는 RMSE와 같은 단위로 학습 과정을 볼 수 있습니다.\n</li></ul>",
          blanks: [
            { line: "model |> _____(", answer: /model\|>compile\(/ },
            { line: "loss = _____,", answer: /loss="mse",/ },
            { line: "optimizer = optimizer_adam(learning_rate = _____),", answer: /optimizer=optimizer_adam\(learning_rate=0\.01\),/ },
            { line: "metrics = _____()", answer: /metrics=metric_root_mean_squared_error\(\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 5. 3단계 학습 실행과 학습곡선",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/nn/08-task5.R",
          concept: "<p><code>fit()</code> 함수로 학습을 실행합니다.</p>\n<ul>\n<li><code>x</code>, <code>y</code>: 학습에 사용할 입력과 결과입니다. <code>x_train</code>과 <code>y_train</code>을 지정합니다. <code>keras</code>는 공식을 받지 않으므로 표준화해 둔 행렬을 그대로 넘깁니다.\n</li><li><code>epochs</code>: 훈련 데이터 전체를 몇 번 통과할지 정합니다. Part 1의 <code>n_iter</code>에 해당하며 여기에서는 <code>200</code>으로 지정합니다.\n</li><li><code>batch_size</code>: 가중치를 한 번 갱신할 때 사용할 관측치 수입니다. <code>64</code>로 지정합니다. Part 1에서는 매번 전체 관측치로 기울기를 계산했지만, 여기서는 64개씩 나눠 보면서 한 epoch 안에서 여러 번 갱신합니다.\n</li><li><code>validation_split</code>: 훈련 데이터에서 검증용으로 떼어 낼 비율입니다. <code>0.2</code>를 지정해 20%를 떼어 냅니다. 이 몫은 가중치 갱신에 쓰이지 않으므로 학습 도중 처음 보는 관측치에서의 성능을 가늠할 수 있습니다. 훈련 데이터 안에서 할당하는 것이므로 테스트 데이터와 혼동하지 마세요.\n</li><li><code>verbose</code>: 진행 상황 출력 여부입니다. <code>0</code>을 지정해 끕니다.\n</li></ul>\n<p>학습 기록은 <code>history</code>에 저장합니다. <code>history\\\\(metrics\\\\)loss</code>에는 epoch마다 계산된 훈련 손실이, <code>$val_loss</code>에는 검증 손실이 벡터로 담기며, 이 둘로 학습곡선 두 개를 그립니다.</p>",
          blanks: [
            { line: "history <- model |> _____(", answer: /history<\-model\|>fit\(/ },
            { line: "x = _____,", answer: /x=x_train,/ },
            { line: "y = _____,", answer: /y=y_train,/ },
            { line: "epochs = _____,", answer: /epochs=60,/ },
            { line: "validation_split = _____,", answer: /validation_split=0\.2,/ },
            { line: "loss  = c(history$metrics$_____, history$metrics$_____),", answer: /loss=c\(history\$metrics\$loss,history\$metrics\$val_loss\),/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 6. 예측과 평가",
          mode: "fill",
          checkId: "nn-06-predict",
          starter_path: "snippets/nn/09-nn-06-predict.R",
          concept: "<p><code>predict()</code> 함수로 테스트 데이터의 예측값을 계산하고 RMSE로 성능을 비교합니다.</p>\n<ul>\n<li><code>predict()</code>: 학습된 모델과 <code>x_test</code>를 넣습니다. <code>verbose = 0</code>으로 진행 출력을 끕니다. 반환값이 행렬이므로 <code>as.numeric()</code>으로 벡터로 바꿔 <code>pred_keras</code>에 저장합니다.\n</li><li><code>rmse_keras</code>: 테스트 RMSE를 계산해 저장합니다. Task 5의 학습곡선은 훈련 데이터 안에서 계산한 값이었고, 여기서 처음으로 테스트 데이터를 씁니다.\n</li><li><code>pred_lm</code>, <code>rmse_lm</code>: 비교를 위해 Part 1에서 적합해 둔 <code>lm_fit</code>의 테스트 예측값과 RMSE도 계산합니다. <code>lm_fit</code>은 데이터프레임을 받으므로 <code>x_test</code>를 <code>data.frame()</code>으로 바꿔 넘깁니다.\n</li><li>영모형의 <code>rmse_null</code>까지 세 값을 나란히 출력합니다.\n</li></ul>",
          blanks: [
            { line: "pred_keras <- _____(predict(_____, x_test, verbose = 0))", answer: null },
            { line: "rmse_keras <- _____(_____((y_test - _____)^2))", answer: /rmse_keras<\-sqrt\(mean\(\(y_test\-pred_keras\)\^2\)\)/ },
            { line: "pred_lm <- predict(_____, newdata = _____)", answer: /pred_lm<\-predict\(lm_fit,newdata=test_df\)/ },
            { line: "rmse_lm <- sqrt(mean((y_test - _____)^2))", answer: /rmse_lm<\-sqrt\(mean\(\(y_test\-pred_lm\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 2.3,
      title: "Part 3. (선택사항) 하이퍼파라미터 조정",
      color: "#185FA5",
      steps: [
        {
          title: "기준 검증 RMSE 확인",
          mode: "run",
          checkId: null,
          starter_path: "snippets/nn/10-run.R",
          concept: "<p>Task 6에서 세 값을 나란히 놓았을 때 Keras 모형의 성능이 선형회귀의 성능보다 높지 않았습니다. 은닉층을 얹었는데도 성능이 따라오지 않은 것인데, 여기에는 두 가지 가능성이 있습니다. 예측변수와 결과변수의 관계가 대체로 선형이라 은닉층이 잡아낼 것이 애초에 많지 않았을 수 있고, 아니면 구조는 충분한데 학습 설정이 맞지 않아 모형이 가진 표현력을 다 쓰지 못했을 수 있습니다. Task 3에서 5까지는 단순한 신경망 모델로 노드 8개, 학습률 0.01, 규제 없음으로 고정해두고 훈련을 시켰습니다. Part 3에서는 이 값들을 하나씩 바꿔 가며 검증 손실이 어떻게 반응하는지 보고, 기본 설정에서 얼마나 나아질 수 있는지 확인합니다.</p>\n<p>같은 구조를 반복해서 만들어야 하므로 모형 정의를 함수로 감싸두겠습니다. 아래 코드에서 정의된 <code>build_model()</code>은 Task 3에서 5까지 세 단계로 나눠 실행하던 구조 정의와 컴파일을 함수 하나로 묶은 것입니다. 층을 쌓고 <code>compile()</code>까지 마친 모형을 반환하므로 호출을 하면 학습만 남은 모형이 나옵니다.</p>\n<p>바뀐 점은 값을 코드에 직접 쓰지 않고 인수로 빼냈다는 것입니다. <code>units</code>, <code>lr</code>, <code>dropout</code>, <code>l2</code> 네 개가 조정 대상이고, 함수 정의의 <code>= 8</code>, <code>= 0.01</code> 같은 부분은 아무것도 넘기지 않았을 때 쓰이는 기본값입니다. 예를 들어, <code>build_model()</code>이라고만 쓰면 Task 5와 같은 모형이 나오고, <code>build_model(units = 128)</code>이라고 쓰면 노드 수만 바뀐 모형이 나옵니다. 반복문 안에서 값만 갈아 끼우며 여러 모형을 만들 수 있도록 정의해둔 것입니다.</p>\n<p><code>layer_dropout()</code>과 <code>regularizer_l2()</code>는 Part 3에서 새로 등장합니다. 지금은 두 인수의 기본값이 모두 <code>0</code>이라 아무 효과가 없습니다. <code>regularizer_l2(0)</code>은 벌점을 걸지 않는 것과 같고, <code>layer_dropout(rate = 0)</code>은 노드를 하나도 끄지 않으므로 층이 있어도 통과만 시킵니다. Task 9에 가서 이 값들에 <code>0</code>이 아닌 수를 넘기면 그때부터 작동합니다. 미리 자리를 만들어 두었다고 보시면 됩니다.</p>\n<p>조정할 항목이 더 생기면 같은 방식으로 인수를 하나 추가하고 기본값을 지금과 같은 동작이 되도록 두면 됩니다. 예를 들어 은닉층을 하나 더 넣고 싶다면 <code>units2 = 0</code>을 인수로 받아 <code>0</code>이 아닐 때만 층을 추가하도록 쓰면, 앞서 작성한 코드는 그대로 두고 새 실험만 얹을 수 있습니다.</p>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 7. 학습률",
          mode: "fill",
          checkId: "nn-07-lr",
          starter_path: "snippets/nn/11-nn-07-lr.R",
          concept: "<p>학습률은 한 번에 움직일 폭입니다. 폭이 지나치게 좁으면 정해진 epoch 안에 충분히 내려가지 못하고, 지나치게 넓으면 최소 지점을 넘나들며 손실이 오르내립니다. 세 값을 시도해 각각 어떤 증상이 나타나는지 봅니다.</p>\n<ul>\n<li><code>lrs</code>: 시도할 학습률 세 개를 벡터로 만들어 저장합니다. <code>0.0005</code>, <code>0.01</code>, <code>0.3</code>을 씁니다. 기본값인 <code>0.01</code>을 가운데 두고 양쪽으로 크게 벌린 값입니다.\n</li><li><code>set_random_seed()</code>: 반복문 안에서 매번 <code>42</code>로 호출합니다. 초기 가중치를 같게 맞춰야 세 결과의 차이를 학습률 때문이라고 말할 수 있습니다.\n</li><li><code>build_model()</code>: <code>lr</code> 인수에 현재 학습률을 넘깁니다. 나머지 인수는 기본값을 그대로 씁니다.\n</li><li><code>fit()</code>: <code>epochs = 40</code>, <code>batch_size = 64</code>, <code>validation_split = 0.2</code>로 학습합니다.\n</li><li><code>curves_lr</code>: 세 번의 학습곡선을 담을 리스트입니다. 반복마다 훈련 손실과 검증 손실을 세로로 쌓은 데이터프레임을 만들어 넣습니다.\n</li><li><code>rmse_val_lr</code>: 설정마다 검증 손실의 최솟값에 제곱근을 취해 저장합니다. 학습 도중 가장 좋았던 지점의 RMSE입니다.\n</li></ul>",
          blanks: [
            { line: "lrs <- c(_____, _____, _____)", answer: /lrs<\-c\(0\.0005,0\.01,0\.3\)/ },
            { line: "set_random_seed(_____)", answer: /set_random_seed\(42\)/ },
            { line: "m <- build_model(lr = _____)", answer: /m<\-build_model\(lr=lrs\[j\]\)/ },
            { line: "h <- m |> fit(x_train, y_train, epochs = _____, batch_size = 64,", answer: /h<\-m\|>fit\(x_train,y_train,epochs=40,batch_size=64,/ },
            { line: "rmse_val_lr[j] <- _____(_____(h$metrics$val_loss))", answer: /rmse_val_lr\[j\]<\-sqrt\(min\(h\$metrics\$val_loss\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 8. 노드 수",
          mode: "fill",
          checkId: "nn-08-units",
          starter_path: "snippets/nn/12-nn-08-units.R",
          concept: "<p>학습률을 <code>0.01</code>로 고정하고 은닉층 노드 수만 바꿉니다. 한 번에 한 축씩 움직여야 어느 값이 결과를 바꾼 것인지 말할 수 있습니다.</p>\n<ul>\n<li><code>units_list</code>: 시도할 노드 수 세 개를 벡터로 만듭니다. <code>2</code>, <code>8</code>, <code>128</code>을 씁니다. 기본값 8을 가운데 두고 양쪽으로 벌린 값입니다.\n</li><li><code>build_model()</code>: <code>units</code>에 현재 노드 수를, <code>lr</code>에 <code>0.01</code>을 넘깁니다.\n</li><li><code>fit()</code>: <code>epochs = 60</code>으로 늘립니다. 노드가 많은 모형은 수렴에 더 걸립니다.\n</li><li><code>curves_u</code>, <code>rmse_val_u</code>: Task 7과 같은 방식으로 학습곡선과 검증 RMSE를 저장합니다.\n</li></ul>",
          blanks: [
            { line: "units_list <- c(_____, _____, _____)", answer: /units_list<\-c\(2,8,128\)/ },
            { line: "m <- build_model(units = _____, lr = _____)", answer: /m<\-build_model\(units=units_list\[j\],lr=0\.01\)/ },
            { line: "h <- m |> fit(x_train, y_train, epochs = _____, batch_size = 64,", answer: /h<\-m\|>fit\(x_train,y_train,epochs=60,batch_size=64,/ },
            { line: "rmse_val_u[j] <- sqrt(min(h$metrics$_____))", answer: /rmse_val_u\[j\]<\-sqrt\(min\(h\$metrics\$val_loss\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 9. 규제",
          mode: "fill",
          checkId: "nn-09-reg",
          starter_path: "snippets/nn/13-nn-09-reg.R",
          concept: "<p>Task 8의 <code>units = 128</code>에서 나타난 과적합에 세 처방을 비교합니다. 용량을 줄이는 대신 큰 모형을 그대로 두고 학습 과정에 제약을 거는 방식입니다.</p>\n<ul>\n<li>조기 종료: <code>callback_early_stopping()</code>으로 검증 손실이 개선되지 않으면 학습을 중단합니다. <code>patience = 8</code>은 여덟 epoch 동안 나아지지 않으면 멈춘다는 뜻이고, <code>restore_best_weights = TRUE</code>를 넣으면 가장 좋았던 시점의 가중치로 되돌아가므로 epoch 수를 조정 대상에서 뺄 수 있습니다.\n</li><li>드롭아웃: 매 갱신마다 노드의 일부를 무작위로 끕니다. 특정 노드에 의존하지 못하게 만드는 장치이고, 예측 시점에는 자동으로 꺼집니다. <code>build_model()</code>의 <code>dropout</code> 인수로 비율을 넘깁니다.\n</li><li>가중치 규제: 릿지와 같은 형태의 벌점을 가중치에 겁니다. 앞 세션의 \\\\(\\lambda\\\\)가 <code>l2</code> 인수로 다시 등장합니다.\n</li></ul>\n<p>세 설정을 <code>settings</code> 리스트에 담고 반복문으로 돌립니다.</p>\n<ul>\n<li><code>cb_es</code>: 조기 종료 콜백을 만들어 저장합니다. 세 설정에 모두 적용합니다.\n</li><li><code>settings</code>: <code>label</code>, <code>dropout</code>, <code>l2</code>를 담은 리스트 세 개입니다. 규제 없음, 드롭아웃 <code>0.3</code>, L2 <code>0.01</code> 순입니다.\n</li><li><code>build_model()</code>: <code>units = 128</code>, <code>lr = 0.01</code>로 고정하고 <code>dropout</code>과 <code>l2</code>만 설정마다 바꿉니다.\n</li><li><code>fit()</code>: <code>epochs = 100</code>으로 넉넉히 두고 <code>callbacks = list(cb_es)</code>를 넘깁니다. 조기 종료가 있으므로 100회를 다 돌지 않고 멈춥니다.\n</li></ul>",
          blanks: [
            { line: "cb_es <- callback_early_stopping(monitor = \"val_loss\", patience = _____,", answer: /cb_es<\-callback_early_stopping\(monitor="val_loss",patience=8,/ },
            { line: "restore_best_weights = _____)", answer: /restore_best_weights=TRUE\)/ },
            { line: "list(label = \"Dropout 0.3\",       dropout = _____, l2 = 0),", answer: /list\(label="Dropout0\.3",dropout=0\.3,l2=0\),/ },
            { line: "list(label = \"L2 0.01\",           dropout = 0,   l2 = _____)", answer: /list\(label="L20\.01",dropout=0,l2=0\.01\)/ },
            { line: "m <- build_model(units = _____, lr = 0.01,", answer: /m<\-build_model\(units=128,lr=0\.01,/ },
            { line: "dropout = s$_____, l2 = s$_____)", answer: /dropout=s\$dropout,l2=s\$l2\)/ },
            { line: "validation_split = 0.2, callbacks = list(_____), verbose = 0)", answer: /validation_split=0\.2,callbacks=list\(cb_es\),verbose=0\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 2.4,
      title: "Part 4. (선택사항) 그리드서치",
      color: "#185FA5",
      steps: [
        {
          title: "Task 10. 격자 만들기와 교차검증",
          mode: "fill",
          checkId: "nn-10-grid",
          starter_path: "snippets/nn/14-nn-10-grid.R",
          concept: "<ul>\n<li><code>grid</code>: <code>expand.grid()</code>로 노드 수, 학습률, 드롭아웃의 모든 조합을 만듭니다. <code>units</code>는 <code>8</code>과 <code>64</code>, <code>lr</code>은 <code>0.005</code>와 <code>0.02</code>, <code>dropout</code>은 <code>0</code>과 <code>0.3</code>입니다.\n<ul>\n<li><code>K</code>, <code>fold</code>: 겹의 수를 <code>3</code>으로 두고, 훈련 데이터의 각 행에 1부터 3까지의 번호를 무작위로 배정합니다. <code>rep(1:K, length.out = nrow(x_train))</code>으로 번호를 만든 뒤 <code>sample()</code>로 섞습니다.\n</li><li><code>run_one()</code>: 조합 하나를 받아 3겹 교차검증을 수행하고 평균 RMSE를 반환하는 함수입니다. 겹마다 두 겹으로 학습하고 남은 한 겹으로 평가합니다.\n</li><li><code>evaluate()</code>: 학습된 모형과 평가용 데이터를 넣으면 손실을 반환합니다. <code>loss</code>가 MSE이므로 제곱근을 취하면 RMSE입니다.\n</li><li><code>results</code>: <code>cv_rmse</code> 오름차순으로 정렬한 결과입니다.\n</li></ul>\n</li></ul>\n<p>Part 3의 <code>validation_split</code>이 훈련 데이터의 일부를 한 번 떼어 고정해 두는 방식이었다면, 여기서는 겹을 바꿔 가며 모든 관측치가 한 번씩 평가에 쓰입니다. 검증이 훈련 데이터 안에서만 이루어진다는 점은 같습니다.</p>\n<p>### 실행 시간</p>\n<p>8조합 × 3겹 = 24회 학습이므로 몇 분 걸립니다. 시간이 부족하면 <code>dropout</code>을 <code>0</code> 하나로 고정해 4조합으로 줄이세요.</p>",
          blanks: [
            { line: "grid <- _____(", answer: /grid<\-expand\.grid\(/ },
            { line: "units   = c(_____, _____),", answer: /units=c\(8,64\),/ },
            { line: "K <- _____", answer: /K<\-3/ },
            { line: "m <- build_model(units = grid$units[i], lr = grid$_____[i],", answer: /m<\-build_model\(units=grid\$units\[i\],lr=grid\$lr\[i\],/ },
            { line: "validation_data = list(_____, _____),", answer: /validation_data=list\(xb,yb\),/ },
            { line: "scores[k] <- _____(as.numeric(evaluate(m, xb, yb, verbose = 0)[\"loss\"]))", answer: /scores\[k\]<\-sqrt\(as\.numeric\(evaluate\(m,xb,yb,verbose=0\)\["loss"\]\)\)/ },
            { line: "results <- grid |> arrange(_____) |> mutate(cv_rmse = round(cv_rmse, 4))", answer: /results<\-grid\|>arrange\(cv_rmse\)\|>mutate\(cv_rmse=round\(cv_rmse,4\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 11. 최종 평가",
          mode: "run",
          checkId: null,
          starter_path: "snippets/nn/15-task11.R",
          concept: "<p>이제 최적 조합으로 훈련 데이터 전체를 학습하고 테스트 데이터로 한 번만 평가합니다. 아래 코드를 실행해 네 모형을 나란히 봅니다. 점선은 선형회귀의 테스트 RMSE입니다.</p>\n<ul>\n<li><code>best</code>: <code>results</code>의 첫 행입니다. 정렬해 두었으므로 <code>cv_rmse</code>가 가장 작은 조합입니다.\n</li><li><code>final_model</code>: <code>best</code>의 세 값을 <code>build_model()</code>에 넘겨 만듭니다.\n</li><li><code>fit()</code>: <code>epochs = 100</code>, <code>validation_split = 0.2</code>, 조기 종료 콜백을 함께 넘깁니다. Part 4의 교차검증은 설정을 고르는 데까지만 쓰였고, 최종 학습은 훈련 데이터 전체로 한 번 합니다.\n</li><li><code>pred_final</code>, <code>rmse_final</code>: 테스트 예측값과 RMSE입니다. 이 실습에서 테스트 데이터를 쓰는 것은 여기가 처음이자 마지막입니다.\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
  ]
});
