# 빈칸을 채워 코드를 완성하세요

# Task 2와 모든 설정이 같습니다. 바뀌는 것은 활성화 함수뿐입니다.
# 아래에서 <<< 표시가 붙은 두 줄이 Task 2와 다른 부분입니다.

set.seed(1)
n <- nrow(x_train)
p <- ncol(x_train)

n_hidden <- 5        # 은닉층 유닛 수
lr       <- 0.01     # 학습률
n_iter   <- 2000     # 경사하강 반복 횟수

# ── 초기화 ────────────────────────────────────────────────
# Task 2와 동일합니다. 시드도 같으므로 출발점이 완전히 같습니다.
# 따라서 이후 결과의 차이는 오직 활성화 함수에서만 옵니다.
W1 <- matrix(rnorm(p * n_hidden, sd = 0.1), nrow = p)   # 입력 -> 은닉층 (p × 5)
b1 <- rep(0, n_hidden)                                  # 은닉층 편향
w2 <- rnorm(n_hidden, sd = 0.1)                         # 은닉층 -> 출력
b2 <- mean(y_train)                                     # 출력 편향

loss_history_relu <- rep(NA, n_iter)

# ── 학습 시작 ────────────────────────────────────────────────

for (iter in 1:n_iter) {

  # ── 1. 순전파 ───────────────────────────────────────────
  Z    <- x_train %*% W1 + rep(b1, each = n)   # 은닉층 입력 (n × 5)

  # <<< 변경점 1: 활성화 함수
  # ReLU(z) = max(0, z). 음수는 0으로 잘라내고 양수만 통과시킵니다.
  # pmax()는 두 값을 원소별로 비교해 큰 쪽을 남기는 함수입니다.
  # 이 한 줄이 모형을 비선형으로 만듭니다.
  H    <- _____(_____, 0)

  pred <- as.vector(H %*% w2 + b2)             # 최종 예측값

  loss_history_relu[iter] <- mean((y_train - pred)^2)

  # ── 2. 역전파 ───────────────────────────────────────────
  dpred   <- 2 * (pred - y_train) / n          # 손실을 pred로 미분
  grad_w2 <- as.vector(t(H) %*% dpred)         # w2의 기울기
  grad_b2 <- sum(dpred)                        # b2의 기울기

  dH <- matrix(dpred, ncol = 1) %*% matrix(w2, nrow = 1)   # 은닉층으로 신호 전달

  # <<< 변경점 2: 활성화 함수의 도함수
  # 항등함수는 도함수가 1이라 dZ <- dH 였습니다.
  # ReLU는 z > 0에서 1, z <= 0에서 0이므로 (Z > 0)을 곱합니다.
  # (Z > 0)은 TRUE/FALSE 행렬이고 곱셈에서 1/0으로 취급됩니다.
  # 즉 순전파에서 잘린 유닛은 갱신 신호도 받지 못합니다.
  dZ <- _____ * (_____ > 0)

  grad_W1 <- t(x_train) %*% dZ                 # W1의 기울기
  grad_b1 <- colSums(dZ)                       # b1의 기울기

  # ── 3. 갱신 ─────────────────────────────────────────────
  W1 <- W1 - lr * grad_W1
  b1 <- b1 - lr * grad_b1
  w2 <- w2 - lr * grad_w2
  b2 <- b2 - lr * grad_b2
}

# ── 테스트 손실 ───────────────────────────────────────────
# 예측할 때도 학습과 같은 활성화 함수를 써야 합니다. 여기에도 pmax()가 들어갑니다.
n_test <- nrow(x_test)
Z_test <- x_test %*% W1 + rep(b1, each = n_test)
H_test <- pmax(Z_test, 0)                      # <<< 여기도 ReLU
p_test <- as.vector(H_test %*% w2 + b2)
mse_relu <- mean((y_test - p_test)^2)

# ── 두 모형 비교 ──────────────────────────────────────────
plot(loss_history, type = "l",
     ylim = range(c(loss_history, loss_history_relu)),
     xlab = "Epoch", ylab = "Training MSE",
     main = "Linear vs ReLU")
lines(loss_history_relu, lty = 2)
abline(h = mean(residuals(lm_fit)^2), col = "gray50", lty = 3)
legend("topright",
       legend = c("Linear", "ReLU", "lm()"),
       lty = c(1, 2, 3), col = c("black", "black", "gray50"), bty = "n")

c(
  test_mse_relu     = mse_relu,
  test_mse_identity = mse_id,
  test_mse_lm       = mse_lm
) |>
  round(4)
