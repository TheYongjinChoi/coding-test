# 아래의 결과를 복제하는 코드 작성
set.seed(123)

fit_rf <- _____(
  formula = _____,
  data    = _____,
  respect.unordered.factors = "order",
  verbose = FALSE
)

oob_rmse_rf <- _____(fit_rf$prediction.error)

pred_rf <- predict(fit_rf, data = _____)$_____

rmse_rf <- sqrt(mean((y_test - pred_rf)^2))

c(bagging_rmse = rmse_bag,
  rf_oob_rmse  = oob_rmse_rf,
  rf_test_rmse = rmse_rf)
