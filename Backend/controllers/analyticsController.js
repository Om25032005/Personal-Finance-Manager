const mongoose = require('mongoose');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');

// Helper to parse "YYYY-MM" string or default to current month
const getMonthRange = (monthStr) => {
  let year, month;
  if (monthStr && /^\d{4}-\d{2}$/.test(monthStr)) {
    const parts = monthStr.split('-');
    year = parseInt(parts[0]);
    month = parseInt(parts[1]);
  } else {
    const d = new Date();
    year = d.getFullYear();
    month = d.getMonth() + 1;
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // last millisecond of the month

  // Previous month range
  const prevStartDate = new Date(year, month - 2, 1);
  const prevEndDate = new Date(year, month - 1, 0, 23, 59, 59, 999);

  const formatStr = `${year}-${String(month).padStart(2, '0')}`;
  const prevFormatStr = month === 1 
    ? `${year - 1}-12` 
    : `${year}-${String(month - 1).padStart(2, '0')}`;

  return { startDate, endDate, prevStartDate, prevEndDate, currentMonthStr: formatStr, prevMonthStr: prevFormatStr };
};

// Helper to calculate percentage change
const getPercentageChange = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(1));
};

/**
 * @desc    Get dashboard KPIs, mini trends and financial score
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
exports.getDashboardAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, startDate: queryStart, endDate: queryEnd } = req.query;

    const ranges = getMonthRange(month);
    
    // Support custom date ranges if passed, else default to selected month range
    const startFilter = queryStart ? new Date(queryStart) : ranges.startDate;
    const endFilter = queryEnd ? new Date(queryEnd) : ranges.endDate;

    const userObjId = new mongoose.Types.ObjectId(userId);

    // 1. Current vs Previous Month totals using Aggregations
    const incomeAgg = await Income.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const findMonthTotal = (agg, m) => {
      const match = agg.find(item => item._id === m);
      return match ? match.total : 0;
    };

    const currentIncome = findMonthTotal(incomeAgg, ranges.currentMonthStr);
    const previousIncome = findMonthTotal(incomeAgg, ranges.prevMonthStr);
    const currentExpense = findMonthTotal(expenseAgg, ranges.currentMonthStr);
    const previousExpense = findMonthTotal(expenseAgg, ranges.prevMonthStr);

    const currentSavings = currentIncome - currentExpense;
    const previousSavings = previousIncome - previousExpense;

    // 2. Budget Utilizations
    const budgets = await Budget.find({ userId, month: ranges.currentMonthStr });
    const totalAllocatedBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

    const expenseBreakdown = await Expense.aggregate([
      { 
        $match: { 
          userId: userObjId, 
          date: { $gte: startFilter, $lte: endFilter } 
        } 
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let spentUnderBudget = 0;
    budgets.forEach(b => {
      const actualExp = expenseBreakdown.find(e => e._id === b.category);
      if (actualExp) {
        spentUnderBudget += actualExp.total;
      }
    });

    const budgetUtilization = totalAllocatedBudget > 0 
      ? parseFloat(((spentUnderBudget / totalAllocatedBudget) * 100).toFixed(1))
      : 0;

    // Previous Month budget utilization for change delta
    const prevBudgets = await Budget.find({ userId, month: ranges.prevMonthStr });
    const prevAllocated = prevBudgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
    
    const prevExpenseBreakdown = await Expense.aggregate([
      { 
        $match: { 
          userId: userObjId, 
          date: { $gte: ranges.prevStartDate, $lte: ranges.prevEndDate } 
        } 
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" }
        }
      }
    ]);

    let prevSpentUnderBudget = 0;
    prevBudgets.forEach(b => {
      const actualExp = prevExpenseBreakdown.find(e => e._id === b.category);
      if (actualExp) {
        prevSpentUnderBudget += actualExp.total;
      }
    });

    const prevBudgetUtilization = prevAllocated > 0 
      ? parseFloat(((prevSpentUnderBudget / prevAllocated) * 100).toFixed(1))
      : 0;

    // 3. Active Goals
    const goals = await Goal.find({ userId });
    const activeGoalsCount = goals.filter(g => g.savedAmount < g.targetAmount).length;

    // Previous active goals count change (mocked relative delta or computed)
    const prevActiveGoalsCount = activeGoalsCount; // simplified stable

    // 4. Financial Health Score calculation
    const healthScore = calculateHealthScore(
      currentIncome,
      currentExpense,
      budgets,
      expenseBreakdown,
      goals,
      incomeAgg
    );

    // 5. Build Mini Trends (last 6 months)
    const miniTrends = [];
    const dateHelper = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dateHelper.getFullYear(), dateHelper.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const incVal = findMonthTotal(incomeAgg, mStr);
      const expVal = findMonthTotal(expenseAgg, mStr);
      miniTrends.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: incVal,
        expense: expVal,
        savings: incVal - expVal
      });
    }

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          income: {
            value: currentIncome,
            pctChange: getPercentageChange(currentIncome, previousIncome),
            trend: miniTrends.map(t => t.income)
          },
          expense: {
            value: currentExpense,
            pctChange: getPercentageChange(currentExpense, previousExpense),
            trend: miniTrends.map(t => t.expense)
          },
          savings: {
            value: currentSavings,
            pctChange: getPercentageChange(currentSavings, previousSavings),
            trend: miniTrends.map(t => t.savings)
          },
          budgetUtilization: {
            value: budgetUtilization,
            pctChange: parseFloat((budgetUtilization - prevBudgetUtilization).toFixed(1)),
            trend: [prevBudgetUtilization, budgetUtilization]
          },
          activeGoals: {
            value: activeGoalsCount,
            pctChange: 0,
            trend: [prevActiveGoalsCount, activeGoalsCount]
          },
          financialHealth: {
            value: healthScore.score,
            rating: healthScore.rating,
            breakdown: healthScore.breakdown
          }
        },
        selectedMonth: ranges.currentMonthStr
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get monthly income vs expense line chart data (last 6 months)
 * @route   GET /api/analytics/monthly-income-expense
 * @access  Private
 */
exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const incomeAgg = await Income.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          income: { $sum: "$amount" }
        }
      }
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          expense: { $sum: "$amount" }
        }
      }
    ]);

    const trends = [];
    const dateHelper = new Date();
    // last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dateHelper.getFullYear(), dateHelper.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      
      const incObj = incomeAgg.find(item => item._id === mStr);
      const expObj = expenseAgg.find(item => item._id === mStr);

      const income = incObj ? incObj.income : 0;
      const expense = expObj ? expObj.expense : 0;
      const savings = income - expense;

      trends.push({
        month: d.toLocaleString('default', { month: 'short', year: '2-digit' }),
        income,
        expense,
        savings
      });
    }

    res.status(200).json({ success: true, data: trends });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get expense category distribution pie chart & top categories
 * @route   GET /api/analytics/expense-distribution
 * @access  Private
 */
exports.getExpenseDistribution = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, category } = req.query;
    const ranges = getMonthRange(month);

    const userObjId = new mongoose.Types.ObjectId(userId);

    const matchFilter = {
      userId: userObjId,
      date: { $gte: ranges.startDate, $lte: ranges.endDate }
    };

    if (category) {
      matchFilter.category = category;
    }

    const aggregated = await Expense.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$category",
          value: { $sum: "$amount" }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const totalExpense = aggregated.reduce((sum, item) => sum + item.value, 0);

    const response = aggregated.map(item => ({
      name: item._id,
      value: parseFloat(item.value.toFixed(2)),
      percentage: totalExpense > 0 ? parseFloat(((item.value / totalExpense) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({ success: true, data: response, totalExpense });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get budget utilization status
 * @route   GET /api/analytics/budget-utilization
 * @access  Private
 */
exports.getBudgetUtilization = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    const ranges = getMonthRange(month);

    const budgets = await Budget.find({ userId, month: ranges.currentMonthStr });

    const userObjId = new mongoose.Types.ObjectId(userId);
    const expensesGrouped = await Expense.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: ranges.startDate, $lte: ranges.endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" }
        }
      }
    ]);

    const data = budgets.map(b => {
      const actual = expensesGrouped.find(e => e._id === b.category);
      const spent = actual ? actual.spent : 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);
      const isExceeded = spent > b.monthlyLimit;

      return {
        category: b.category,
        allocated: b.monthlyLimit,
        spent: parseFloat(spent.toFixed(2)),
        remaining: parseFloat(remaining.toFixed(2)),
        utilization: b.monthlyLimit > 0 ? parseFloat(((spent / b.monthlyLimit) * 100).toFixed(1)) : 0,
        isExceeded
      };
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get savings trend & rate over past 6 months
 * @route   GET /api/analytics/savings-trend
 * @access  Private
 */
exports.getSavingsTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjId = new mongoose.Types.ObjectId(userId);

    const incomeAgg = await Income.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const expenseAgg = await Expense.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const savingsData = [];
    const dateHelper = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(dateHelper.getFullYear(), dateHelper.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const incObj = incomeAgg.find(item => item._id === mStr);
      const expObj = expenseAgg.find(item => item._id === mStr);

      const income = incObj ? incObj.total : 0;
      const expense = expObj ? expObj.total : 0;
      const savings = income - expense;
      const savingsRate = income > 0 ? parseFloat(((savings / income) * 100).toFixed(1)) : 0;

      savingsData.push({
        month: d.toLocaleString('default', { month: 'short' }),
        savings: parseFloat(savings.toFixed(2)),
        savingsRate: Math.max(0, savingsRate) // Cap negative savings rate at 0 for representation
      });
    }

    res.status(200).json({ success: true, data: savingsData });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get income source distribution
 * @route   GET /api/analytics/income-sources
 * @access  Private
 */
exports.getIncomeSources = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month, source } = req.query;
    const ranges = getMonthRange(month);

    const userObjId = new mongoose.Types.ObjectId(userId);

    const matchFilter = {
      userId: userObjId,
      date: { $gte: ranges.startDate, $lte: ranges.endDate }
    };

    if (source) {
      matchFilter.source = new RegExp(source, 'i');
    }

    const aggregated = await Income.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$source",
          value: { $sum: "$amount" }
        }
      },
      { $sort: { value: -1 } }
    ]);

    const totalIncome = aggregated.reduce((sum, item) => sum + item.value, 0);

    const response = aggregated.map(item => ({
      name: item._id,
      value: parseFloat(item.value.toFixed(2)),
      percentage: totalIncome > 0 ? parseFloat(((item.value / totalIncome) * 100).toFixed(1)) : 0
    }));

    res.status(200).json({ success: true, data: response, totalIncome });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get detailed financial health score & rating breakdown
 * @route   GET /api/analytics/financial-health
 * @access  Private
 */
exports.getFinancialHealthDetails = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    const ranges = getMonthRange(month);

    const userObjId = new mongoose.Types.ObjectId(userId);

    const incomeAgg = await Income.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" }
        }
      }
    ]);

    const currentIncome = incomeAgg.find(i => i._id === ranges.currentMonthStr)?.total || 0;

    const expensesGrouped = await Expense.aggregate([
      {
        $match: {
          userId: userObjId,
          date: { $gte: ranges.startDate, $lte: ranges.endDate }
        }
      },
      {
        $group: {
          _id: "$category",
          spent: { $sum: "$amount" }
        }
      }
    ]);

    const currentExpense = expensesGrouped.reduce((sum, e) => sum + e.spent, 0);
    const budgets = await Budget.find({ userId, month: ranges.currentMonthStr });
    const goals = await Goal.find({ userId });

    const health = calculateHealthScore(
      currentIncome,
      currentExpense,
      budgets,
      expensesGrouped,
      goals,
      incomeAgg
    );

    res.status(200).json({ success: true, data: health });
  } catch (err) {
    next(err);
  }
};

// Internal formula calculator to calculate health score out of 100
const calculateHealthScore = (income, expense, budgets, expenseBreakdown, goals, historicalIncomes) => {
  // 1. Savings Rate Score (Max 30)
  // Target savings rate = 30%
  const savings = income - expense;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  let savingsRateScore = 0;
  if (savingsRate >= 30) {
    savingsRateScore = 30;
  } else if (savingsRate > 0) {
    savingsRateScore = parseFloat(((savingsRate / 30) * 30).toFixed(1));
  }

  // 2. Budget Compliance Score (Max 30)
  // Target: No budget exceeding limit
  let budgetComplianceScore = 30;
  if (budgets.length > 0) {
    let nonExceeded = 0;
    budgets.forEach(b => {
      const actualExp = expenseBreakdown.find(e => e._id === b.category);
      const spent = actualExp ? actualExp.spent || actualExp.total || 0 : 0;
      if (spent <= b.monthlyLimit) {
        nonExceeded += 1;
      }
    });
    budgetComplianceScore = parseFloat(((nonExceeded / budgets.length) * 30).toFixed(1));
  }

  // 3. Goal Completion Score (Max 20)
  // Average completion % of active / all goals
  let goalCompletionScore = 20;
  if (goals.length > 0) {
    const totalProgress = goals.reduce((sum, g) => {
      const pct = Math.min((g.savedAmount / g.targetAmount) * 100, 100);
      return sum + pct;
    }, 0);
    const avgProgress = totalProgress / goals.length;
    goalCompletionScore = parseFloat(((avgProgress / 100) * 20).toFixed(1));
  }

  // 4. Income Stability Score (Max 20)
  // Consistent income deposits in past 3 months
  let incomeStabilityScore = 20;
  const dateHelper = new Date();
  let monthsWithIncome = 0;
  
  for (let i = 0; i < 3; i++) {
    const d = new Date(dateHelper.getFullYear(), dateHelper.getMonth() - i, 1);
    const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthlyTotal = historicalIncomes.find(h => h._id === mStr)?.total || 0;
    if (monthlyTotal > 0) {
      monthsWithIncome += 1;
    }
  }

  if (monthsWithIncome === 2) {
    incomeStabilityScore = 13.5;
  } else if (monthsWithIncome === 1) {
    incomeStabilityScore = 7;
  } else if (monthsWithIncome === 0) {
    incomeStabilityScore = 0;
  }

  const totalScore = parseFloat((savingsRateScore + budgetComplianceScore + goalCompletionScore + incomeStabilityScore).toFixed(1));

  let rating = 'Needs Improvement';
  if (totalScore >= 85) rating = 'Excellent';
  else if (totalScore >= 70) rating = 'Good';
  else if (totalScore >= 50) rating = 'Average';

  return {
    score: totalScore,
    rating,
    breakdown: {
      savingsRateScore,
      budgetComplianceScore,
      goalCompletionScore,
      incomeStabilityScore
    }
  };
};
