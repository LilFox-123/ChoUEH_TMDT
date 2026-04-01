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

## Yeu cau moi truong

- Node.js 18+
- MongoDB Atlas hoac MongoDB local

## Cai dat nhanh

```bash
npm install
```

Tao file `.env` o thu muc goc voi noi dung mau:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/cho_ueh?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Chay app:

```bash
npm start
```

Mo trinh duyet tai:

- http://localhost:3000

## Scripts

- `npm start`: chay server
- `npm run dev`: chay server (hien dang trung voi start)
- `npm run seed`: xoa du lieu cu va tao du lieu mau
- `npm run patch-products`: script cap nhat du lieu san pham

## Seed du lieu mau

Du an co file seed tao user va san pham mau:

```bash
npm run seed
```

Tai khoan admin mau (sau khi seed):

- Email: `an.nguyen@st.ueh.edu.vn`
- Password: `123456`

## API chinh

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Product

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (can dang nhap, upload toi da 6 anh)
- `PUT /api/products/:id` (can dang nhap)
- `DELETE /api/products/:id` (can dang nhap)
- `GET /api/products/stats/me` (can dang nhap)

### User

- `GET /api/users/:id`
- `PUT /api/users/:id` (can dang nhap)
- `GET /api/users/:id/green-score` (can dang nhap)

### Message

- `GET /api/messages/unread-count` (can dang nhap)
- `POST /api/messages` (can dang nhap)
- `GET /api/messages/conversations` (can dang nhap)
- `GET /api/messages/:userId/:productId` (can dang nhap)

### Admin

Tat ca route admin deu yeu cau role admin:

- `GET /api/admin/stats`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `DELETE /api/admin/products/:id/images/:index`

## Deploy

## Lua chon khuyen dung: Render hoac Railway

Voi kien truc hien tai (Express server + upload local), ban nen deploy backend tren Render/Railway de on dinh hon.

Thong so co ban:

- Build command: `npm install`
- Start command: `npm start`
- Environment variables: giong file `.env` (nhat la `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`)

## Vercel co deploy duoc khong?

Co the, nhung khong toi uu cho app dang dung luu file local va chay server theo kieu lien tuc.
Neu dung Vercel, nen tach frontend/backend hoac doi phan upload sang cloud storage (Cloudinary, S3, ...).

## Bao mat va luu y

- Khong commit file `.env`
- Dung `JWT_SECRET` dai, kho doan
- Neu deploy production, dat:
  - `NODE_ENV=production`
  - `ALLOWED_ORIGINS` dung domain that
- Upload hien tai luu trong `public/uploads`, can giai phap storage ben ngoai neu scale

## Huong phat trien tiep

- Tach backend API va frontend deployment
- Them test cho controllers
- Them logging/monitoring
- Di chuyen upload sang cloud storage
- Bo sung CI/CD

## License

MIT
