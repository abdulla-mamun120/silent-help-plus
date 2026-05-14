const express = require('express');
const router = express.Router();
const {
    getAllMentors,
    registerMentor,
    getMentorProfile,
    sendRequest,
    updateRequestStatus
} = require('../controllers/mentorshipController');

const { verifyToken } = require('../middleware/auth');

// Public
router.get('/stats', require('../controllers/mentorshipController').getMentorStats);
router.get('/', getAllMentors);
router.get('/:id/profile', getMentorProfile);

router.post('/register', verifyToken, registerMentor);
router.post('/request/send', verifyToken, sendRequest);
router.patch('/request/:id/status', verifyToken, updateRequestStatus);

module.exports = router;