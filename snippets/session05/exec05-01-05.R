# 1. 데이터 분할 (2-Fold)
n <- nrow(df)
fold <- sample(rep(1:2, length.out = n))

y_resid <- numeric(n); d_resid <- numeric(n); ps <- numeric(n)

# 2. 각 폴드별 교차 학습 (Cross-fitting)
for (f in 1:2) {
  train_df <- df[fold != f, ]; test_df  <- df[fold == f, ]
  
  # 모델 학습
  m_y <- randomForest(Y ~ Z1+Z2+Z3, data = train_df)
  m_d <- glm(D ~ Z1+Z2+Z3, data = train_df, family = binomial)
  
  # 테스트 데이터에 대한 잔차 및 PS 계산
  y_resid[fold == f] <- test_df$Y - predict(m_y, test_df)
  d_resid[fold == f] <- test_df$D - predict(m_d, test_df, type = "response")
  ps[fold == f]      <- predict(m_d, test_df, type = "response")
}

# 3. 최종 보정 및 회귀
w <- ifelse(df$D == 1, 1/ps, 1/(1-ps))
m_dml <- lm(y_resid ~ d_resid, weights = w)

summary(m_dml)