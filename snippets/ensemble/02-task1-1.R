# 아래의 결과를 복제하는 코드 작성
tree_basic <- _____(
  rx_num ~ .,
  data = _____,
  method = _____
)

cat("잎의 개수:", sum(tree_basic$frame$var == "<leaf>"), "\n")

# 훈련된 트리 시각화
_____(
  _____,
  type = 2,
  extra = 101,
  fallen.leaves = TRUE
)
