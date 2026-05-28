// Quiz Controller
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');
const QuizResult = require('../models/QuizResult');
const { generateQuizQuestions } = require('../services/aiService');

// Get all quizzes
exports.getAllQuizzes = async (req, res) => {
  try {
    const { examName, subject, topic, difficulty, limit = 20, skip = 0 } = req.query;

    let query = {};
    if (examName) query.examName = examName;
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;

    const quizzes = await Quiz.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Quiz.countDocuments(query);

    res.json({
      success: true,
      quizzes,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quizzes', error: error.message });
  }
};

// Get quiz details with questions
exports.getQuizDetails = async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId).populate('questions');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({
      success: true,
      quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz', error: error.message });
  }
};

// Submit quiz answers
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const userId = req.userId;

    const quiz = await Quiz.findById(quizId).populate('questions');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctAnswers = 0;
    let totalMarks = 0;
    const processedAnswers = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers.find(a => a.questionId === question._id.toString());

      let isCorrect = false;
      let marks = 0;

      if (userAnswer) {
        isCorrect = userAnswer.selectedOption === question.correctOption;
        if (isCorrect) {
          correctAnswers++;
          marks = question.marks || 1;
        } else if (question.negativeMarks) {
          marks = -(question.negativeMarks);
        }
      }

      totalMarks += marks;
      processedAnswers.push({
        questionId: question._id,
        selectedOption: userAnswer?.selectedOption || null,
        isCorrect,
        marks
      });
    }

    const percentage = (correctAnswers / quiz.questions.length) * 100;

    const quizResult = new QuizResult({
      userId,
      quizId,
      examName: quiz.examName,
      subject: quiz.subject,
      topic: quiz.topic,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      wrongAnswers: quiz.questions.length - correctAnswers,
      unattempted: answers.filter(a => !a.selectedOption).length,
      score: totalMarks,
      percentage,
      answers: processedAnswers
    });

    await quizResult.save();

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        totalQuestions: quiz.questions.length,
        correctAnswers,
        wrongAnswers: quiz.questions.length - correctAnswers,
        score: totalMarks,
        percentage: percentage.toFixed(2),
        isPassed: percentage >= (quiz.passingScore || 50)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit quiz', error: error.message });
  }
};

// Get user quiz results
exports.getUserQuizResults = async (req, res) => {
  try {
    const userId = req.userId;
    const { examName, limit = 20, skip = 0 } = req.query;

    let query = { userId };
    if (examName) query.examName = examName;

    const results = await QuizResult.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ completedAt: -1 });

    const total = await QuizResult.countDocuments(query);

    res.json({
      success: true,
      results,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch quiz results', error: error.message });
  }
};

// Generate AI quiz
exports.generateAIQuiz = async (req, res) => {
  try {
    const { examName, subject, topic, numberOfQuestions = 5 } = req.body;

    const questions = await generateQuizQuestions(examName, subject, topic, numberOfQuestions);

    if (!questions || questions.length === 0) {
      return res.status(500).json({ success: false, message: 'Failed to generate questions' });
    }

    // Save questions
    const savedQuestions = await Question.insertMany(questions);

    // Create quiz
    const quiz = new Quiz({
      title: `${topic} - AI Generated Quiz`,
      examName,
      subject,
      topic,
      questions: savedQuestions.map(q => q._id),
      totalQuestions: savedQuestions.length,
      isAIGenerated: true,
      difficulty: 'Medium'
    });

    await quiz.save();

    res.status(201).json({
      success: true,
      message: 'Quiz generated successfully',
      quiz: await quiz.populate('questions')
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate quiz', error: error.message });
  }
};

module.exports = exports;
