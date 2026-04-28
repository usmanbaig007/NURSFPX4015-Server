require('dotenv').config();
const mongoose = require('mongoose');
const Tutor = require('./models/Tutor');
const Review = require('./models/Review');

const FALLBACK_TUTORS = [
  {
    name: 'Dr. Sarah Mitchell',
    credentials: 'DNP, FNP-C',
    bio: 'Dr. Sarah Mitchell is a board-certified Family Nurse Practitioner with 12+ years of experience. She specializes in evidence-based practice, care coordination, and helping learners meet assessment rubrics with clarity and precision.',
    isActive: true,
    order: 1
  },
  {
    name: 'Dr. Emily Rodriguez',
    credentials: 'DNP, AGACNP-BC',
    bio: 'Emily is a critical care specialist who supports advanced Capella assessments in patient safety, quality improvement, and leadership. Her guidance ensures clinically accurate and academically strong work.',
    isActive: true,
    order: 2
  },
  {
    name: 'Lisa Thompson',
    credentials: 'MSN, RN, CNE',
    bio: 'Lisa Thompson is a certified nurse educator who specializes in aligning Capella assessments & Capstones with grading rubrics. She ensures structured, well-researched, and polished academic submissions.',
    isActive: true,
    order: 3
  },
  {
    name: 'Michael Carter',
    credentials: 'MSN, RN',
    bio: 'Michael Carter is an experienced nurse and academic mentor focused on Capella assessments and APA-compliant writing. He helps students structure high-quality submissions aligned with FlexPath requirements.',
    isActive: true,
    order: 4
  },
  {
    name: 'Dr. Patricia Hayes',
    credentials: 'PhD, RN',
    bio: 'Dr. Hayes brings decades of nursing research expertise to help students craft evidence-based assessments. She excels at literature reviews, PICOT questions, and quality improvement projects.',
    isActive: true,
    order: 5
  },
  {
    name: 'James Williams',
    credentials: 'MSN, APRN',
    bio: 'James specializes in healthcare policy and nursing leadership assessments. He guides students through complex organizational and systems-level analysis with precision and depth.',
    isActive: true,
    order: 6
  },
];

const FALLBACK_REVIEWS = [
  { studentName: 'Jessica M.', rating: 5, comment: 'Absolutely amazing service! My NURS-FPX4015 Assessment 1 came back with a Distinguished grade. The writer understood the rubric perfectly.', course: 'NURS-FPX4015', source: 'google', isApproved: true },
  { studentName: 'Robert T.', rating: 5, comment: 'Fast turnaround and excellent quality. I was nervous about the biopsychosocial concepts paper but they nailed every section. Highly recommend!', course: 'NURS-FPX4015', source: 'trustpilot', isApproved: true },
  { studentName: 'Amanda K.', rating: 5, comment: 'Professional, timely, and very thorough. The assessment was APA-compliant and rubric-aligned. Got a Proficient on my retake submission!', course: 'NURS-FPX4015', source: 'direct', isApproved: true },
  { studentName: 'David L.', rating: 4, comment: 'Good communication throughout the process. The writer asked clarifying questions and delivered a high-quality paper on time.', course: 'NURS-FPX4015', source: 'sitejabber', isApproved: true },
  { studentName: 'Patricia S.', rating: 5, comment: 'I was struggling with Assessment 3 and these experts saved me. The content was evidence-based and perfectly structured. Will use again!', course: 'NURS-FPX4015', source: 'google', isApproved: true },
  { studentName: 'Michael B.', rating: 5, comment: 'Top-notch service. Every assessment they write is original, properly cited, and follows Capella\'s FlexPath standards. 10/10.', course: 'NURS-FPX4015', source: 'direct', isApproved: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const tutorCount = await Tutor.countDocuments();
    if (tutorCount === 0) {
      console.log('Seeding Tutors...');
      await Tutor.insertMany(FALLBACK_TUTORS);
    } else {
      console.log('Tutors already exist, skipping seed.');
    }

    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      console.log('Seeding Reviews...');
      await Review.insertMany(FALLBACK_REVIEWS);
    } else {
      console.log('Reviews already exist, skipping seed.');
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
