const db = require('../config/db');

// ─── GET /api/admin/mentors/pending ──────────────────────────────
const getPendingMentors = async (req, res) => {
    try {
        const [mentors] = await db.query(`
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
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── PATCH /api/admin/mentors/:id/approve ────────────────────────
const approveMentor = async (req, res) => {
    try {
        const [result] = await db.query(
            `UPDATE mentors SET status = 'approved' WHERE id = ?`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.json({ success: true, message: 'Mentor approved successfully' });

    } catch (error) {
        console.error('approveMentor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── PATCH /api/admin/mentors/:id/reject ─────────────────────────
const rejectMentor = async (req, res) => {
    try {
        const [result] = await db.query(
            `UPDATE mentors SET status = 'rejected' WHERE id = ?`,
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Mentor not found' });
        }

        res.json({ success: true, message: 'Mentor rejected' });

    } catch (error) {
        console.error('rejectMentor error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ─── GET /api/admin/mentors/requests ─────────────────────────────
const getAllMentorRequests = async (req, res) => {
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

    } catch (error) {
        console.error('getAllMentorRequests error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    getPendingMentors,
    approveMentor,
    rejectMentor,
    getAllMentorRequests
};