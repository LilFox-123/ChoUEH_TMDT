// Admin authorization middleware
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: 'Chỉ quản trị viên mới có quyền truy cập'
  });
};

module.exports = { isAdmin };
