# 빈칸을 채워 코드를 완성하세요

set.seed(123)

grid <- _____(
  units   = c(_____, _____),
  lr      = c(0.005, 0.02),
  dropout = c(0, 0.3)
)

K <- _____
fold <- sample(rep(1:K, length.out = nrow(x_train)))

run_one <- function(i) {

  scores <- numeric(K)

  for (k in 1:K) {

    xa <- x_train[fold != k, ]; ya <- y_train[fold != k]
    xb <- x_train[fold == k, ]; yb <- y_train[fold == k]

    set_random_seed(42)

    m <- build_model(units = grid$units[i], lr = grid$_____[i],
                     dropout = grid$dropout[i])

    m |> fit(xa, ya, epochs = 60, batch_size = 64,
             validation_data = list(_____, _____),
             callbacks = list(callback_early_stopping(
               monitor = "val_loss", patience = 8,
               restore_best_weights = TRUE)),
             verbose = 0)

    scores[k] <- _____(as.numeric(evaluate(m, xb, yb, verbose = 0)["loss"]))
  }

  mean(scores)
}

grid$cv_rmse <- sapply(seq_len(nrow(grid)), run_one)

results <- grid |> arrange(_____) |> mutate(cv_rmse = round(cv_rmse, 4))

results

# 시각화
results |>
  mutate(label = paste0("u", units, " / lr", lr, " / d", dropout),
         label = reorder(label, -cv_rmse)) |>
  ggplot(aes(label, cv_rmse)) +
  geom_col(width = 0.6, fill = "#1f77b4") +
  geom_hline(yintercept = rmse_val_base, linetype = "dashed") +
  geom_text(aes(label = cv_rmse), hjust = -0.15, size = 3.4) +
  coord_flip() +
  labs(x = NULL, y = "교차검증 RMSE", title = "Grid search") +
  theme_minimal(base_size = 12)
