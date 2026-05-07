const express = require('express');
const router = express.Router();
const {
  getTutors,
  getAllTutors,
  createTutor,
  updateTutor,
  deleteTutor,
} = require('../controllers/tutorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getTutors);
router.get('/all', protect, getAllTutors);
router.post('/', protect, createTutor);
router.put('/:id', protect, updateTutor);
router.delete('/:id', protect, deleteTutor);

module.exports = router;
