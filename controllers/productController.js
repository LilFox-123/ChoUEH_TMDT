const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');
const { PUBLIC_USER_SELECT, sanitizePublicUser } = require('../utils/userPrivacy');

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
  } else if (price === undefined || price <= 0) {
    return 'Giá bán là bắt buộc với bài đăng Đang bán';
  }

  if (budgetMin !== undefined && budgetMax !== undefined && budgetMin > budgetMax) {
    return 'Ngân sách tối đa phải lớn hơn hoặc bằng ngân sách tối thiểu';
  }

  return null;
};

const attachCourseContextOnCreate = (payload, body) => {
  const context = buildCourseContext(body);

  if (context.courseCode) payload.courseCode = context.courseCode;
  if (context.courseName) payload.courseName = context.courseName;
  if (context.faculty) payload.faculty = context.faculty;
  if (context.academicYear) payload.academicYear = context.academicYear;
  if (context.semester !== undefined) payload.semester = context.semester;
  if (context.suitableForYear.length > 0) payload.suitableForYear = context.suitableForYear;
  if (context.meetingPoints.length > 0) payload.meetingPoints = context.meetingPoints;
  if (context.preferredTimeSlots.length > 0) payload.preferredTimeSlots = context.preferredTimeSlots;
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

const attachListingContextOnCreate = (payload, body) => {
  const listing = buildListingContext(body);

  payload.listingType = listing.listingType;
  if (listing.listingType === 'wanted') {
    if (listing.budgetMin !== undefined) payload.budgetMin = listing.budgetMin;
    if (listing.budgetMax !== undefined) payload.budgetMax = listing.budgetMax;
    payload.urgency = listing.urgency || 'medium';
  } else if (listing.price !== undefined) {
    payload.price = listing.price;
  }

  return listing;
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

const handleProductError = (res, error) => {
  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return res.status(500).json({
    success: false,
    message: error.message
  });
};

exports.getProducts = async (req, res) => {
  try {
    const {
      search, category, condition, status,
      minPrice, maxPrice, sort,
      page = 1, limit = 12, seller,
      courseCode, faculty, listingType
    } = req.query;

    const query = {};
    const andFilters = [];
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
    if (condition && normalizedListingType !== 'wanted') query.condition = condition;
    // Skip status filter when fetching seller's own listings (dashboard view)
    if (seller && !status) {
      query.seller = seller;
    } else {
      query.status = status || 'available';
      if (seller) query.seller = seller;
    }
    if (courseCode) query.courseCode = { $regex: `^${normalizeText(courseCode)}`, $options: 'i' };
    if (faculty) query.faculty = faculty;
    if (normalizedListingType) query.listingType = normalizedListingType;

    if (minPrice || maxPrice) {
      const minValue = normalizeNumber(minPrice);
      const maxValue = normalizeNumber(maxPrice);

      if (normalizedListingType === 'wanted') {
        if (minValue !== undefined) {
          andFilters.push({
            $or: [
              { budgetMax: { $gte: minValue } },
              { budgetMax: { $exists: false }, budgetMin: { $gte: minValue } }
            ]
          });
        }

        if (maxValue !== undefined) {
          andFilters.push({
            $or: [
              { budgetMin: { $lte: maxValue } },
              { budgetMin: { $exists: false }, budgetMax: { $lte: maxValue } }
            ]
          });
        }
      } else {
        query.price = {};
        if (minValue !== undefined) query.price.$gte = minValue;
        if (maxValue !== undefined) query.price.$lte = maxValue;
      }
    }

    if (andFilters.length > 0) {
      query.$and = andFilters;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = normalizedListingType === 'wanted' ? { budgetMin: 1, createdAt: -1 } : { price: 1 };
    else if (sort === 'price_desc') sortOption = normalizedListingType === 'wanted' ? { budgetMax: -1, createdAt: -1 } : { price: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('seller', 'name avatar studentId rating')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    handleProductError(res, error);
  }
};

exports.getProduct = async (req, res) => {
  try {
    // SECURITY: sanitized for public
    const product = await Product.findById(req.params.id)
      .populate('seller', PUBLIC_USER_SELECT);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    const seller = product.seller;

    product.views += 1;
    await product.save();

    const productData = product.toObject();
    productData.sellerId = seller?._id?.toString() || null;
    // SECURITY: sanitized for public
    productData.seller = sanitizePublicUser(seller);

    res.json({ success: true, data: productData });
  } catch (error) {
    handleProductError(res, error);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, category, condition, description, location } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bài đăng'
      });
    }

    const listing = buildListingContext(req.body);
    const listingValidation = validateListingPayload(listing);
    if (listingValidation) {
      return res.status(400).json({
        success: false,
        message: listingValidation
      });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    const productPayload = {
      title: normalizeText(title),
      category,
      condition: condition || 'used',
      description: normalizeText(description),
      location: location || 'Cơ sở A - 59C Nguyễn Đình Chiểu',
      images,
      seller: req.user._id
    };

    attachListingContextOnCreate(productPayload, req.body);
    attachCourseContextOnCreate(productPayload, req.body);

    const product = await Product.create(productPayload);
    await product.populate('seller', 'name avatar studentId');

    res.status(201).json({
      success: true,
      message: listing.listingType === 'wanted' ? 'Đăng nhu cầu thành công!' : 'Đăng tin thành công!',
      data: product
    });
  } catch (error) {
    handleProductError(res, error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chỉnh sửa sản phẩm này'
      });
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
      return res.status(400).json({
        success: false,
        message: listingValidation
      });
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => file.path);
      updates.images = [...(product.images || []), ...newImages];
    }

    const updateOperation = {};
    if (Object.keys(updates).length > 0) updateOperation.$set = updates;
    if (Object.keys(unset).length > 0) updateOperation.$unset = unset;

    if (Object.keys(updateOperation).length === 0) {
      await product.populate('seller', 'name avatar studentId');
      return res.json({
        success: true,
        message: 'Không có thay đổi nào cần cập nhật',
        data: product
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateOperation, {
      new: true,
      runValidators: true
    }).populate('seller', 'name avatar studentId');

    res.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: product
    });
  } catch (error) {
    handleProductError(res, error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa sản phẩm này'
      });
    }

    // Xóa ảnh trên Cloudinary khi xóa sản phẩm
    if (product.images && product.images.length > 0) {
      const cloudinary = require('cloudinary').v2;
      for (const imgUrl of product.images) {
        if (imgUrl && imgUrl.includes('cloudinary.com')) {
          try {
            // Lấy public_id từ URL Cloudinary (phần sau /upload/vXXX/)
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
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    handleProductError(res, error);
  }
};

exports.getMyStats = async (req, res) => {
  try {
    const [total, available, sold] = await Promise.all([
      Product.countDocuments({ seller: req.user._id }),
      Product.countDocuments({ seller: req.user._id, status: 'available' }),
      Product.countDocuments({ seller: req.user._id, status: 'sold' })
    ]);

    const totalViews = await Product.aggregate([
      { $match: { seller: req.user._id } },
      { $group: { _id: null, views: { $sum: '$views' } } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        available,
        sold,
        views: totalViews[0]?.views || 0
      }
    });
  } catch (error) {
    handleProductError(res, error);
  }
};

const TRANSACTION_STATUSES = ['available', 'negotiating', 'deposited', 'sold'];

exports.updateTransactionStatus = async (req, res) => {
  try {
    const { transactionStatus } = req.body;

    if (!transactionStatus || !TRANSACTION_STATUSES.includes(transactionStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái giao dịch không hợp lệ'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật trạng thái sản phẩm này'
      });
    }

    product.transactionStatus = transactionStatus;

    await product.save();

    res.json({
      success: true,
      transactionStatus: product.transactionStatus
    });
  } catch (error) {
    handleProductError(res, error);
  }
};