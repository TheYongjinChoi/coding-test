results <- c(
  "영모형 (평균)"        = sqrt(mean((y_test - mean(y_train))^2)),
  "단일 트리"            = rmse_tree,
  "배깅 (수동, 30 trees)" = rmse_bag,
  "랜덤 포레스트"        = rmse_rf,
  "수동 부스팅 (최적 M)"  = rmse_te[best_m]
)

if (exists("rmse_pruned")) results["가지치기 후 트리"] <- rmse_pruned
if (exists("rmse_xgb"))    results["XGBoost"]          <- rmse_xgb

tibble(
  model = names(results),
  test_rmse = round(as.numeric(results), 3)
) |>
  arrange(test_rmse)
