best <- results[1, ]

set_random_seed(42)

final_model <- build_model(units = best$units, lr = best$lr,
                           dropout = best$dropout)

final_model |> fit(
  x_train, y_train,
  epochs = 100, batch_size = 64,
  validation_split = 0.2,
  callbacks = list(callback_early_stopping(
    monitor = "val_loss", patience = 8, restore_best_weights = TRUE)),
  verbose = 0
)

pred_final <- as.numeric(predict(final_model, x_test, verbose = 0))

rmse_final <- sqrt(mean((y_test - pred_final)^2))

tibble(
  모형 = c("영모형", "선형회귀", "Keras (기본 설정)", "Keras (조정 후)"),
  테스트_RMSE = round(c(rmse_null, rmse_lm, rmse_keras, rmse_final), 4)
)

# 시각화
tibble(
  모형 = factor(c("영모형", "선형회귀", "Keras 기본", "Keras 조정 후"),
                levels = c("영모형", "선형회귀", "Keras 기본", "Keras 조정 후")),
  rmse = c(rmse_null, rmse_lm, rmse_keras, rmse_final)
) |>
  ggplot(aes(모형, rmse)) +
  geom_col(width = 0.55, fill = "#1f77b4") +
  geom_hline(yintercept = rmse_lm, linetype = "dashed") +
  geom_text(aes(label = round(rmse, 3)), vjust = -0.4, size = 3.6) +
  labs(x = NULL, y = "테스트 RMSE", title = "Final comparison") +
  theme_minimal(base_size = 12)
