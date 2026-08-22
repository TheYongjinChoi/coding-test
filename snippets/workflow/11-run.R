rmse_null <- sqrt(mean((y_test - mean(y_train))^2))

comparison <- tibble(
  model = c(
    "영모형 (변수 0개)",
    "OLS",
    "Lasso (lambda.min)",
    "Lasso (lambda.1se)",
    "Ridge (lambda.min)",
    "Ridge (lambda.1se)"
  ),
  변수수 = c(
    0,
    ncol(x_train),
    sum(coef(cv_lasso, s = "lambda.min") != 0) - 1,
    sum(coef(cv_lasso, s = "lambda.1se") != 0) - 1,
    ncol(x_train),
    ncol(x_train)
  ),
  rmse = c(
    rmse_null,
    rmse_ols,
    rmse_lasso_min,
    rmse_lasso_1se,
    rmse_ridge_min,
    rmse_ridge_1se
  )
) |>
  mutate(
    개선율 = round(100 * (rmse_ols - rmse) / rmse_ols, 2),
    rmse = round(rmse, 3)
  ) |>
  arrange(rmse)

comparison
