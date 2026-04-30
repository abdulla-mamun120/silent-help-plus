const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all pending resources
router.get('/resources', (req, res) => {
    const { status } = req.query;
    let query = `SELECT * FROM resources`;
    const params = [];

    if (status) {
        query += ` WHERE status = ?`;
        params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, resources: results });
    });
});

// Approve or reject resource
router.put('/resources/:id', (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    db.query(
        `UPDATE resources SET status = ? WHERE id = ?`,
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: `Resource ${status}!` });
        }
    );
});

// Get all reports
router.get('/reports', (req, res) => {
    db.query(
        `SELECT * FROM reports ORDER BY created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, reports: results });
        }
    );
});

// Update report status
router.put('/reports/:id', (req, res) => {
    const { status } = req.body;

    if (!['pending', 'investigating', 'resolved'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    db.query(
        `UPDATE reports SET status = ? WHERE id = ?`,
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: `Report updated!` });
        }
    );
});

module.exports = router;