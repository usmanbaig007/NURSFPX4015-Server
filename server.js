require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// CORS
const buildOrigins = () => {
  if (!process.env.CLIENT_URL) return ['http://localhost:5173', 'http://localhost:3000'];
  const origins = process.env.CLIENT_URL.split(',').map((s) => s.trim());
  // Auto-add www / non-www variants
  const withVariants = new Set(origins);
  origins.forEach((o) => {
    try {
      const u = new URL(o);
      if (u.hostname.startsWith('www.')) {
        withVariants.add(o.replace('www.', ''));
      } else {
        withVariants.add(o.replace('://', '://www.'));
      }
    } catch { /* ignore malformed */ }
  });
  return [...withVariants];
};

const allowedOrigins = buildOrigins();

// Handle preflight (OPTIONS) requests explicitly
app.options('*', cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// Dynamic sitemaps (index + sub-sitemaps + XSL stylesheets)
const sitemap = require('./routes/sitemap');
const sitemapDbWrap = (handler) => async (req, res, next) => {
  try { await connectDB(); } catch (e) { return next(e); }
  handler(req, res, next);
};
app.get('/sitemap.xml', sitemapDbWrap(sitemap.index));
app.get('/page-sitemap.xml', sitemapDbWrap(sitemap.pages));
app.get('/post-sitemap.xml', sitemapDbWrap(sitemap.posts));
app.get('/sitemap-index.xsl', sitemap.indexXsl);
app.get('/sitemap-urlset.xsl', sitemap.urlsetXsl);

// Ensure MongoDB is connected before API handlers run.
app.use('/api', async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Cloudinary direct-upload signature
const { cloudinary: cloudinaryClient } = require('./config/cloudinary');
app.post('/api/cloudinary-signature', require('./middleware/authMiddleware').protect, (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'nursfpx4015';
    const signature = cloudinaryClient.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET
    );
    res.json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
      },
    });
  } catch (error) {
    console.error('Cloudinary signature error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate upload signature' });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/tutors', require('./routes/tutors'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/site-content', require('./routes/siteContent'));
app.use('/api/pages', require('./routes/pages'));
app.use('/api/faqs', require('./routes/faqs'));

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT} [${process.env.NODE_ENV}]`));
}

module.exports = app;
