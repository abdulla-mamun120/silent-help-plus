const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/books
router.get('/', async (req, res) => {
  const { type, dept, condition, search } = req.query;

  let query = 'SELECT * FROM book_exchange WHERE 1=1';
  const vals = [];

  if (type)      { query += ' AND type = ?';           vals.push(type); }
  if (dept)      { query += ' AND dept = ?';           vals.push(dept); }
  if (condition) { query += ' AND book_condition = ?'; vals.push(condition); }
  if (search)    {
    query += ' AND (book_title LIKE ? OR author LIKE ?)';
    vals.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC';

  try {
    const [results] = await db.query(query, vals);

    const books = results.map(row => ({
      id:             row.id,
      title:          row.book_title,
      author:         row.author,
      type:           row.type,
      price:          row.price,
      condition:      row.book_condition,
      dept:           row.dept,
      notes:          row.notes,
      seller_anon_id: 'Anon_' + row.owner_id,
      created_at:     row.created_at,
      status:         row.status
    }));

    res.json({ success: true, books });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/books
let lastInsert = {};

router.post('/', async (req, res) => {
  const { title, author, type, price, condition, dept, notes, owner_id } = req.body;

  if (!title || !type || !condition) {
    return res.status(400).json({ success: false, error: 'title, type, condition required' });
  }

  const key = `${owner_id}-${title}-${type}`;
  const now = Date.now();
  if (lastInsert[key] && now - lastInsert[key] < 3000) {
    return res.status(429).json({ success: false, error: 'Duplicate request' });
  }
  lastInsert[key] = now;

  const finalOwnerId = owner_id || 1;

  try {
    const [result] = await db.query(
      `INSERT INTO book_exchange (owner_id, book_title, author, type, price, book_condition, dept, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [finalOwnerId, title, author || null, type, price || 0, condition, dept || null, notes || null]
    );

    const [rows] = await db.query('SELECT * FROM book_exchange WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, book: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM book_exchange WHERE id = ?', [bookId]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });

    await db.query('DELETE FROM book_exchange WHERE id = ?', [bookId]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/books/:id/contact
router.post('/:id/contact', async (req, res) => {
  const { message, contact_info } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Message required' });

  const bookId = req.params.id;
  const sender_id = 1;

  try {
    const [rows] = await db.query('SELECT id FROM book_exchange WHERE id = ?', [bookId]);
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Book not found' });

    await db.query(
      `INSERT INTO book_messages (book_id, sender_id, message, contact_info) VALUES (?, ?, ?, ?)`,
      [bookId, sender_id, message, contact_info || null]
    );

    res.json({ success: true, message: 'Message sent anonymously' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/books/:id/wishlist
router.post('/:id/wishlist', async (req, res) => {
  const bookId = req.params.id;
  const user_id = 1;

  try {
    const [rows] = await db.query(
      'SELECT id FROM book_wishlists WHERE user_id = ? AND book_id = ?',
      [user_id, bookId]
    );

    if (rows.length > 0) {
      await db.query(
        'DELETE FROM book_wishlists WHERE user_id = ? AND book_id = ?',
        [user_id, bookId]
      );
      res.json({ success: true, wishlisted: false });
    } else {
      await db.query(
        'INSERT INTO book_wishlists (user_id, book_id) VALUES (?, ?)',
        [user_id, bookId]
      );
      res.json({ success: true, wishlisted: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;