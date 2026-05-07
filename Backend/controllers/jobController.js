const db = require('../config/db');

// GET all jobs (with filters)
exports.getJobs = (req, res) => {
    const { search, job_type, location, field } = req.query;

    let query = `SELECT * FROM job_posts WHERE status = 'approved'`;
    const params = [];

    if (search) {
        query += ' AND (title LIKE ? OR company LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (job_type) {
        query += ' AND job_type = ?';
        params.push(job_type);
    }
    if (location) {
        query += ' AND location = ?';
        params.push(location);
    }
    if (field) {
        query += ' AND field = ?';
        params.push(field);
    }

    query += ' ORDER BY is_featured DESC, created_at DESC';

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        res.json({ success: true, jobs: results });
    });
};

// GET single job
exports.getJobById = (req, res) => {
    db.query('SELECT * FROM job_posts WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(404).json({ message: 'Job not found' });
        res.json({ success: true, job: results[0] });
    });
};

// POST create job (admin)
exports.createJob = (req, res) => {
    const { title, company, job_type, location, field, salary, hours_per_week, department, is_featured, deadline } = req.body;

    const query = `INSERT INTO job_posts 
        (title, company, job_type, location, field, salary, hours_per_week, department, is_featured, deadline) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [title, company, job_type, location, field, salary, hours_per_week, department, is_featured || false, deadline], (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error', error: err });
        res.status(201).json({ success: true, message: 'Job created', id: result.insertId });
    });
};

// DELETE job (admin)
exports.deleteJob = (req, res) => {
    db.query('DELETE FROM job_posts WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ success: true, message: 'Job deleted' });
    });
};