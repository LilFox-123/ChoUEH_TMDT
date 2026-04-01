const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, getGreenScore } = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/:id/green-score', protect, getGreenScore);
router.get('/:id', optionalAuth, getUserProfile);
router.put('/:id', protect, updateProfile);

module.exports = router;
