# 🛒 Chợ UEH — Sàn Giao Dịch Nội Bộ Sinh Viên

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-Template-B4CA65?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-CDN-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

**Nền tảng mua bán đồ cũ dành riêng cho cộng đồng sinh viên Đại học Kinh tế TP.HCM (UEH)**

[🌐 Live Demo](https://choueh-tmdt.onrender.com) · [📋 Báo cáo đồ án](#) · [🐛 Báo lỗi](../../issues)

</div>

---

## 📖 Giới thiệu

**Chợ UEH** là ứng dụng web marketplace được xây dựng như đồ án môn học Thương mại điện tử tại UEH. Nền tảng cho phép sinh viên UEH mua bán, trao đổi đồ cũ, giáo trình, thiết bị học tập trong khuôn viên trường — hoàn toàn miễn phí và an toàn.

Điểm khác biệt so với các marketplace thông thường (Chợ Tốt, Facebook Marketplace):

| Tính năng | Chợ UEH | Marketplace thông thường |
|---|:---:|:---:|
| Xác thực email UEH | ✅ | ❌ |
| Gắn mã môn học / khoa | ✅ | ❌ |
| Điểm hẹn trong campus | ✅ | ❌ |
| Bảng nhu cầu "Đang cần" | ✅ | ❌ |
| UEH Green Score | ✅ | ❌ |
| Chat nội bộ sinh viên | ✅ | ❌ |

---

## ✨ Tính năng nổi bật

### 🎓 Ngữ cảnh học phần UEH
Mỗi bài đăng có thể gắn thông tin môn học (mã môn, tên môn, khoa, học kỳ, năm phù hợp) giúp sinh viên tìm đúng giáo trình theo từng môn học.

### 📍 Điểm hẹn campus
6 địa điểm cố định trong khuôn viên UEH (Cơ sở A, B, N · Thư viện · Căn tin · Sảnh chính) kèm khung giờ giao nhận khớp lịch học.

### 📋 Bảng nhu cầu (Wanted Board)
Ngoài đăng bán, sinh viên có thể đăng "Đang cần" để người khác chủ động liên hệ khi có món phù hợp.

### ♻️ UEH Green Score
Gamification theo dõi tác động môi trường: số món đồ tái sử dụng, ước tính tiền tiết kiệm, CO₂ giảm — với 3 cấp độ Xanh Mới → Xanh Tích Cực → Xanh Champion.

### 💬 Chat nội bộ
Nhắn tin trực tiếp giữa người mua và người bán, có badge thông báo tin nhắn chưa đọc trên navbar.

### 🛡️ Bảo mật
- JWT lưu cookie `httpOnly + sameSite: strict` (không dùng localStorage)
- XSS protection — toàn bộ input render qua `escapeHTML()`
- Ẩn thông tin nhạy cảm (email, MSSV, SĐT) khỏi API công khai
- Rate limiting: 200 req/15min (API) · 20 req/15min (Auth)
- Helmet + CORS

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (Browser)               │
│         Tailwind CSS · EJS · Vanilla JS          │
└─────────────────┬───────────────────────────────┘
                  │ HTTP
┌─────────────────▼───────────────────────────────┐
│              EXPRESS SERVER (Node.js)            │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Routes  │→ │Controllers│→ │    Models    │   │
│  └──────────┘  └──────────┘  └──────┬───────┘   │
│                                     │            │
│  Middleware: Helmet · CORS · JWT     │            │
│             Rate Limit · Cookie      │            │
└─────────────────────────────────────┼────────────┘
                                      │ Mongoose
┌─────────────────────────────────────▼────────────┐
│              MongoDB Atlas (Cloud)                │
│         Users · Products · Messages               │
└───────────────────────────────────────────────────┘
```

---

## 📁 Cấu trúc thư mục

```
ChoUEH_TMDT/
├── config/
│   ├── db.js               # Kết nối MongoDB
│   └── multer.js           # Cấu hình upload ảnh
├── controllers/            # Xử lý logic nghiệp vụ
│   ├── authController.js
│   ├── productController.js
│   ├── messageController.js
│   ├── userController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js             # Xác thực JWT
│   └── admin.js            # Kiểm tra quyền admin
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Message.js
├── routes/                 # Định nghĩa API và view routes
├── utils/
│   └── userPrivacy.js      # Lọc dữ liệu nhạy cảm
├── views/                  # EJS templates
│   ├── partials/           # Navbar, Footer
│   ├── index.ejs
│   ├── products.ejs
│   ├── product-detail.ejs
│   ├── post-ad.ejs
│   ├── dashboard.ejs
│   ├── messages.ejs
│   ├── profile.ejs
│   └── admin.ejs
├── public/
│   ├── css/
│   ├── js/
│   └── uploads/
├── seed.js                 # Tạo dữ liệu mẫu
├── patch-products.js       # Cập nhật ngữ cảnh UEH cho sản phẩm
├── render.yaml             # Cấu hình deploy Render
└── server.js               # Entry point
```

---

## 👤 Tài khoản demo

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | an.nguyen@st.ueh.edu.vn | 123456 |
| User | bao.tran@st.ueh.edu.vn | 123456 |
| User | chau.le@st.ueh.edu.vn | 123456 |
| User | duy.pham@st.ueh.edu.vn | 123456 |
| User | ha.vo@st.ueh.edu.vn | 123456 |

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Mô tả |
|---|---|---|
| POST | `/api/auth/register` | Đăng ký tài khoản |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/me` | Thông tin user hiện tại |
| POST | `/api/auth/logout` | Đăng xuất |

### Products
| Method | Endpoint | Mô tả | Auth |
|---|---|---|:---:|
| GET | `/api/products` | Danh sách, tìm kiếm, lọc | ❌ |
| GET | `/api/products/:id` | Chi tiết sản phẩm | ❌ |
| POST | `/api/products` | Tạo bài đăng (upload ≤6 ảnh) | ✅ |
| PUT | `/api/products/:id` | Cập nhật bài đăng | ✅ |
| DELETE | `/api/products/:id` | Xóa bài đăng | ✅ |
| GET | `/api/products/stats/me` | Thống kê bài đăng của tôi | ✅ |

### Users
| Method | Endpoint | Mô tả | Auth |
|---|---|---|:---:|
| GET | `/api/users/:id` | Hồ sơ công khai | ❌ |
| PUT | `/api/users/:id` | Cập nhật hồ sơ | ✅ |
| GET | `/api/users/:id/green-score` | UEH Green Score | ✅ |

### Messages
| Method | Endpoint | Mô tả | Auth |
|---|---|---|:---:|
| POST | `/api/messages` | Gửi tin nhắn | ✅ |
| GET | `/api/messages/conversations` | Danh sách hội thoại | ✅ |
| GET | `/api/messages/:userId/:productId` | Tin nhắn theo sản phẩm | ✅ |
| GET | `/api/messages/unread-count` | Số tin chưa đọc | ✅ |

### Admin *(yêu cầu role admin)*
| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/admin/stats` | Thống kê tổng quan |
| GET/PUT/DELETE | `/api/admin/users/:id` | Quản lý người dùng |
| GET/PUT/DELETE | `/api/admin/products/:id` | Quản lý sản phẩm |

---

## 🗃️ Database Schema

### User
```js
{ name, email, studentId, phone, department, year,
  password (bcrypt), avatar, bio, rating, totalReviews,
  role: ['user', 'admin'] }
```

### Product
```js
{ title, listingType: ['sell', 'wanted'],
  price, budgetMin, budgetMax, urgency,
  category, condition, description, location,
  // UEH-specific fields:
  courseCode, courseName, faculty, academicYear,
  semester, suitableForYear,
  meetingPoints, preferredTimeSlots,
  images[], seller, status, views }
```

### Message
```js
{ sender, receiver, product, content, read, createdAt }
```

---

## 🛠️ Tech Stack

| Layer | Công nghệ |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 4.18 |
| Database | MongoDB Atlas + Mongoose 8 |
| View Engine | EJS 3 |
| Styling | Tailwind CSS (CDN) + Custom CSS |
| Auth | JWT + httpOnly Cookie |
| Upload | Multer |
| Security | Helmet · CORS · express-rate-limit · bcryptjs |
| Deploy | Render (free tier) |

---

## 📝 Scripts

```bash
npm start              # Chạy server
npm run seed           # Xóa data cũ và tạo data mẫu
npm run patch-products # Cập nhật ngữ cảnh UEH cho sản phẩm
```

---

## ☁️ Deploy

Dự án deploy trên **Render** (free tier) với database **MongoDB Atlas**. Dùng [UptimeRobot](https://uptimerobot.com) ping endpoint `/ping` mỗi 5 phút để tránh app bị sleep.

---

## 👨‍💻 Nhóm phát triển

Đồ án môn học **Thương mại điện tử** — Trường Đại học Kinh tế TP.HCM (UEH)
**Năm học:** 2024 – 2025

---

## 📄 License

[MIT](LICENSE) © 2024–2025 UEH Student Team
