const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessmentById,
  searchAssessments,
  getDegreeStructure,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/search', searchAssessments);
router.get('/structure', getDegreeStructure);
router.get('/', getAssessments);
router.get('/:id', getAssessmentById);
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createAssessment
);
router.put('/:id', protect, updateAssessment);
router.delete('/:id', protect, deleteAssessment);

module.exports = router;
