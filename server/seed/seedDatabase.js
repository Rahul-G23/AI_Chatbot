// Database Seeding Script for ExamVerse AI
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const Exam = require('../models/Exam');
const Syllabus = require('../models/Syllabus');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examverse', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✓ MongoDB Connected for Seeding');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Sample Exam Data
const exams = [
  {
    name: 'NEET',
    description: 'National Eligibility cum Entrance Test',
    conductedBy: 'National Testing Agency (NTA)',
    applicationDeadline: new Date('2024-02-15'),
    admitCardDate: new Date('2024-04-01'),
    examDate: new Date('2024-05-05'),
    resultDate: new Date('2024-06-01'),
    eligibility: {
      educationQualification: '12th Pass with PCB',
      ageLimit: '17-25 years (varies by exam year)',
      citizenship: 'Indian Nationals & OCI/PIO Card Holders'
    },
    examPattern: {
      totalQuestions: 180,
      totalMarks: 720,
      duration: '3 hours',
      sections: ['Physics', 'Chemistry', 'Biology'],
      negativeMarking: true
    },
    importantBooks: ['NCERT Physics', 'NCERT Chemistry', 'NCERT Biology', 'DC Pandey Physics', 'Pradeep Chemistry'],
    bestPrepTime: '2 years',
    frequency: 'Annual'
  },
  {
    name: 'JEE Main',
    description: 'Joint Entrance Examination',
    conductedBy: 'National Testing Agency (NTA)',
    applicationDeadline: new Date('2024-01-20'),
    admitCardDate: new Date('2024-02-15'),
    examDate: new Date('2024-04-09'),
    resultDate: new Date('2024-05-15'),
    eligibility: {
      educationQualification: '12th Pass with PCM',
      ageLimit: '17-25 years',
      citizenship: 'Indian Nationals & OCI/PIO Card Holders'
    },
    examPattern: {
      totalQuestions: 90,
      totalMarks: 300,
      duration: '3 hours',
      sections: ['Physics', 'Chemistry', 'Mathematics'],
      negativeMarking: true
    },
    importantBooks: ['NCERT Physics', 'NCERT Chemistry', 'NCERT Mathematics', 'JEE Main Previous Papers'],
    bestPrepTime: '2 years',
    frequency: 'Annual (4 Attempts)'
  },
  {
    name: 'UPSC',
    description: 'Union Public Service Commission Civil Services',
    conductedBy: 'Union Public Service Commission',
    applicationDeadline: new Date('2024-02-28'),
    admitCardDate: new Date('2024-04-01'),
    examDate: new Date('2024-05-26'),
    resultDate: new Date('2024-07-01'),
    eligibility: {
      educationQualification: 'Bachelors Degree',
      ageLimit: '21-32 years (Relaxation available)',
      citizenship: 'Indian Nationals'
    },
    examPattern: {
      totalQuestions: 100,
      totalMarks: 1750,
      duration: 'Prelims: 2 hours per paper',
      sections: ['General Studies', 'CSAT', 'Essay', 'Interview'],
      negativeMarking: true
    },
    importantBooks: ['NCERT Books 6-12', 'Indian Polity by Laxmikanth', 'General Science Resources'],
    bestPrepTime: '1-2 years',
    frequency: 'Annual'
  }
];

// Sample Syllabus Data for NEET
const neetSyllabus = [
  {
    examName: 'NEET',
    subject: 'Physics',
    unit: 'Mechanics',
    chapter: 'Motion in One Dimension',
    topics: [
      {
        name: 'Kinematics',
        subtopics: ['Distance and Displacement', 'Velocity and Speed', 'Acceleration'],
        weightage: 8,
        importance: 'High',
        difficulty: 'Easy',
        previousYearFrequency: 5,
        keyFormulas: ['s = ut + (1/2)at²', 'v = u + at', 'v² = u² + 2as'],
        keyPoints: ['Vector quantities', 'Scalar quantities', 'Reference frames']
      },
      {
        name: 'Equations of Motion',
        subtopics: ['First equation', 'Second equation', 'Third equation'],
        weightage: 6,
        importance: 'High',
        difficulty: 'Easy',
        previousYearFrequency: 4,
        keyFormulas: ['v = u + at', 's = ut + (1/2)at²', 'v² = u² + 2as']
      }
    ],
    totalQuestions: 40,
    estimatedHours: 20
  },
  {
    examName: 'NEET',
    subject: 'Chemistry',
    unit: 'Physical Chemistry',
    chapter: 'Atomic Structure',
    topics: [
      {
        name: 'Bohr Model',
        subtopics: ['Postulates', 'Limitations', 'Applications'],
        weightage: 10,
        importance: 'High',
        difficulty: 'Medium',
        previousYearFrequency: 6,
        keyFormulas: ['E = -13.6/n²', 'Rydberg Constant'],
        keyPoints: ['Quantization of energy', 'Electron orbit']
      }
    ],
    totalQuestions: 35,
    estimatedHours: 18
  },
  {
    examName: 'NEET',
    subject: 'Biology',
    unit: 'Cell Biology',
    chapter: 'Cell Structure and Function',
    topics: [
      {
        name: 'Prokaryotic Cells',
        subtopics: ['Bacterial cells', 'Archaebacteria', 'Structure'],
        weightage: 5,
        importance: 'Medium',
        difficulty: 'Easy',
        previousYearFrequency: 3,
        keyPoints: ['No nucleus', 'Single chromosome', 'Cell wall present']
      },
      {
        name: 'Eukaryotic Cells',
        subtopics: ['Plant cells', 'Animal cells', 'Organelles'],
        weightage: 12,
        importance: 'High',
        difficulty: 'Medium',
        previousYearFrequency: 8,
        keyPoints: ['Nucleus present', 'Multiple chromosomes', 'Complex organelles']
      }
    ],
    totalQuestions: 45,
    estimatedHours: 22
  }
];

// Note: static sample questions removed. During seeding in production/dev,
// questions should be generated via AI or imported from external sources.

// Seed Database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Exam.deleteMany({});
    await Syllabus.deleteMany({});
    await Question.deleteMany({});
    await Quiz.deleteMany({});

    console.log('Cleared existing data...');

    // Insert Exams
    const insertedExams = await Exam.insertMany(exams);
    console.log(`✓ Inserted ${insertedExams.length} exams`);

    // Insert Syllabus
    const insertedSyllabus = await Syllabus.insertMany(neetSyllabus);
    console.log(`✓ Inserted ${insertedSyllabus.length} syllabus documents`);
    console.log('Skipping insertion of static sample questions (AI-generation recommended)');

    console.log(`Database Seeding Completed Successfully: Exams=${insertedExams.length}, Syllabuses=${insertedSyllabus.length}`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding Error:', error);
    process.exit(1);
  }
};

// Run seeding
connectDB().then(() => {
  seedDatabase();
});
