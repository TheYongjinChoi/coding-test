# 1. lm() 함수를 활용한 다중 회귀분석 수행
m_reg <- lm(Y ~ D + Z1 + Z2 + Z3, data = df)

# 2. 분석 결과 확인
summary(m_reg)

# 3. 처치효과 계수 확인 (D의 계수 출력)
coef(m_reg)["D"]