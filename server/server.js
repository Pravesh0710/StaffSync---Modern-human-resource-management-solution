const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

if (!isTest) {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Route imports
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const trainingRoutes = require('./src/routes/trainingRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();

// Database connection (only connect automatically if not in test environment)
if (!isTest) {
  connectDB();
}

// Security & utility middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root info endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'StaffSync HRM REST API',
    status: 'Running',
    version: '1.0.0',
    healthCheck: '/api/health',
    frontendUrl: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'StaffSync HRM API is operating normally',
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/trainings', trainingRoutes);
app.use('/api/reports', reportRoutes);

// 404 Not Found route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!isTest) {
  app.listen(PORT, () => {
    console.log(`[StaffSync Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app;
