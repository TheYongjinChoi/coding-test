ntree <- seq_len(n_bag)

rmse_path <- sapply(ntree, function(m) {
  pred_m <- rowMeans(pred_mat[, 1:m, drop = FALSE])
  sqrt(mean((pred_m - y_test)^2))
})

plot(ntree, rmse_path, type = "l", lwd = 2,
     xlab = "Number of trees", ylab = "Test RMSE")
