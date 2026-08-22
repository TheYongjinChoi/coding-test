# 아래의 결과를 복제하는 코드 작성
set.seed(123)

cv_lasso <- _____(
  x = x_train,
  y = y_train,
  alpha = _____,
  family = _____,
  nfolds = _____,
  type.measure = _____
)

plot(cv_lasso, sign.lambda = 1)

cv_lasso$_____ # 교차검증 오차가 가장 작은 lambda
cv_lasso$_____ # 최소 오차에서 표준오차 하나만큼 떨어진 범위 안에서 가장 큰 lambda
