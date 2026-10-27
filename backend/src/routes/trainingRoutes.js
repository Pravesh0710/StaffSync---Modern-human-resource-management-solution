const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const trainingController = require('../controllers/trainingController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

// Protect all training routes
router.use(authenticate);

const createTrainingValidation = [
  body('title').trim().notEmpty().withMessage('Training title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  validate
];

// Employee view assigned trainings
router.get('/my-trainings', trainingController.getMyTrainings);

// Management routes
router.get('/', authorize('HR', 'MANAGER'), trainingController.getAllTrainings);
router.post('/', authorize('HR', 'MANAGER'), createTrainingValidation, trainingController.createTraining);
router.put('/:id', authorize('HR', 'MANAGER'), trainingController.updateTraining);
router.delete('/:id', authorize('HR', 'MANAGER'), trainingController.deleteTraining);

module.exports = router;
