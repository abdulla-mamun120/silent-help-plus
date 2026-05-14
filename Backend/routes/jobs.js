const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const jobController = require('../controllers/jobController');

// ── Submit (Post a Job form) ──
router.post('/submit', async (req, res) => {
    const { title, company, job_type, location, field, salary,
            hours_per_week, department, deadline, description, is_featured } = req.body;

    if (!title || !job_type || !location) {
        return res.status(400).json({ success: false, message: 'Title, job_type, location required' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO job_posts
             (title, company, job_type, location, field, salary, hours_per_week,
              department, deadline, description, is_featured, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [title, company, job_type, location, field, salary,
             hours_per_week, department, deadline || null,
             description || null, is_featured || false]
        );
        res.status(201).json({ success: true, message: 'Job submitted for review!', id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── Stats ──
router.get('/stats', async (req, res) => {
    try {
        const [[r1], [r2], [r3], [r4]] = await Promise.all([
            db.query("SELECT COUNT(*) as count FROM job_posts WHERE status = 'approved'"),
            db.query("SELECT COUNT(*) as count FROM job_posts WHERE job_type = 'internship' AND status = 'approved'"),
            db.query("SELECT COUNT(*) as count FROM job_posts WHERE location = 'remote' AND status = 'approved'"),
            db.query("SELECT COUNT(*) as count FROM job_posts WHERE DATE(created_at) = CURDATE() AND status = 'approved'")
        ]);

        res.json({
            success:     true,
            total:       r1[0].count,
            internships: r2[0].count,
            remote:      r3[0].count,
            new_today:   r4[0].count
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// ── CRUD (jobController) ──
router.get('/',    jobController.getJobs);
router.post('/',   jobController.createJob);
router.get('/:id', jobController.getJobById);
router.delete('/:id', jobController.deleteJob);

module.exports = router;