const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { getFinancialInsights } = require('../utils/aiEngine');

// @desc    Generate AI Financial Insights for user
// @route   GET /api/ai/insights/:month
// @access  Private
exports.generateInsights = async (req, res, next) => {
  try {
    const { month } = req.params; // Format YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Please provide month in YYYY-MM format' });
    }

    // 1. Fetch Incomes & Expenses for the month
    const [year, m] = month.split('-').map(Number);
    const startOfMonth = new Date(year, m - 1, 1);
    const endOfMonth = new Date(year, m, 0, 23, 59, 59);

    const incomes = await Income.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // 2. Fetch all Budgets for the month
    const budgets = await Budget.find({
      userId: req.user.id,
      month
    });

    // 3. Fetch all active Goals
    const goals = await Goal.find({
      userId: req.user.id
    });

    // 4. Calculate Stats Summary
    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    const categoryBreakdown = {};
    expenses.forEach((exp) => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    const stats = {
      totalIncome,
      totalExpense,
      netSavings,
      savingsRate,
      categoryBreakdown
    };

    // 5. Call AI Engine
    const insights = await getFinancialInsights(stats, budgets, goals);

    res.status(200).json({
      success: true,
      month,
      insights
    });
  } catch (error) {
    next(error);
  }
};
