rmse_null <- sqrt(mean((y_test - mean(y_train))^2))

round(rmse_null, 4)
