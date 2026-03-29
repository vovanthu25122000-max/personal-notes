# Secure Notes App

## Chức năng hiện có
- Đăng ký bằng username, email và password
- Gửi OTP qua Gmail để xác thực tài khoản
- Gửi lại OTP xác thực khi cần
- Đăng nhập bằng username hoặc email sau khi đã xác thực
- Quên mật khẩu, gửi OTP về email và đổi mật khẩu mới
- Tạo, xem, sửa, xóa ghi chú đã mã hóa AES-256-GCM

## Cấu hình cần thiết
1. Tạo database bằng file `schema.sql`
2. Tạo file `.env` từ mẫu `.env.example`
3. Điền đúng thông tin MySQL và Gmail app password
4. Nếu muốn chạy HTTPS, đặt `cert/key.pem` và `cert/cert.pem`

## Cài đặt
```bash
npm install
npm start
```

## Biến môi trường
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `SESSION_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`
- `MAIL_FROM`
- `USE_HTTPS=true|false`

## Luồng sử dụng
1. Mở `register.html` để tạo tài khoản và nhận OTP qua email
2. Mở `verify.html` để xác thực OTP
3. Đăng nhập tại `login.html`
4. Nếu quên mật khẩu, vào `forgot.html` để xin OTP reset
5. Mở `reset.html` để đặt lại mật khẩu
