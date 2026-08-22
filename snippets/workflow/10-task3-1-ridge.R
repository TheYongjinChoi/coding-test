# 아래의 결과를 복제하는 코드 작성
set.seed(123)

cv_ridge <- cv.glmnet(
  x = _____,
  y = _____,
  alpha = _____,
  family = _____,
  nfolds = _____,
  type.measure = _____
)

pred_ridge_min <- _____(
  predict(_____, newx = _____, s = _____)
)

pred_ridge_1se <- as.numeric(
  predict(_____, newx = _____, s = _____)
)

rmse_ridge_min <- _____(_____((_____ - _____)^2))
rmse_ridge_1se <- _____(_____((_____ - _____)^2))

cat(
  "OLS               RMSE:", round(rmse_ols, 3), "\n",
  "Lasso lambda.1se  RMSE:", round(rmse_lasso_1se, 3), "\n",
  "Ridge lambda.min  RMSE:", round(rmse_ridge_min, 3), "\n",
  "Ridge lambda.1se  RMSE:", round(rmse_ridge_1se, 3), "\n"
)
