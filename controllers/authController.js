const jwt = require('jsonwebtoken');
const User = require('../models/User');

const UEH_EMAIL_REGEX = /(@student\.ueh\.edu\.vn|@ueh\.edu\.vn)$/i;
const UEH_STUDENT_ID_REGEX = /^31\d{9}$/;

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/'
});

const sendAuthResponse = (res, statusCode, token, user, message) => {
  res
    .cookie('token', token, getCookieOptions())
    .status(statusCode)
    .json({
      success: true,
      message,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar,
        role: user.role
      }
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, studentId, phone, department, year, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedStudentId = studentId?.trim();

    if (!name || !email || !studentId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    if (!UEH_EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email phải là email UEH (@student.ueh.edu.vn)'
      });
    }

    if (!UEH_STUDENT_ID_REGEX.test(normalizedStudentId)) {
      return res.status(400).json({
        success: false,
        message: 'MSSV không hợp lệ'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { studentId: normalizedStudentId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc MSSV đã được sử dụng'
      });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      studentId: normalizedStudentId,
      phone,
      department: department || 'Khoa Kinh tế',
      year: year || 'Khóa 49',
      password
    });

    const token = generateToken(user._id);
    sendAuthResponse(res, 201, token, user, 'Đăng ký thành công!');
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email hoặc MSSV đã tồn tại trong hệ thống'
      });
    }

    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({
        success: false,
        message: firstError?.message || 'Dữ liệu không hợp lệ'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const credential = email?.trim().toLowerCase();

    if (!credential || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập email/MSSV và mật khẩu'
      });
    }

    const user = await User.findOne({
      $or: [{ email: credential }, { studentId: credential }]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email/MSSV hoặc mật khẩu không đúng'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email/MSSV hoặc mật khẩu không đúng'
      });
    }

    const token = generateToken(user._id);
    sendAuthResponse(res, 200, token, user, 'Đăng nhập thành công!');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Lỗi máy chủ'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  res
    .clearCookie('token', getCookieOptions())
    .json({
      success: true,
      message: 'Đăng xuất thành công'
    });
};
