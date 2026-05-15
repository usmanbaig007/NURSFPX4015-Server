const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAllAssessments,
  getAssessmentByIdentifier,
  searchAssessments,
  getDegreeStructure,
  getRandomAssessments,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} = require('../controllers/assessmentController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.get('/search', searchAssessments);
router.get('/structure', getDegreeStructure);
router.get('/random', getRandomAssessments);
router.get('/all', protect, getAllAssessments);
router.get('/', getAssessments);
router.get('/:id', getAssessmentByIdentifier);
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  createAssessment
);
router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ]),
  updateAssessment
);
router.delete('/:id', protect, deleteAssessment);

module.exports = router;
