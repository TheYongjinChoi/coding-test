# 빈칸을 채워 코드를 완성하세요

cb_es <- callback_early_stopping(monitor = "val_loss", patience = _____,
                                 restore_best_weights = _____)

settings <- list(
  list(label = "No regularisation", dropout = 0,   l2 = 0),
  list(label = "Dropout 0.3",       dropout = _____, l2 = 0),
  list(label = "L2 0.01",           dropout = 0,   l2 = _____)
)

curves_reg   <- list()
rmse_val_reg <- numeric(length(settings))

for (i in seq_along(settings)) {

  s <- settings[[i]]

  set_random_seed(42)

  m <- build_model(units = _____, lr = 0.01,
                   dropout = s$_____, l2 = s$_____)

  h <- m |> fit(x_train, y_train, epochs = 100, batch_size = 64,
                validation_split = 0.2, callbacks = list(_____), verbose = 0)

  n_ep <- length(h$metrics$loss)

  curves_reg[[i]] <- tibble(
    epoch = rep(1:n_ep, 2),
    loss  = c(h$metrics$loss, h$metrics$val_loss),
    set   = rep(c("Training", "Validation"), each = n_ep),
    label = s$label
  )

  rmse_val_reg[i] <- sqrt(min(h$metrics$val_loss))
}

# 시각화
bind_rows(curves_reg) |>
  filter(set == "Validation") |>
  ggplot(aes(epoch, loss, colour = label)) +
  geom_line(linewidth = 0.9) +
  labs(x = "Epoch", y = "Validation MSE", colour = NULL,
       title = "Regularisation strategies") +
  theme_minimal(base_size = 12)
