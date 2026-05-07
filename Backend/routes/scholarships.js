const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { eligibility, deadline, amount, search } = req.query;

    let query = 'SELECT * FROM scholarships WHERE is_active = 1';
    const params = [];

    // Search filter
    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    // Eligibility filter
    if (eligibility) {
      query += ' AND eligibility = ?';
      params.push(eligibility);
    }

    // Deadline filter
    if (deadline) {
      query += ' AND deadline_urgency = ?';
      params.push(deadline);
    }

    // Amount filter
    if (amount === 'low') {
      query += ' AND amount < 2000';
    } else if (amount === 'mid') {
      query += ' AND amount BETWEEN 2000 AND 6000';
    } else if (amount === 'high') {
      query += ' AND amount > 6000';
    }

    query += ' ORDER BY is_new DESC, deadline ASC';

    const [rows] = await db.query(query, params);
    res.json({ success: true, data: rows });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Apply করা
router.post('/:id/apply', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    await db.query(
      'INSERT INTO scholarship_applications (user_id, scholarship_id) VALUES (?, ?)',
      [user_id, id]
    );

    res.json({ success: true, message: 'Application submitted!' });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Already applied!' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST - Save/Unsave
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [existing] = await db.query(
      'SELECT id FROM saved_scholarships WHERE user_id = ? AND scholarship_id = ?',
      [user_id, id]
    );

    if (existing.length > 0) {
      await db.query(
        'DELETE FROM saved_scholarships WHERE user_id = ? AND scholarship_id = ?',
        [user_id, id]
      );
      res.json({ success: true, saved: false });
    } else {
      await db.query(
        'INSERT INTO saved_scholarships (user_id, scholarship_id) VALUES (?, ?)',
        [user_id, id]
      );
      res.json({ success: true, saved: true });
    }

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;