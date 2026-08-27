const express = require('express');
const router = express.Router();
const { analyzeTicket } = require('../controllers/triageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeTicket);

module.exports = router;
