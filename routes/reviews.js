const express = require('express');
const router = express.Router();
const {
  getReviews,
  createReview,
  createAdminReview,
  updateReview,
  approveReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getReviews);
router.post('/', createReview);
router.post('/admin', protect, createAdminReview);
router.put('/:id', protect, updateReview);
router.patch('/:id/approve', protect, approveReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
