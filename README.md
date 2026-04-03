# 🚀 Chợ UEH Marketplace

[![Node.js](https://img.shields.io/badge/Node.js-v18+-informational?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-brightgreen?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.0-green?logo=mongodb)](https://mongodb.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Nền tảng mua bán đồ cũ thông minh dành riêng cho sinh viên Đại học Kinh tế TP.HCM (UEH)** 📱✨

<img width="2501" height="1275" alt="image" src="https://github.com/user-attachments/assets/ca62013d-2fb8-4351-84e0-b4f2cc711f6c" />



## ✨ Tính năng chính
| 📋 CRUD Sản phẩm | 💬 Hệ thống tin nhắn | 👑 Admin Dashboard | 🎯 UEH Exclusive |
|---|---|---|---|
| Đăng tin bán/mua đồ cũ, upload 6 ảnh | Chat 1:1 giữa người mua & bán | Quản lý user/sản phẩm | Chỉ sinh viên UEH (email + MSSV) |
| Tìm kiếm theo môn học/Khoa | Đếm tin nhắn chưa đọc | Stats tổng quan | Điểm gặp: Cơ sở A/B/N, Thư viện |
| Lọc giá/loại/gấp rút | Conversations realtime | Xóa/sửa sản phẩm | Khoa học, năm học, khung giờ |

**Các trang chính**: Home, Đăng nhập/ĐK, Sản phẩm, Chi tiết SP, Đăng tin, Dashboard, Profile, Tin nhắn, Admin.

## 🛠️ Tech Stack
```
Backend: Node.js 18+ | Express 4.x | Mongoose 8.x
Frontend: EJS | Tailwind CSS 3 (CDN) | Custom JS per page
Auth: JWT + Cookies | bcryptjs
Upload: Multer (local public/uploads)
Security: Helmet | CORS | Rate Limit (200req/15min)
```
**Dependencies chính**:
```bash
npm i express mongoose ejs multer helmet cors cookie-parser jsonwebtoken bcryptjs express-rate-limit dotenv
```

## 📂 Cấu trúc dự án
```
ChoUEH_TMDT/
├── config/           # DB connect, Multer config
├── controllers/      # Business logic (auth, product, message...)
├── middleware/       # Auth, admin check
├── models/           # User, Product, Message schemas
├── public/           # CSS/JS + uploads/
├── routes/           # API + View routes
├── utils/            # User privacy helpers
├── views/            # EJS templates + partials
├── server.js         # 🚀 Entry point
├── seed.js           # 🌱 Sample data
├── package.json      # 📦 Dependencies
└── README.md         # 📖 You're reading it!
```

## 🚀 Quick Start (5 phút)
### 1. Clone & Install
```bash
git clone <repo-url>
cd ChoUEH_TMDT
npm install
```

### 2. Environment (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cho_ueh?retryWrites=true&w=majority
JWT_SECRET=your-very-long-super-secret-key-here-at-least-32-chars
JWT_EXPIRE=30d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 3. Run
```bash
npm start
# Hoặc seed data mẫu trước:
npm run seed
```
🌐 **http://localhost:3000**

**Admin test**: `an.nguyen@st.ueh.edu.vn` / `123456`

## 🗄️ Database Schemas

### 👤 User
```js
{
  name, email (@student.ueh.edu.vn), studentId (31xxxxxxx),
  phone, department, year,
  password (hashed), avatar, bio,
  rating (0-5), totalReviews, role: ['user'|'admin']
}
```

### 📦 Product (200+ fields UEH-specific)
```js
{
  title, listingType: ['sell'|'wanted'], price/budget,
  category: ['sach','dien-tu',...], condition: ['new'|'used'],
  description, images: [], seller (ref User),
  faculty, courseCode, meetingPoints, preferredTimeSlots,
  status: ['available'|'sold'|'reserved'], views
}
```
**Indexes**: Full-text search (title/desc/course), category/price/createdAt.

### 💬 Message
Conversations tied to user/product.

## 🔌 API Endpoints

### 👤 Auth (JWT required after login)
| Method | Endpoint | Auth | Desc |
|--------|----------|------|------|
| POST | `/api/auth/register` | - | Đăng ký (UEH email/MSSV) |
| POST | `/api/auth/login` | - | Đăng nhập |
| GET | `/api/auth/me` | ✅ | Profile hiện tại |
| POST | `/api/auth/logout` | ✅ | Logout |

### 📦 Products
| Method | Endpoint | Auth | Desc |
|--------|----------|------|------|
| GET | `/api/products` | - | List + search/filter |
| GET | `/api/products/:id` | - | Detail |
| POST | `/api/products` | ✅ | Create (upload 6 imgs) |
| PUT | `/api/products/:id` | ✅ | Update |
| DELETE | `/api/products/:id` | ✅ | Delete |

### 💬 Messages
| Method | Endpoint | Auth | Desc |
|--------|----------|------|------|
| POST | `/api/messages` | ✅ | Send msg |
| GET | `/api/messages/conversations` | ✅ | List convos |
| GET | `/api/messages/:userId/:productId` | ✅ | Messages |
| GET | `/api/messages/unread-count` | ✅ | Count |

### 👑 Admin (role=admin)
| GET | `/api/admin/stats` | Stats dashboard |
|-----|---------------------|-----------------|
| GET/PUT/DEL | `/api/admin/users/:id` | Manage users |
| GET/PUT/DEL | `/api/admin/products/:id` | Manage products |

## 🎨 Views & Frontend
- **Tailwind CDN** w/ custom theme (primary: #00464d, accent: #EC6D33)
- **Custom JS**: admin.js, products.js, post-ad.js, messages.js (dynamic UI)
- **Responsive**: Mobile-first, dark mode support
- **Partials**: navbar.ejs, footer.ejs

## 🌱 Scripts hữu ích
```bash
npm start              # 🚀 Production server
npm run seed           # 🌱 Create sample users/products
npm run patch-products # 🛠️ Fix product data
```

## ☁️ Deployment Guide
### ✅ Khuyến nghị: Render/Railway (Free tier OK)
```
Build: npm install
Start: npm start
Env: MONGODB_URI*, JWT_SECRET*, NODE_ENV=production
```
**Static uploads**: public/uploads → Git ignore + external storage (Cloudinary).

### ⚠️ Vercel: Serverless limitations
- OK for API but file uploads need refactor.

## 🔒 Security & Best Practices
✅ **Implemented**:
- Helmet (CSP disabled for Tailwind)
- CORS configurable
- Rate limit API/auth
- Input validation (Mongoose)
- JWT (30d expiry)
- bcrypt (salt 10)







