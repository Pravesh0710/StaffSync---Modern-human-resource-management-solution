const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

// Protect all employee routes with authentication
router.use(authenticate);

// Validation rules for creating an employee
const createEmployeeValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
  validate
];

// Routes
router.get('/', authorize('HR', 'MANAGER'), employeeController.getAllEmployees);
router.post('/', authorize('HR'), createEmployeeValidation, employeeController.createEmployee);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);
router.patch('/:id/toggle-status', authorize('HR'), employeeController.toggleEmployeeStatus);
router.delete('/:id', authorize('HR'), employeeController.deleteEmployee);

module.exports = router;
