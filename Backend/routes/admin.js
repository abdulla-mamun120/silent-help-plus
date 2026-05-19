const express = require('express');
const router = express.Router();
const db = require('../config/db');

// ─── Resources ────────────────────────────────────────────────────

router.get('/resources', async (req, res) => {
    const { status } = req.query;
    let query = `SELECT * FROM resources`;
    const params = [];

    if (status) {
        query += ` WHERE status = ?`;
        params.push(status);
    }

    query += ` ORDER BY created_at DESC`;

    try {
        const [results] = await db.query(query, params);
        res.json({ success: true, resources: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/resources/:id', async (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        await db.query(`UPDATE resources SET status = ? WHERE id = ?`, [status, req.params.id]);
        res.json({ success: true, message: `Resource ${status}!` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Reports ──────────────────────────────────────────────────────

router.get('/reports', async (req, res) => {
    try {
        const [results] = await db.query(`SELECT * FROM reports ORDER BY created_at DESC`);
        res.json({ success: true, reports: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/reports/:id', async (req, res) => {
    const { status } = req.body;

    if (!['pending', 'investigating', 'resolved'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        await db.query(`UPDATE reports SET status = ? WHERE id = ?`, [status, req.params.id]);
        res.json({ success: true, message: `Report updated!` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Jobs ─────────────────────────────────────────────────────────

router.get('/jobs', async (req, res) => {
    try {
        const [results] = await db.query(`SELECT * FROM job_posts ORDER BY created_at DESC`);
        res.json({ success: true, jobs: results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/jobs', async (req, res) => {
    const { title, company, job_type, location, field, salary,
            hours_per_week, department, is_featured, deadline } = req.body;

    if (!title || !job_type || !location) {
        return res.status(400).json({ success: false, message: 'Title, job_type, location required' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO job_posts (title, company, job_type, location, field, salary,
             hours_per_week, department, is_featured, deadline)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, company, job_type, location, field, salary,
             hours_per_week, department, is_featured || false, deadline || null]
        );
        res.status(201).json({ success: true, message: 'Job created!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/jobs/:id', async (req, res) => {
    const { title, company, job_type, location, field, salary,
            hours_per_week, department, is_featured, deadline } = req.body;

    try {
        await db.query(
            `UPDATE job_posts SET title=?, company=?, job_type=?, location=?, field=?,
             salary=?, hours_per_week=?, department=?, is_featured=?, deadline=? WHERE id=?`,
            [title, company, job_type, location, field, salary,
             hours_per_week, department, is_featured || false, deadline || null, req.params.id]
        );
        res.json({ success: true, message: 'Job updated!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/jobs/:id', async (req, res) => {
    try {
        await db.query(`DELETE FROM job_posts WHERE id = ?`, [req.params.id]);
        res.json({ success: true, message: 'Job deleted!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/jobs/:id/status', async (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
        await db.query(`UPDATE job_posts SET status = ? WHERE id = ?`, [status, req.params.id]);
        res.json({ success: true, message: `Job ${status}!` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Mentors ──────────────────────────────────────────────────────

router.get('/mentors/pending', async (req, res) => {
    try {
        const [mentors] = await db.query(`
            SELECT id, anonymous_id, department, year, expertise,
                   bio, hours_per_week, contact_preference, status, created_at
            FROM mentors
            WHERE status = 'pending'
            ORDER BY created_at DESC
        `);
        res.json({ success: true, data: mentors });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/mentors/:id/approve', async (req, res) => {
    try {
        const [result] = await db.query(
            `UPDATE mentors SET status = 'approved' WHERE id = ?`,
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }
        res.json({ success: true, message: 'Mentor approved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.patch('/mentors/:id/reject', async (req, res) => {
    try {
        const [result] = await db.query(
            `UPDATE mentors SET status = 'rejected' WHERE id = ?`,
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }
        res.json({ success: true, message: 'Mentor rejected' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/mentors/requests', async (req, res) => {
    try {
        const [requests] = await db.query(`
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
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;