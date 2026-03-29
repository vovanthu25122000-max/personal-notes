const express = require('express');
const { requireLogin } = require('../middleware/auth');
const {
  createNote,
  getNoteById,
  getNotesByUser,
  getRecentNotesByUser,
  getTrashByUser,
  moveNoteToTrash,
  permanentlyDeleteNote,
  purgeExpiredTrash,
  restoreNote,
  searchNotesByTitle,
  updateNote
} = require('../models/note');
const { encryptNote, decryptNote } = require('../utils/crypto');

const router = express.Router();

router.get('/', requireLogin, async (req, res) => {
  await purgeExpiredTrash();
  const query = String(req.query.q || '').trim();

  if (query) {
    const notes = await searchNotesByTitle(req.session.userId, query);
    return res.json(notes);
  }

  const notes = await getNotesByUser(req.session.userId);
  res.json(notes);
});

router.get('/recent/list', requireLogin, async (req, res) => {
  await purgeExpiredTrash();
  const notes = await getRecentNotesByUser(req.session.userId, 5);
  res.json(notes);
});

router.get('/trash/list', requireLogin, async (req, res) => {
  await purgeExpiredTrash();
  const notes = await getTrashByUser(req.session.userId);
  res.json(notes);
});

router.get('/:id', requireLogin, async (req, res) => {
  const note = await getNoteById(req.params.id, req.session.userId, true);
  if (!note) {
    return res.status(404).json({ message: 'Không tìm thấy ghi chú.' });
  }

  if (note.deleted_at) {
    return res.status(410).json({ message: 'Ghi chú này đang nằm trong thùng rác.' });
  }

  const content = decryptNote(note.encrypted_content, note.iv, req.session.userId);
  res.json({
    id: note.id,
    title: note.title,
    content,
    created_at: note.created_at,
    updated_at: note.updated_at
  });
});

router.post('/', requireLogin, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và nội dung.' });
  }

  const { encrypted, iv } = encryptNote(content, req.session.userId);
  await createNote(req.session.userId, title, encrypted, iv);
  res.json({ message: 'Tạo ghi chú thành công.' });
});

router.put('/:id', requireLogin, async (req, res) => {
  const note = await getNoteById(req.params.id, req.session.userId);
  if (!note) {
    return res.status(404).json({ message: 'Không tìm thấy ghi chú để cập nhật.' });
  }

  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Vui lòng nhập tiêu đề và nội dung.' });
  }

  const { encrypted, iv } = encryptNote(content, req.session.userId);
  await updateNote(req.params.id, title, encrypted, iv);
  res.json({ message: 'Cập nhật thành công.' });
});

router.delete('/:id', requireLogin, async (req, res) => {
  const note = await getNoteById(req.params.id, req.session.userId);
  if (!note) {
    return res.status(404).json({ message: 'Không tìm thấy ghi chú để xóa.' });
  }

  await moveNoteToTrash(req.params.id, req.session.userId);
  res.json({ message: 'Đã chuyển ghi chú vào thùng rác. Ghi chú sẽ được giữ trong 30 ngày.' });
});

router.post('/:id/restore', requireLogin, async (req, res) => {
  const note = await getNoteById(req.params.id, req.session.userId, true);
  if (!note || !note.deleted_at) {
    return res.status(404).json({ message: 'Không tìm thấy ghi chú trong thùng rác.' });
  }

  await restoreNote(req.params.id, req.session.userId);
  res.json({ message: 'Đã khôi phục ghi chú.' });
});

router.delete('/:id/permanent', requireLogin, async (req, res) => {
  const note = await getNoteById(req.params.id, req.session.userId, true);
  if (!note || !note.deleted_at) {
    return res.status(404).json({ message: 'Không tìm thấy ghi chú trong thùng rác.' });
  }

  await permanentlyDeleteNote(req.params.id, req.session.userId);
  res.json({ message: 'Đã xóa vĩnh viễn ghi chú.' });
});

module.exports = router;
