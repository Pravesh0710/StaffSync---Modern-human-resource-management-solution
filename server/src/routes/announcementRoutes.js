const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/rbac');
const validate = require('../middleware/validate');

// Protect all announcement routes
router.use(authenticate);

const announcementValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  validate
];

router.get('/', announcementController.getAnnouncements);
router.post('/', authorize('HR', 'MANAGER'), announcementValidation, announcementController.createAnnouncement);
router.put('/:id', authorize('HR', 'MANAGER'), announcementController.updateAnnouncement);
router.delete('/:id', authorize('HR', 'MANAGER'), announcementController.deleteAnnouncement);

module.exports = router;
