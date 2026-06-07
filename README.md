# SmartHome - Website giới thiệu thiết bị gia dụng thông minh

SmartHome là website frontend giới thiệu các thiết bị gia dụng thông minh, được xây dựng cho đồ án cuối kỳ môn Lập trình Web. Dự án tập trung vào giao diện trang chủ, danh sách sản phẩm nổi bật, trang đăng nhập, mini cart và trải nghiệm responsive trên nhiều kích thước màn hình.

Repository: https://github.com/phmthnh/LapTrinhWebCuoiKy.git

## Mục tiêu dự án

- Xây dựng một website giới thiệu sản phẩm đồ gia dụng thông minh với giao diện hiện đại, dễ dùng.
- Luyện tập HTML, CSS, JavaScript thuần và quy trình chạy dự án bằng Vite.
- Tổ chức giao diện gồm header, hero, danh sách sản phẩm, giới thiệu, liên hệ và đăng nhập.
- Thực hành xử lý tương tác phía client như menu mobile, sticky header, tìm kiếm sản phẩm và giỏ hàng lưu bằng `localStorage`.
- Tạo nền tảng để có thể phát triển tiếp thành website bán hàng hoàn chỉnh.

## Tính năng hiện có

### Trang chủ `index.html`

- Header cố định ở đầu trang.
- Logo SmartHome và menu điều hướng theo từng section.
- Thanh tìm kiếm sản phẩm ở phần header.
- Dropdown danh mục sản phẩm gồm:
  - Phòng khách sang trọng
  - Nhà bếp hiện đại
  - Hệ thống an ninh
  - Chiếu sáng thông minh
- Nút chuyển sang trang đăng nhập.
- Biểu tượng giỏ hàng kèm số lượng sản phẩm.
- Hero section giới thiệu thông điệp chính của website.
- Section sản phẩm nổi bật với các sản phẩm mẫu:
  - Robot hút bụi
  - Nồi chiên không dầu
  - Máy lọc không khí
- Nút "Thêm vào giỏ" cho từng sản phẩm.
- Section giới thiệu thương hiệu.
- Form liên hệ cơ bản.
- Footer thông tin bản quyền.

### Trang đăng nhập `login.html`

- Header riêng cho trang đăng nhập.
- Bố cục chia đôi gồm banner giới thiệu và form đăng nhập.
- Form nhập email, số điện thoại hoặc tên đăng nhập.
- Form nhập mật khẩu.
- Nút đăng nhập.
- Liên kết quên mật khẩu và đăng ký.
- Nút đăng nhập bằng Facebook và Google ở mức giao diện.

### Tương tác JavaScript `main.js`

- Thêm hiệu ứng đổi trạng thái header khi cuộn trang.
- Mở hoặc đóng menu trên thiết bị di động.
- Tự động đánh dấu menu đang active theo section đang xem.
- Có logic lọc sản phẩm theo từ khóa trong `main.js`.
- Thêm sản phẩm vào mini cart.
- Lưu giỏ hàng vào `localStorage` để khi tải lại trang không mất dữ liệu.
- Hiển thị tổng tiền trong mini cart.
- Xóa sản phẩm khỏi giỏ hàng.

## Công nghệ sử dụng

- HTML5: xây dựng cấu trúc trang.
- CSS3: thiết kế giao diện, layout, responsive và hiệu ứng hover.
- JavaScript thuần: xử lý tương tác phía client.
- Vite: dev server, build và preview frontend.
- Font Awesome CDN: hiển thị icon cho menu, tìm kiếm, giỏ hàng, social login.
- Git và GitHub: quản lý mã nguồn, branch và pull request.

## Yêu cầu môi trường

Dự án đang dùng Vite `8.0.x`. Theo package Vite đã cài trong dự án, môi trường Node.js cần phù hợp một trong các phiên bản sau:

```text
Node.js ^20.19.0 hoặc >=22.12.0
```

Kiểm tra phiên bản Node.js và npm:

```bash
node -v
npm -v
```

## Cài đặt và chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/phmthnh/LapTrinhWebCuoiKy.git
```

### 2. Di chuyển vào thư mục dự án

```bash
cd LapTrinhWebCuoiKy
```

### 3. Cài dependencies

Dùng lệnh sau khi cài lần đầu:

```bash
npm install
```

Nếu muốn cài đúng theo `package-lock.json`, dùng:

```bash
npm ci
```

### 4. Chạy môi trường phát triển

```bash
npm run dev
```

Sau khi chạy thành công, mở địa chỉ Vite hiển thị trong terminal. Thông thường là:

```text
http://localhost:5173
```

### 5. Build dự án

```bash
npm run build
```

Lệnh này tạo thư mục `dist/` chứa bản build dùng để deploy.

### 6. Preview bản build

```bash
npm run preview
```

Lệnh này chạy thử nội dung trong thư mục `dist/` sau khi build.

## Scripts trong `package.json`

| Lệnh | Chức năng |
| --- | --- |
| `npm run dev` | Chạy Vite dev server để phát triển giao diện |
| `npm run build` | Build dự án ra thư mục `dist/` |
| `npm run preview` | Chạy thử bản build production |

## Cấu trúc thư mục

```text
LapTrinhWebCuoiKy/
├── public/
│   ├── favicon.ico.jpg
│   ├── favicon.svg
│   └── icons.svg
├── .gitignore
├── README.md
├── index.html
├── login.html
├── main.js
├── note-do-gia-dung.md
├── package-lock.json
├── package.json
├── script.js
└── style.css
```

## Mô tả các file chính

| File | Vai trò |
| --- | --- |
| `index.html` | Trang chủ của website SmartHome |
| `login.html` | Trang đăng nhập tĩnh |
| `style.css` | Toàn bộ CSS cho trang chủ, trang đăng nhập, responsive và mini cart |
| `main.js` | Xử lý scroll header, menu mobile, active nav, tìm kiếm và giỏ hàng |
| `script.js` | File JavaScript dự phòng, hiện đang được import trong `main.js` nhưng chưa có nội dung |
| `note-do-gia-dung.md` | Danh sách ý tưởng sản phẩm đồ gia dụng thông minh để mở rộng nội dung website |
| `public/` | Chứa favicon và icon tĩnh |
| `package.json` | Khai báo thông tin dự án, scripts và dev dependencies |
| `package-lock.json` | Khóa phiên bản dependency để cài đặt ổn định |

## Luồng sử dụng cơ bản

1. Người dùng mở trang chủ.
2. Người dùng xem banner giới thiệu SmartHome.
3. Người dùng xem danh mục hoặc cuộn đến section sản phẩm.
4. Người dùng nhập từ khóa vào ô tìm kiếm để lọc sản phẩm.
5. Người dùng nhấn "Thêm vào giỏ" để thêm sản phẩm vào mini cart.
6. Website cập nhật số lượng sản phẩm trên icon giỏ hàng.
7. Khi hover vào giỏ hàng, người dùng thấy danh sách sản phẩm đã thêm và tổng tiền.
8. Người dùng có thể xóa sản phẩm khỏi giỏ.
9. Người dùng có thể chuyển sang trang đăng nhập qua nút "Đăng nhập".

## Ghi chú hiện trạng

- Dự án hiện là frontend tĩnh, chưa có backend.
- Form liên hệ chưa gửi dữ liệu đến server.
- Form đăng nhập chưa xác thực tài khoản thật.
- Nút Facebook và Google mới ở mức giao diện, chưa tích hợp OAuth.
- Giỏ hàng dùng `localStorage`, chưa có database và chưa có trang thanh toán.
- Dữ liệu sản phẩm đang viết trực tiếp trong `index.html`, chưa tách thành file JSON hoặc API.
- Một số hình ảnh sản phẩm đang dùng placeholder từ `placehold.co`.
- Ảnh hero đang trỏ tới `./image/logo.jpg`; nếu dùng ảnh thật cần thêm thư mục `image/` hoặc đổi lại đường dẫn ảnh.

## Quy trình làm việc nhóm

### 1. Không code trực tiếp trên `main`

Mỗi thành viên nên tạo branch riêng theo chức năng đang làm.

Ví dụ:

```bash
git checkout main
git pull origin main
git checkout -b feature/login-page
```

### 2. Commit theo từng phần rõ ràng

```bash
git add .
git commit -m "feat: add login page"
```

Một số tiền tố commit nên dùng:

| Tiền tố | Ý nghĩa |
| --- | --- |
| `feat:` | Thêm chức năng mới |
| `fix:` | Sửa lỗi |
| `style:` | Chỉnh giao diện, CSS hoặc format |
| `refactor:` | Sắp xếp lại code nhưng không đổi hành vi |
| `docs:` | Chỉnh tài liệu |
| `chore:` | Việc phụ trợ như cấu hình, dependency |

### 3. Push branch lên GitHub

```bash
git push -u origin feature/login-page
```

### 4. Tạo Pull Request

Sau khi push branch:

1. Mở repository trên GitHub.
2. Chọn "Compare & pull request".
3. Ghi rõ nội dung đã thay đổi.
4. Gửi Pull Request để thành viên khác review.
5. Merge vào `main` sau khi đã kiểm tra.

## Gợi ý hướng phát triển

### Giai đoạn 1: Hoàn thiện frontend hiện tại

- Sửa lại đường dẫn ảnh hero và bổ sung ảnh sản phẩm thật.
- Bổ sung `data-name` cho card sản phẩm để chức năng tìm kiếm hoạt động ổn định.
- Tách phần xử lý giỏ hàng ra module riêng nếu code JavaScript tiếp tục tăng.
- Chuyển inline style trong HTML sang `style.css`.
- Dọn CSS bị lặp ở phần responsive và popup.
- Thêm trang chi tiết sản phẩm.
- Thêm trang giỏ hàng đầy đủ.

### Giai đoạn 2: Chuẩn hóa dữ liệu sản phẩm

- Tạo file dữ liệu sản phẩm dạng JSON.
- Render danh sách sản phẩm bằng JavaScript thay vì viết lặp HTML thủ công.
- Bổ sung danh mục sản phẩm dựa trên `note-do-gia-dung.md`.
- Thêm giá, mô tả, ảnh, tồn kho và trạng thái nổi bật cho sản phẩm.

### Giai đoạn 3: Bổ sung chức năng thương mại điện tử

- Đăng ký, đăng nhập và đăng xuất.
- Quản lý tài khoản người dùng.
- Lưu giỏ hàng theo tài khoản.
- Trang thanh toán.
- Quản lý đơn hàng.
- Tìm kiếm, lọc và sắp xếp sản phẩm.

### Giai đoạn 4: Kết nối backend

- Xây dựng API cho sản phẩm, tài khoản, giỏ hàng và đơn hàng.
- Kết nối database.
- Thêm xác thực người dùng.
- Thêm trang quản trị để quản lý sản phẩm.

## Deploy

Dự án có thể deploy lên các nền tảng frontend static như:

- Vercel
- Netlify
- GitHub Pages

Quy trình deploy phổ biến:

1. Build dự án:

```bash
npm run build
```

2. Deploy thư mục `dist/` lên nền tảng đã chọn.

Nếu dùng Vercel hoặc Netlify, có thể kết nối trực tiếp repository GitHub và cấu hình:

```text
Build command: npm run build
Output directory: dist
```

## Tiêu chí kiểm tra trước khi nộp bài

- Chạy được `npm install` hoặc `npm ci`.
- Chạy được `npm run dev`.
- Chạy được `npm run build`.
- Trang chủ hiển thị đủ header, hero, sản phẩm, giới thiệu, liên hệ và footer.
- Trang đăng nhập mở được từ nút "Đăng nhập".
- Giao diện không vỡ trên desktop và mobile.
- Các link nội bộ trong menu cuộn đến đúng section.
- Giỏ hàng có thể thêm, hiển thị và xóa sản phẩm.
- README mô tả đúng cách cài đặt, chạy và cấu trúc dự án.

## License

Dự án phục vụ mục đích học tập.
