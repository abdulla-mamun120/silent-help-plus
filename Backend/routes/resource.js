const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// File storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/resources/');
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

// Upload resource
router.post('/upload', upload.single('file'), (req, res) => {
    const { title, department, semester, resource_type, subject, description, userId } = req.body;

    if (!title || !department || !resource_type) {
        return res.status(400).json({ success: false, message: 'Title, department and type are required' });
    }

    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const anonymous_id = 'Anon_' + department.substring(0, 3).toUpperCase() + '_' + Math.floor(Math.random() * 900 + 100);
    const file_size = (req.file.size / 1024 / 1024).toFixed(2) + ' MB';

    db.query(
        `INSERT INTO resources (uploader_id, anonymous_id, title, department, semester, resource_type, subject, description, file_name, file_path, file_size)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId || 1, anonymous_id, title, department, semester, resource_type, subject, description, req.file.originalname, req.file.path, file_size],
        (err) => {
            if (err) {
                console.error('DB Error:', err.message);
                return res.status(500).json({ success: false, message: 'Database error' });
            }
            res.status(201).json({ success: true, message: 'Resource submitted for review!' });
        }
    );
});

// Get all approved resources
router.get('/', (req, res) => {
    const { department, semester, resource_type } = req.query;

    let query = `SELECT * FROM resources WHERE status = 'approved'`;
    const params = [];

    if (department) { query += ` AND department = ?`; params.push(department); }
    if (semester)   { query += ` AND semester = ?`;   params.push(semester); }
    if (resource_type) { query += ` AND resource_type = ?`; params.push(resource_type); }

    query += ` ORDER BY created_at DESC`;

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error' });
        res.json({ success: true, resources: results });
    });
});

// Download resource (increment count)
router.get('/download/:id', (req, res) => {
    db.query(`SELECT * FROM resources WHERE id = ?`, [req.params.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        const resource = results[0];

        db.query(`UPDATE resources SET download_count = download_count + 1 WHERE id = ?`, [req.params.id]);

        res.download(path.resolve(resource.file_path), resource.file_name);
    });
});

module.exports = router;