const express = require('express');
const router = express.Router();
const {
  validateContact,
  submitContact,
  getSubmissions,
  markAsRead,
  deleteSubmission,
} = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', validateContact, submitContact);
router.get('/', protect, getSubmissions);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteSubmission);

module.exports = router;
