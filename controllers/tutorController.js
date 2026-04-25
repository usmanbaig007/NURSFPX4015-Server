const Tutor = require('../models/Tutor');
const { cloudinary } = require('../config/cloudinary');

const getTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: tutors });
  } catch (error) {
    console.error('Get tutors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAllTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: tutors });
  } catch (error) {
    console.error('Get all tutors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createTutor = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      data.imageUrl = req.file.path;
      data.imagePublicId = req.file.filename;
    }
    const tutor = await Tutor.create(data);
    res.status(201).json({ success: true, data: tutor });
  } catch (error) {
    console.error('Create tutor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }
    res.json({ success: true, data: tutor });
  } catch (error) {
    console.error('Update tutor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ success: false, message: 'Tutor not found' });
    }
    if (tutor.imagePublicId) {
      await cloudinary.uploader.destroy(tutor.imagePublicId);
    }
    await tutor.deleteOne();
    res.json({ success: true, message: 'Tutor deleted' });
  } catch (error) {
    console.error('Delete tutor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getTutors, getAllTutors, createTutor, updateTutor, deleteTutor };
