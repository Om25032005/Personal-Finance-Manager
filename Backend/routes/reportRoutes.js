const express = require('express');
const router = express.Router();
const {
  getMonthlySummary,
  exportExcel,
  exportPDF
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary/:month', getMonthlySummary);
router.get('/export/excel/:month', exportExcel);
router.get('/export/pdf/:month', exportPDF);

module.exports = router;
