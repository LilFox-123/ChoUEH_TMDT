const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Check if review exists for a product by a reviewer
// @route   GET /api/reviews?product=:productId&reviewer=:reviewerId
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { product: productId, reviewer: reviewerId } = req.query;

    if (!productId || !reviewerId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID và Reviewer ID là bắt buộc'
      });
    }

    const review = await Review.findOne({
      product: productId,
      reviewer: reviewerId
    });

    res.json({
      success: true,
      exists: !!review,
      review: review || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const reviewerId = req.user._id;

    // Validate rating
    if (!rating || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating phải là số nguyên từ 1 đến 5'
      });
    }

    // Validate product exists
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Sản phẩm không tồn tại'
      });
    }

    const sellerId = product.seller;

    // Guard: product must be sold
    if (product.transactionStatus !== 'sold') {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm chưa hoàn thành giao dịch'
      });
    }

    // Guard: reviewer must be the buyer
    if (!product.buyerId || product.buyerId.toString() !== reviewerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Chỉ người mua mới có thể đánh giá'
      });
    }

    // Guard: reviewer must not be the seller (can't self-review)
    if (sellerId.toString() === reviewerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Không thể tự đánh giá'
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      seller: sellerId,
      reviewer: reviewerId,
      product: productId
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'Bạn đã đánh giá giao dịch này rồi'
      });
    }

    // Create the review
    const review = await Review.create({
      seller: sellerId,
      reviewer: reviewerId,
      product: productId,
      rating,
      comment: comment || ''
    });

    // Atomically update seller rating
    // newRating = ((oldRating * oldTotal) + newStars) / (oldTotal + 1)
    const seller = await User.findById(sellerId).select('rating totalReviews');
    if (seller) {
      const oldRating = seller.rating || 5.0;
      const oldTotal = seller.totalReviews || 0;
      const newTotal = oldTotal + 1;
      const newRating = ((oldRating * oldTotal) + rating) / newTotal;

      await User.findByIdAndUpdate(sellerId, {
        rating: Math.round(newRating * 10) / 10,
        totalReviews: newTotal
      });
    }

    // Populate reviewer info for response
    await review.populate('reviewer', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Đánh giá thành công',
      review
    });
  } catch (error) {
    // Handle duplicate key error from unique index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Bạn đã đánh giá giao dịch này rồi'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
