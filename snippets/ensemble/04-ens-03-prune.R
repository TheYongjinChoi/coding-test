# 아래의 결과를 복제하는 코드 작성
set.seed(123)

tree_full <- _____(
  rx_num ~ .,
  data = train_data,
  method = "anova",
  control = rpart.control(
    cp = _____,
    minsplit = _____,
    xval = _____
  )
)

best_cp <- _____$_____[
  _____(tree_full$cptable[, "xerror"]), "CP"
]

tree_pruned <- _____(tree_full, cp = _____)

pred_pruned <- _____(tree_pruned, newdata = test_data)
rmse_pruned <- _____(_____((_____ - _____)^2))

cat(
  "선택된 cp:", signif(best_cp, 4), "\n",
  "최대 트리 잎:", sum(tree_full$frame$var == "<leaf>"), "\n",
  "가지치기 후 잎:", sum(tree_pruned$frame$var == "<leaf>"), "\n",
  "가지치기 후 테스트 RMSE:", round(rmse_pruned, 3), "\n"
)
