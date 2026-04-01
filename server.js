const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Security Middleware ───
app.use(helmet({
  contentSecurityPolicy: false,  // Disabled for CDN scripts (Tailwind, Google Fonts)
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Quá nhiều request, vui lòng thử lại sau 15 phút' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: 'Quá nhiều lần đăng nhập/đăng ký, vui lòng thử lại sau 15 phút' }
});

// ─── Core Middleware ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static Files ───
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ─── View Engine ───
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── API Routes ───
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', apiLimiter, require('./routes/userRoutes'));
app.use('/api/products', apiLimiter, require('./routes/productRoutes'));
app.use('/api/messages', apiLimiter, require('./routes/messageRoutes'));
app.use('/api/admin', apiLimiter, require('./routes/adminRoutes'));

// ─── View Routes ───
app.use('/', require('./routes/viewRoutes'));

// ─── Error Handler ───
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ─── Start Server ───
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Chợ UEH Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🛡️  Security: Helmet + Rate Limiting + CORS active`);
});
