library(randomForest)

# 1. Y에서 Z의 영향을 제거 (잔차 계산)
model_y <- randomForest(__ ~ __ + __ + __, data = ___)
y_resid <- df$__ - _____(_____, _____)

# 2. D에서 Z의 영향을 제거 (잔차 계산)
model_d <- _____(factor(D) ~ Z1 + Z2 + Z3, data = df)
d_resid <- df$__ - _____(_____, _____, type = "prob")[,2]

# 3. 두 잔차 사이의 관계를 회귀 분석
final_reg <- lm(_____ ~ _____)
summary(_____)