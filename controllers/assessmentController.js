const Assessment = require('../models/Assessment');
const { cloudinary } = require('../config/cloudinary');

const getAssessments = async (req, res) => {
  try {
    const { degree, className, featured, nursfpx4015, page = 1, limit = 12 } = req.query;
    const query = {};
    if (degree) query.degree = new RegExp(`^${degree}$`, 'i');
    if (className) query.className = new RegExp(`^${className}$`, 'i');
    if (featured === 'true') query.isFeatured = true;
    if (nursfpx4015 === 'true') query.isNursfpx4015 = true;

    const skip = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit));
    const lim = Math.min(50, parseInt(limit));

    const [assessments, total] = await Promise.all([
      Assessment.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim),
      Assessment.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: assessments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / lim),
    });
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const searchAssessments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const regex = new RegExp(q.trim(), 'i');
    const assessments = await Assessment.find({
      $or: [
        { title: regex },
        { description: regex },
        { className: regex },
        { degree: regex },
        { tags: { $in: [regex] } },
      ],
    }).limit(20);

    res.json({ success: true, data: assessments, total: assessments.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getDegreeStructure = async (req, res) => {
  try {
    const structure = await Assessment.aggregate([
      {
        $group: {
          _id: { degree: '$degree', className: '$className' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.degree',
          classes: {
            $push: { name: '$_id.className', count: '$count' },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: structure });
  } catch (error) {
    console.error('Degree structure error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createAssessment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.files?.image?.[0]) {
      data.imageUrl = req.files.image[0].path;
      data.imagePublicId = req.files.image[0].filename;
    }
    if (req.files?.file?.[0]) {
      data.fileUrl = req.files.file[0].path;
      data.filePublicId = req.files.file[0].filename;
    }
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    const assessment = await Assessment.create(data);
    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAssessment = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.tags && typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    const assessment = await Assessment.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    res.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    if (assessment.imagePublicId) {
      await cloudinary.uploader.destroy(assessment.imagePublicId);
    }
    if (assessment.filePublicId) {
      await cloudinary.uploader.destroy(assessment.filePublicId, { resource_type: 'raw' });
    }
    await assessment.deleteOne();
    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAssessments,
  getAssessmentById,
  searchAssessments,
  getDegreeStructure,
  createAssessment,
  updateAssessment,
  deleteAssessment,
};
