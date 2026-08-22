build_model <- function(units = 8, lr = 0.01, dropout = 0, l2 = 0) {
  keras_model_sequential(input_shape = ncol(x_train)) |>
    layer_dense(units = units, activation = "relu",
                kernel_regularizer = regularizer_l2(l2)) |>
    layer_dropout(rate = dropout) |>
    layer_dense(units = 1) |>
    compile(
      loss = "mse",
      optimizer = optimizer_adam(learning_rate = lr),
      metrics = metric_root_mean_squared_error()
    )
}

# Task 5에서 학습한 기본 설정의 검증 RMSE입니다.
# 앞으로 모든 비교 그림에 기준선으로 들어갑니다.
rmse_val_base <- sqrt(min(history$metrics$val_loss))

round(rmse_val_base, 4)
