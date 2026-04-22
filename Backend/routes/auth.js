const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register
router.post('/register', (req, res) => {
  const { name, email, password, department, student_id } = req.body;

  // Check if user exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    db.query(
      'INSERT INTO users (name, email, password, department, student_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, department, student_id],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Registration failed' });
        res.status(201).json({ message: 'Registration successful!' });
      }
    );
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];

    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    // Generate JWT token
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
        department: user.department
      }
    });
  });
});

module.exports = router;