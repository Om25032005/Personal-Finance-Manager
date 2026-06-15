const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getMonthlyTrends,
  getExpenseDistribution,
  getBudgetUtilization,
  getSavingsTrend,
  getIncomeSources,
  getFinancialHealthDetails
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes with JWT Auth
router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/monthly-income-expense', getMonthlyTrends);
router.get('/expense-distribution', getExpenseDistribution);
router.get('/budget-utilization', getBudgetUtilization);
router.get('/savings-trend', getSavingsTrend);
router.get('/income-sources', getIncomeSources);
router.get('/financial-health', getFinancialHealthDetails);

module.exports = router;
