// Middleware kiểm tra đăng nhập
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: 'Chưa đăng nhập.' });
  next();
}

module.exports = { requireLogin };
