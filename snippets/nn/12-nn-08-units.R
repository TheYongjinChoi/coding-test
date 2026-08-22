# 빈칸을 채워 코드를 완성하세요

units_list <- c(_____, _____, _____)

curves_u   <- list()
rmse_val_u <- numeric(length(units_list))

for (j in seq_along(units_list)) {

  set_random_seed(42)

  m <- build_model(units = _____, lr = _____)

  h <- m |> fit(x_train, y_train, epochs = _____, batch_size = 64,
                validation_split = 0.2, verbose = 0)

  n_ep <- length(h$metrics$loss)

  curves_u[[j]] <- tibble(
    epoch = rep(1:n_ep, 2),
    loss  = c(h$metrics$loss, h$metrics$val_loss),
    set   = rep(c("Training", "Validation"), each = n_ep),
    label = paste0("units = ", units_list[j])
  )

  rmse_val_u[j] <- sqrt(min(h$metrics$_____))
}

# 시각화
bind_rows(curves_u) |>
  ggplot(aes(epoch, loss, colour = set)) +
  geom_line(linewidth = 0.9) +
  facet_wrap(~ label, scales = "free_y") +
  scale_colour_manual(values = c("#d62728", "#1f77b4")) +
  labs(x = "Epoch", y = "MSE", colour = NULL,
       title = "Effect of hidden units") +
  theme_minimal(base_size = 12)
