set.seed(123)

mtry_grid <- 1:10
oob_rmse_mtry <- numeric(length(mtry_grid))

for (j in seq_along(mtry_grid)) {

  fit_m <- ranger(
    formula   = form,
    data      = train_data,
    num.trees = 300,
    mtry      = mtry_grid[j],
    respect.unordered.factors = "order",
    verbose   = FALSE
  )

  oob_rmse_mtry[j] <- sqrt(fit_m$prediction.error)
}

plot(mtry_grid, oob_rmse_mtry, type = "b",
     xlab = "mtry", ylab = "OOB RMSE",
     main = "Effect of mtry on OOB RMSE")

cat("최적 mtry:", mtry_grid[which.min(oob_rmse_mtry)], "\n")
