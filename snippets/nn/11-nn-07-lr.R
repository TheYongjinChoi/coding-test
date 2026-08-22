# 빈칸을 채워 코드를 완성하세요

lrs <- c(_____, _____, _____)

curves_lr   <- list()
rmse_val_lr <- numeric(length(lrs))

for (j in seq_along(lrs)) {

  set_random_seed(_____)

  m <- build_model(lr = _____)

  h <- m |> fit(x_train, y_train, epochs = _____, batch_size = 64,
                validation_split = 0.2, verbose = 0)

  n_ep <- length(h$metrics$loss)

  curves_lr[[j]] <- tibble(
    epoch = rep(1:n_ep, 2),
    loss  = c(h$metrics$loss, h$metrics$val_loss),
    set   = rep(c("Training", "Validation"), each = n_ep),
    label = paste0("lr = ", lrs[j])
  )

  rmse_val_lr[j] <- _____(_____(h$metrics$val_loss))
}

# 시각화
bind_rows(curves_lr) |>
  ggplot(aes(epoch, loss, colour = set)) +
  geom_line(linewidth = 0.9) +
  facet_wrap(~ label, scales = "free_y") +
  scale_colour_manual(values = c("#d62728", "#1f77b4")) +
  labs(x = "Epoch", y = "MSE", colour = NULL,
       title = "Effect of learning rate") +
  theme_minimal(base_size = 12)
