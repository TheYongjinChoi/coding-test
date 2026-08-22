# 빈칸을 채워 코드를 완성하세요

history <- model |> _____(
  x = _____,
  y = _____,
  epochs = _____,
  batch_size = 64,
  validation_split = _____,
  verbose = 0
)

n_ep <- length(history$metrics$loss)

hist_df <- tibble(
  epoch = rep(1:n_ep, 2),
  loss  = c(history$metrics$_____, history$metrics$_____),
  set   = rep(c("Training", "Validation"), each = n_ep)
)

ggplot(hist_df, aes(epoch, loss, colour = set)) +
  geom_line(linewidth = 0.9) +
  scale_colour_manual(values = c("#d62728", "#1f77b4")) +
  labs(x = "Epoch", y = "MSE", colour = NULL,
       title = "Learning curve") +
  theme_minimal(base_size = 13)
