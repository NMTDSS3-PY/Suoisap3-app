# Quản lý ca trực — Thủy điện Suối Sập 3

Hướng dẫn đưa app này lên web, dùng thật, dữ liệu lưu chung cho cả tổ vận hành.

Có 2 việc phải làm: **(1) Tạo Firebase để lưu dữ liệu**, **(2) Deploy lên Vercel để có link web**.

---

## PHẦN 1 — Tạo Firebase (nơi lưu dữ liệu)

Không có bước này, app vẫn chạy nhưng **mất hết dữ liệu mỗi khi tải lại trang**.

### Bước 1.1 — Tạo dự án Firebase
1. Vào https://console.firebase.google.com, đăng nhập bằng Gmail.
2. Bấm **Add project (Thêm dự án)** → đặt tên, ví dụ `suoisap3` → bỏ chọn Google Analytics (không cần) → **Create project**.

### Bước 1.2 — Bật Firestore Database
1. Trong dự án vừa tạo, vào menu trái **Build → Firestore Database**.
2. Bấm **Create database** → chọn **Start in test mode** (cho phép đọc/ghi tự do, dễ dùng nội bộ) → chọn khu vực gần nhất (ví dụ `asia-southeast1`) → **Enable**.

> ⚠️ "Test mode" nghĩa là ai có link cũng đọc/ghi được dữ liệu — phù hợp dùng nội bộ nhà máy. Nếu muốn giới hạn người dùng, cần thêm bước xác thực đăng nhập (có thể nhờ hỗ trợ sau).

### Bước 1.3 — Lấy cấu hình kết nối
1. Bấm biểu tượng bánh răng ⚙️ cạnh "Project Overview" → **Project settings**.
2. Kéo xuống mục **Your apps** → bấm biểu tượng **</>** (Web) → đặt tên app bất kỳ → **Register app**.
3. Firebase hiện ra đoạn code có `firebaseConfig` dạng:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "suoisap3.firebaseapp.com",
     projectId: "suoisap3",
     storageBucket: "suoisap3.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
   };
   ```
4. Mở file **`src/firebase.js`** trong dự án này, thay các giá trị mẫu bằng giá trị thật anh vừa lấy được.

---

## PHẦN 2 — Đưa app lên web bằng Vercel

### Bước 2.1 — Tạo tài khoản Vercel
Vào https://vercel.com → **Sign up** → đăng nhập bằng Gmail hoặc GitHub.

### Bước 2.2 — Đưa code lên (2 cách, chọn 1)

**Cách A — Không cần biết Git (đơn giản nhất):**
1. Nén toàn bộ thư mục dự án này thành file `.zip`.
2. Vào https://vercel.com/new → kéo thả file zip vào ô upload (Vercel hỗ trợ import trực tiếp thư mục).
3. Vercel tự nhận diện đây là dự án Vite → bấm **Deploy**.

**Cách B — Qua GitHub (khuyên dùng nếu sau này cần sửa code thường xuyên):**
1. Tạo repository mới trên https://github.com, tải toàn bộ code lên đó.
2. Trên Vercel: **Add New → Project → Import Git Repository** → chọn repo vừa tạo → **Deploy**.
3. Từ giờ, mỗi lần cập nhật code trên GitHub, Vercel tự động build lại và cập nhật link.

### Bước 2.3 — Nhận link
Sau khi deploy xong (khoảng 1 phút), Vercel cấp 1 link dạng:
```
https://quan-ly-ca-truc-suoi-sap-3.vercel.app
```
Gửi link này cho anh em trong tổ vận hành là dùng được ngay trên điện thoại/máy tính.

---

## Chạy thử trên máy tính trước khi deploy (không bắt buộc)

Nếu máy tính có cài Node.js (https://nodejs.org, chọn bản LTS):

```bash
npm install
npm run dev
```

Mở trình duyệt vào địa chỉ hiện ra (thường là `http://localhost:5173`) để xem trước khi đưa lên Vercel.

---

## Cấu trúc dự án

```
src/
  App.jsx        → toàn bộ giao diện và logic của app
  firebase.js     → cấu hình kết nối Firebase (CẦN ĐIỀN THÔNG TIN THẬT)
  storage.js       → hàm đọc/ghi dữ liệu lên Firestore
  main.jsx         → điểm khởi động React
  index.css        → Tailwind CSS
package.json        → danh sách thư viện cần cài
vite.config.js       → cấu hình công cụ build
```

## Có vấn đề gì khi deploy?

Lỗi thường gặp nhất là **quên điền `firebase.js`** — lúc đó app tải lên được nhưng bấm nút gì cũng không lưu, tải lại trang là mất dữ liệu. Kiểm tra lại Bước 1.3.
