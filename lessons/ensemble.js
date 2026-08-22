// ============================================================
//  3강 실습 — 트리 기반 앙상블
//  자동 생성 후 손으로 다듬는 파일입니다. 개념/힌트/성공 메시지는 여기서 수정하세요.
//  blanks[].answer 는 채점용 정규식(공백·주석 제거 후 비교)입니다.
// ============================================================

registerCourse({
  id: "ensemble",
  title: "3강. 트리 기반 앙상블",
  subtitle: "의사결정트리 · 배깅 · 랜덤포레스트 · 부스팅",
  color: "#854F0B",
  tracker: null,   // null 이면 클라이언트 채점만 사용
  chapters: [
    {
      id: 3.0,
      title: "데이터 준비",
      color: "#854F0B",
      steps: [
        {
          title: "데이터 준비",
          mode: "run",
          checkId: null,
          starter_path: "snippets/ensemble/01-setup.R",
          concept: "<p>아래 코드를 실행하세요. 데이터를 불러오고 변수를 정리한 뒤 훈련 데이터와 테스트 데이터로 나눕니다.</p>\n<p>이번 실습에서는 아래 객체를 계속 사용합니다.</p>\n<ul>\n<li><code>train_data</code>, <code>test_data</code>: 결과변수를 포함한 데이터프레임\n</li><li><code>y_train</code>, <code>y_test</code>: 결과변수 벡터\n</li><li><code>x_train</code>, <code>x_test</code>: 예측변수 데이터프레임\n</li><li><code>form</code>: <code>rx_num ~ .</code> 공식\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 3.1,
      title: "Part 1. 의사결정 트리",
      color: "#854F0B",
      steps: [
        {
          title: "Task 1-1. 트리 적합과 시각화",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/02-task1-1.R",
          concept: "<p><code>rpart()</code> 함수를 사용해 훈련 데이터에 의사결정 트리를 적합합니다.</p>\n<ul>\n<li>첫 번째 인수인 공식에 <code>rx_num ~ .</code>을 설정합니다.\n</li><li><code>data</code>에 학습에 사용할 훈련 데이터인 <code>train_data</code>를 지정합니다.\n</li><li><code>method = \"anova\"</code>: 결과변수가 연속형일 때 지정합니다. 분할 기준으로 잔차제곱합을 사용합니다. 결과변수가 범주형이라면 <code>\"class\"</code>를 지정하고 불순도를 기준으로 나눕니다.\n</li><li>학습된 결과를 <code>tree_basic</code>에 저장합니다.\n</li><li>잎의 개수는 <code>sum(tree_basic\\\\(frame\\\\)var == \"&lt;leaf&gt;\")</code>로 확인합니다. <code>$frame</code>은 트리의 각 노드 정보를 담은 데이터프레임이고, <code>var</code> 열이 <code>\"&lt;leaf&gt;\"</code>인 행이 잎입니다.\n</li></ul>\n<p>이어서 <code>rpart.plot()</code> 함수로 트리를 시각화합니다.</p>\n<ul>\n<li>첫 번째 인수로 훈련된 모델인 <code>tree_basic</code>을 지정합니다.\n</li><li><code>type = 2</code>: 분할 조건을 노드 아래에 표시하는 옵션입니다.\n</li><li><code>extra = 101</code>: 각 노드의 관측치 수와 비율을 함께 표시하는 옵션입니다.\n</li><li><code>fallen.leaves = TRUE</code>: 잎을 같은 높이에 정렬해 구조를 읽기 쉽게 합니다.\n</li></ul>",
          blanks: [
            { line: "tree_basic <- _____(", answer: /tree_basic<\-rpart\(/ },
            { line: "data = _____,", answer: /data=train_data,/ },
            { line: "method = _____", answer: /method="anova"/ },
            { line: "_____(", answer: /rpart\.plot\(/ },
            { line: "_____,", answer: /tree_basic,/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 1-2. 예측과 평가",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/03-task1-2.R",
          concept: "<p><code>predict()</code> 함수에 학습된 모델과 테스트 데이터를 입력해 예측값을 계산합니다.</p>\n<ul>\n<li>첫 번째 인수로 <code>tree_basic</code>을 불러옵니다.\n</li><li><code>newdata</code>에 테스트 데이터를 지정합니다. <code>glmnet</code>과 달리 데이터프레임을 그대로 넣습니다.\n</li><li>계산한 예측값을 <code>pred_tree</code>에 저장합니다.\n</li></ul>\n<p>다음으로 실제값과 예측값의 차이를 RMSE로 계산해 <code>rmse_tree</code>에 저장합니다. 같은 방식으로 훈련 데이터에 대한 RMSE도 계산해 <code>rmse_tree_train</code>에 저장합니다. 훈련 RMSE와 테스트 RMSE를 나란히 보면 과적합 여부를 판단할 수 있습니다.</p>",
          blanks: [
            { line: "pred_tree       <- predict(_____, newdata = _____)", answer: /rmse_tree<\-sqrt\(mean\(\(y_test\-pred_tree\)\^2\)\)/ },
            { line: "pred_tree_train <- predict(tree_basic, newdata = _____)", answer: null },
            { line: "rmse_tree       <- _____(_____((y_test  - _____)^2))", answer: /rmse_tree<\-sqrt\(mean\(\(y_test\-pred_tree\)\^2\)\)/ },
            { line: "rmse_tree_train <- sqrt(mean((y_train - _____)^2))", answer: /rmse_tree_train<\-sqrt\(mean\(\(y_train\-pred_tree_train\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 1-3. (선택사항) 최대 트리와 가지치기",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/04-task1-3.R",
          concept: "<p>정지 규칙을 풀어 트리를 최대한 키운 뒤 교차검증으로 다시 줄여 봅니다. 하이퍼파라미터는 <code>rpart.control()</code> 안에서 설정하고 이를 <code>control</code>에 넘깁니다.</p>\n<ul>\n<li>복잡도 패널티 <code>cp</code>를 <code>0.0001</code>로 설정해 거의 0에 가깝게 낮춥니다. 이렇게 하면 오차를 조금이라도 줄이는 분할은 모두 허용됩니다.\n</li><li><code>minsplit</code>은 <code>10</code>으로 설정합니다. 노드에 관측치가 10개만 있어도 나눕니다.\n</li><li><code>xval</code>은 교차검증 겹의 수를 정하는 인수입니다. <code>10</code>으로 설정해 10겹 교차검증을 수행합니다.\n</li><li>결과를 <code>tree_full</code>에 저장합니다.\n</li></ul>\n<p>교차검증을 설정하면 그 결과가 <code>tree_full$cptable</code>에 저장됩니다. <code>cptable</code>은 <code>rpart</code>가 트리를 키우면서 남긴 기록으로, 행 하나가 트리 크기 하나에 대응하고 열은 다음과 같습니다.</p>\n<ul>\n<li><code>CP</code>: 복잡도 파라미터\n</li><li><code>nsplit</code>: 분할 횟수\n</li><li><code>rel error</code>: 훈련 데이터 오차\n</li><li><code>xerror</code>: 교차검증 오차\n</li><li><code>xstd</code>: 교차검증 오차의 표준오차\n</li></ul>\n<p>여기서 가지치기의 기준이 되는 것은 <code>xerror</code>입니다. 훈련 데이터로 계산하는 <code>rel error</code>는 트리가 커질수록 계속 줄어들지만, 교차검증으로 계산하는 <code>xerror</code>는 어느 지점에서 최소가 된 뒤 다시 커집니다. 그 반등 지점이 과적합이 시작되는 곳이므로, <code>cptable</code>에서 <code>xerror</code>가 가장 작은 행의 <code>CP</code> 값을 찾아 그 값으로 가지를 잘라 내겠습니다.</p>\n<ul>\n<li>벡터에서 최솟값의 위치를 반환하는 <code>which.min()</code>으로 <code>tree_full$cptable</code>에서 <code>xerror</code>가 최소인 행 번호를 찾습니다.\n</li><li>그 행의 <code>\"CP\"</code> 열 값을 꺼내 <code>best_cp</code>에 저장합니다.\n</li><li><code>prune()</code> 함수에 <code>tree_full</code>과 <code>cp = best_cp</code>를 넣어 가지치기를 수행하고, 결과를 <code>tree_pruned</code>에 저장합니다.\n</li></ul>",
          blanks: [
            { line: "tree_full <- _____(", answer: /tree_full<\-rpart\(/ },
            { line: "cp = _____,", answer: /cp=0\.0001,/ },
            { line: "minsplit = _____,", answer: /minsplit=10,/ },
            { line: "xval = _____", answer: /xval=10/ },
            { line: "best_cp <- _____$_____[", answer: /best_cp<\-tree_full\$cptable\[/ },
            { line: "_____(tree_full$cptable[, \"xerror\"]), \"CP\"", answer: /which\.min\(tree_full\$cptable\[,"xerror"\]\),"CP"/ },
            { line: "tree_pruned <- _____(tree_full, cp = _____)", answer: /tree_pruned<\-prune\(tree_full,cp=best_cp\)/ },
            { line: "pred_pruned <- _____(tree_pruned, newdata = test_data)", answer: /pred_pruned<\-predict\(tree_pruned,newdata=test_data\)/ },
            { line: "rmse_pruned <- _____(_____((_____ - _____)^2))", answer: /rmse_pruned<\-sqrt\(mean\(\(y_test\-pred_pruned\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 3.2,
      title: "Part 2. 배깅과 랜덤 포레스트",
      color: "#854F0B",
      steps: [
        {
          title: "Task 2-1. 배깅 직접 구현",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/05-task2-1.R",
          concept: "<p>여기서는 배깅의 원리를 이해하기 위해 패키지에 맡기지 않고 직접 구현합니다. 다음의 세 가지 단계를 차례로 실행해보겠습니다.</p>\n<ul>\n<li>훈련 데이터에서 부트스트랩 표본을 여러 개 뽑습니다(복원추출).\n</li><li>각 표본에 트리를 하나씩 적합합니다.\n</li><li>개별 트리의 예측을 평균 내어 최종 예측을 만듭니다.\n</li></ul>\n<p><strong>1단계. 부트스트랩 표본과 개별 트리 학습</strong></p>\n<p>먼저 부트스트랩 표본을 만들고 트리를 학습시킵니다. 이 과정은 <code>for</code> 루프로 반복합니다. <code>for</code> 루프는 같은 작업을 정해진 횟수만큼 반복하는 구문으로 <code>for (b in 1:n_bag) { ... }</code>라고 쓰면 중괄호 안의 코드가 <code>n_bag</code>번 실행되며 그때마다 변수 <code>b</code>에 1부터 <code>n_bag</code>까지의 값이 차례로 들어갑니다. 이 <code>b</code>를 인덱스로 써서 각 트리를 리스트의 서로 다른 칸에 저장합니다.</p>\n<ul>\n<li><code>30</code>회 반복해서 훈련. 반복할 횟수로 <code>30</code>을 지정하고, 이걸 n_bag에 저장.\n</li><li>매 회차마다 예측 결과를 저장하기 위해 <code>fits</code>에 빈 리스트를 저장해 둡니다.\n</li><li><code>sample()</code> 함수로 훈련 데이터의 행 번호를 무작위로 뽑아 <code>idx</code>에 저장합니다. 숫자를 뽑을 대상을 지정하는 첫 번째 인수에 <code>seq_len(nrow(train_data))</code>을 설정해 훈련데이터에서 가능한 모든 행 번호를 나열하고, 두 번째 인수에 뽑을 개수로 <code>nrow(train_data)</code>를 지정합니다. <code>replace = TRUE</code>로 복원추출해야 부트스트랩이 됩니다.\n</li><li><code>idx</code>에는 이번 회차에 뽑힌 행 번호가 담겨 있습니다. 이를 <code>train_data[idx, ]</code>처럼 행 인덱스로 넣어 회차별 부트스트랩 표본을 만들고 <code>boot</code>에 저장합니다.\n</li><li>각 회차에서 <code>rpart()</code>로 트리를 적합해 <code>fits[[b]]</code>에 저장합니다. <code>fits</code>의 <code>b</code>번째 자리에 훈련된 트리를 넣는다는 뜻이므로, 루프가 끝나면 <code>fits</code>에는 30개의 트리가 담기게 됩니다.\n<ul>\n<li>모형식은 앞에서 저장해 둔 수식 객체 <code>form</code>으로 설정하고, 데이터는 해당 회차의 부트스트랩 표본인 <code>boot</code>로 설정합니다.\n</li><li><code>rpart()</code>의 하이퍼파라미터를 정하는 <code>control</code> 인수는 아래와 같이 설정해 분산이 큰 복잡한 트리를 만듭니다. 복잡도 파라미터 <code>cp</code>는 0으로 두어 오차를 조금이라도 줄이는 분할이면 모두 허용하고, <code>minsplit</code>은 10으로 두어 관측치가 10개만 있는 노드도 더 나누도록 합니다. 두 값 모두 트리가 최대한 깊게 자라도록 푸는 설정입니다.\n</li></ul>\n</li></ul>\n<p><strong>2단계. 예측 합치기</strong></p>\n<p>다음으로 개별 트리의 예측을 하나로 합칩니다. 회귀 문제이므로 결합 방식은 단순 평균입니다.</p>\n<ul>\n<li><code>sapply(fits, predict, newdata = test_data)</code>로 모든 트리의 예측을 한 번에 계산해 <code>pred_mat</code>에 저장합니다. 결과는 테스트 관측치 수 × 트리 개수 크기의 행렬입니다.\n<ul>\n<li><code>sapply()</code>는 리스트의 각 요소에 같은 함수를 적용한 뒤 결과를 하나로 묶어 주는 함수입니다. <code>sapply(fits, predict, newdata = test_data)</code>라고 쓰면 <code>fits</code>에 담긴 트리를 하나씩 꺼내 <code>predict(트리, newdata = test_data)</code>를 실행합니다. 첫 번째 인수는 반복할 대상, 두 번째는 적용할 함수이고, 그 뒤에 붙인 인수인 <code>newdata</code>는 함수를 호출할 때마다 그대로 전달됩니다. 앞서 <code>for</code> 루프로 썼던 반복을 한 줄로 줄인 것과 같습니다.\n</li><li>트리 하나의 예측 결과는 테스트 관측치 수만큼의 값을 가진 벡터입니다. <code>sapply()</code>는 길이가 같은 벡터들이 모이면 이를 열 방향으로 이어 붙여 행렬로 만들어 주기 때문에 <code>pred_mat</code>은 테스트 관측치 수 × 트리 개수 크기의 행렬이 됩니다.\n</li></ul>\n</li><li><code>rowMeans()</code>로 행별 평균을 구해 <code>bag_pred</code>에 저장합니다. 배깅은 같은 관측치에 대한 여러 트리의 예측을 평균을 내는 방법이므로 평균은 행 방향으로 구해야 합니다. <code>rowMeans(pred_mat)</code>으로 각 행의 평균을 계산해 <code>bag_pred</code>에 저장하면 관측치마다 하나씩, 테스트 관측치 수만큼의 최종 예측이 나옵니다.\n</li></ul>\n<p><strong>3단계. 성능 비교</strong></p>\n<p>마지막으로 트리 하나만 썼을 때와 배깅했을 때의 성능을 비교합니다. 배깅이 예측 성능을 개선했는지 확인해 보세요.</p>\n<ul>\n<li><code>pred_mat[, 1]</code>은 첫 번째 트리 하나의 예측입니다. 이것으로 <code>rmse_single</code>을 계산합니다.\n</li><li><code>bag_pred</code>로 <code>rmse_bag</code>을 계산해 나란히 출력합니다.\n</li></ul>",
          blanks: [
            { line: "n_bag <- _____", answer: /n_bag<\-30/ },
            { line: "_____ (b in 1:_____) {", answer: /for\(bin1:n_bag\)\{/ },
            { line: "idx <- _____(", answer: /idx<\-sample\(/ },
            { line: "replace = _____", answer: /replace=TRUE/ },
            { line: "boot <- train_data[_____, ]", answer: /boot<\-train_data\[idx,\]/ },
            { line: "data = _____,", answer: /data=boot,/ },
            { line: "control = rpart.control(cp = _____, minsplit = _____)", answer: /control=rpart\.control\(cp=0,minsplit=10\)/ },
            { line: "pred_mat <- sapply(fits, predict, newdata = _____)", answer: /pred_mat<\-sapply\(fits,predict,newdata=test_data\)/ },
            { line: "bag_pred <- _____(pred_mat)", answer: /bag_pred<\-rowMeans\(pred_mat\)/ },
            { line: "rmse_single <- _____(_____((pred_mat[, 1] - y_test)^2))", answer: /rmse_single<\-sqrt\(mean\(\(pred_mat\[,1\]\-y_test\)\^2\)\)/ },
            { line: "rmse_bag    <- _____(_____((bag_pred      - y_test)^2))", answer: /rmse_bag<\-sqrt\(mean\(\(bag_pred\-y_test\)\^2\)\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 2-1. 배깅 직접 구현 — 결과 확인",
          mode: "run",
          checkId: null,
          starter_path: "snippets/ensemble/06-task2-1.R",
          concept: "<p>개별 트리는 그대로 두고 평균만 냈을 뿐인데 RMSE가 줄어듭니다. 각 트리의 예측 오차에 섞인 노이즈가 서로 다른 방향이라 평균에서 상쇄되기 때문입니다.</p>\n<p>아래 코드는 이미 만들어 둔 <code>pred_mat</code>을 재사용해 앞에서부터 차례로 \\\\(m\\\\)개 열만 평균을 내면서 평균에 포함한 트리의 숫자가 늘어감에 따라 RMSE가 어떻게 변하는지 보여 줍니다. 수정없이 그대로 실행하세요.</p>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 2-2. 랜덤 포레스트",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/07-task2-2.R",
          concept: "<p>랜덤 포레스트는 배깅에 훈련에 사용하는 예측변수를 무작위로 선택하는 하나의 요소를 더합니다. 분할마다 후보로 올릴 예측변수를 무작위로 제한해 트리들 사이의 상관을 낮추는 것입니다.</p>\n<p>이 실습에서는 <code>ranger</code> 패키지를 사용합니다. R의 랜덤 포레스트 구현으로는 <code>randomForest</code>가 가장 오래됐지만, <code>ranger</code>는 C++를 기반으로 만들어진 후발 주자이지만, 더 다양한 기능을 제공하고, 예측변수가 많거나 표본이 클 때 더 빠릅니다.</p>\n<p><code>ranger</code>는 회귀에서 OOB(out-of-bag) MSE를 <code>prediction.error</code>에 담아 둡니다. 부트스트랩은 복원추출이므로 각 트리를 학습할 때 뽑히지 않은 관측치가 약 37% 남고, 이 관측치들로 추정한 오차가 OOB 오차입니다. 검증 데이터를 따로 떼지 않아도 되므로 하이퍼 파라미터 탐색에 그대로 쓸 수 있습니다. 성능 평가 단계에서는 여기에 제곱근을 취해야 RMSE가 됩니다.</p>\n<ul>\n<li><code>ranger()</code> 함수에 <code>formula = form</code>, <code>data = train_data</code>를 넣어 훈련을 실행하고 그 결과를 <code>fit_rf</code>에 저장합니다. <code>respect.unordered.factors = \"order\"</code>는 순서 없는 범주형 변수를 다루는 방식으로, 범주를 결과변수 평균 순으로 정렬해 분할 후보를 찾습니다. 범주 수가 많을 때 계산이 빨라지고 분할도 안정적입니다. <code>verbose = FALSE</code>로 훈련 과정의 출력은 끕니다.\n</li><li><code>fit_rf$prediction.error</code>는 OOB(out-of-bag) 오차입니다. 각 트리를 학습할 때 부트스트랩에서 뽑히지 않은 관측치로 계산한 예측 오차로, 별도의 검증 데이터 없이도 성능을 가늠할 수 있습니다. 회귀에서는 MSE로 저장되므로 제곱근을 취해 <code>oob_rmse_rf</code>에 저장합니다.\n</li><li><code>predict()</code>에 <code>fit_rf</code>와 <code>data = test_data</code>를 넣어 예측값을 계산하고 <code>pred_rf</code>에 저장합니다. <code>ranger</code>의 <code>predict()</code>는 인수 이름이 <code>newdata</code>가 아니라 <code>data</code>이고, 결과는 예측값 외에 여러 정보를 담은 리스트이므로 <code>$predictions</code>로 꺼내야 합니다.\n</li><li>테스트 RMSE를 <code>rmse_rf</code>에 저장하고 배깅의 결과와 나란히 출력합니다. 랜덤 포레스트는 분할마다 변수를 일부만 후보로 삼아 트리 간 상관을 낮추므로, 배깅보다 오차가 조금 더 줄어드는 것이 일반적입니다.\n</li></ul>",
          blanks: [
            { line: "fit_rf <- _____(", answer: /fit_rf<\-ranger\(/ },
            { line: "formula = _____,", answer: /formula=form,/ },
            { line: "data    = _____,", answer: /data=train_data,/ },
            { line: "oob_rmse_rf <- _____(fit_rf$prediction.error)", answer: /oob_rmse_rf<\-sqrt\(fit_rf\$prediction\.error\)/ },
            { line: "pred_rf <- predict(fit_rf, data = _____)$_____", answer: /pred_rf<\-predict\(fit_rf,data=test_data\)\$predictions/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 2-2. 랜덤 포레스트 — 결과 확인",
          mode: "run",
          checkId: null,
          starter_path: "snippets/ensemble/08-task2-2.R",
          concept: "<p>아무것도 조정하지 않은 기본 설정만으로도 배깅보다 개선이 있다면, 그 차이는 분할마다 변수를 무작위로 제한한 효과입니다.</p>\n<p>아래 코드는 <code>mtry</code>를 1부터 10까지 바꿔 가며 OOB RMSE를 계산합니다. 그대로 실행하세요.</p>\n<ul>\n<li><code>mtry</code>가 작으면 트리들이 서로 덜 닮습니다. 일반화에 유리한 경우가 많지만 개별 트리의 편향은 조금 커집니다.\n</li><li><code>mtry</code>가 크면 트리들이 서로 닮습니다. 평균을 내는 이득이 줄어듭니다. <code>mtry</code>가 예측변수 전체 개수와 같으면 배깅과 같아집니다.\n</li></ul>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 3.3,
      title: "Part 3. 부스팅",
      color: "#854F0B",
      steps: [
        {
          title: "Task 3-1. 패키지없이 구현하는 부스팅",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/09-task3-1.R",
          concept: "<p>부스팅은 약한 학습기를 순차적으로 쌓아 예측을 개선하는 방법입니다. 여기서도 패키지에 맡기지 않고 그 과정을 직접 작성해 봅니다. 약한 학습기로는 분할이 하나뿐인 회귀 트리, 즉 stump를 사용합니다. Stump 하나는 예측변수 전체 중 딱 하나를 골라 한 번만 자르는 모형이므로 예측력이 매우 낮습니다. 그런 모형을 100개 쌓으면 어떻게 되는지를 살펴보는 것이 이 과제의 목적입니다.</p>\n<p>먼저 stump 하나를 훈련 데이터에 적합해 <code>stump1</code>에 저장합니다.</p>\n<ul>\n<li><code>rpart()</code>에 <code>y_train ~ .</code>을 넣습니다. 왼쪽에는 앞에서 만든 결과변수 벡터를, 오른쪽 <code>.</code>에는 <code>data</code>로 넘긴 데이터프레임의 모든 열을 쓴다는 뜻입니다.\n</li><li><code>data = x_train</code>으로 예측변수만 담긴 데이터프레임을 넘깁니다.\n</li><li><code>maxdepth = 1</code>로 분할을 한 번만 하도록 강제합니다.\n</li><li><code>cp = 0</code>으로 복잡도 페널티를 없앱니다. <code>maxdepth</code>가 이미 제약이므로 페널티까지 걸면 분할이 아예 일어나지 않을 수 있습니다.\n</li></ul>\n<p>성능은 훈련 RMSE로 확인합니다. 잔차를 계산해 주는 <code>residuals()</code> 함수를 쓰면 <code>y_train - predict(stump1)</code>을 직접 계산하지 않아도 잔차를 바로 얻을 수 있습니다. 이 잔차를 제곱해 평균 내고 제곱근을 취한 값을 <code>rmse_stump1</code>에 저장합니다.</p>\n<ul>\n<li>비교 기준으로 훈련 데이터의 평균만으로 예측한 영모형의 RMSE도 <code>rmse_null</code>에 저장합니다.\n</li></ul>\n<p>이제 부스팅의 동작을 한 번 수행합니다. 첫 stump가 설명하지 못한 부분, 즉 잔차를 새로운 결과변수로 삼아 두 번째 stump를 적합합니다.</p>\n<ul>\n<li><code>residuals(stump1)</code>로 첫 stump의 잔차를 꺼내 <code>r1</code>에 저장합니다.\n</li><li><code>rpart()</code>에 <code>r1 ~ .</code>을 넣고 나머지는 그대로 두어 <code>stump2</code>를 적합합니다. 예측변수는 그대로이고 결과변수만 바뀌었습니다.\n</li><li><code>predict(stump1) + predict(stump2)</code>로 두 예측을 더해 <code>pred2</code>에 저장합니다. 평균이 아니라 <strong>합</strong>입니다. 두 번째 stump가 예측하는 것은 결과변수가 아니라 첫 번째가 남긴 오차이므로, 그 오차분을 더해 주어야 원래 척도의 예측이 됩니다.\n</li></ul>",
          blanks: [
            { line: "stump1 <- _____(", answer: /stump1<\-rpart\(/ },
            { line: "data = _____,", answer: null },
            { line: "maxdepth = _____,", answer: null },
            { line: "rmse_stump1 <- _____(_____(_____(stump1)^2))", answer: null },
            { line: "rmse_null   <- _____(_____((y_train - mean(y_train))^2))", answer: null },
            { line: "_____ ~ .,", answer: null },
            { line: "pred2 <- predict(stump1) _____ predict(stump2)", answer: /pred2<\-predict\(stump1\)\+predict\(stump2\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 3-1. 패키지없이 구현하는 부스팅 — 결과 확인",
          mode: "run",
          checkId: null,
          starter_path: "snippets/ensemble/10-task3-1.R",
          concept: "<p>두 번째 stump가 첫 번째와 다른 변수를 골랐을 가능성이 큽니다. 첫 stump가 설명하고 남은 부분에서는 다른 변수가 가장 유용해지기 때문입니다.</p>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 3-2. 100회 반복하기",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/11-task3-2.R",
          concept: "<p>Task 3-1의 동작을 <code>for</code> 루프에 넣어 100번 반복합니다. 매 반복에서 직전 stump의 잔차를 꺼내 새 stump를 적합하고, 예측결과 벡터를 누적해 저장합니다. 이번에는 비교를 위해 훈련과 테스트 두 궤적을 함께 기록합니다.</p>\n<p><strong>1단계. 초기화</strong></p>\n<ul>\n<li><code>M</code>에 반복 횟수 <code>100</code>을 저장합니다.\n</li><li><code>f_tr</code>과 <code>f_te</code>에 각각 <code>0</code>을 저장합니다. 누적 예측을 담을 그릇이고, 반복마다 새 stump의 예측이 더해집니다.\n</li><li><code>r</code>에 <code>y_train</code>을 저장합니다. 첫 반복에서 stump가 맞힐 대상입니다. 아직 아무것도 예측하지 않았으므로 잔차는 결과변수 자체입니다.\n</li><li><code>rmse_tr</code>과 <code>rmse_te</code>에 <code>numeric(M)</code>으로 길이 <code>M</code>의 빈 벡터를 만듭니다.\n</li></ul>\n<p><strong>2단계. 루프</strong></p>\n<ul>\n<li><code>rpart()</code>에 <code>r ~ .</code>을 넣어 현재 잔차에 stump를 적합합니다. 학습은 언제나 훈련 데이터로만 이루어집니다.\n</li><li><code>f_tr</code>에는 <code>predict(stump)</code>를, <code>f_te</code>에는 <code>predict(stump, newdata = x_test)</code>를 더합니다.\n</li><li>각각의 RMSE를 <code>rmse_tr[m]</code>과 <code>rmse_te[m]</code>에 저장합니다.\n</li><li><code>residuals(stump)</code>로 다음 반복이 맞힐 잔차 <code>r</code>을 갱신합니다. <code>r</code>을 갱신하지 않으면 같은 stump를 100번 반복하게 되니 주의하세요.\n</li></ul>\n<p><strong>3단계. 시각화</strong></p>\n<p>두 곡선을 한 그림에 겹쳐 그리고, <code>which.min(rmse_te)</code>로 찾은 최적 반복 횟수를 <code>best_m</code>에 저장해 세로선으로 표시합니다.</p>",
          blanks: [
            { line: "r <- _____", answer: /r<\-y_train/ },
            { line: "_____ ~ .,", answer: /r\~\.,/ },
            { line: "f_te <- f_te + predict(stump, newdata = _____)", answer: /f_te<\-f_te\+predict\(stump,newdata=x_test\)/ },
            { line: "r <- _____(stump)", answer: /r<\-residuals\(stump\)/ },
            { line: "best_m <- _____(rmse_te)", answer: /best_m<\-which\.min\(rmse_te\)/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
        {
          title: "Task 3-3. (선택사항) XGBoost",
          mode: "fill",
          checkId: null,
          starter_path: "snippets/ensemble/12-task3-3.R",
          concept: "<p><code>xgboost</code>는 트리를 기저 학습기로 쓰는 부스팅의 고성능 구현입니다. 2차 근사와 계산 최적화로 속도와 성능을 끌어올렸습니다. <code>rpart</code>가 공식과 데이터프레임을 받는 것과 달리 <code>xgboost</code>는 행렬을 입력으로 받으므로, 데이터를 먼저 변환해야 합니다. 1강에서 <code>glmnet</code>을 쓸 때와 같은 단계입니다.</p>\n<ul>\n<li><code>model.matrix(rx_num ~ . - 1, data = train_data)</code>으로 예측변수 행렬을 만들어 <code>x_mat_train</code>에 저장합니다. <code>- 1</code>은 절편 열을 빼라는 뜻입니다. 같은 방식으로 <code>x_mat_test</code>도 만듭니다.\n</li><li><code>xgb.DMatrix()</code>에 <code>data = x_mat_train</code>, <code>label = y_train</code>을 넣어 <code>dtrain</code>에 저장합니다. <code>xgboost</code>가 내부적으로 쓰는 형식입니다.\n</li><li><code>xgb.cv()</code>에 <code>data = dtrain</code>, <code>nrounds = 200</code>, <code>nfold = 10</code>, <code>verbose = FALSE</code>를 넣어 <code>xgcv</code>에 저장합니다. Task 3-2에서 손으로 그렸던 곡선을 함수 하나로 얻는 셈입니다.\n</li><li><code>which.min(xgcv\\\\(evaluation_log\\\\)test_rmse_mean)</code>으로 최소 지점의 반복 번호를 찾아 <code>nrounds_best</code>에 저장합니다.\n</li><li><code>xgb.train()</code>에 <code>nrounds = nrounds_best</code>를 넣어 <code>xgb_final</code>에 저장하고, 테스트 RMSE를 <code>rmse_xgb</code>에 저장합니다.\n</li></ul>",
          blanks: [
            { line: "x_mat_train <- model.matrix(rx_num ~ . - 1, data = _____)", answer: /x_mat_train<\-model\.matrix\(rx_num\~\.\-1,data=train_data\)/ },
            { line: "x_mat_test  <- model.matrix(rx_num ~ . - 1, data = _____)", answer: /x_mat_test<\-model\.matrix\(rx_num\~\.\-1,data=test_data\)/ },
            { line: "dtrain <- xgb.DMatrix(data = x_mat_train, label = _____)", answer: /dtrain<\-xgb\.DMatrix\(data=x_mat_train,label=y_train\)/ },
            { line: "data = _____,", answer: /data=dtrain,/ },
            { line: "nfold = _____,", answer: /nfold=10,/ },
            { line: "nrounds_best <- _____(xgcv$evaluation_log$test_rmse_mean)", answer: /nrounds_best<\-which\.min\(xgcv\$evaluation_log\$test_rmse_mean\)/ },
            { line: "nrounds = _____", answer: /nrounds=nrounds_best/ },
          ],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
    {
      id: 3.4,
      title: "모형 비교",
      color: "#854F0B",
      steps: [
        {
          title: "모형 비교",
          mode: "run",
          checkId: null,
          starter_path: "snippets/ensemble/13-run.R",
          concept: "<p>아래 코드를 실행하세요. 지금까지 계산한 테스트 RMSE를 한 표로 모읍니다. 선택사항을 건너뛰었다면 해당 행은 자동으로 빠집니다.</p>",
          blanks: [],
          hint: null,
          success: "완료했습니다. 다음 단계로 넘어가세요.",
          implication: null
        },
      ]
    },
  ]
});
