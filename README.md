# SmartHome — Website Thiết Bị Gia Dụng Thông Minh

SmartHome là website thương mại điện tử frontend giới thiệu và bán các thiết bị gia dụng thông minh, được xây dựng cho đồ án cuối kỳ môn Lập trình Web. Dự án triển khai đầy đủ luồng người dùng từ trang chủ, danh mục sản phẩm, trang chi tiết sản phẩm, giỏ hàng, thanh toán cho đến đăng nhập/đăng ký — hoàn toàn bằng HTML, CSS và JavaScript thuần, chạy qua Vite.

**Repository:** https://github.com/phmthnh/LapTrinhWebCuoiKy.git

---

## Mục tiêu dự án

- Xây dựng website giới thiệu và bán sản phẩm đồ gia dụng thông minh với giao diện Premium hiện đại.
- Luyện tập HTML5, CSS3, JavaScript thuần (ES Modules) và quy trình build bằng Vite.
- Triển khai đầy đủ các trang: trang chủ, danh mục, chi tiết sản phẩm, giỏ hàng, thanh toán, đăng nhập.
- Xử lý tương tác phía client: mega menu, tìm kiếm, lọc sản phẩm, giỏ hàng (`localStorage`), xác thực người dùng.
- Đảm bảo giao diện đồng bộ, responsive và có trải nghiệm người dùng mượt mà.

---

## Tính năng

### Trang chủ `index.html`

- **Header cố định (sticky)** với hiệu ứng scroll: nền trắng + shadow khi cuộn.
- **Mega menu "Products"** dropdown hiển thị 4 danh mục sản phẩm với icon và mô tả.
- **Hero section** với hình ảnh nổi bật và call-to-action.
- **Section "Sản phẩm nổi bật"**: 4 sản phẩm mẫu với nút "Xem thêm" trỏ thẳng vào trang chi tiết sản phẩm tương ứng.
- **Section Technology**: giới thiệu công nghệ nền tảng của SmartHome.
- **Testimonials**: đánh giá khách hàng.
- **Footer** đa cột với liên kết điều hướng.
- **Mini Cart**: hover vào icon giỏ hàng hiện danh sách sản phẩm + tổng tiền + nút checkout.
- **Mobile menu** hoạt động đầy đủ với hamburger button.

### Trang danh mục sản phẩm

Có **5 trang catalog** với giao diện đồng bộ hoàn toàn:

| Trang | Danh mục |
|---|---|
| `all-products.html` | Tất cả sản phẩm (40 sản phẩm) |
| `kitchen.html` | Nhà bếp hiện đại (10 sản phẩm) |
| `living-room.html` | Phòng khách sang trọng (10 sản phẩm) |
| `lighting.html` | Chiếu sáng thông minh (10 sản phẩm) |
| `security.html` | Hệ thống an ninh (10 sản phẩm) |

Mỗi trang catalog có:
- **Sidebar bộ lọc** với: danh mục (`data-category-filter`), khoảng giá (range slider + preset), loại sản phẩm (pill buttons).
- **Thanh tìm kiếm** theo tên / danh mục / tính năng với status feedback và nút xóa bộ lọc.
- **Header catalog** với tiêu đề danh mục + dropdown sắp xếp (Nổi bật / Giá / Tên).
- **Grid sản phẩm** (`.premium-grid`) với loading overlay, badge PREMIUM / SALE.
- **Pagination** điều hướng trang.
- Card sản phẩm có nút "Thêm vào giỏ" và nút "Chi tiết" trỏ vào `product-detail.html`.

### Trang chi tiết sản phẩm `product-detail.html`

- Nhận thông tin sản phẩm qua **URL query params**: `id`, `title`, `price`, `oldPrice`, `img`, `desc`, `category`.
- Hiển thị: ảnh lớn, tên, giá (và giá gốc nếu có), danh mục, mô tả đầy đủ.
- Nút **"Thêm vào giỏ hàng"** và **"Mua ngay"**.
- Breadcrumb điều hướng về đúng trang danh mục.
- Section **"Sản phẩm đã xem gần đây"** (lưu bằng `localStorage`).

### Trang đăng nhập / đăng ký `login.html`

- Bố cục split: banner giới thiệu + form.
- **Đăng nhập** bằng email/số điện thoại + mật khẩu.
- **Đăng ký** tài khoản mới với validate phía client.
- Lưu thông tin tài khoản vào `localStorage`.
- Tự động merge giỏ hàng guest vào tài khoản sau khi đăng nhập.
- Nút đăng nhập bằng Facebook / Google (giao diện).

### Trang giỏ hàng & thanh toán `checkout.html`

- Hiển thị danh sách sản phẩm trong giỏ với số lượng, giá, ảnh.
- Điều chỉnh số lượng, xóa sản phẩm.
- Tính tổng tiền tự động.
- Form nhập thông tin giao hàng.
- Xác nhận đặt hàng, lưu đơn hàng vào `localStorage`.

---

## Công nghệ sử dụng

| Công nghệ | Vai trò |
|---|---|
| **HTML5** | Cấu trúc tất cả trang |
| **CSS3** (Vanilla) | Thiết kế toàn bộ giao diện, layout, responsive, animation |
| **JavaScript ES Modules** | Logic client-side: menu, cart, filter, auth, product detail |
| **Vite 8.x** | Dev server, HMR, build & preview |
| **Font Awesome 6** (CDN) | Icons: menu, cart, badges, arrows |
| **Google Fonts — Inter** | Typography chính |
| **localStorage** | Lưu giỏ hàng, tài khoản, đơn hàng, lịch sử xem |
| **Git & GitHub** | Quản lý mã nguồn |

---

## Yêu cầu môi trường

Dự án dùng Vite `8.0.x`, yêu cầu:

```text
Node.js ^20.19.0 hoặc >=22.12.0
```

Kiểm tra:

```bash
node -v
npm -v
```

---

## Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/phmthnh/LapTrinhWebCuoiKy.git
cd LapTrinhWebCuoiKy
```

### 2. Cài dependencies

```bash
npm install
```

Hoặc cài đúng theo `package-lock.json`:

```bash
npm ci
```

### 3. Chạy môi trường phát triển

```bash
npm run dev
```

Mở địa chỉ Vite hiển thị trong terminal (thường là `http://localhost:5173`).

### 4. Build production

```bash
npm run build
```

Tạo thư mục `dist/` sẵn sàng để deploy.

### 5. Preview bản build

```bash
npm run preview
```

---

## Scripts

| Lệnh | Chức năng |
|---|---|
| `npm run dev` | Chạy Vite dev server với HMR |
| `npm run build` | Build ra thư mục `dist/` |
| `npm run preview` | Chạy thử bản build production |

---

## Cấu trúc thư mục

```text
LapTrinhWebCuoiKy/
├── public/
│   ├── favicon.ico.jpg
│   ├── favicon.svg
│   ├── icons.svg
│   └── images/
│       └── home/           ← Ảnh trang chủ (hero, products, technology...)
├── image/                  ← Ảnh sản phẩm dùng trong catalog
├── dist/                   ← Bản build production (auto-generated)
├── node_modules/           ← Dependencies (auto-generated)
│
├── index.html              ← Trang chủ
├── all-products.html       ← Danh mục: Tất cả sản phẩm
├── kitchen.html            ← Danh mục: Nhà bếp
├── living-room.html        ← Danh mục: Phòng khách
├── lighting.html           ← Danh mục: Chiếu sáng
├── security.html           ← Danh mục: An ninh
├── product-detail.html     ← Trang chi tiết sản phẩm
├── login.html              ← Đăng nhập / Đăng ký
├── checkout.html           ← Giỏ hàng & Thanh toán
│
├── main.js                 ← Logic chính toàn site
├── auth.js                 ← Xác thực người dùng
├── checkout.js             ← Logic trang thanh toán
├── login.js                ← Logic trang đăng nhập
├── script.js               ← Module JS phụ trợ
├── style.css               ← Toàn bộ CSS của dự án
│
├── note-do-gia-dung.md     ← Danh sách ý tưởng sản phẩm
├── package.json
├── package-lock.json
└── README.md
```

---

## Mô tả các file chính

| File | Vai trò |
|---|---|
| `index.html` | Trang chủ: hero, sản phẩm nổi bật, technology, testimonials |
| `all-products.html` | Catalog đầy đủ 40 sản phẩm với sidebar lọc và tìm kiếm |
| `kitchen.html` | Catalog 10 sản phẩm nhà bếp |
| `living-room.html` | Catalog 10 sản phẩm phòng khách |
| `lighting.html` | Catalog 10 sản phẩm chiếu sáng |
| `security.html` | Catalog 10 sản phẩm an ninh |
| `product-detail.html` | Chi tiết sản phẩm, nhận data qua URL params |
| `login.html` | Đăng nhập và đăng ký tài khoản |
| `checkout.html` | Giỏ hàng và form thanh toán |
| `main.js` | Sticky header, mega menu, catalog filter, cart, product detail logic |
| `auth.js` | Quản lý tài khoản, merge cart, localStorage keys |
| `checkout.js` | Logic giỏ hàng đầy đủ, tính tiền, đặt hàng |
| `login.js` | Validate form đăng nhập/đăng ký, xử lý auth state |
| `style.css` | Toàn bộ CSS: layout, catalog, cards, cart, responsive |

---

## Luồng sử dụng

```
Trang chủ
   │
   ├─► Mega Menu "Products" → chọn danh mục
   │         │
   │         └─► Trang Catalog (all / kitchen / living-room / lighting / security)
   │                   │
   │                   ├─► Sidebar: lọc theo danh mục, giá, loại sản phẩm
   │                   ├─► Thanh tìm kiếm: tìm theo tên / tính năng
   │                   └─► Click card sản phẩm → product-detail.html?id=...&title=...
   │                                 │
   │                                 ├─► Xem thông tin chi tiết
   │                                 ├─► Thêm vào giỏ hàng
   │                                 └─► Mua ngay → checkout.html
   │
   ├─► Sản phẩm nổi bật → "Xem thêm" → product-detail.html (đúng sản phẩm)
   │
   ├─► Icon giỏ hàng (hover) → Mini Cart → nút Checkout → checkout.html
   │
   └─► Nút "Get Started" → login.html → đăng nhập / đăng ký
```

---

## Ghi chú hiện trạng

- Dự án là **frontend tĩnh**, chưa có backend hay API.
- **Xác thực người dùng** dùng `localStorage`, không có server-side session.
- **Giỏ hàng** và **đơn hàng** lưu bằng `localStorage`.
- Form liên hệ chưa gửi dữ liệu đến server.
- Nút đăng nhập Facebook / Google mới ở mức giao diện, chưa tích hợp OAuth.
- Dữ liệu sản phẩm viết trực tiếp trong HTML và `main.js`, chưa dùng API.

---

## Quy trình làm việc nhóm

### Tạo branch và làm việc

```bash
git checkout main
git pull origin main
git checkout -b feature/ten-tinh-nang
```

### Commit rõ ràng

```bash
git add .
git commit -m "feat: add product detail page"
git push -u origin feature/ten-tinh-nang
```

| Tiền tố | Ý nghĩa |
|---|---|
| `feat:` | Thêm tính năng mới |
| `fix:` | Sửa lỗi |
| `style:` | Chỉnh CSS, giao diện |
| `refactor:` | Cải tổ code |
| `docs:` | Cập nhật tài liệu |
| `chore:` | Cấu hình, dependencies |

### Pull Request

1. Push branch lên GitHub.
2. Tạo Pull Request, mô tả rõ thay đổi.
3. Thành viên khác review và approve.
4. Merge vào `main`.

> ⚠️ **Không commit trực tiếp lên `main`.**  
> Nếu có conflict sau merge, dọn sạch conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) trước khi commit.

---

## Deploy

Dự án có thể deploy lên các nền tảng static hosting:

- **Vercel** *(khuyến nghị)*
- **Netlify**
- **GitHub Pages**

Cấu hình:

```text
Build command:    npm run build
Output directory: dist
```

---

## Tiêu chí kiểm tra trước khi nộp bài

- [ ] `npm install` và `npm run dev` chạy không lỗi.
- [ ] `npm run build` tạo được thư mục `dist/`.
- [ ] Trang chủ hiển thị đủ: header, hero, sản phẩm nổi bật, technology, testimonials, footer.
- [ ] Mega menu mở đúng, điều hướng đến đúng trang danh mục.
- [ ] 5 trang catalog hiển thị đồng nhất: sidebar lọc + thanh tìm kiếm + grid sản phẩm.
- [ ] Click "Xem thêm" / card sản phẩm → mở đúng `product-detail.html` với thông tin sản phẩm tương ứng.
- [ ] Giỏ hàng: thêm, hiển thị số lượng, mini cart hover, xóa sản phẩm.
- [ ] Trang checkout hiển thị giỏ hàng và có thể đặt hàng.
- [ ] Trang đăng nhập/đăng ký hoạt động, lưu tài khoản vào `localStorage`.
- [ ] Giao diện không vỡ trên desktop và mobile (responsive).
- [ ] Không có lỗi CSS parse (không có git merge conflict markers trong `style.css`).

---

## License

Dự án phục vụ mục đích học tập — Môn Lập trình Web, đồ án cuối kỳ.
