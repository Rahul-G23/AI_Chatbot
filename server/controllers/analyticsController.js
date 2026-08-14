// User Analytics Controller
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

// Get dashboard analytics
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    const totalQuizzes = await QuizResult.countDocuments({ userId });

    const quizzes = await QuizResult.find({ userId }).sort({ completedAt: -1 }).limit(5);

    let avgQuizScore = 0;

    if (totalQuizzes > 0) {
      const quizStats = await QuizResult.aggregate([
        { $match: { userId: new (require('mongoose')).Types.ObjectId(userId) } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
      ]);
      avgQuizScore = quizStats[0]?.avgScore || 0;
    }
    res.json({
      success: true,
      analytics: {
        user: {
          name: user.name,
          email: user.email,
          targetExam: user.targetExam,
          streakDays: user.streakDays,
          totalStudyMinutes: user.totalStudyMinutes,
          totalStudySeconds: user.totalStudySeconds
        },
        stats: {
          totalQuizzes,
          avgQuizScore: avgQuizScore.toFixed(2)
        },
        recentActivity: {
          quizzes
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch analytics', error: error.message });
  }
};

// Get performance by subject
exports.getPerformanceBySubject = async (req, res) => {
  try {
    const userId = req.userId;
    const { examName } = req.query;

    let query = { userId };
    if (examName) query.examName = examName;

    const subjectPerformance = await QuizResult.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$subject',
          totalQuizzes: { $sum: 1 },
          avgScore: { $avg: '$percentage' },
          correctAnswers: { $sum: '$correctAnswers' },
          totalQuestions: { $sum: '$totalQuestions' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      performance: subjectPerformance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch subject performance', error: error.message });
  }
};

// Get weak topics
exports.getWeakTopics = async (req, res) => {
  try {
    const userId = req.userId;

    const weakTopics = await QuizResult.aggregate([
      { $match: { userId: new (require('mongoose')).Types.ObjectId(userId) } },
      { $group: { _id: '$topic', avgScore: { $avg: '$percentage' }, count: { $sum: 1 } } },
      { $sort: { avgScore: 1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      weakTopics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch weak topics', error: error.message });
  }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { examName, limit = 20 } = req.query;

    let matchStage = {};
    if (examName) matchStage.examName = examName;

    const leaderboard = await QuizResult.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $group: {
          _id: '$userId',
          name: { $first: '$userInfo.name' },
          avgPercentage: { $avg: '$percentage' },
          totalTests: { $sum: 1 },
          bestScore: { $max: '$percentage' }
        }
      },
      { $sort: { avgPercentage: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard', error: error.message });
  }
};

// Add study time for the authenticated user
exports.addStudyTime = async (req, res) => {
  try {
    const userId = req.userId;
    const durationSeconds = Number(req.body.durationSeconds);

    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid study duration'
      });
    }

    // Prevent accidentally/tamperingly adding huge sessions.
    const safeSeconds = Math.min(Math.floor(durationSeconds), 24 * 60 * 60);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const previousStudyDate = user.lastStudyDate ? new Date(user.lastStudyDate) : null;
    let nextStreakDays = Number(user.streakDays || 0);

    if (!previousStudyDate) {
      nextStreakDays = 1;
    } else {
      const previousDay = new Date(previousStudyDate);
      previousDay.setHours(0, 0, 0, 0);

      const dayDifference = Math.floor((today - previousDay) / (24 * 60 * 60 * 1000));

      if (dayDifference === 1) {
        nextStreakDays += 1;
      } else if (dayDifference > 1) {
        nextStreakDays = 1;
      }
    }

    user.totalStudySeconds = Number(user.totalStudySeconds || 0) + safeSeconds;
    user.totalStudyMinutes = Math.floor((user.totalStudySeconds || 0) / 60);
    user.lastStudyDate = now;
    user.streakDays = Math.max(0, nextStreakDays);
    user.updatedAt = now;

    await user.save();

    res.json({
      success: true,
      totalStudySeconds: user.totalStudySeconds,
      totalStudyMinutes: user.totalStudyMinutes,
      streakDays: user.streakDays
    });
  } catch (error) {
    console.error('Failed to add study time:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to save study time'
    });
  }
};

module.exports = exports;
