const User = require('../models/User');
const Product = require('../models/Product');
const {
  PUBLIC_USER_SELECT,
  PRIVATE_USER_SELECT,
  sanitizePublicUser,
  canViewPrivateUserProfile
} = require('../utils/userPrivacy');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const canViewPrivateProfile = canViewPrivateUserProfile(req.user, req.params.id);
    // SECURITY: sanitized for public
    const user = await User.findById(req.params.id).select(
      canViewPrivateProfile ? PRIVATE_USER_SELECT : PUBLIC_USER_SELECT
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // SECURITY: sanitized for public
    const responseUser = canViewPrivateProfile ? user : sanitizePublicUser(user);

    res.json({ success: true, user: responseUser });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    // Only allow user to update their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa hồ sơ này'
      });
    }

    const allowedFields = ['name', 'phone', 'department', 'year', 'bio', 'avatar'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Cập nhật hồ sơ thành công',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for a seller
// @route   GET /api/users/:id/reviews
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const sellerId = req.params.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);

    // Check if Review model exists
    let Review;
    try {
      Review = require('../models/Review');
    } catch (err) {
      // Review model doesn't exist yet, return empty stub
      return res.json({
        success: true,
        reviews: [],
        total: 0
      });
    }

    const reviews = await Review.find({ seller: sellerId })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    const total = await Review.countDocuments({ seller: sellerId });

    res.json({
      success: true,
      reviews,
      total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get UEH Green Score for a user
// @route   GET /api/users/:id/green-score
// @access  Private
exports.getGreenScore = async (req, res) => {
  try {
    const isOwner = req.user && req.params.id === req.user._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem Green Score này'
      });
    }

    const soldProducts = await Product.find({
      seller: req.params.id,
      status: 'sold',
      listingType: 'sell'
    }).select('price');

    const totalItemsReused = soldProducts.length;
    const estimatedMoneySaved = soldProducts.reduce((sum, product) => {
      return sum + (Number(product.price) || 0);
    }, 0);
    const co2Reduced = Number((totalItemsReused * 0.5).toFixed(1));

    let level = 'Xanh Mới';
    let progressPercent = Math.min((totalItemsReused / 5) * 100, 100);
    let nextMilestone = 6;

    if (totalItemsReused >= 21) {
      level = 'Xanh Champion';
      progressPercent = 100;
      nextMilestone = null;
    } else if (totalItemsReused >= 6) {
      level = 'Xanh Tích Cực';
      progressPercent = Math.min(((totalItemsReused - 6) / 15) * 100, 100);
      nextMilestone = 21;
    }

    res.json({
      success: true,
      data: {
        totalItemsReused,
        estimatedMoneySaved,
        co2Reduced,
        level,
        progressPercent,
        nextMilestone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
