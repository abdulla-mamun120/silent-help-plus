const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jobController = require('../controllers/jobController');


router.post('/submit', (req, res) => {
    const { title, company, job_type, location, field, salary, hours_per_week, department, deadline, description, is_featured } = req.body;

    if (!title || !job_type || !location) {
        return res.status(400).json({ success: false, message: 'Title, job_type, location required' });
    }

    db.query(
        `INSERT INTO job_posts (title, company, job_type, location, field, salary, hours_per_week, department, deadline, description, is_featured, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [title, company, job_type, location, field, salary, hours_per_week, department, deadline || null, description || null, is_featured || false],
        (err, result) => {
            if (err) {
                console.log('DB Error:', err);
                return res.status(500).json({ success: false, message: 'Database error', error: err });
            }
            res.status(201).json({ success: true, message: 'Job submitted for review!', id: result.insertId });
        }
    );
});

router.get('/', jobController.getJobs);
router.post('/', jobController.createJob);
router.delete('/:id', jobController.deleteJob);
router.get('/:id', jobController.getJobById);

module.exports = router;