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
// Get all jobs
router.get('/jobs', (req, res) => {
    db.query(
        `SELECT * FROM job_posts ORDER BY created_at DESC`,
        (err, results) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, jobs: results });
        }
    );
});

// Create new job
router.post('/jobs', (req, res) => {
    const { title, company, job_type, location, field, salary, hours_per_week, department, is_featured, deadline } = req.body;

    if (!title || !job_type || !location) {
        return res.status(400).json({ success: false, message: 'Title, job_type, location required' });
    }

    db.query(
        `INSERT INTO job_posts (title, company, job_type, location, field, salary, hours_per_week, department, is_featured, deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, company, job_type, location, field, salary, hours_per_week, department, is_featured || false, deadline || null],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.status(201).json({ success: true, message: 'Job created!', id: result.insertId });
        }
    );
});

// Update job
router.put('/jobs/:id', (req, res) => {
    const { title, company, job_type, location, field, salary, hours_per_week, department, is_featured, deadline } = req.body;

    db.query(
        `UPDATE job_posts SET title=?, company=?, job_type=?, location=?, field=?, salary=?, hours_per_week=?, department=?, is_featured=?, deadline=?
         WHERE id=?`,
        [title, company, job_type, location, field, salary, hours_per_week, department, is_featured || false, deadline || null, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: 'Job updated!' });
        }
    );
});

// Delete job
router.delete('/jobs/:id', (req, res) => {
    db.query(
        `DELETE FROM job_posts WHERE id = ?`,
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: 'Job deleted!' });
        }
    );
});
// Approve or reject job
router.put('/jobs/:id/status', (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    db.query(
        `UPDATE job_posts SET status = ? WHERE id = ?`,
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error' });
            res.json({ success: true, message: `Job ${status}!` });
        }
    );
});

// ─── Mentor Routes ────────────────────────────────────────────────

// Get all pending mentors
router.get('/mentors/pending', async (req, res) => {
    try {
        const [mentors] = await db.promise().query(`
            SELECT 
                m.id,
                m.anonymous_id,
                m.department,
                m.year,
                m.expertise,
                m.bio,
                m.hours_per_week,
                m.contact_preference,
                m.status,
                m.created_at
            FROM mentors m
            WHERE m.status = 'pending'
            ORDER BY m.created_at DESC
        `);

        res.json({ success: true, data: mentors });

    } catch (error) {
        console.error('getPendingMentors error:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Approve mentor
router.patch('/mentors/:id/approve', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `UPDATE mentors SET status = 'approved' WHERE id = ?`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.json({ success: true, message: 'Mentor approved successfully' });

    } catch (error) {
        console.error('approveMentor error:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Reject mentor
router.patch('/mentors/:id/reject', async (req, res) => {
    try {
        const [result] = await db.promise().query(
            `UPDATE mentors SET status = 'rejected' WHERE id = ?`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.json({ success: true, message: 'Mentor rejected' });

    } catch (error) {
        console.error('rejectMentor error:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

// Get all mentorship requests
router.get('/mentors/requests', async (req, res) => {
    try {
        const [requests] = await db.promise().query(`
            SELECT 
                mr.id,
                mr.message,
                mr.topics,
                mr.status,
                mr.created_at,
                m.anonymous_id AS mentor_name,
                m.department   AS mentor_dept
            FROM mentorship_requests mr
            JOIN mentors m ON mr.to_mentor_id = m.id
            ORDER BY mr.created_at DESC
        `);

        res.json({ success: true, data: requests });

    } catch (error) {
        console.error('getAllMentorRequests error:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});


module.exports = router;