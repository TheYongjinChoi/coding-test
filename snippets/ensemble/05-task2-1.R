# 아래의 결과를 복제하는 코드 작성
set.seed(123)

# 1단계. 부트스트랩 표본과 개별 트리 학습
n_bag <- _____
fits <- list()

_____ (b in 1:_____) {

  idx <- _____(
    seq_len(nrow(train_data)),
    nrow(train_data),
    replace = _____
  )

  boot <- train_data[_____, ]

  fits[[b]] <- rpart(
    form,
    data = _____,
    method = "anova",
    control = rpart.control(cp = _____, minsplit = _____)
  )
}

# 2단계. 예측 합치기
pred_mat <- sapply(fits, predict, newdata = _____)
bag_pred <- _____(pred_mat)

# 3단계. 성능 비교
rmse_single <- _____(_____((pred_mat[, 1] - y_test)^2))
rmse_bag    <- _____(_____((bag_pred      - y_test)^2))

c(single_tree_rmse = rmse_single, bagging_rmse = rmse_bag)
