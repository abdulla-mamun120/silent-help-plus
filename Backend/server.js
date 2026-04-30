const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Frontend')));

// Test Route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Silent Help+ Backend is running!' });
});

// Page Routes
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/dashboard/dashboard.html'));
});

app.get('/qa', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/qa.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/login page/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/register.html'));
});
app.get('/resources', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/resources.html'));
});

app.get('/scholarships', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/scholarships.html'));
});

app.get('/jobs', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/jobs.html'));
});

app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/books.html'));
});

app.get('/mentorship', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/mentorship.html'));
});

app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/report.html'));
});

// Routes 
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/helpRequest'));
app.use('/api/reports', require('./routes/report'));
app.use('/api/resources', require('./routes/resource'));
app.use('/api/admin', require('./routes/admin'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});