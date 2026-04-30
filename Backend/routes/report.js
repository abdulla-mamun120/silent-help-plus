const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.post('/', (req, res) => {
    const { reportType, description, userId } = req.body;

    if (!reportType || !description)
        return res.status(400).json({ success: false, message: 'reportType এবং description আবশ্যক' });

    if (description.trim().length < 50)
        return res.status(400).json({ success: false, message: 'কমপক্ষে ৫০ অক্ষর লিখুন' });

    const anonymous_id = 'REP_' + Math.random().toString(36).substr(2, 8).toUpperCase();

    db.query(
        `INSERT INTO reports (reporter_id, anonymous_id, report_type, description)
         VALUES (?, ?, ?, ?)`,
        [userId, anonymous_id, reportType, description.trim()],
        (err) => {
            if (err) {
                console.error('DB Error:', err.message);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.status(201).json({
                success: true,
                message: 'Report submitted!',
                reportId: anonymous_id
            });
        }
    );
});

module.exports = router;