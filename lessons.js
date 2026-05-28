// ============================================================
// Course content editing file — only edit this file
// check: (out, code) => correct answer condition (out=output, code=written code)
// hint: hint to show when answer is incorrect (null if none)
// ============================================================
const COURSE = {
  title: "R Coding Practice",
  chapters: [
    {
      id: 1,
      title: "Basic Syntax",
      color: "#1D9E75",
      steps: [
        {
          title: "Storing Values in Variables",
          concept: `In R, you store values in variables using the <code>&lt;-</code> operator.<br><br>
For example: <code>x &lt;- 10</code> stores the value 10 in x.<br>
To view the stored value, simply type the variable name or use <code>print(x)</code>.`,
          tasks: [
            "Store your name (as a string) in a variable called <code>name</code>",
            "Store your age (as a number) in a variable called <code>age</code>",
            "Print both variables"
          ],
          starter: `# Store values in variables\n\n`,
          check: (out, code) => code.includes('<-') && out.length > 0,
          hint: null,
          implication: `Variable assignment (<code>&lt;-</code>) is fundamental to R. Unlike Python's <code>=</code>, R makes the direction of assignment explicit. Values stored in variables are reused throughout your entire analysis pipeline — this is the starting point of reproducible research.`,
          success: "Variables stored successfully! Your foundations are getting stronger."
        },
        {
          title: "Creating Vectors",
          concept: `The core data structure in R is the <strong>vector</strong>.<br><br>
You can combine multiple values using the <code>c()</code> function.<br>
For example: <code>scores &lt;- c(85, 90, 78, 92)</code>`,
          tasks: [
            "Store five numbers in a vector called <code>scores</code>",
            "Check its length using <code>length(scores)</code>",
            "Calculate the mean using <code>mean(scores)</code>"
          ],
          starter: `# Create a vector and calculate basic statistics\n\n`,
          check: (out, code) => code.includes('c(') && code.includes('mean(') && out.length > 0,
          hint: null,
          success: "You're handling vectors with confidence!"
        }
      ]
    },
    {
      id: 2,
      title: "Causal Inference Fundamentals",
      color: "#185FA5",
      steps: [
        {
          title: "Matching with MatchIt",
          concept: `The <code>MatchIt</code> package allows you to perform propensity score matching.<br><br>
Use <code>matchit(formula, data, method)</code> to create a matching object, then<br>
inspect the results with <code>summary()</code>.`,
          tasks: [
            "Load the package with <code>library(MatchIt)</code>",
            "Run <code>matchit()</code> using the example data",
            "Inspect the results with <code>summary(m.out)</code>"
          ],
          starter: `library(MatchIt)
# Example data
data(lalonde)
# Match on treatment ~ covariates
m.out <- matchit(treat ~ age + educ + race,
                 data   = lalonde,
                 method = "nearest")
`,
          check: (out, code) => code.includes('matchit(') && out.length > 0,
          hint: null,
          success: "Matching complete! You're now able to use MatchIt."
        },
        {
          title: "Introduction to DoubleML",
          concept: `<code>DoubleML</code> is an R implementation of the<br>
Double/Debiased ML framework by Chernozhukov et al. (2018).<br><br>
<code>DoubleMLPLR</code>: Partially Linear Regression<br>
<code>DoubleMLIRM</code>: Interactive Regression Model`,
          tasks: [
            "Load <code>library(DoubleML)</code> and <code>library(mlr3learners)</code>",
            "Create a <code>DoubleMLData</code> object",
            "Fit a <code>DoubleMLPLR</code> model and call <code>$fit()</code>"
          ],
          starter: `library(DoubleML)
library(mlr3)
library(mlr3learners)
set.seed(42)
n <- 500
X <- matrix(rnorm(n * 5), n, 5)
d <- X[,1] + rnorm(n)
y <- 0.5 * d + X[,2] + rnorm(n)
df <- data.frame(y = y, d = d, X)
# Create DoubleMLData object
dml_data <- DoubleMLData$new(df,
  y_col  = "y",
  d_cols = "d"
)
# Set learners (Lasso)
lrn_l <- lrn("regr.cv_glmnet")
lrn_m <- lrn("regr.cv_glmnet")
# PLR model
dml_plr <- DoubleMLPLR$new(dml_data, ml_l = lrn_l, ml_m = lrn_m)
`,
          check: (out, code) => code.includes('DoubleMLPLR') && code.includes('$fit()') || code.includes('dml_plr$fit'),
          hint: null,
          success: "DoubleML ran successfully!"
        }
      ]
    },
    {
      id: 3,
      title: "Causal Forest",
      color: "#854F0B",
      steps: [
        {
          title: "Causal Forest with grf",
          concept: `The <code>causal_forest()</code> function from the <code>grf</code> package<br>
estimates heterogeneous treatment effects (HTE).<br><br>
Use <code>average_treatment_effect()</code> to obtain the ATE, and<br>
<code>predict()</code> to obtain individual CATEs.`,
          tasks: [
            "Load the package with <code>library(grf)</code>",
            "Run <code>causal_forest(X, Y, W)</code>",
            "Retrieve the ATE using <code>average_treatment_effect()</code>"
          ],
          starter: `library(grf)
set.seed(42)
n <- 1000
X <- matrix(rnorm(n * 5), n, 5)
W <- rbinom(n, 1, 0.5)
Y <- 2 * W + X[,1] + rnorm(n)
# Fit Causal Forest
cf <- causal_forest(X, Y, W)
# Estimate ATE
`,
          check: (out, code) => code.includes('causal_forest(') && code.includes('average_treatment_effect(') && out.length > 0,
          hint: null,
          success: "Causal Forest complete! You've estimated CATEs as well."
        }
      ]
    }
  ]
};