const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reviewer ID is required']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be an integer'
    }
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Compound unique index: one review per buyer per product per seller
reviewSchema.index({ seller: 1, reviewer: 1, product: 1 }, { unique: true });

// Index for querying reviews by seller
reviewSchema.index({ seller: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
