library(randomForest)

# 1. Y에서 Z의 영향을 제거 (잔차 계산)
model_y <- randomForest(Y ~ Z1 + Z2 + Z3, data = df)
y_resid <- df$Y - predict(model_y, df)

# 2. D에서 Z의 영향을 제거 (잔차 계산)
# D는 이진 변수이므로 확률값(predict type='prob')을 활용해도 좋습니다
model_d <- randomForest(factor(D) ~ Z1 + Z2 + Z3, data = df)
d_resid <- df$D - predict(model_d, df, type = "prob")[,2]

# 3. 두 잔차 사이의 관계를 회귀 분석 (Final Step)
final_reg <- lm(y_resid ~ d_resid)
summary(final_reg)