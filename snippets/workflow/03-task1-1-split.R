# 아래의 결과를 복제하는 코드 작성
set.seed(123)

train_id <- _____(
  1:_____(_____),
  size = round(_____ * nrow(model_df))
)

train_data <- model_df[_____, ]
test_data  <- model_df[_____, ]

cat("전체 표본:", nrow(model_df), "\n")
cat("훈련 표본:", nrow(train_data), "\n")
cat("테스트 표본:", nrow(test_data), "\n")
