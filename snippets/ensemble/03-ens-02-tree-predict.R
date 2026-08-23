# 아래의 결과를 복제하는 코드 작성
pred_tree       <- predict(_____, newdata = _____)
pred_tree_train <- predict(tree_basic, newdata = _____)

rmse_tree       <- _____(_____((y_test  - _____)^2))
rmse_tree_train <- sqrt(mean((y_train - _____)^2))

cat(
  "단일 트리  훈련 RMSE:", round(rmse_tree_train, 3), "\n",
  "단일 트리  테스트 RMSE:", round(rmse_tree, 3), "\n"
)
