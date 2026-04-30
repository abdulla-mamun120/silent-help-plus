const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all questions (department filter)
router.get('/', (req, res) => {
    const { department } = req.query;
    let query = 'SELECT * FROM help_requests ORDER BY created_at DESC';
    let params = [];

    if (department) {
        query = 'SELECT * FROM help_requests WHERE department = ? ORDER BY created_at DESC';
        params = [department];
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

// Post a new question
router.post('/', (req, res) => {
    const { user_id, department, category, question_text } = req.body;

    // Generate anonymous ID
    const anonymous_id = 'Anon_' + department + '_' + Math.floor(1000 + Math.random() * 9000);

    db.query(
        'INSERT INTO help_requests (user_id, anonymous_id, department, category, question_text) VALUES (?, ?, ?, ?, ?)',
        [user_id, anonymous_id, department, category, question_text],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to post question' });
            res.status(201).json({ 
                message: 'Question posted successfully!',
                anonymous_id: anonymous_id
            });
        }
    );
});

// Vote on a question
router.post('/:id/vote', (req, res) => {
    const { id } = req.params;
    db.query(
        'UPDATE help_requests SET votes = votes + 1 WHERE id = ?',
        [id],
        (err) => {
            if (err) return res.status(500).json({ message: 'Vote failed' });
            res.json({ message: 'Voted successfully!' });
        }
    );
});

module.exports = router;