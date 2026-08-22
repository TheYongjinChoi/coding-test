# 아래의 결과를 복제하는 코드 작성
lasso_coef <- coef(_____, s = _____)

lasso_coef_df <- tibble(
  term = _____(lasso_coef),
  estimate = _____(lasso_coef)
)

sd_x <- apply(x_train, 2, sd)

lasso_coef_df |>
  filter(term != "(Intercept)", estimate != 0) |>
  mutate(std_estimate = estimate * sd_x[term]) |>
  arrange(desc(abs(std_estimate))) |>
  print(n = 20)
