# Cho UEH Marketplace

Nen tang mua ban do cu danh cho sinh vien UEH.

## Tong quan

Du an duoc xay dung bang Node.js + Express + MongoDB, su dung EJS cho giao dien server-rendered, ho tro:

- Dang ky/dang nhap bang email UEH
- Dang tin ban do, upload nhieu anh
- Tim kiem va loc san pham
- Nhan tin giua nguoi mua va nguoi ban
- Dashboard ca nhan va trang quan tri admin

## Cong nghe su dung

- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- View engine: EJS
- Auth: JWT + cookie
- Upload: Multer (luu local trong public/uploads)
- Bao mat: Helmet, CORS, rate limit

## Cau truc thu muc

```text
.
|- config/
|  |- db.js
|  `- multer.js
|- controllers/
|- middleware/
|- models/
|- public/
|  |- css/
|  |- js/
|  `- uploads/
|- routes/
|- utils/
|- views/
|- patch-products.js
|- seed.js
`- server.js
```

