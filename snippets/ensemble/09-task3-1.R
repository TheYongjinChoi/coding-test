# 아래의 결과를 복제하는 코드 작성
stump1 <- _____(
  y_train ~ .,
  data = _____,
  maxdepth = _____,
  cp = 0
)

rmse_stump1 <- _____(_____(_____(stump1)^2))
rmse_null   <- _____(_____((y_train - mean(y_train))^2))

r1 <- residuals(stump1)

stump2 <- rpart(
  _____ ~ .,
  data = x_train,
  maxdepth = 1,
  cp = 0
)

pred2 <- predict(stump1) _____ predict(stump2)

rmse_stump2 <- sqrt(mean((y_train - pred2)^2))

c(null_rmse  = rmse_null,
  one_stump  = rmse_stump1,
  two_stumps = rmse_stump2)
