const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, student_id } = req.body;

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = bcrypt.hashSync(password, 10);
    const anonymous_id = `Anon_${department.substring(0,3).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;

    await db.query(
  'INSERT INTO users (name, email, password, department, student_id, anonymous_id) VALUES (?, ?, ?, ?, ?, ?)',
  [name, email, hashedPassword, department, student_id, anonymous_id]
);

    res.status(201).json({ message: 'Registration successful!' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    const token = jwt.sign(
      { id: user.id, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: {
  id: user.id,
  name: user.name,
  email: user.email,
  department: user.department,
  anonymous_id: user.anonymous_id
}
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;