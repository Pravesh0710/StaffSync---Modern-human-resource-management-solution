const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

// Protect all leave routes
router.use(authenticate);

const applyLeaveValidation = [
  body('leaveType')
    .isIn(['ANNUAL', 'SICK', 'CASUAL', 'MATERNITY', 'PATERNITY', 'UNPAID'])
    .withMessage('Invalid leave type'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('reason').trim().notEmpty().withMessage('Reason for leave is required'),
  validate
];

const reviewLeaveValidation = [
  body('status').isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  validate
];

// Employee leave routes
router.post('/', applyLeaveValidation, leaveController.applyLeave);
router.get('/my-leaves', leaveController.getMyLeaves);
router.delete('/:id', leaveController.cancelLeave);

// Management leave routes
router.get('/', authorize('HR', 'MANAGER'), leaveController.getLeaveRequests);
router.patch('/:id/review', authorize('HR', 'MANAGER'), reviewLeaveValidation, leaveController.reviewLeave);

module.exports = router;
