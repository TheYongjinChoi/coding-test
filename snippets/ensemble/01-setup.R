library(dplyr)
library(tidyr)
library(tibble)
library(ggplot2)
library(rpart)
library(rpart.plot)
library(ranger)

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
  "dia_dx_6m", "ast_dx_6m", "hbp_dx_6m", "emp_dx_6m", "ami_dx_6m",
  "chf_dx_6m", "dep_dx_6m", "chl_dx_6m", "kid_dx_6m",
  "doc_any_6m", "doc_num_mod_6m", "er_any_6m", "er_num_mod_6m",
  "hosp_num_mod_6m", "usual_place_6m", "usual_doc_6m", "usual_clinic_6m",
  "need_med_6m", "need_rx_6m", "need_dent_6m",
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

    dx_diabetes   = as.integer(dia_dx_6m),
    dx_asthma     = as.integer(ast_dx_6m),
    dx_bp         = as.integer(hbp_dx_6m),
    dx_copd       = as.integer(emp_dx_6m),
    dx_heart      = as.integer(ami_dx_6m),
    dx_chf        = as.integer(chf_dx_6m),
    dx_depression = as.integer(dep_dx_6m),
    dx_chol       = as.integer(chl_dx_6m),
    dx_kidney     = as.integer(kid_dx_6m),

    doc_any       = as.integer(doc_any_6m),
    doc_visits    = as.numeric(doc_num_mod_6m),
    er_any        = as.integer(er_any_6m),
    er_visits     = as.numeric(er_num_mod_6m),
    hosp_visits   = as.numeric(hosp_num_mod_6m),
    usual_place   = as.integer(usual_place_6m),
    usual_doc     = as.integer(usual_doc_6m),
    usual_clinic  = as.integer(usual_clinic_6m),
    need_med      = as.integer(need_med_6m),
    need_rx       = as.integer(need_rx_6m),
    need_dent     = as.integer(need_dent_6m),

    owe_money     = as.integer(cost_any_owe_6m),
    borrowed      = as.integer(cost_borrow_6m),
    smoke_ever    = as.integer(smk_ever_6m),
    smoke_curr    = as.numeric(smk_curr_6m)
  ) |>
  drop_na()

set.seed(123)

train_id <- sample(1:nrow(model_df), size = round(0.80 * nrow(model_df)))

train_data <- model_df[train_id, ]
test_data  <- model_df[-train_id, ]

y_train <- train_data$rx_num
y_test  <- test_data$rx_num

x_train <- train_data |> select(-rx_num)
x_test  <- test_data  |> select(-rx_num)

form <- as.formula("rx_num ~ .")

cat("훈련 표본:", nrow(train_data), "\n")
cat("테스트 표본:", nrow(test_data), "\n")
cat("예측변수 개수:", ncol(model_df) - 1, "\n")
