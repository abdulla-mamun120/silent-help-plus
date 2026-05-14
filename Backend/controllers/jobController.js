const db = require('../config/db');

exports.getJobs = async (req, res) => {
    const { search, job_type, location, field, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let baseQuery = `FROM job_posts WHERE status = 'approved'`;
    const params = [];

    if (search) {
        baseQuery += ' AND (title LIKE ? OR company LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }
    if (job_type) { baseQuery += ' AND job_type = ?';  params.push(job_type); }
    if (location) { baseQuery += ' AND location = ?';  params.push(location); }
    if (field)    { baseQuery += ' AND field = ?';     params.push(field);    }

    try {
        const [[{ total }]] = await db.query(`SELECT COUNT(*) as total ${baseQuery}`, params);
        const totalPages     = Math.ceil(total / parseInt(limit));

        const [jobs] = await db.query(
            `SELECT * ${baseQuery} ORDER BY is_featured DESC, created_at DESC LIMIT ? OFFSET ?`,
            [...params, parseInt(limit), offset]
        );

        res.json({
            success: true,
            jobs,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.createJob = async (req, res) => {
    const { title, company, job_type, location, field, salary,
            hours_per_week, department, deadline, description, is_featured } = req.body;
    try {
        const [result] = await db.query(
            `INSERT INTO job_posts
             (title, company, job_type, location, field, salary, hours_per_week,
              department, deadline, description, is_featured, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
            [title, company, job_type, location, field, salary,
             hours_per_week, department, deadline || null,
             description || null, is_featured || false]
        );
        res.status(201).json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        await db.query("DELETE FROM job_posts WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM job_posts WHERE id = ?", [req.params.id]);
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Job not found' });
        res.json({ success: true, job: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};