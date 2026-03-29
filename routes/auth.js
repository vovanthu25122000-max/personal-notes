const express = require('express');
const bcrypt = require('bcrypt');
const {
  clearResetOtp,
  createUser,
  findUserByEmail,
  findUserByIdentifier,
  findUserById,
  findUserByUsername,
  setResetOtp,
  setVerificationOtp,
  updateUserPassword,
  updateUserVerification
} = require('../models/user');
const { sendMail } = require('../utils/mailer');
const { addMinutes, generateOtp } = require('../utils/otp');

const router = express.Router();
const OTP_TTL_MINUTES = 10;

function isExpired(dateValue) {
  if (!dateValue) return true;
  return new Date(dateValue) < new Date();
}

async function sendVerificationEmail(email, otp) {
  await sendMail({
    to: email,
    subject: 'Mã OTP xác thực tài khoản Secure Notes',
    text: `Mã OTP xác thực tài khoản của bạn là ${otp}. Mã có hiệu lực trong ${OTP_TTL_MINUTES} phút.`,
    html: `<p>Mã OTP xác thực tài khoản của bạn là <strong>${otp}</strong>.</p><p>Mã có hiệu lực trong ${OTP_TTL_MINUTES} phút.</p>`
  });
}

async function sendResetEmail(email, otp) {
  await sendMail({
    to: email,
    subject: 'Mã OTP đặt lại mật khẩu Secure Notes',
    text: `Mã OTP đặt lại mật khẩu của bạn là ${otp}. Mã có hiệu lực trong ${OTP_TTL_MINUTES} phút.`,
    html: `<p>Mã OTP đặt lại mật khẩu của bạn là <strong>${otp}</strong>.</p><p>Mã có hiệu lực trong ${OTP_TTL_MINUTES} phút.</p>`
  });
}

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ username, email và password.' });
    }

    const existingByUsername = await findUserByUsername(username);
    if (existingByUsername) {
      return res.status(409).json({ message: 'Username đã tồn tại.' });
    }

    const existingByEmail = await findUserByEmail(email);
    if (existingByEmail) {
      return res.status(409).json({ message: 'Email đã được sử dụng. Nếu chưa xác thực, hãy gửi lại OTP.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = generateOtp();
    const expiresAt = addMinutes(new Date(), OTP_TTL_MINUTES);

    await createUser(username, email, passwordHash, otp, expiresAt);
    await sendVerificationEmail(email, otp);

    res.json({
      message: 'Đăng ký thành công. Vui lòng nhập OTP đã gửi về email để kích hoạt tài khoản.',
      email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Không thể đăng ký lúc này. Kiểm tra lại cấu hình email và database.' });
  }
});

router.post('/verify-register-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Vui lòng nhập email và OTP.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    if (user.is_verified) {
      return res.json({ message: 'Tài khoản đã được xác thực. Bạn có thể đăng nhập.' });
    }

    if (user.verification_otp !== otp || isExpired(user.verification_otp_expires_at)) {
      return res.status(400).json({ message: 'OTP không đúng hoặc đã hết hạn.' });
    }

    await updateUserVerification(user.id, true);
    res.json({ message: 'Xác thực thành công. Đang quay về trang đăng nhập.' });
  } catch (error) {
    console.error('Verify register OTP error:', error);
    res.status(500).json({ message: 'Không thể xác thực tài khoản lúc này.' });
  }
});

router.post('/resend-verification-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: 'Tài khoản này đã xác thực.' });
    }

    const otp = generateOtp();
    const expiresAt = addMinutes(new Date(), OTP_TTL_MINUTES);
    await setVerificationOtp(user.id, otp, expiresAt);
    await sendVerificationEmail(email, otp);

    res.json({ message: 'Đã gửi lại OTP xác thực. Vui lòng kiểm tra email.' });
  } catch (error) {
    console.error('Resend verification OTP error:', error);
    res.status(500).json({ message: 'Không thể gửi lại OTP lúc này.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập username/email và password.' });
    }

    const user = await findUserByIdentifier(identifier);
    if (!user) return res.status(401).json({ message: 'Sai thông tin đăng nhập.' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Sai thông tin đăng nhập.' });

    if (!user.is_verified) {
      return res.status(403).json({
        message: 'Tài khoản chưa xác thực email. Vui lòng nhập OTP trước khi đăng nhập.',
        email: user.email,
        needsVerification: true
      });
    }

    req.session.userId = user.id;
    res.json({ message: 'Đăng nhập thành công.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Không thể đăng nhập lúc này.' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Vui lòng nhập email.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.json({ message: 'Nếu email tồn tại, mã OTP đặt lại mật khẩu đã được gửi.' });
    }

    const otp = generateOtp();
    const expiresAt = addMinutes(new Date(), OTP_TTL_MINUTES);
    await setResetOtp(user.id, otp, expiresAt);
    await sendResetEmail(email, otp);

    res.json({ message: 'Đã gửi OTP đặt lại mật khẩu. Vui lòng kiểm tra email.', email });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Không thể gửi OTP đặt lại mật khẩu lúc này.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Vui lòng nhập email, OTP và mật khẩu mới.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
    }

    if (user.reset_otp !== otp || isExpired(user.reset_otp_expires_at)) {
      return res.status(400).json({ message: 'OTP đặt lại mật khẩu không đúng hoặc đã hết hạn.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await updateUserPassword(user.id, passwordHash);
    await clearResetOtp(user.id);

    res.json({ message: 'Đổi mật khẩu thành công. Đang quay về trang đăng nhập.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Không thể đổi mật khẩu lúc này.' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Đã đăng xuất.' });
  });
});

router.get('/me', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Chưa đăng nhập.' });
    }

    const user = await findUserById(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Không thể tải thông tin người dùng.' });
  }
});

module.exports = router;
