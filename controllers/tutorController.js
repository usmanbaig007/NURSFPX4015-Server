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
    const { name, credentials, specialty, bio, order, isActive, imageUrl, imagePublicId } = req.body;
    const tutor = await Tutor.create({
      name, credentials, specialty, bio,
      order: order || 0,
      isActive: isActive !== 'false' && isActive !== false,
      imageUrl: imageUrl || '',
      imagePublicId: imagePublicId || '',
    });
    res.status(201).json({ success: true, data: tutor });
  } catch (error) {
    console.error('Create tutor error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateTutor = async (req, res) => {
  try {
    const { name, credentials, specialty, bio, order, isActive, imageUrl, imagePublicId } = req.body;

    const data = { name, credentials, specialty, bio, order, isActive };

    // If a new image URL is provided, update it and destroy the old one
    if (imageUrl) {
      const existing = await Tutor.findById(req.params.id);
      if (existing && existing.imagePublicId && existing.imagePublicId !== imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId).catch(() => {});
      }
      data.imageUrl = imageUrl;
      data.imagePublicId = imagePublicId || '';
    }

    const tutor = await Tutor.findByIdAndUpdate(req.params.id, data, {
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
