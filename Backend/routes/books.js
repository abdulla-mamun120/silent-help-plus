const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/books — সব listing, filter সহ
router.get('/', (req, res) => {
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

  db.query(query, vals, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });

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
  });
});

let lastInsert = {};

router.post('/', (req, res) => {
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

  db.query(
    `INSERT INTO book_exchange (owner_id, book_title, author, type, price, book_condition, dept, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [finalOwnerId, title, author || null, type, price || 0, condition, dept || null, notes || null],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      db.query('SELECT * FROM book_exchange WHERE id = ?', [result.insertId], (err2, rows) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.status(201).json({ success: true, book: rows[0] });
      });
    }
  );
});

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  const bookId = req.params.id;

  db.query('SELECT * FROM book_exchange WHERE id = ?', [bookId], (err, rows) => {
    if (err)  return res.status(500).json({ success: false, error: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Not found' });

    db.query('DELETE FROM book_exchange WHERE id = ?', [bookId], (err2) => {
      if (err2) return res.status(500).json({ success: false, error: err2.message });
      res.json({ success: true, message: 'Deleted' });
    });
  });
});

// POST /api/books/:id/contact
router.post('/:id/contact', (req, res) => {
  const { message, contact_info } = req.body;
  if (!message) return res.status(400).json({ success: false, error: 'Message required' });

  const bookId = req.params.id;
  const sender_id = 1;

  db.query('SELECT id FROM book_exchange WHERE id = ?', [bookId], (err, rows) => {
    if (err)  return res.status(500).json({ success: false, error: err.message });
    if (rows.length === 0) return res.status(404).json({ success: false, error: 'Book not found' });

    db.query(
      `INSERT INTO book_messages (book_id, sender_id, message, contact_info) VALUES (?, ?, ?, ?)`,
      [bookId, sender_id, message, contact_info || null],
      (err2) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, message: 'Message sent anonymously' });
      }
    );
  });
});

// POST /api/books/:id/wishlist — toggle
router.post('/:id/wishlist', (req, res) => {
  const bookId = req.params.id;
  const user_id = 1;

  db.query(
    'SELECT id FROM book_wishlists WHERE user_id = ? AND book_id = ?',
    [user_id, bookId],
    (err, rows) => {
      if (err) return res.status(500).json({ success: false, error: err.message });

      if (rows.length > 0) {
        db.query(
          'DELETE FROM book_wishlists WHERE user_id = ? AND book_id = ?',
          [user_id, bookId],
          (err2) => {
            if (err2) return res.status(500).json({ success: false, error: err2.message });
            res.json({ success: true, wishlisted: false });
          }
        );
      } else {
        db.query(
          'INSERT INTO book_wishlists (user_id, book_id) VALUES (?, ?)',
          [user_id, bookId],
          (err2) => {
            if (err2) return res.status(500).json({ success: false, error: err2.message });
            res.json({ success: true, wishlisted: true });
          }
        );
      }
    }
  );
});

module.exports = router;