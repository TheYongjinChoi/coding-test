library(dplyr)
library(tidyr)
library(tibble)
library(ggplot2)
library(glmnet)

# 데이터 불러오기
file_path <- DATA("ohie_all6m.rds")   # 서버에 준비된 실습 데이터

ohie <- readRDS(file_path)

if (inherits(ohie, "data.table")) ohie <- as.data.frame(ohie)

required_vars <- c(
  # 결과변수
  "rx_num_mod_6m",         # 현재 복용 중인 처방약의 종류 수

  # 처치
  "treatment_descriptive", # 건강보험 추첨 선정 여부

  # 인구학적 특성과 가구
  "female_6m", "birthyear_6m", "edu_6m", "employ_6m",
  "hhsize_6m", "num19_6m", "live_alone_6m", "live_partner_6m",
  "hhinc_pctfpl_6m",

  # 보험
  "ins_any_6m", "ins_ohp_6m", "ins_medicare_6m", "ins_employer_6m",
  "ins_months_6m",

  # 건강상태
  "health_gen_6m", "health_chg_6m", "happiness_6m",
  "baddays_phys_6m", "baddays_ment_6m", "baddays_tot_6m",
  "dep_sad_6m", "dep_interest_6m",

  # 진단력
  "dia_dx_6m", "ast_dx_6m", "hbp_dx_6m", "emp_dx_6m", "ami_dx_6m",
  "chf_dx_6m", "dep_dx_6m", "chl_dx_6m", "kid_dx_6m",

  # 의료이용
  "doc_any_6m", "doc_num_mod_6m", "er_any_6m", "er_num_mod_6m",
  "hosp_num_mod_6m", "usual_place_6m", "usual_doc_6m", "usual_clinic_6m",
  "need_med_6m", "need_rx_6m", "need_dent_6m",

  # 비용 부담과 흡연
  "cost_any_owe_6m", "cost_borrow_6m", "smk_ever_6m", "smk_curr_6m"
)

# 필요한 변수가 모두 존재하는지 확인
stopifnot(all(required_vars %in% names(ohie)))

# 사용할 변수만 선택
df <- ohie |>
  select(all_of(required_vars))

dim(df)
glimpse(df)
hist(df$rx_num_mod_6m)
