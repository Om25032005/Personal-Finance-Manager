const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { sendEmail, templates } = require('../utils/mailer');

// Helper to check budget and notify if exceeded
const checkBudgetExceeded = async (userId, category, date, userEmail, userName) => {
  try {
    const expenseDate = new Date(date);
    const year = expenseDate.getFullYear();
    const month = String(expenseDate.getMonth() + 1).padStart(2, '0');
    const monthStr = `${year}-${month}`; // YYYY-MM

    // 1. Fetch budget for this category and month
    const budget = await Budget.findOne({ userId, category, month: monthStr });
    if (!budget) return { exceeded: false };

    // 2. Fetch sum of expenses for this category and month
    const startOfMonth = new Date(year, expenseDate.getMonth(), 1);
    const endOfMonth = new Date(year, expenseDate.getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      userId,
      category,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    if (totalSpent > budget.monthlyLimit) {
      // Send alert email
      try {
        const emailTemplate = templates.budgetExceeded(category, budget.monthlyLimit, totalSpent);
        await sendEmail({
          to: userEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
      } catch (mailErr) {
        console.error('Budget exceeded email failed to send:', mailErr.message);
      }

      return {
        exceeded: true,
        limit: budget.monthlyLimit,
        spent: totalSpent
      };
    }

    return { exceeded: false };
  } catch (err) {
    console.error('Error checking budget limit:', err);
    return { exceeded: false };
  }
};

// @desc    Get all expenses for user
// @route   GET /api/expense
// @access  Private
exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new expense
// @route   POST /api/expense
// @access  Private
exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category) {
      return res.status(400).json({ success: false, message: 'Please provide amount and category' });
    }

    const expenseDate = date ? new Date(date) : new Date();

    const expense = await Expense.create({
      userId: req.user.id,
      amount,
      category,
      description,
      date: expenseDate
    });

    // Check budget limit
    const budgetAlert = await checkBudgetExceeded(
      req.user.id,
      category,
      expenseDate,
      req.user.email,
      req.user.name
    );

    res.status(201).json({
      success: true,
      data: expense,
      budgetAlert: budgetAlert.exceeded ? budgetAlert : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expense/:id
// @access  Private
exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Verify ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this expense record' });
    }

    const newDate = req.body.date ? new Date(req.body.date) : expense.date;

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Check budget limit again
    const budgetAlert = await checkBudgetExceeded(
      req.user.id,
      expense.category,
      newDate,
      req.user.email,
      req.user.name
    );

    res.status(200).json({
      success: true,
      data: expense,
      budgetAlert: budgetAlert.exceeded ? budgetAlert : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expense/:id
// @access  Private
exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    // Verify ownership
    if (expense.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this expense record' });
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
