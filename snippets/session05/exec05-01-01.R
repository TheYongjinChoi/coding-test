# ── 1. 시뮬레이션 데이터 생성 ────────────────────────────
set.seed(42)
n <- 1000

Z1 <- rnorm(n); Z2 <- rnorm(n); Z3 <- rnorm(n)
ps_true <- plogis(1.2 * Z1 - 1.0 * Z2 + 0.8 * Z3)
D <- rbinom(n, 1, ps_true)
Y <- 2 * D + 3.0 * Z1^2 - 2.5 * Z2^2 + 1.8 * Z1 * Z2 + 4.0 * Z3 + rnorm(n)
df <- data.frame(Y, D, Z1, Z2, Z3)

# ── 2. 텍스트 정보 출력 ──────────────────────────────────
cat("=== [1] Data Frame Summary (Top 5 Rows) ===\n")
print(head(df, 5))
cat("\n")

cat("=== [2] Correlation Matrix ===\n")
cor_mat <- round(cor(df), 3)
print(cor_mat)
cat("\n")

# ── 3. ggplot2 그래프 ──
library(ggplot2)

df_long <- data.frame(
  Y = rep(df$Y, 3),
  D = rep(df$D, 3),
  Z_val = c(df$Z1, df$Z2, df$Z3),
  Z_var = rep(c("Z1 (Nonlinear increase)", "Z2 (Nonlinear decrease)", "Z3 (Strong linear)"), each = n)
)

p <- ggplot(df_long, aes(x = Z_val, y = Y, color = as.factor(D))) +
  geom_point(alpha = 0.2, size = 1.0) +
  geom_smooth(method = "gam", formula = y ~ s(x, bs = "cs"), se = FALSE, linewidth = 1.0) +
  facet_wrap(~Z_var, scales = "free_x") +
  scale_color_manual(values = c("#4E79A7", "#E15759"), name = "Treatment (D)") +
  labs(
    title = "Associations between Confounders(Z) and Outcome(Y)",
    subtitle = " ",
    x = "Confounder value (Z)",
    y = "Outcome (Y)"
  ) +
  theme_minimal(base_family = "sans") +
  theme(
    plot.title = element_text(face = "bold", size = 11, color = "#222222"),
    legend.position = "bottom"
  )

img_path <- "temp_plot.png"
ggsave(img_path, plot = p, width = 8, height = 4.2, dpi = 120)

# ── 4. 그래프 출력 ──────────────────────────
plot_base64 <- jsonlite::base64_enc(readBin(img_path, "raw", n = file.info(img_path)$size))
cat("|||PLOT_START|||", plot_base64, "|||PLOT_END|||", sep="")