# ── 코드 실행 단축키 ──────────────────────────────────────────
# 💡 한 줄 실행 | Windows: Ctrl + Enter | Mac: Cmd + Enter

library(dplyr)
library(tidyr)
library(tibble)
library(ggplot2)

file_path <- DATA("ohie_all6m.rds")   # 서버에 준비된 실습 데이터

ohie <- readRDS(file_path)

if (inherits(ohie, "data.table")) ohie <- as.data.frame(ohie)

required_vars <- c(
  "rx_num_mod_6m",
  "treatment_descriptive",
  "female_6m", "birthyear_6m", "edu_6m", "employ_6m",
  "hhsize_6m", "num19_6m", "live_alone_6m", "live_partner_6m",
  "hhinc_pctfpl_6m",
  "ins_any_6m", "ins_ohp_6m", "ins_medicare_6m", "ins_employer_6m",
  "ins_months_6m",
  "health_gen_6m", "health_chg_6m", "happiness_6m",
  "baddays_phys_6m", "baddays_ment_6m", "baddays_tot_6m",
  "dep_sad_6m", "dep_interest_6m",
  "er_any_6m", "er_num_mod_6m", "hosp_num_mod_6m",
  "usual_place_6m", "usual_doc_6m", "usual_clinic_6m",
  "need_dent_6m",
  "cost_any_owe_6m", "cost_borrow_6m", "smk_ever_6m", "smk_curr_6m"
)

model_df <- ohie |>
  select(all_of(required_vars)) |>
  transmute(
    rx_num        = as.numeric(rx_num_mod_6m),

    treatment     = factor(treatment_descriptive),

    female        = as.integer(female_6m),
    age           = 2009 - as.numeric(birthyear_6m),
    edu           = factor(edu_6m),
    employed      = as.integer(employ_6m),
    hh_size       = as.numeric(hhsize_6m),
    num_child     = as.numeric(num19_6m),
    live_alone    = as.integer(live_alone_6m),
    live_partner  = as.integer(live_partner_6m),
    income_fpl    = as.numeric(hhinc_pctfpl_6m),

    insured       = as.integer(ins_any_6m),
    ins_ohp       = as.integer(ins_ohp_6m),
    ins_medicare  = as.integer(ins_medicare_6m),
    ins_employer  = as.integer(ins_employer_6m),
    ins_months    = as.numeric(ins_months_6m),

    health_gen    = as.numeric(health_gen_6m),
    health_chg    = as.numeric(health_chg_6m),
    happiness     = as.numeric(happiness_6m),
    baddays_phys  = as.numeric(baddays_phys_6m),
    baddays_ment  = as.numeric(baddays_ment_6m),
    baddays_tot   = as.numeric(baddays_tot_6m),
    dep_sad       = as.numeric(dep_sad_6m),
    dep_interest  = as.numeric(dep_interest_6m),

    er_any        = as.integer(er_any_6m),
    er_visits     = as.numeric(er_num_mod_6m),
    hosp_visits   = as.numeric(hosp_num_mod_6m),
    usual_place   = as.integer(usual_place_6m),
    usual_doc     = as.integer(usual_doc_6m),
    usual_clinic  = as.integer(usual_clinic_6m),
    need_dent     = as.integer(need_dent_6m),

    owe_money     = as.integer(cost_any_owe_6m),
    borrowed      = as.integer(cost_borrow_6m),
    smoke_ever    = as.integer(smk_ever_6m),
    smoke_curr    = as.numeric(smk_curr_6m)
  ) |>
  drop_na()

set.seed(123)

train_id <- sample(1:nrow(model_df), size = round(0.80 * nrow(model_df)))

# 설계행렬: 범주형은 더미로, 절편 열은 제거
x_all <- model.matrix(rx_num ~ ., data = model_df)[, -1]
y_all <- model_df$rx_num

# 표준화 기준은 훈련 데이터에서만 계산
mu  <- colMeans(x_all[train_id, ])
sdv <- apply(x_all[train_id, ], 2, sd)
sdv[sdv == 0] <- 1

x_train <- scale(x_all[train_id, ],  center = mu, scale = sdv)
x_test  <- scale(x_all[-train_id, ], center = mu, scale = sdv)

y_train <- y_all[train_id]
y_test  <- y_all[-train_id]

cat("훈련 표본:", nrow(x_train), "\n")
cat("테스트 표본:", nrow(x_test), "\n")
cat("예측변수 개수:", ncol(x_train), "\n")

summary(y_train)
