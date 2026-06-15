const express = require('express');
const router = express.Router();
const {
  getBudgets,
  getBudgetStatus,
  upsertBudget,
  deleteBudget
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBudgets)
  .post(upsertBudget);

router.route('/:id')
  .delete(deleteBudget);

router.get('/status/:month', getBudgetStatus);

module.exports = router;
