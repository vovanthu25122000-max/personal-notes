// User model
const db = require('./db');

async function createUser(username, email, passwordHash, verificationOtp, verificationOtpExpiresAt) {
  await db.query(
    `INSERT INTO Users (
      username,
      email,
      password_hash,
      is_verified,
      verification_otp,
      verification_otp_expires_at,
      created_at
    ) VALUES (?, ?, ?, 0, ?, ?, NOW())`,
    [username, email, passwordHash, verificationOtp, verificationOtpExpiresAt]
  );
}

async function findUserByUsername(username) {
  const [rows] = await db.query('SELECT * FROM Users WHERE username = ?', [username]);
  return rows[0];
}

async function findUserByIdentifier(identifier) {
  const [rows] = await db.query(
    'SELECT * FROM Users WHERE username = ? OR email = ?',
    [identifier, identifier]
  );
  return rows[0];
}

async function findUserById(id) {
  const [rows] = await db.query(
    'SELECT id, username, email, is_verified, created_at FROM Users WHERE id = ?',
    [id]
  );
  return rows[0];
}

async function findUserByEmail(email) {
  const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
  return rows[0];
}

async function setVerificationOtp(userId, otp, expiresAt) {
  await db.query(
    'UPDATE Users SET verification_otp = ?, verification_otp_expires_at = ?, is_verified = 0 WHERE id = ?',
    [otp, expiresAt, userId]
  );
}

async function updateUserVerification(userId, isVerified) {
  await db.query(
    'UPDATE Users SET is_verified = ?, verification_otp = NULL, verification_otp_expires_at = NULL WHERE id = ?',
    [isVerified, userId]
  );
}

async function setResetOtp(userId, otp, expiresAt) {
  await db.query(
    'UPDATE Users SET reset_otp = ?, reset_otp_expires_at = ? WHERE id = ?',
    [otp, expiresAt, userId]
  );
}

async function clearResetOtp(userId) {
  await db.query(
    'UPDATE Users SET reset_otp = NULL, reset_otp_expires_at = NULL WHERE id = ?',
    [userId]
  );
}

async function updateUserPassword(userId, passwordHash) {
  await db.query(
    'UPDATE Users SET password_hash = ?, reset_otp = NULL, reset_otp_expires_at = NULL WHERE id = ?',
    [passwordHash, userId]
  );
}

module.exports = {
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
};
