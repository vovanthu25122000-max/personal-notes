// AES-256-GCM encryption utilities
const crypto = require('crypto');

const SECRET = 'your_super_secret_key_32bytes!'; // 32 bytes for AES-256

function getKey(userId) {
  // Derive a key per user (for demo, use SECRET + userId, in production use PBKDF2)
  return crypto.createHash('sha256').update(SECRET + userId).digest();
}

function encryptNote(content, userId) {
  const iv = crypto.randomBytes(12);
  const key = getKey(userId);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(content, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const tag = cipher.getAuthTag();
  return { encrypted: encrypted + ':' + tag.toString('base64'), iv: iv.toString('base64') };
}

function decryptNote(encrypted_content, iv, userId) {
  const [enc, tag] = encrypted_content.split(':');
  const key = getKey(userId);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  let decrypted = decipher.update(enc, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptNote, decryptNote };
