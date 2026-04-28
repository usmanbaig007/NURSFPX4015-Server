const Assessment = require('../models/Assessment');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');

const normalizeAssessmentPayload = (payload = {}) => {
  const data = { ...payload };

  // Description is deprecated and should not be persisted anymore.
  delete data.description;
  delete data.slug;

  if (typeof data.tags === 'string') {
    data.tags = data.tags.split(',').map((t) => t.trim()).filter(Boolean);
  }

  ['isFeatured', 'isNursfpx4015'].forEach((key) => {
    if (typeof data[key] === 'string') {
      data[key] = data[key] === 'true';
    }
  });

  return data;
};

const LEGACY_ASSESSMENT_ID_SUFFIX_REGEX = /-[a-f0-9]{24}$/i;

const slugifyAssessmentTitle = (title = '') => {
  const slug = String(title)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return slug || 'assessment';
};

const sanitizeIncomingSlug = (slug = '') => {
  return String(slug || '')
    .trim()
    .toLowerCase()
    .replace(LEGACY_ASSESSMENT_ID_SUFFIX_REGEX, '')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildTitleRegexFromSlug = (slug = '') => {
  const tokens = sanitizeIncomingSlug(slug).split('-').filter(Boolean);
  if (!tokens.length) return null;

  return new RegExp(`^\\s*${tokens.map(escapeRegex).join('[^a-zA-Z0-9]+')}\\s*$`, 'i');
};

const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = slugifyAssessmentTitle(title);
  let candidate = baseSlug;
  let counter = 2;
  const filter = excludeId ? { _id: { $ne: excludeId } } : {};

  while (await Assessment.exists({ slug: candidate, ...filter })) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return candidate;
};

const ensureAssessmentSlug = async (assessment) => {
  if (!assessment) return assessment;
  if (assessment.slug) return assessment;

  assessment.slug = await generateUniqueSlug(assessment.title, assessment._id);
  await assessment.save();

  return assessment;
};

const ensureAssessmentSlugs = async (assessments = []) => {
  await Promise.all(assessments.map((assessment) => ensureAssessmentSlug(assessment)));
  return assessments;
};

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

    await ensureAssessmentSlugs(assessments);

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

const getAssessmentByIdentifier = async (req, res) => {
  try {
    const rawIdentifier = String(req.params.id || '').trim();
    const sanitizedSlug = sanitizeIncomingSlug(rawIdentifier);
    let assessment = null;

    if (mongoose.isValidObjectId(rawIdentifier)) {
      assessment = await Assessment.findById(rawIdentifier);
    }

    if (!assessment && sanitizedSlug) {
      assessment = await Assessment.findOne({ slug: sanitizedSlug });
    }

    if (!assessment && sanitizedSlug) {
      const titleRegex = buildTitleRegexFromSlug(sanitizedSlug);
      if (titleRegex) {
        assessment = await Assessment.findOne({ title: titleRegex });
      }
    }

    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    await ensureAssessmentSlug(assessment);

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
        { content: regex },
        { className: regex },
        { degree: regex },
        { tags: { $in: [regex] } },
      ],
    }).limit(20);

    await ensureAssessmentSlugs(assessments);

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
    const data = normalizeAssessmentPayload(req.body);

    if (!data.title || !String(data.title).trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    data.slug = await generateUniqueSlug(data.title);

    if (req.files?.image?.[0]) {
      data.imageUrl = req.files.image[0].path;
      data.imagePublicId = req.files.image[0].filename;
    }
    if (req.files?.file?.[0]) {
      data.fileUrl = req.files.file[0].path;
      data.filePublicId = req.files.file[0].filename;
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
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }

    const data = normalizeAssessmentPayload(req.body);
    const incomingTitle = typeof data.title === 'string' ? data.title.trim() : '';
    const titleChanged = Boolean(incomingTitle) && incomingTitle !== assessment.title;

    if (!assessment.slug || titleChanged) {
      data.slug = await generateUniqueSlug(incomingTitle || assessment.title, assessment._id);
    }

    if (req.files?.image?.[0]) {
      if (assessment.imagePublicId) {
        await cloudinary.uploader.destroy(assessment.imagePublicId);
      }
      data.imageUrl = req.files.image[0].path;
      data.imagePublicId = req.files.image[0].filename;
    }

    if (req.files?.file?.[0]) {
      if (assessment.filePublicId) {
        await cloudinary.uploader.destroy(assessment.filePublicId, { resource_type: 'raw' });
      }
      data.fileUrl = req.files.file[0].path;
      data.filePublicId = req.files.file[0].filename;
    }

    Object.assign(assessment, data);
    await assessment.save();

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
  getAssessmentByIdentifier,
  searchAssessments,
  getDegreeStructure,
  createAssessment,
  updateAssessment,
  deleteAssessment,
};
