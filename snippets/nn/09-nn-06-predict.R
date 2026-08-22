# 빈칸을 채워 코드를 완성하세요

pred_keras <- _____(predict(_____, x_test, verbose = 0))

rmse_keras <- _____(_____((y_test - _____)^2))

test_df <- data.frame(x_test)
pred_lm <- predict(_____, newdata = _____)

rmse_lm <- sqrt(mean((y_test - _____)^2))

c(null = rmse_null, lm = rmse_lm, keras = rmse_keras) |> round(4)
