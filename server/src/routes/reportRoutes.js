const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');

// Protect all report routes
router.use(authenticate);

// HR reporting metrics
router.get('/hr-metrics', authorize('HR'), reportController.getHRMetrics);
router.get('/attendance-report', authorize('HR'), reportController.getAttendanceReport);

// Manager team reporting metrics
router.get('/manager-metrics', authorize('MANAGER'), reportController.getManagerMetrics);

module.exports = router;
