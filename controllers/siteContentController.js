const SiteContent = require('../models/SiteContent');

// Sensible defaults when a key has never been saved
const DEFAULTS = {
  'about-us': {
    heroHeading: 'About Us',
    heroSubheading: 'Empowering nursing students to achieve Distinguished and Proficient grades.',
    sections: [
      {
        id: 's1',
        heading: 'Who We Are',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      },
      {
        id: 's2',
        heading: '',
        body: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
      },
      {
        id: 's3',
        heading: '',
        body: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi.',
      },
    ],
  },
  'contact-us': {
    heroHeading: 'Contact Us',
    heroSubheading: 'Reach out and get expert guidance on your NURS-FPX4015 assessments.',
    sectionHeading: "We're Here to Help",
    paragraph:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    phone: '+1(612)208-2686',
    email: 'contact@nursfpx4015.com',
  },
  'form-config': {
    popupHeading: 'Get 30% Off Your First Online Class Help!',
    popupSubheading: "Expert assistance is just a click away—don't miss out!",
    heroHeading: 'Get Your NURSFPX4015 Assessments within 24 Hours',
    submitText: 'Send',
    fields: [
      { name: 'fullName', placeholder: 'Full Name', required: true },
      { name: 'email', placeholder: 'Email Address', required: true },
      { name: 'phone', placeholder: 'Phone Number', required: false },
      { name: 'subject', placeholder: 'Your Subject / Course Code / University', required: false },
    ],
  },
};

const getContent = async (req, res) => {
  try {
    const doc = await SiteContent.findOne({ key: req.params.key });
    const data = doc ? doc.data : (DEFAULTS[req.params.key] || null);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateContent = async (req, res) => {
  try {
    const { key } = req.params;
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ success: false, message: '"data" field is required' });
    }
    const doc = await SiteContent.findOneAndUpdate(
      { key },
      { $set: { data } },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: doc.data });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getContent, updateContent };
