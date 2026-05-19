# 🏠 SmartHome

Website giới thiệu các thiết bị gia dụng thông minh, được xây dựng bằng **HTML, CSS, JavaScript + Vite** cho đồ án cuối kỳ môn Lập trình Web.

## ✨ Tính năng

- Landing page hiện đại
- Responsive UI
- Danh sách sản phẩm nổi bật
- Phần giới thiệu thương hiệu
- Form liên hệ
- Hỗ trợ teamwork bằng Git branch workflow
- Hỗ trợ auto reload với Vite

---

## 🛠 Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- Vite
- Git & GitHub

---

## 📁 Cấu trúc dự án

```text
LapTrinhWebCuoiKy/
│
├── public/
│
├── src/
│   └── assets/
│       ├── hero.png
│       ├── product1.png
│       ├── product2.png
│       ├── product3.png
│       └── about.png
│
├── index.html
├── style.css
├── script.js
├── main.js
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Cài đặt project

### 1. Clone project

```bash
git clone https://github.com/phmthnh/LapTrinhWebCuoiKy.git
```

### 2. Mở thư mục project

```bash
cd LapTrinhWebCuoiKy
```

### 3. Cài dependencies

```bash
npm install
```

### 4. Chạy localhost

```bash
npm run dev
```

Sau đó mở:

```text
http://localhost:5173
```

---

## 👥 Quy trình làm việc nhóm (Bắt buộc)

### ❌ Không được code trực tiếp trên `main`

Mỗi người phải tạo branch riêng.

### 1. Đồng bộ code mới nhất

```bash
git checkout main
git pull origin main
```

### 2. Tạo branch riêng

Ví dụ:

```bash
git checkout -b feature-navbar
```

hoặc

```bash
git checkout -b feature-login
```

### 3. Commit code

```bash
git add .
git commit -m "finish navbar"
```

### 4. Push branch

```bash
git push -u origin feature-navbar
```

### 5. Tạo Pull Request trên GitHub

Sau khi push:

- Vào GitHub repository
- Nhấn **Compare & Pull Request**
- Viết mô tả thay đổi
- Chờ review và merge vào `main`

---

## 📌 Quy tắc commit

Ví dụ commit message:

```text
feat: add navbar
fix: responsive mobile
style: improve hero section
refactor: clean css structure
```

---

## 🌐 Deploy

Project có thể deploy bằng:

- Vercel
- Netlify
- GitHub Pages

Khuyến nghị:

**Vercel** 🚀

---

## 📄 License

Dự án phục vụ mục đích học tập.