const User = require('../models/User');
const Product = require('../models/Product');
const Message = require('../models/Message');
const cloudinary = require('cloudinary').v2;

const MEETING_POINT_OPTIONS = [
  'Cơ sở A - 59 Nguyễn Đình Chiểu',
  'Cơ sở B - 279 Nguyễn Tri Phương',
  'Cơ sở N - Nguyễn Văn Linh',
  'Thư viện',
  'Căn tin',
  'Sảnh chính'
];

const PREFERRED_TIME_SLOT_OPTIONS = [
  'Sau tiết 2',
  'Sau tiết 4',
  'Buổi trưa 11h-13h',
  'Buổi chiều 15h-17h'
];

const LISTING_TYPES = ['sell', 'wanted'];
const URGENCY_LEVELS = ['low', 'medium', 'high'];

const normalizeText = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeListingType = (value, fallback = 'sell') => {
  const normalized = normalizeText(value);
  return LISTING_TYPES.includes(normalized) ? normalized : fallback;
};

const normalizeUrgency = (value, fallback = 'medium') => {
  const normalized = normalizeText(value);
  return URGENCY_LEVELS.includes(normalized) ? normalized : fallback;
};

const parseSuitableForYear = (value) => {
  const rawValues = Array.isArray(value) ? value : value !== undefined ? [value] : [];
  return [...new Set(
    rawValues
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item >= 1 && item <= 4)
  )];
};

const parseAllowedStringArray = (value, allowedValues) => {
  const rawValues = Array.isArray(value) ? value : value !== undefined ? [value] : [];
  return [...new Set(
    rawValues
      .map((item) => normalizeText(item))
      .filter((item) => allowedValues.includes(item))
  )];
};

const buildCourseContext = (body) => {
  const courseCode = normalizeText(body.courseCode).toUpperCase();
  const courseName = normalizeText(body.courseName);
  const faculty = normalizeText(body.faculty);
  const academicYear = normalizeText(body.academicYear);
  const suitableForYear = parseSuitableForYear(body.suitableForYear);
  const meetingPoints = parseAllowedStringArray(body.meetingPoints, MEETING_POINT_OPTIONS);
  const preferredTimeSlots = parseAllowedStringArray(body.preferredTimeSlots, PREFERRED_TIME_SLOT_OPTIONS);

  let semester;
  if (body.semester !== undefined && body.semester !== null && body.semester !== '') {
    semester = Number(body.semester);
  }

  return {
    courseCode,
    courseName,
    faculty,
    academicYear,
    semester,
    suitableForYear,
    meetingPoints,
    preferredTimeSlots
  };
};

const buildListingContext = (body, fallbackType = 'sell') => {
  const listingType = normalizeListingType(body.listingType, fallbackType);

  return {
    listingType,
    price: normalizeNumber(body.price),
    budgetMin: normalizeNumber(body.budgetMin),
    budgetMax: normalizeNumber(body.budgetMax),
    urgency: listingType === 'wanted' && body.urgency !== undefined && body.urgency !== ''
      ? normalizeUrgency(body.urgency, 'medium')
      : undefined
  };
};

const validateListingPayload = ({ listingType, price, budgetMin, budgetMax }) => {
  if (listingType === 'wanted') {
    if (budgetMin === undefined && budgetMax === undefined) {
      return 'Vui lòng nhập ngân sách mong muốn';
    }
  } else if (price === undefined) {
    return 'Vui lòng nhập giá bán';
  }

  if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
    return 'Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu';
  }

  return null;
};

const attachCourseContextOnUpdate = (updates, unset, body) => {
  const context = buildCourseContext(body);
  const textFields = ['courseCode', 'courseName', 'faculty', 'academicYear'];

  textFields.forEach((field) => {
    if (body[field] !== undefined) {
      if (context[field]) updates[field] = context[field];
      else unset[field] = 1;
    }
  });

  if (body.semester !== undefined) {
    if (context.semester !== undefined) updates.semester = context.semester;
    else unset.semester = 1;
  }

  if (body.suitableForYear !== undefined) {
    updates.suitableForYear = context.suitableForYear;
  }

  if (body.meetingPoints !== undefined) {
    updates.meetingPoints = context.meetingPoints;
  }

  if (body.preferredTimeSlots !== undefined) {
    updates.preferredTimeSlots = context.preferredTimeSlots;
  }
};

const attachListingContextOnUpdate = (updates, unset, body, existingProduct) => {
  const listing = buildListingContext(body, existingProduct.listingType || 'sell');
  const nextListingType = body.listingType !== undefined
    ? listing.listingType
    : existingProduct.listingType || 'sell';

  if (body.listingType !== undefined) {
    updates.listingType = listing.listingType;
  }

  if (nextListingType === 'wanted') {
    unset.price = 1;

    if (body.budgetMin !== undefined) {
      if (listing.budgetMin !== undefined) updates.budgetMin = listing.budgetMin;
      else unset.budgetMin = 1;
    }

    if (body.budgetMax !== undefined) {
      if (listing.budgetMax !== undefined) updates.budgetMax = listing.budgetMax;
      else unset.budgetMax = 1;
    }

    if (body.urgency !== undefined) {
      updates.urgency = listing.urgency || 'medium';
    } else if (body.listingType !== undefined && existingProduct.listingType !== 'wanted') {
      updates.urgency = listing.urgency || existingProduct.urgency || 'medium';
    }
  } else {
    if (body.price !== undefined) {
      if (listing.price !== undefined) updates.price = listing.price;
      else unset.price = 1;
    }

    if (body.listingType !== undefined || body.budgetMin !== undefined) unset.budgetMin = 1;
    if (body.listingType !== undefined || body.budgetMax !== undefined) unset.budgetMax = 1;
    if (body.listingType !== undefined || body.urgency !== undefined) unset.urgency = 1;
  }

  return {
    listingType: nextListingType,
    price: body.price !== undefined ? listing.price : existingProduct.price,
    budgetMin: body.budgetMin !== undefined ? listing.budgetMin : existingProduct.budgetMin,
    budgetMax: body.budgetMax !== undefined ? listing.budgetMax : existingProduct.budgetMax
  };
};

// Helper: xóa ảnh trên Cloudinary theo URL
const deleteCloudinaryImage = async (imgUrl) => {
  if (imgUrl && imgUrl.includes('cloudinary.com')) {
    try {
      const parts = imgUrl.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex !== -1) {
        const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
        const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error.message);
    }
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalMessages, recentProducts, recentUsers] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Message.countDocuments(),
      Product.find().sort({ createdAt: -1 }).limit(5).populate('seller', 'name'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email studentId role createdAt')
    ]);

    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalMessages,
        productsByCategory
      },
      recentProducts,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'phone', 'department', 'year', 'role', 'bio'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    res.json({ success: true, message: 'Cập nhật thành công', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Không thể xóa chính mình' });
    }

    // Xóa ảnh trên Cloudinary khi xóa user
    const products = await Product.find({ seller: req.params.id });
    for (const product of products) {
      if (product.images) {
        for (const img of product.images) {
          await deleteCloudinaryImage(img);
        }
      }
    }

    await Product.deleteMany({ seller: req.params.id });
    await Message.deleteMany({ $or: [{ sender: req.params.id }, { receiver: req.params.id }] });
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Xóa người dùng thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 20, faculty, listingType } = req.query;
    const query = {};
    const normalizedListingType = normalizeListingType(listingType, '');

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { courseName: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (faculty) query.faculty = faculty;
    if (normalizedListingType) query.listingType = normalizedListingType;

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name email studentId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const allowedFields = ['title', 'category', 'condition', 'description', 'location', 'status'];
    const updates = {};
    const unset = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        const value = typeof req.body[field] === 'string' ? req.body[field].trim() : req.body[field];
        updates[field] = value;
      }
    });

    const nextListingState = attachListingContextOnUpdate(updates, unset, req.body, product);
    attachCourseContextOnUpdate(updates, unset, req.body);

    const listingValidation = validateListingPayload(nextListingState);
    if (listingValidation) {
      return res.status(400).json({ success: false, message: listingValidation });
    }

    // Dùng file.path để lấy URL Cloudinary
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      updates.images = [...(product.images || []), ...newImages];
    }

    const updateOperation = {};
    if (Object.keys(updates).length > 0) updateOperation.$set = updates;
    if (Object.keys(unset).length > 0) updateOperation.$unset = unset;

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateOperation, {
      new: true,
      runValidators: true
    }).populate('seller', 'name email studentId');

    res.json({ success: true, message: 'Cập nhật thành công', data: updatedProduct });
  } catch (error) {
    const statusCode = error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Xóa ảnh trên Cloudinary
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await deleteCloudinaryImage(img);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    const index = Number.parseInt(req.params.index, 10);
    if (index < 0 || index >= product.images.length) {
      return res.status(400).json({ success: false, message: 'Chỉ số ảnh không hợp lệ' });
    }

    // Xóa ảnh trên Cloudinary
    await deleteCloudinaryImage(product.images[index]);

    product.images.splice(index, 1);
    await product.save();
    await product.populate('seller', 'name email studentId');

    res.json({ success: true, message: 'Xóa ảnh thành công', data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
