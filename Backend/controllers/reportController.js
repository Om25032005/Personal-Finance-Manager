const Income = require('../models/Income');
const Expense = require('../models/Expense');
const { generateExcelReport } = require('../utils/excelGenerator');
const { generatePDFReport } = require('../utils/pdfGenerator');

// Helper to fetch monthly income and expenses
const getMonthlyData = async (userId, monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const incomes = await Income.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  }).sort({ date: 1 });

  const expenses = await Expense.find({
    userId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  }).sort({ date: 1 });

  return { incomes, expenses };
};

// @desc    Get monthly summary statistics (JSON)
// @route   GET /api/reports/summary/:month
// @access  Private
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const { month } = req.params; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Please provide month in YYYY-MM format' });
    }

    const { incomes, expenses } = await getMonthlyData(req.user.id, month);

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? parseFloat(((netSavings / totalIncome) * 100).toFixed(2)) : 0;

    // Calculate category wise breakdown
    const categoryBreakdown = {};
    expenses.forEach((exp) => {
      categoryBreakdown[exp.category] = (categoryBreakdown[exp.category] || 0) + exp.amount;
    });

    res.status(200).json({
      success: true,
      data: {
        month,
        totalIncome,
        totalExpense,
        netSavings,
        savingsRate,
        incomeCount: incomes.length,
        expenseCount: expenses.length,
        categoryBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export Excel report
// @route   GET /api/reports/export/excel/:month
// @access  Private
exports.exportExcel = async (req, res, next) => {
  try {
    const { month } = req.params; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Please provide month in YYYY-MM format' });
    }

    const { incomes, expenses } = await getMonthlyData(req.user.id, month);

    const workbook = await generateExcelReport(incomes, expenses, month);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financial_report_${month}.xlsx`
    );

    await workbook.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

// @desc    Export PDF report
// @route   GET /api/reports/export/pdf/:month
// @access  Private
exports.exportPDF = async (req, res, next) => {
  try {
    const { month } = req.params; // YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: 'Please provide month in YYYY-MM format' });
    }

    const { incomes, expenses } = await getMonthlyData(req.user.id, month);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=financial_report_${month}.pdf`
    );

    generatePDFReport(incomes, expenses, month, req.user, res);
  } catch (error) {
    next(error);
  }
};
