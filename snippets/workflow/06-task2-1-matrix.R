# 아래의 결과를 복제하는 코드 작성

# 1. 행렬 변환
x_all <- _____(rx_num ~ ., data = _____)[, -1]
y_all <- model_df$_____

# 2. 훈련테스트 분할
x_train <- x_all[_____, ]
x_test  <- x_all[_____, ]

y_train <- y_all[_____]
y_test  <- y_all[_____]

dim(x_train)
dim(x_test)
