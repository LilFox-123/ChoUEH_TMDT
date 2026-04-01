const express = require('express');
const router = express.Router();
const { sendMessage, getConversations, getMessages, getUnreadCount } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.get('/unread-count', protect, getUnreadCount);
router.post('/', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:userId/:productId', protect, getMessages);

module.exports = router;
