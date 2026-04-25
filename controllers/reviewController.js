const Review = require('../models/Review');

const getReviews = async (req, res) => {
  try {
    const query = req.query.all === 'true' ? {} : { isApproved: true };
    const reviews = await Review.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const createReview = async (req, res) => {
  try {
    const { studentName, rating, comment, course, source } = req.body;
    if (!studentName || !rating || !comment) {
      return res
        .status(400)
        .json({ success: false, message: 'Name, rating, and comment are required' });
    }
    const review = await Review.create({ studentName, rating, comment, course, source });
    res.status(201).json({
      success: true,
      message: 'Review submitted for approval',
      data: { id: review._id },
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, data: review });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getReviews, createReview, approveReview, deleteReview };
