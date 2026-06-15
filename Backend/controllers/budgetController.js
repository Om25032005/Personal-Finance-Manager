const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// @desc    Get all budgets for user
// @route   GET /api/budget
// @access  Private
exports.getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.status(200).json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budget status for a specific month (utilization percentage)
// @route   GET /api/budget/status/:month
// @access  Private
exports.getBudgetStatus = async (req, res, next) => {
  try {
    const { month } = req.params; // Format YYYY-MM
    const budgets = await Budget.find({ userId: req.user.id, month });

    // Extract start and end of that month
    const [year, m] = month.split('-').map(Number);
    const startOfMonth = new Date(year, m - 1, 1);
    const endOfMonth = new Date(year, m, 0, 23, 59, 59);

    // Get expenses for that month
    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const utilization = budgets.map((budget) => {
      const categoryExpenses = expenses.filter((exp) => exp.category === budget.category);
      const totalSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const percent = budget.monthlyLimit > 0 ? (totalSpent / budget.monthlyLimit) * 100 : 0;

      return {
        id: budget._id,
        category: budget.category,
        monthlyLimit: budget.monthlyLimit,
        spent: totalSpent,
        utilizationPercentage: parseFloat(percent.toFixed(2)),
        isExceeded: totalSpent > budget.monthlyLimit
      };
    });

    res.status(200).json({ success: true, data: utilization });
  } catch (error) {
    next(error);
  }
};

// @desc    Upsert (create or update) budget
// @route   POST /api/budget
// @access  Private
exports.upsertBudget = async (req, res, next) => {
  try {
    const { category, monthlyLimit, month } = req.body;

    if (!category || monthlyLimit === undefined || !month) {
      return res.status(400).json({ success: false, message: 'Please provide category, monthlyLimit and month' });
    }

    // Upsert logic: find existing or create new
    const budget = await Budget.findOneAndUpdate(
      { userId: req.user.id, category, month },
      { monthlyLimit },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete budget
// @route   DELETE /api/budget/:id
// @access  Private
exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    if (budget.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this budget record' });
    }

    await budget.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
