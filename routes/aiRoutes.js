const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { chat } = require('../controllers/aiController');

// Rate limit: 10 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Bạn đang chat quá nhanh, vui lòng chờ 1 phút'
  }
});

router.post('/chat', aiLimiter, chat);

module.exports = router;
