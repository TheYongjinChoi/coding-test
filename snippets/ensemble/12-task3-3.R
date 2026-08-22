# 아래의 결과를 복제하는 코드 작성
library(xgboost)

x_mat_train <- model.matrix(rx_num ~ . - 1, data = _____)
x_mat_test  <- model.matrix(rx_num ~ . - 1, data = _____)

dtrain <- xgb.DMatrix(data = x_mat_train, label = _____)

set.seed(10)

xgcv <- xgb.cv(
  data = _____,
  nrounds = 200,
  nfold = _____,
  verbose = FALSE
)

nrounds_best <- _____(xgcv$evaluation_log$test_rmse_mean)

xgb_final <- xgb.train(
  data = dtrain,
  nrounds = _____
)

pred_xgb <- predict(xgb_final, x_mat_test)
rmse_xgb <- sqrt(mean((y_test - pred_xgb)^2))

c(best_nrounds = nrounds_best, test_rmse = rmse_xgb)
