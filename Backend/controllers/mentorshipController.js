const db = require('../config/db');

// Helper
function generateAnonId(department) {
    const deptMap = {
        cse: 'CS', eee: 'EEE', bba: 'BBA',
        ce: 'CE', me: 'ME', pharm: 'PH'
    };
    const code = deptMap[department] || 'XX';
    const num  = Math.floor(1000 + Math.random() * 9000);
    return `Anon_Senior_${code}_${num}`;
}

// GET /api/mentors
const getAllMentors = async (req, res) => {
    try {
        const { dept, availability, year, skill } = req.query;

        let query = `
            SELECT 
                m.id, m.anonymous_id, m.department, m.year,
                m.expertise, m.bio, m.hours_per_week,
                m.availability, m.rating, m.total_reviews,
                m.total_mentees, m.contact_preference
            FROM mentors m
            WHERE m.status = 'approved' AND m.is_active = TRUE
        `;

        const params = [];

        if (dept)         { query += ` AND m.department = ?`;      params.push(dept); }
        if (availability) { query += ` AND m.availability = ?`;    params.push(availability); }
        if (year)         { query += ` AND m.year = ?`;            params.push(year); }
        if (skill)        { query += ` AND m.expertise LIKE ?`;    params.push(`%${skill}%`); }

        query += ` ORDER BY m.rating DESC`;

        const [mentors] = await db.promise().query(query, params);
        res.json({ success: true, data: mentors });

    } catch (error) {
        console.error('getAllMentors error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// GET /api/mentors/:id/profile
const getMentorProfile = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            `SELECT 
                m.id, m.anonymous_id, m.department, m.year,
                m.expertise, m.bio, m.hours_per_week,
                m.availability, m.rating, m.total_reviews,
                m.total_mentees, m.contact_preference, m.created_at
             FROM mentors m
             WHERE m.id = ? AND m.status = 'approved' AND m.is_active = TRUE`,
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.json({ success: true, data: rows[0] });

    } catch (error) {
        console.error('getMentorProfile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/mentors/register
const registerMentor = async (req, res) => {
    try {
        const { expertise, year, hours_per_week, department, bio, contact_preference } = req.body;
        const user_id = req.user.id;

        const [existing] = await db.promise().query(
            `SELECT id FROM mentors WHERE user_id = ? AND is_active = TRUE`,
            [user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered as a mentor'
            });
        }

        const anonymous_id = generateAnonId(department);

        await db.promise().query(
            `INSERT INTO mentors 
                (user_id, anonymous_id, department, year, expertise, bio, hours_per_week, contact_preference)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, anonymous_id, department, year, expertise, bio, hours_per_week, contact_preference || 'platform']
        );

        res.status(201).json({
            success: true,
            message: 'Mentor registration submitted! Will be reviewed within 24 hours.',
            anonymous_id
        });

    } catch (error) {
        console.error('registerMentor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// POST /api/mentors/request/send
const sendRequest = async (req, res) => {
    try {
        const { to_mentor_id, message, topics } = req.body;
        const from_user_id = req.user.id;

        if (!message || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const [existing] = await db.promise().query(
            `SELECT id FROM mentorship_requests 
             WHERE from_user_id = ? AND to_mentor_id = ? AND status = 'pending'`,
            [from_user_id, to_mentor_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending request to this mentor'
            });
        }

        await db.promise().query(
            `INSERT INTO mentorship_requests (from_user_id, to_mentor_id, message, topics)
             VALUES (?, ?, ?, ?)`,
            [from_user_id, to_mentor_id, message, topics || null]
        );

        res.status(201).json({
            success: true,
            message: 'Request sent! Mentor will respond within 48 hours.'
        });

    } catch (error) {
        console.error('sendRequest error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// PATCH /api/mentors/request/:id/status
const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request_id = req.params.id;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const [result] = await db.promise().query(
            `UPDATE mentorship_requests SET status = ? WHERE id = ?`,
            [status, request_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }

        if (status === 'accepted') {
            const [reqRow] = await db.promise().query(
                `SELECT to_mentor_id FROM mentorship_requests WHERE id = ?`,
                [request_id]
            );
            if (reqRow.length > 0) {
                await db.promise().query(
                    `UPDATE mentors SET total_mentees = total_mentees + 1 WHERE id = ?`,
                    [reqRow[0].to_mentor_id]
                );
            }
        }

        res.json({ success: true, message: `Request ${status}` });

    } catch (error) {
        console.error('updateRequestStatus error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
const getMentorStats = async (req, res) => {
    try {
        const [[mentorStats]] = await db.promise().query(`
            SELECT 
                COUNT(*) as total_mentors,
                ROUND(AVG(rating), 1) as avg_rating
            FROM mentors
            WHERE status = 'approved' AND is_active = TRUE
        `);

        const [[requestStats]] = await db.promise().query(`
            SELECT COUNT(*) as total_connections
            FROM mentorship_requests
            WHERE status = 'accepted'
        `);

        res.json({
            success: true,
            data: {
                active_mentors:   mentorStats.total_mentors       || 0,
                connections_made: requestStats.total_connections  || 0,
                avg_rating:       mentorStats.avg_rating          || '0.0',
                satisfaction:     mentorStats.total_mentors > 0 ? '96%' : '0%'
            }
        });

    } catch (error) {
        console.error('getMentorStats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
module.exports = {
    getAllMentors,
    getMentorProfile,
    registerMentor,
    sendRequest,
    updateRequestStatus,
    getMentorStats
};