// Countdown Controller
const Exam = require('../models/Exam');

// Get countdown dates
exports.getCountdownDates = async (req, res) => {
  try {
    const { examName } = req.query;

    let query = {};
    if (examName) query.name = examName;

    const exams = await Exam.find(query).select(
      'name examDate applicationDeadline admitCardDate resultDate'
    );

    // Calculate countdowns
    const now = new Date();
    const countdowns = exams.map(exam => ({
      examName: exam.name,
      examDate: exam.examDate,
      daysRemaining: Math.ceil((new Date(exam.examDate) - now) / (1000 * 60 * 60 * 24)),
      hoursRemaining: Math.ceil((new Date(exam.examDate) - now) / (1000 * 60 * 60)),
      applicationDeadline: exam.applicationDeadline,
      admitCardDate: exam.admitCardDate,
      resultDate: exam.resultDate,
      status: exam.examDate > now ? 'Upcoming' : 'Completed'
    }));

    res.json({
      success: true,
      countdowns: countdowns.sort((a, b) => a.daysRemaining - b.daysRemaining)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch countdown dates', error: error.message });
  }
};

// Get exam details with countdown
exports.getExamWithCountdown = async (req, res) => {
  try {
    const { examName } = req.params;

    const exam = await Exam.findOne({ name: examName });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const now = new Date();
    const countdown = {
      examName: exam.name,
      examDate: exam.examDate,
      daysRemaining: Math.ceil((new Date(exam.examDate) - now) / (1000 * 60 * 60 * 24)),
      hoursRemaining: Math.ceil((new Date(exam.examDate) - now) / (1000 * 60 * 60)),
      minutesRemaining: Math.ceil((new Date(exam.examDate) - now) / (1000 * 60)),
      applicationDeadline: exam.applicationDeadline,
      admitCardDate: exam.admitCardDate,
      resultDate: exam.resultDate,
      eligibility: exam.eligibility,
      examPattern: exam.examPattern,
      status: exam.examDate > now ? 'Upcoming' : 'Completed'
    };

    res.json({
      success: true,
      exam,
      countdown
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch exam details', error: error.message });
  }
};

module.exports = exports;
