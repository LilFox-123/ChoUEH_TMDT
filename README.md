<!-- BADGES -->
<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Template-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-CDN-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

# 🛒 Chợ UEH — Sàn Giao Dịch Nội Bộ Sinh Viên UEH

**🌐 Live Demo:** [https://choueh-tmdt.onrender.com](https://choueh-tmdt.onrender.com)
<img width="2498" height="1351" alt="image" src="https://github.com/user-attachments/assets/fb4209fe-a5f0-4986-88a9-41defa1cc153" />


</div>

---

## 📖 Giới thiệu

**Chợ UEH** là marketplace mua bán đồ cũ dành **riêng cho sinh viên Đại học Kinh tế TP.HCM (UEH)**, được phát triển như đồ án môn **Thương mại điện tử** năm học 2025-2026. Khác với các nền tảng thông thường như Chợ Tốt hay Facebook Marketplace, Chợ UEH tích hợp xác thực email `@student.ueh.edu.vn`, gắn mã môn học/khoa/học kỳ vào từng bài đăng, hệ thống điểm hẹn campus, và AI Assistant **Zeen** — tạo ra một hệ sinh thái giao dịch an toàn, đáng tin cậy, hoàn toàn trong khuôn khổ cộng đồng UEH.

---

## 🏆 Chợ UEH vs. Nền tảng thông thường

| Tính năng | Chợ UEH | Chợ Tốt | Facebook Marketplace |
|---|:---:|:---:|:---:|
| Xác thực email UEH (`@student.ueh.edu.vn`) | ✅ | ❌ | ❌ |
| Gắn mã môn học / khoa / học kỳ | ✅ | ❌ | ❌ |
| Điểm hẹn campus cố định (6 địa điểm) | ✅ | ❌ | ❌ |
| Bảng "Đang cần" (Wanted Board) | ✅ | ❌ | ❌ |
| UEH Green Score (điểm môi trường) | ✅ | ❌ | ❌ |
| AI Assistant nội bộ (Zeen) | ✅ | ❌ | ❌ |
| Hệ thống đánh giá người bán (Review) | ✅ | ✅ | ❌ |

---

## ✨ Tính năng chính

### 🔐 Core
- 👤 **Xác thực tài khoản** — Đăng ký/đăng nhập bằng email UEH hoặc MSSV (31xxxxxxxxxx), validate regex backend
- 📦 **Đăng tin linh hoạt** — Hỗ trợ 2 loại: bán đồ (`sell`) và bảng tìm kiếm (`wanted board`), upload tối đa 6 ảnh qua Cloudinary
- 🔍 **Tìm kiếm & Lọc nâng cao** — Full-text search, filter theo danh mục / khoa / mã môn / giá / tình trạng, sort đa tiêu chí
- 🏷️ **Filter Chips** — Badge filter có thể xóa từng tiêu chí, UX thân thiện
- 💬 **Chat 1-1** — Nhắn tin trực tiếp giữa người mua và người bán, polling 5s, unread badge trên navbar
- ⭐ **Review System** — Đánh giá người bán (1–5 sao + bình luận) sau giao dịch, chống self-review và duplicate
- 🖼️ **Product Detail** — Lightbox full-screen (prev/next/keyboard), quick-info block, chia sẻ Facebook/Zalo, report modal
- 📊 **Dashboard cá nhân** — Thống kê tin đăng + UEH Green Score badge

### 🎓 UEH Exclusive
- 📚 **UEH Context** — Gắn mã môn (`courseCode`), khoa (`faculty`), học kỳ, niên khóa, năm phù hợp vào mỗi bài đăng
- 📍 **Điểm hẹn campus** — 6 địa điểm cố định (Cơ sở A/B/N, Thư viện, Căn tin, Sảnh chính) + 4 khung giờ
- 🌱 **UEH Green Score** — Gamification môi trường: itemsReused, moneySaved, co2Reduced, level badge
- 🤖 **Zeen AI Assistant** — Chatbot nội bộ hỗ trợ sinh viên tìm sản phẩm, hướng dẫn sử dụng, gợi ý danh mục
- 🏡 **Homepage động** — Hero slider 3 slide, mascot Zeen float animation, wanted board dynamic, Green Score banner, reuse widget scroll animation
- 👤 **Seller Profile** — Trang hồ sơ công khai người bán với danh sách bài đăng và rating

### 🛡️ Security & Admin
- 🔒 **Bảo mật** — XSS protection (`escapeHTML`), ẩn email/MSSV/SĐT khỏi API công khai (`userPrivacy.js`), rate limiting, Helmet, CORS
- 🛠️ **Admin Panel** — Quản lý users & products, stats dashboard, xóa ảnh Cloudinary khi xóa sản phẩm

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                       │
│              EJS Templates + Tailwind CSS + Font Awesome        │
│              8 Client-side JS files (chat, lightbox, etc.)      │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Node.js 22)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────┐ │
│  │  Routes  │→ │Middleware│→ │Controllers│→ │    Models     │ │
│  │ (7 files)│  │JWT/Admin │  │(6 files)  │  │(User,Product, │ │
│  └──────────┘  └──────────┘  └───────────┘  │Message,Review)│ │
│                                              └───────┬───────┘ │
└──────────────────────────────────────────────────────┼─────────┘
                                                       │
                    ┌──────────────────────────────────┤
                    ▼                                  ▼
     ┌──────────────────────┐           ┌─────────────────────────┐
     │   MongoDB Atlas (M0)  │           │   Cloudinary (Images)   │
     │  Users, Products,     │           │  Upload via Multer      │
     │  Messages, Reviews    │           │  ≤6 ảnh / sản phẩm     │
     └──────────────────────┘           └─────────────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
ChoUEH_TMDT/
├── config/
│   ├── db.js                  # Kết nối MongoDB Atlas via Mongoose
│   └── multer.js              # Cấu hình Multer + Cloudinary storage
│
├── controllers/
│   ├── authController.js      # Đăng ký, đăng nhập, JWT, logout
│   ├── productController.js   # CRUD sản phẩm, search, filter, stats
│   ├── messageController.js   # Chat 1-1, unread count
│   ├── userController.js      # Profile, cập nhật thông tin
│   ├── adminController.js     # Admin dashboard, quản lý users/products
│   └── aiController.js        # Zeen AI chatbot endpoint
│
├── middleware/
│   ├── auth.js                # JWT protect + optionalAuth middleware
│   └── admin.js               # Kiểm tra role admin
│
├── models/
│   ├── User.js                # Schema người dùng UEH
│   ├── Product.js             # Schema bài đăng sản phẩm
│   ├── Message.js             # Schema tin nhắn chat
│   └── Review.js             # Schema đánh giá người bán
│
├── routes/
│   ├── authRoutes.js          # /api/auth/*
│   ├── productRoutes.js       # /api/products/*
│   ├── userRoutes.js          # /api/users/*
│   ├── messageRoutes.js       # /api/messages/*
│   ├── adminRoutes.js         # /api/admin/*
│   ├── aiRoutes.js            # /api/ai/*
│   ├── reviewRoutes.js        # /api/reviews/*
│   └── viewRoutes.js          # Server-side rendered pages (EJS)
│
├── utils/
│   └── userPrivacy.js         # Ẩn email/MSSV/SĐT khỏi public API
│
├── views/                     # 14 EJS templates
│   ├── partials/
│   │   ├── navbar.ejs
│   │   └── footer.ejs
│   ├── index.ejs              # Homepage
│   ├── login.ejs / register.ejs
│   ├── product-detail.ejs
│   ├── profile.ejs / seller-profile.ejs
│   ├── dashboard.ejs
│   ├── admin-dashboard.ejs
│   ├── admin-users.ejs
│   └── admin-products.ejs
│
├── public/
│   ├── css/                   # Custom CSS bổ sung Tailwind
│   ├── js/                    # 8 file JS client-side
│   │   ├── chat.js            # Logic chat polling
│   │   ├── lightbox.js        # Fullscreen image viewer
│   │   └── ...
│   └── images/                # Assets tĩnh (logo, mascot Zeen...)
│
├── seed.js                    # Tạo dữ liệu mẫu (xóa data cũ trước)
├── patch-products.js          # Migration: cập nhật UEH context cho products
├── server.js                  # Entry point — khởi tạo Express, routes, middleware
└── package.json
```

---

## 🗄️ Database Schema

```js
// User.js — Người dùng UEH
{
  name:         String,                  // Họ tên
  email:        String,                  // @student.ueh.edu.vn
  studentId:    String,                  // MSSV: 31xxxxxxxxxx
  phone:        String,
  department:   String,                  // Khoa / ngành
  year:         Number,                  // Năm học
  password:     String,                  // bcrypt hash
  avatar:       String,                  // Cloudinary URL
  bio:          String,
  rating:       Number,                  // Trung bình sao (1–5)
  totalReviews: Number,
  role:         { type: String, enum: ['user', 'admin'] }
}

// Product.js — Bài đăng sản phẩm
{
  title:           String,
  listingType:     { type: String, enum: ['sell', 'wanted'] },
  price:           Number,               // Nếu sell
  budgetMin:       Number,               // Nếu wanted
  budgetMax:       Number,
  urgency:         String,               // Độ ưu tiên (wanted)
  category:        String,               // 6 danh mục
  condition:       String,               // Tình trạng sản phẩm
  description:     String,
  location:        String,
  courseCode:      String,               // Mã môn học UEH
  courseName:      String,
  faculty:         String,               // Khoa UEH
  academicYear:    String,               // Niên khóa
  semester:        String,
  suitableForYear: [Number],             // Năm học phù hợp
  meetingPoints:   [String],             // Điểm hẹn campus
  preferredTimeSlots: [String],          // Khung giờ giao dịch
  images:          [String],             // Cloudinary URLs (≤6)
  seller:          { type: ObjectId, ref: 'User' },
  transactionStatus: String,
  buyerId:         { type: ObjectId, ref: 'User' },
  status:          String,
  views:           Number
}

// Message.js — Tin nhắn chat 1-1
{
  sender:   { type: ObjectId, ref: 'User' },
  receiver: { type: ObjectId, ref: 'User' },
  product:  { type: ObjectId, ref: 'Product' },
  content:  String,
  read:     Boolean
}

// Review.js — Đánh giá người bán
{
  seller:   { type: ObjectId, ref: 'User' },
  reviewer: { type: ObjectId, ref: 'User' },
  product:  { type: ObjectId, ref: 'Product' },
  rating:   { type: Number, min: 1, max: 5 },
  comment:  String,
  createdAt: Date
}
```

---

## 📡 API Reference

### 🔐 Auth — `/api/auth`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `POST` | `/register` | ❌ | Đăng ký tài khoản UEH |
| `POST` | `/login` | ❌ | Đăng nhập, trả về JWT cookie |
| `GET` | `/me` | ✅ | Lấy thông tin tài khoản hiện tại |
| `POST` | `/logout` | ✅ | Xóa JWT cookie, đăng xuất |

### 📦 Product — `/api/products`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/` | ❌ | Lấy danh sách sản phẩm (hỗ trợ filter & search) |
| `GET` | `/:id` | ❌ | Lấy chi tiết 1 sản phẩm |
| `POST` | `/` | ✅ | Đăng tin mới (sell hoặc wanted) |
| `PUT` | `/:id` | ✅ | Cập nhật bài đăng |
| `DELETE` | `/:id` | ✅ | Xóa bài đăng + ảnh Cloudinary |
| `GET` | `/stats/me` | ✅ | Thống kê bài đăng của bản thân |

### 👤 User — `/api/users`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/:id` | ❌ | Xem hồ sơ công khai người dùng |
| `PUT` | `/:id` | ✅ | Cập nhật thông tin cá nhân |
| `GET` | `/:id/green-score` | ❌ | Lấy UEH Green Score của người dùng |

### 💬 Message — `/api/messages`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `POST` | `/` | ✅ | Gửi tin nhắn |
| `GET` | `/conversations` | ✅ | Danh sách hội thoại |
| `GET` | `/:userId/:productId` | ✅ | Lịch sử chat theo sản phẩm |
| `GET` | `/unread-count` | ✅ | Số tin nhắn chưa đọc (navbar badge) |

### ⭐ Review — `/api/reviews`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/` | ❌ | Lấy review theo `?product=&reviewer=` |
| `POST` | `/` | ✅ | Đăng đánh giá người bán |

### 🤖 AI — `/api/ai`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `POST` | `/chat` | ❌ | Gửi câu hỏi tới Zeen AI Assistant |

### 🛠️ Admin — `/api/admin`

| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/stats` | ✅ Admin | Tổng quan thống kê hệ thống |
| `GET` | `/users` | ✅ Admin | Danh sách tất cả người dùng |
| `PUT` | `/users/:id` | ✅ Admin | Cập nhật thông tin người dùng |
| `DELETE` | `/users/:id` | ✅ Admin | Xóa tài khoản người dùng |
| `GET` | `/products` | ✅ Admin | Danh sách tất cả sản phẩm |
| `PUT` | `/products/:id` | ✅ Admin | Cập nhật bài đăng |
| `DELETE` | `/products/:id` | ✅ Admin | Xóa bài đăng + ảnh Cloudinary |

---

## 👥 Tài khoản demo

> Tất cả tài khoản sử dụng mật khẩu: `123456`

| Role | Email | Mật khẩu |
|------|-------|-----------|
| 🔴 Admin | `phuc.hon@st.ueh.edu.vn` | `123456` |
| 🟢 User | `bao.tran@st.ueh.edu.vn` | `123456` |
| 🟢 User | `chau.le@st.ueh.edu.vn` | `123456` |
| 🟢 User | `duy.pham@st.ueh.edu.vn` | `123456` |
| 🟢 User | `ha.vo@st.ueh.edu.vn` | `123456` |

---

## 🧰 Tech Stack

| Layer | Công nghệ | Version |
|-------|-----------|---------|
| Runtime | Node.js | 22 |
| Framework | Express | 4.18 |
| Database | MongoDB Atlas + Mongoose | M0 Free / 8.x |
| View Engine | EJS | Latest |
| Styling | Tailwind CSS (CDN) + Font Awesome 6 Free | — |
| Authentication | JWT + Cookie (httpOnly, sameSite:strict) | — |
| File Upload | Multer + multer-storage-cloudinary | — |
| Cloud Storage | Cloudinary | Free tier |
| Security | Helmet, CORS, express-rate-limit, bcryptjs | — |
| Validation | express-validator | — |
| Deploy | Render (free tier) | — |
| Keep-alive | UptimeRobot → `/ping` | — |

---

## 🚀 Hướng dẫn Deploy

### Yêu cầu cần chuẩn bị

- Tài khoản [Render](https://render.com)
- Tài khoản [MongoDB Atlas](https://cloud.mongodb.com) (cluster M0 Free)
- Tài khoản [Cloudinary](https://cloudinary.com) (Free tier)

### Các bước deploy

**Bước 1 — Clone repository & push lên GitHub**
```bash
git clone https://github.com/<your-username>/ChoUEH_TMDT.git
```
Đẩy code lên repository GitHub của bạn.

**Bước 2 — Tạo MongoDB Atlas Cluster**

Vào [cloud.mongodb.com](https://cloud.mongodb.com) → Tạo cluster M0 Free → Tạo database user → Whitelist IP `0.0.0.0/0` → Copy connection string.

**Bước 3 — Tạo Cloudinary account**

Vào [cloudinary.com](https://cloudinary.com) → Dashboard → Lấy `Cloud Name`, `API Key`, `API Secret`.

**Bước 4 — Deploy lên Render**

- Vào [render.com](https://render.com) → **New Web Service** → Connect GitHub repo
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- Thêm tất cả **Environment Variables** (bảng bên dưới)

**Bước 5 — Cài UptimeRobot keep-alive (khuyến nghị)**

Vào [uptimerobot.com](https://uptimerobot.com) → Tạo monitor HTTP → URL: `https://<your-app>.onrender.com/ping` → Interval: 5 phút (tránh server ngủ).

### 🔑 Environment Variables

| Biến | Mô tả | Ví dụ |
|------|-------|-------|
| `PORT` | Cổng server | `3000` |
| `NODE_ENV` | Môi trường chạy | `production` |
| `MONGODB_URI` | Connection string MongoDB Atlas | `mongodb+srv://...` |
| `JWT_SECRET` | Chuỗi bí mật ký JWT | `your_super_secret_key` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your_api_secret` |
| `GEMINI_API_KEY` | Google Gemini API key (Zeen AI) | `AIza...` |

---

## 📜 NPM Scripts

| Script | Lệnh | Mô tả |
|--------|------|-------|
| `start` | `node server.js` | Khởi động server production |
| `seed` | `node seed.js` | Tạo dữ liệu mẫu (**xóa toàn bộ data cũ**) |
| `patch-products` | `node patch-products.js` | Cập nhật UEH context cho các sản phẩm hiện có |

---

## 📋 Thông tin đồ án

| | |
|---|---|
| **Môn học** | Thương mại điện tử |
| **Trường** | Đại học Kinh tế TP.HCM (UEH) |
| **Năm học** | 2025 – 2026 |

---

## 📄 License

Dự án được phát hành dưới giấy phép **MIT License**. Xem chi tiết tại file [LICENSE](LICENSE).

---

> ⚠️ **Disclaimer:** Chợ UEH là đồ án học thuật được phát triển độc lập bởi sinh viên UEH. Đây **không phải sản phẩm chính thức** của Đại học Kinh tế TP.HCM. Tên và logo UEH được sử dụng với mục đích học thuật phi thương mại.
