const express = require('express');
const router = express.Router();
const { generateInsights } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.get('/insights/:month', protect, generateInsights);

module.exports = router;
