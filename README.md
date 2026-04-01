# 🎓 Chợ UEH – Hướng Dẫn Xây Dựng & Chạy Website

## 📁 Cấu trúc dự án

```
cho-ueh-website/
├── index.html           # Trang chủ
├── product_listing.html # Danh sách sản phẩm
├── product_detail.html  # Chi tiết sản phẩm
├── post_ad.html         # Đăng tin bán đồ
├── login.html           # Đăng nhập
├── register.html        # Đăng ký tài khoản
└── messages.html        # Nhắn tin
```

---

## 🚀 CÁCH 1: Chạy ngay (không cần cài đặt)

Chỉ cần mở file `index.html` bằng trình duyệt Chrome/Edge/Firefox.
> Tất cả assets dùng CDN (Tailwind, Google Fonts, Material Icons) — cần internet.

---

## 🌐 CÁCH 2: Chạy Local Server (Khuyên dùng)

### Dùng VS Code + Live Server (Dễ nhất)
```bash
# 1. Cài VS Code: https://code.visualstudio.com
# 2. Cài extension "Live Server" (Ritwick Dey)
# 3. Chuột phải index.html → "Open with Live Server"
# → Tự động mở tại http://127.0.0.1:5500
```

### Dùng Python
```bash
cd cho-ueh-website
python3 -m http.server 8080
# Mở trình duyệt: http://localhost:8080
```

### Dùng Node.js
```bash
npx serve cho-ueh-website
# Mở: http://localhost:3000
```

---

## 💻 CÁCH 3: Deploy lên Hosting miễn phí

### Vercel (Khuyên dùng cho đồ án)
```bash
# 1. Tạo tài khoản https://vercel.com
# 2. Cài Vercel CLI
npm install -g vercel

# 3. Deploy
cd cho-ueh-website
vercel

# → Nhận link: https://cho-ueh.vercel.app
```

### Netlify (Drag & Drop)
1. Vào https://netlify.com → "Add new site"
2. Kéo thả toàn bộ folder `cho-ueh-website` vào
3. → Nhận link tự động

### GitHub Pages
```bash
# 1. Tạo repo mới trên GitHub
# 2. Upload toàn bộ file
git init
git add .
git commit -m "Chợ UEH Website"
git remote add origin https://github.com/username/cho-ueh.git
git push -u origin main

# 3. Settings → Pages → Branch: main → Save
# → Link: https://username.github.io/cho-ueh
```

---

## 🗄️ DATABASE – Hướng dẫn tích hợp

### Option A: Firebase Firestore (Miễn phí, Phù hợp nhất)

**Bước 1: Tạo project Firebase**
1. Vào https://console.firebase.google.com
2. "Create Project" → Đặt tên "cho-ueh"
3. Tắt Google Analytics → "Create"

**Bước 2: Tạo Firestore Database**
1. "Build" → "Firestore Database" → "Create database"
2. Chọn "Start in test mode" (dùng thử)
3. Chọn vùng: `asia-southeast1` (Singapore)

**Bước 3: Lấy config và nhúng vào HTML**

Thêm vào trước `</body>` trong mỗi file HTML:
```html
<!-- Firebase SDK -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
  import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "cho-ueh.firebaseapp.com",
    projectId: "cho-ueh",
    storageBucket: "cho-ueh.appspot.com",
    messagingSenderId: "YOUR_ID",
    appId: "YOUR_APP_ID"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  // === ĐĂNG KÝ ===
  async function registerUser(email, password, studentId, fullName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      email, fullName, studentId,
      createdAt: new Date()
    });
    return userCredential;
  }

  // === ĐĂNG TIN ===
  async function postAd(title, price, category, condition, description, location) {
    const docRef = await addDoc(collection(db, "products"), {
      title, price: Number(price), category, condition,
      description, location,
      sellerId: auth.currentUser?.uid,
      status: "available",
      createdAt: new Date()
    });
    return docRef.id;
  }

  // === LẤY SẢN PHẨM ===
  async function getProducts() {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // === TIN NHẮN ===
  async function sendMessage(receiverId, productId, text) {
    await addDoc(collection(db, "messages"), {
      senderId: auth.currentUser?.uid,
      receiverId, productId, text,
      timestamp: new Date()
    });
  }

  window.uehDB = { registerUser, postAd, getProducts, sendMessage };
</script>
```

**Cấu trúc Firestore Collections:**
```
/users/{userId}
  - uid, email, fullName, studentId, department, year, rating

/products/{productId}
  - title, price, category, condition, description
  - location (campus), images[], sellerId, status
  - createdAt

/messages/{msgId}
  - senderId, receiverId, productId, text, timestamp

/transactions/{txId}
  - buyerId, sellerId, productId, status, createdAt
```

---

### Option B: Supabase (PostgreSQL, Mạnh hơn)

```bash
# 1. Tạo project tại https://supabase.com
# 2. Vào SQL Editor, tạo tables:

CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  student_id TEXT UNIQUE,
  department TEXT,
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  category TEXT,
  condition TEXT CHECK (condition IN ('new', 'used')),
  description TEXT,
  location TEXT,
  seller_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'available',
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

# 3. Nhúng vào HTML:
```
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script>
  const { createClient } = supabase;
  const db = createClient('https://YOUR_PROJECT.supabase.co', 'YOUR_ANON_KEY');
  
  // Lấy sản phẩm
  const { data: products } = await db.from('products')
    .select('*, users(full_name)')
    .order('created_at', { ascending: false });
    
  // Đăng ký
  const { data, error } = await db.auth.signUp({ email, password });
</script>
```

---

## 🖼️ Xử lý Upload Ảnh

### Firebase Storage
```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
const storage = getStorage();

async function uploadImage(file) {
  const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
```

---

## 📱 Tóm tắt Tech Stack Đề xuất

| Thành phần | Công nghệ | Chi phí |
|---|---|---|
| Frontend | HTML + Tailwind CSS | Miễn phí |
| Icons | Material Symbols | Miễn phí |
| Auth + Database | Firebase | Miễn phí (Spark plan) |
| Image Storage | Firebase Storage | Miễn phí (5GB) |
| Hosting | Vercel / Netlify | Miễn phí |
| Realtime Chat | Firebase Realtime DB | Miễn phí |

---

## 🔗 Điều hướng giữa các trang

| Trang | File | Truy cập từ |
|---|---|---|
| Trang chủ | `index.html` | Navbar logo |
| Danh sách SP | `product_listing.html` | Navbar, Categories |
| Chi tiết SP | `product_detail.html` | Click vào sản phẩm |
| Đăng tin | `post_ad.html` | Nút "Đăng tin" |
| Đăng nhập | `login.html` | Nút "Đăng nhập" |
| Đăng ký | `register.html` | Link từ Login |
| Nhắn tin | `messages.html` | Nút "Nhắn tin" SP |

---

## 📝 Ghi chú cho Đồ án

- **Màu chủ đạo:** `#005F69` (UEH Teal), `#EC6D33` (UEH Orange), `#23527C` (UEH Navy)
- **Font chữ:** Plus Jakarta Sans (UI) + Playfair Display (Logo UEH)
- **Logo:** Biểu tượng mũ tốt nghiệp + chữ UEH font serif đặc trưng
- **Target:** Sinh viên UEH, email @st.ueh.edu.vn
- **Tham khảo:** Chợ Tốt (chotot.com) + Facebook Chợ Sinh Viên UEH
