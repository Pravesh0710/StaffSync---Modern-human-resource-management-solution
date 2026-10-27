const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

// Protect all attendance routes
router.use(authenticate);

// Employee attendance workflow
router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/today', attendanceController.getMyTodayAttendance);
router.get('/my-history', attendanceController.getMyAttendanceHistory);

// Management / HR attendance oversight
router.get('/', authorize('HR', 'MANAGER'), attendanceController.getAllAttendance);

// HR manual entry / adjustment
const manualAttendanceValidation = [
  body('employeeId').isMongoId().withMessage('Valid employee ID required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('status').isIn(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE']).withMessage('Invalid status'),
  validate
];

router.post('/manual', authorize('HR'), manualAttendanceValidation, attendanceController.recordManualAttendance);

module.exports = router;
