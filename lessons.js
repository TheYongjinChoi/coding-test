// ============================================================
// Course content editing file — only edit this file
// check: (out, code) => correct answer condition (out=output, code=written code)
// hint: hint to show when answer is incorrect (null if none)
// ============================================================

// Loading snippets

const COURSE = {
  title: "DML 실습",
  chapters: [
    {
      id: 5.1,
      title: "Manual DML",
      color: "#1D9E75",
      steps: [

        // Step 1
        {
          title: "1. 데이터 생성",
          concept: `첫 번째 실습에서는 시뮬레이션 데이터를 활용하여 DML을 manual로 구현해 보겠습니다. 실습을 위해 강의노트에서 참고했던 비선형 교란이 포함된 시뮬레이션 데이터를 생성합니다.<br>`,
          tasks: [
            "제공된 시뮬레이션 데이터 코드를 실행하고 데이터의 분포와 변수 간 상관관계를 확인하세요."
          ],

          starter_path: "snippets/session05/exec05-01-01.R",

          check: (out, code) => {
            return out.includes('|||PLOT_START|||');
          },
          // hint: "lm(Y ~ D, data = df) 형태로 naive_model 변수에 할당해 보세요.",
          implication: "데이터 생성 결과 \\(Y\\)는 \\(Z_1, Z_2\\)와 비선형 곡선 관계를, \\(Z_3\\)와는 강한 선형 관계를 보여줍니다. 처치군(\\(D=1\\))과 대조군(\\(D=0\\))이 각 \\(Z\\) 값에 따라 구간별로 편중되어 분포하기 때문에 \\(D\\)와 \\(Z\\) 사이에도 상관관계가 존재합니다.",
          success: "시뮬레이션 데이터가 성공적으로 생성되었습니다."
        },

        // Step 2
        {
          title: "2. 단순 회귀분석",
          concept: "생성된 데이터를 활용하여 통제변수가 포함된 회귀분석을 수행해 보겠습니다.<br>이전 단계에서 생성한 데이터는 `df`라는 데이터프레임에 저장되어 있습니다. 이 데이터를 활용하여 종속변수와 독립변수, 그리고 통제변수를 포함한 회귀분석을 수행하고, 회귀분석 결과에서 처치효과 `D`의 계수가 참값(2.0)과 얼마나 차이가 나는지 확인해 보세요.",
          tasks: [
            "`lm()` 함수를 활용하여 회귀분석을 수행하고, 그 결과를 `m_reg` 변수에 할당하세요.",
            "종속변수는 `Y`, 독립변수는 `D`로 설정하세요. 그리고 통제변수 `Z1`, `Z2`, `Z3`도 포함하세요.",
            "`summary()` 함수를 이용하여 회귀분석 결과를 확인하세요.",
            "회귀분석 결과에서 처치효과 `D`의 계수가 참값(2.0)과 얼마나 차이가 나는지 확인해 보세요."
          ],

          starter_path: "snippets/session05/exec05-01-02.R",

          check: (out, code) => {
            // 1. 코드 내에 m_reg 변수에 lm 결과가 할당되었는지 확인
            const hasAssignment = code.includes('m_reg <- lm(');
            
            // 2. 종속/독립변수 및 통제변수가 올바르게 포함되었는지 정규식으로 간단히 확인
            // Y ~ D + Z1 + Z2 + Z3 패턴을 찾습니다.
            const hasCorrectFormula = /lm\(Y\s*~\s*D\s*\+\s*Z1\s*\+\s*Z2\s*\+\s*Z3/i.test(code);
            
            // 3. summary() 함수가 실행되었는지 확인 (결과창 출력 확인)
            const hasSummary = out.includes('Coefficients:');

            return hasAssignment && hasCorrectFormula && hasSummary;
          },
          // hint: "lm(Y ~ D, data = df) 형태로 naive_model 변수에 할당해 보세요.",
          implication: "XXXXX",
          success: "XXXXX"
        },

        // Step 3
        {
          title: "3. 랜덤 포레스트 기반 잔차 회귀",
          concept: "DML은 잔차 회귀에 머신러닝을 적용해 교란변수의 효과를 먼저 제거합니다.<br>이번 실습에서는 랜덤 포레스트를 활용하여 \\(Y\\)와 \\(D\\) 각각을 \\(Z\\)로 예측한 뒤 남은 순수한 잔차만을 활용해 추정을 해보겠습니다.",
          tasks: [
            "`randomForest()` 함수를 활용하여 `Y`와 `D`를 각각 `Z1, Z2, Z3`로 예측하는 모델을 만드세요.",
            "실제 값 `df$Y`에서 예측값을 빼서 각각의 잔차 `y_resid`에 저장하세요. 예측값은 `predict()` 함수를 사용하여 얻을 수 있습니다. 마찬가지로 `df$Y`와 `model_d`를 사용하여 `D`의 잔차를 `d_resid`에 저장하세요.",
            "`lm(y_resid ~ d_resid)`를 통해 최종 처치 효과를 추정하세요.",
            "`summary()` 함수를 사용하여 추정된 처치 효과 계수가 참값(2.0)과 얼마나 가까운지 확인하세요."
          ],

          starter_path: "snippets/session05/exec05-01-03.R",

          check: (out, code) => {
            // 잔차 생성 로직과 최종 lm 수행 여부 확인
            const hasResid = code.includes('y_resid <-') && code.includes('d_resid <-');
            const hasFinalLm = code.includes('lm(y_resid ~ d_resid)');
            const hasRandomForest = code.includes('randomForest');
            return hasResid && hasFinalLm && hasRandomForest;
          },
          // hint: "`D`의 잔차는 `type = "prob"` 옵션을 사용하여 이진 분류 모델에서 확률 예측값을 얻어야 합니다.",
          implication: "\\(Y\\)와 \\(D\\)에서 \\(Z\\)의 비선형적 정보를 미리 제거함으로써 선형 회귀가 잡지 못했던 교란 효과를 더 효과적으로 제거했습니다. 이제 단순 회귀와 달리 추정치 \\(\\hat{\\beta}\\)가 참값(2.0)에 좀 더 근접하게 수렴하는 것을 볼 수 있습니다.",
          success: "잔차 회귀를 통해 처치 효과를 성공적으로 추정했습니다!"
        },

        // Step 4
        {
          title: "4. 성향점수 보정",
          concept: "DML은 잔차 회귀에 머신러닝을 적용해 교란변수의 효과를 먼저 제거합니다.<br>이번 실습에서는 랜덤 포레스트를 활용하여 \\(Y\\)와 \\(D\\) 각각을 \\(Z\\)로 예측한 뒤 남은 순수한 잔차만을 활용해 추정을 해보겠습니다.",
          tasks: [
            "앞선 스텝에서 구한 `d_resid`와 `y_resid`를 다시 불러오세요.",
            "성향점수 `ps`를 계산하고, 처치군과 대조군 사이의 불균형을 보정할 가중치 `w`를 생성하세요.",
            "잔차 회귀 모델 `lm(y_resid ~ d_resid)`에 가중치 `w`를 적용하세요.",
            "가중치가 적용된 모델이 단순 잔차 회귀보다 참값(2.0)에 더 정확히 수렴하는지 확인하세요."
          ],

          starter_path: "snippets/session05/exec05-01-04.R",

          check: (out, code) => {
            // 잔차 생성 로직과 최종 lm 수행 여부 확인
            const hasResid = code.includes('y_resid <-') && code.includes('d_resid <-');
            const hasFinalLm = code.includes('lm(y_resid ~ d_resid)');
            const hasRandomForest = code.includes('randomForest');
            return hasResid && hasFinalLm && hasRandomForest;
          },
          // hint: "`D`의 잔차는 `type = "prob"` 옵션을 사용하여 이진 분류 모델에서 확률 예측값을 얻어야 합니다.",
          implication: "\\(Y\\)와 \\(D\\)에서 \\(Z\\)의 비선형적 정보를 미리 제거함으로써 선형 회귀가 잡지 못했던 교란 효과를 더 효과적으로 제거했습니다. 이제 단순 회귀와 달리 추정치 \\(\\hat{\\beta}\\)가 참값(2.0)에 좀 더 근접하게 수렴하는 것을 볼 수 있습니다.",
          success: "잔차 회귀를 통해 처치 효과를 성공적으로 추정했습니다!"
        },

        // Step 5
        {
          title: "5. Cross-fitting",
          concept: `CONCEPT<br>CONCEPT`,
          tasks: [
            "데이터를 2개의 폴드(Fold 1, Fold 2)로 무작위로 분할하세요.",
            "각 폴드에 대해 번갈아가며 랜덤 포레스트 모델을 학습시키고 잔차를 구하세요.",
            "두 폴드에서 생성된 잔차들을 다시 하나로 합치세요.",
            "최종적으로 합쳐진 잔차 데이터에 가중치(w)를 적용하여 회귀를 수행하세요."
          ],

          starter_path: "snippets/session05/exec05-01-05.R",
          
          ccheck: (out, code) => {
            // 데이터 분할 및 루프/결합 로직 포함 여부 확인
            const hasFold = code.includes('sample') || code.includes('fold');
            const hasLoop = code.includes('for') || code.includes('lapply');
            const hasFinalLm = code.includes('lm(y_resid ~ d_resid, weights = w)');
            return hasFold && hasLoop && hasFinalLm;
          },
          hint: "XXXXX",
          success: "XXXXX"
        },

        // Step 6
        {
          title: "6. 성능 비교",
          concept: `CONCEPT<br>CONCEPT`,
          tasks: [
            "제공된 코드를 실행하고 지금까지 추정한 모델들의 성능을 비교해 보세요."
          ],

          starter_path: "snippets/session05/exec05-01-0X.R",
          
          check: (out, code) => code.includes('DoubleMLPLR$new') && code.includes('$fit()'),
          hint: "XXXXX",
          success: "XXXXX"
        }
      ]
    },
    {
      id: 2,
      title: "PLR",
      color: "#185FA5",
      steps: [
        {
          title: "TITLE",
          concept: `CONCEPT<br>CONCEPT`,
          tasks: [
            "XXXXX",
            "XXXXX"
          ],

          starter_path: "snippets/session05/exec05-01-0X.R",
          
          check: (out, code) => code.includes('DoubleMLPLR$new') && code.includes('$fit()'),
          hint: "XXXXX",
          success: "XXXXX"
        },
        {
          title: "TITLE",
          concept: `CONCEPT<br>CONCEPT`,
          tasks: [
            "XXXXX",
            "XXXXX"
          ],

          starter_path: "snippets/session05/exec05-01-0X.R",
          
          check: (out, code) => code.includes('DoubleMLPLR$new') && code.includes('$fit()'),
          hint: "XXXXX",
          success: "XXXXX"
        }
      ]
    },
    {
      id: 3,
      title: "IRM",
      color: "#854F0B",
      steps: [
        {
          title: "TITLE",
          concept: `CONCEPT<br>CONCEPT`,
          tasks: [
            "XXXXX",
            "XXXXX"
          ],

          starter_path: "snippets/session05/exec05-01-0X.R",
          
          check: (out, code) => code.includes('DoubleMLPLR$new') && code.includes('$fit()'),
          hint: "XXXXX",
          success: "XXXXX"
        },
        {
          title: "TITLE",
          concept: `CONCEPT<br>CONCEPT`,
          tasks: [
            "XXXXX",
            "XXXXX"
          ],

          starter_path: "snippets/session05/exec05-01-0X.R",
          
          check: (out, code) => code.includes('DoubleMLPLR$new') && code.includes('$fit()'),
          hint: "XXXXX",
          success: "XXXXX"
        }
      ]
    }
  ]
};