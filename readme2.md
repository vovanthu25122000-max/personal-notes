# Hướng dẫn chỉnh giao diện `less2`

File CSS chính của project là:

- [public/css/style.css](C:\Users\ngan\Pictures\vs code\less2\public\css\style.css)

Các file HTML chính đang dùng CSS này:

- [public/index.html](C:\Users\ngan\Pictures\vs code\less2\public\index.html): Trang chủ
- [public/login.html](C:\Users\ngan\Pictures\vs code\less2\public\login.html): Đăng nhập
- [public/register.html](C:\Users\ngan\Pictures\vs code\less2\public\register.html): Đăng ký
- [public/verify.html](C:\Users\ngan\Pictures\vs code\less2\public\verify.html): Xác thực OTP
- [public/forgot.html](C:\Users\ngan\Pictures\vs code\less2\public\forgot.html): Quên mật khẩu
- [public/reset.html](C:\Users\ngan\Pictures\vs code\less2\public\reset.html): Đổi mật khẩu
- [public/dashboard.html](C:\Users\ngan\Pictures\vs code\less2\public\dashboard.html): Dashboard sau đăng nhập

## 1. Phần CSS dùng chung

### `body`
Ví dụ:

```css
body {
  font-family: "Segoe UI", Arial, sans-serif;
  background: linear-gradient(135deg, #edf4ff 0%, #f7fbf2 100%);
  color: #243042;
  margin: 0;
  min-height: 100vh;
  scroll-behavior: smooth;
}
```

Áp dụng cho:

- tất cả các file HTML trong `public`

Ý nghĩa:

- đổi font toàn trang
- đổi màu nền chung
- đổi màu chữ mặc định

### `a`
Áp dụng cho:

- toàn bộ thẻ link trong các file HTML

### `h1, h2`
Áp dụng cho:

- tiêu đề lớn trong trang chủ, login, dashboard, ghi chú

## 2. Nhóm giao diện đăng nhập / đăng ký / OTP

Các class này chủ yếu dùng trong:

- [public/login.html](C:\Users\ngan\Pictures\vs code\less2\public\login.html)
- [public/register.html](C:\Users\ngan\Pictures\vs code\less2\public\register.html)
- [public/verify.html](C:\Users\ngan\Pictures\vs code\less2\public\verify.html)
- [public/forgot.html](C:\Users\ngan\Pictures\vs code\less2\public\forgot.html)
- [public/reset.html](C:\Users\ngan\Pictures\vs code\less2\public\reset.html)

### `.auth-shell`
Là khung ngoài cùng để căn giữa form giữa màn hình.

### `.auth-card`
Là hộp trắng chứa form đăng nhập/đăng ký.

### `.eyebrow`
Là dòng chữ nhỏ phía trên tiêu đề, ví dụ `Secure Notes`.

### `.subtle`
Là đoạn mô tả nhỏ dưới tiêu đề.

### `.stack-form`
Form xếp dọc các ô input.

### `.compact-form`
Form phụ nhỏ hơn, ví dụ phần gửi lại OTP.

### `.status-box`
Hộp hiện thông báo lỗi/thành công.

### `.auth-links`
Nhóm các đường link dưới form, ví dụ:

- `Đã có tài khoản?`
- `Quên mật khẩu?`

## 3. Phần trang chủ

Dùng trong:

- [public/index.html](C:\Users\ngan\Pictures\vs code\less2\public\index.html)

### `.home-page`
Style riêng cho nền toàn bộ trang chủ.

### `.home-header`
Thanh header cố định phía trên.

### `.navbar`
Thanh điều hướng trên cùng chứa:

- logo
- menu `Trang chủ`, `Giới thiệu`, `Về chúng tôi`, `Đăng nhập`

### `.brand`
Vùng bọc logo bên trái.

### `.logo-frame`
Khung logo cũ dạng chữ `Logo`.
Hiện tại bạn đã thay bằng ảnh, nhưng class này vẫn còn trong CSS.

### `.site-logo`
Style của ảnh logo thật.

### `.nav-links`
Khu menu bên phải navbar.

### `.login-link`
Style riêng cho nút/link đăng nhập trên navbar.

### `.hero-section`
Khu banner lớn đầu trang chủ.

### `.hero-backdrop`
Đây là nơi đặt ảnh nền trang chủ.

Muốn đổi ảnh nền thì sửa ở đây.

Ví dụ:

```css
.hero-backdrop {
  background-image:
    linear-gradient(rgba(18, 44, 72, 0.35), rgba(18, 44, 72, 0.35)),
    url("/images/banner.jpg");
}
```

### `.hero-overlay`
Lớp phủ màu/gradient đè lên ảnh nền.

### `.hero-content`
Khối nội dung nằm trên banner.

### `.hero-kicker`
Dòng chữ nhỏ phía trên tiêu đề hero.

### `.hero-text`
Đoạn mô tả trong hero.

### `.hero-actions`
Nhóm nút trong hero.

### `.hero-btn`
Style chung cho nút trong hero.

### `.info-section`
Phần `Giới thiệu`.

### `.about-section`
Phần `Về chúng tôi`.

### `.info-grid`
Lưới các ô thông tin ở phần giới thiệu.

### `.info-card`
Từng card trong phần giới thiệu.

### `.about-layout`
Bố cục phần `Về chúng tôi`.

### `.about-box`
Các box thông tin nhỏ trong phần `Về chúng tôi`.

## 4. Phần dashboard sau đăng nhập

Dùng trong:

- [public/dashboard.html](C:\Users\ngan\Pictures\vs code\less2\public\dashboard.html)

### `.dashboard-page`
Nền tổng thể của dashboard.

### `.dashboard-topbar`
Thanh ngang trên cùng của dashboard.

Chứa:

- logo
- tên user đang đăng nhập

### `.dashboard-user`
Khung tên người dùng ở góc phải trên cùng.

### `.dashboard-shell`
Khung chia 2 cột:

- sidebar bên trái
- nội dung bên phải

### `.dashboard-sidebar`
Thanh menu bên trái.

### `.sidebar-title`
Chữ lớn `MENU`.

### `.sidebar-search`
Khu vực ô tìm kiếm + nút tìm.

### `.sidebar-menu`
Nhóm nút:

- `Trang chủ`
- `Ghi chú của tôi`
- `Thùng rác`

### `.sidebar-link`
Style chung cho các nút/menu ở sidebar.

### `.sidebar-link-anchor`
Style riêng cho link `Trang chủ`.

### `.sidebar-section`
Khu vực danh sách ghi chú ở sidebar.

### `.sidebar-notes`
Danh sách các ghi chú hiển thị ở cột trái.

### `.sidebar-note-item`
Từng item ghi chú trong danh sách bên trái.

### `.sidebar-empty`
Dòng chữ hiện khi chưa có dữ liệu, ví dụ:

- `Chưa có`
- `Không tìm thấy kết quả phù hợp nào`

### `.logout-btn`
Nút đăng xuất.

### `.dashboard-main`
Toàn bộ khu nội dung bên phải.

### `.dashboard-intro`
Phần tiêu đề lớn của nội dung, ví dụ:

- `Ghi chú của tôi`
- `Thùng rác`

### `.notes-grid`
Lưới các card ghi chú ở giữa màn hình.

### `.note-card`
Mỗi card ghi chú hình vuông.

### `.note-card-icon`
Ô icon nhỏ trong card ghi chú.

### `.empty-card`
Card hiện khi chưa có dữ liệu.

### `.note-viewer`
Khung xem nội dung chi tiết ghi chú ở phía dưới phần card.

### `.note-viewer-placeholder`
Nội dung mặc định khi chưa chọn ghi chú nào.

### `.note-viewer-head`
Phần đầu của khung xem ghi chú.

### `.note-viewer-body`
Phần nội dung chính của ghi chú.

### `.note-viewer-actions`
Khu các nút hành động như:

- `Chỉnh sửa`
- `Chuyển vào thùng rác`
- `Khôi phục`
- `Xóa vĩnh viễn`

### `.danger-btn`
Style của nút nguy hiểm, ví dụ:

- xóa
- xóa vĩnh viễn

### `.floating-create-btn`
Nút dấu `+` ở góc dưới bên phải để tạo ghi chú.

### `.note-modal`
Lớp nền mờ khi mở popup tạo/sửa ghi chú.

### `.note-modal-card`
Khung popup tạo/sửa ghi chú.

### `.note-modal-head`
Phần đầu popup.

### `.icon-btn`
Nút đóng popup.

### `.note-modal-actions`
Khu nút lưu trong popup.

## 5. Muốn chỉnh gì thì sửa ở đâu?

### Muốn đổi ảnh nền trang chủ
Sửa:

- [public/css/style.css](C:\Users\ngan\Pictures\vs code\less2\public\css\style.css)

Tìm:

- `.hero-backdrop`

### Muốn đổi logo
Sửa:

- [public/index.html](C:\Users\ngan\Pictures\vs code\less2\public\index.html)
- [public/dashboard.html](C:\Users\ngan\Pictures\vs code\less2\public\dashboard.html)
- [public/css/style.css](C:\Users\ngan\Pictures\vs code\less2\public\css\style.css)

### Muốn đổi form đăng nhập/đăng ký
Sửa:

- [public/login.html](C:\Users\ngan\Pictures\vs code\less2\public\login.html)
- [public/register.html](C:\Users\ngan\Pictures\vs code\less2\public\register.html)
- [public/css/style.css](C:\Users\ngan\Pictures\vs code\less2\public\css\style.css)

### Muốn đổi dashboard
Sửa:

- [public/dashboard.html](C:\Users\ngan\Pictures\vs code\less2\public\dashboard.html)
- [public/css/style.css](C:\Users\ngan\Pictures\vs code\less2\public\css\style.css)
- [public/js/app.js](C:\Users\ngan\Pictures\vs code\less2\public\js\app.js)

## 6. Mẹo nhớ nhanh

- `public/*.html`: bố cục giao diện
- `public/css/style.css`: màu sắc, kích thước, vị trí, hiệu ứng
- `public/js/app.js`: hành vi nút bấm, tìm kiếm, đăng nhập, ghi chú

Nếu bạn muốn, mình có thể làm tiếp một bản `readme3.md` theo kiểu bảng:

- tên class
- nằm ở trang nào
- dùng để làm gì
- chỉnh cái gì thì sửa class nào
