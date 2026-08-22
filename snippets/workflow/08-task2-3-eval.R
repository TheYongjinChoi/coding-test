# 아래의 결과를 복제하는 코드 작성
pred_lasso_min <- as.numeric(
  predict(_____, newx = _____, s = _____)
)

pred_lasso_1se <- as.numeric(
  predict(cv_lasso, newx = x_test, s = _____)
)

rmse_lasso_min <- _____(_____((y_test - _____)^2))
rmse_lasso_1se <- _____(_____((y_test - _____)^2))

cat(
  "OLS               RMSE:", round(rmse_ols, 3),
  " 변수:", ncol(x_train), "\n",
  "Lasso lambda.min  RMSE:", round(rmse_lasso_min, 3),
  " 변수:", sum(coef(cv_lasso, s = "lambda.min") != 0) - 1, "\n",
  "Lasso lambda.1se  RMSE:", round(rmse_lasso_1se, 3),
  " 변수:", sum(coef(cv_lasso, s = "lambda.1se") != 0) - 1, "\n"
)
