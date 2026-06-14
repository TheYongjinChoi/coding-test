# 1. 잔차(Residuals) 계산 (이전 단계의 모델 활용)
y_resid <- df$Y - predict(model_y, df)
d_resid <- df$D - predict(model_d, df, type = "response") # 확률값 사용

# 2. 성향점수(PS) 기반 가중치 생성
# 처치군(D=1)은 1/ps, 대조군(D=0)은 1/(1-ps)로 가중치 부여
m_ps    <- glm(D ~ Z1 + Z2 + Z3, data = df, family = binomial)
ps      <- predict(m_ps, type = "response")
w       <- ifelse(df$D == 1, 1/ps, 1/(1-ps))

# 3. 가중 잔차 회귀 (Weighted Partialling Out)
# 잔차 회귀에 IPTW를 결합하여 편향을 완벽하게 제거
m_final <- lm(y_resid ~ d_resid, weights = w)

# 4. 결과 확인
summary(m_final)