# 아래의 결과를 복제하는 코드 작성

# 1단계. 초기화
M <- 100

f_tr <- 0
f_te <- 0
r <- _____

rmse_tr <- numeric(M)
rmse_te <- numeric(M)

# 2단계. 루프
for (m in 1:M) {

  stump <- rpart(
    _____ ~ .,
    data = x_train,
    maxdepth = 1,
    cp = 0
  )

  f_tr <- f_tr + predict(stump)
  f_te <- f_te + predict(stump, newdata = _____)

  rmse_tr[m] <- sqrt(mean((y_train - f_tr)^2))
  rmse_te[m] <- sqrt(mean((y_test  - f_te)^2))

  r <- _____(stump)
}

best_m <- _____(rmse_te)

# 3단계. 시각화
data.frame(
  iter = rep(1:M, 2),
  rmse = c(rmse_tr, rmse_te),
  set  = rep(c("Training", "Test"), each = M)
) |>
  ggplot(aes(iter, rmse, colour = set)) +
  geom_line(linewidth = 0.9) +
  geom_vline(xintercept = best_m, linetype = "dashed") +
  scale_colour_manual(values = c("#d62728", "#1f77b4")) +
  labs(x = "Iteration", y = "RMSE", colour = NULL) +
  theme_minimal()

c(best_iteration = best_m,
  test_rmse      = rmse_te[best_m])
