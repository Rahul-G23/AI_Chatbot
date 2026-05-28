// Study Plan Controller
const StudyPlan = require('../models/StudyPlan');
const { generateStudyPlan } = require('../services/aiService');

// Create study plan
exports.createStudyPlan = async (req, res) => {
  try {
    const { examName, targetDate, weakSubjects, dailyStudyHours } = req.body;
    const userId = req.userId;

    const remainingDays = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));

    if (remainingDays < 0) {
      return res.status(400).json({ success: false, message: 'Target date must be in the future' });
    }

    // Generate AI plan
    const aiGeneratedPlan = await generateStudyPlan(examName, remainingDays, weakSubjects, dailyStudyHours);

    const studyPlan = new StudyPlan({
      userId,
      examName,
      targetDate,
      remainingDays,
      dailyStudyHours,
      weakSubjects,
      isAIGenerated: true
    });

    // Parse and add schedule from AI
    if (aiGeneratedPlan) {
      try {
        const scheduleData = JSON.parse(aiGeneratedPlan);
        studyPlan.schedule = scheduleData.schedule || [];
        studyPlan.milestones = scheduleData.milestones || [];
      } catch (e) {
        console.log('Could not parse AI plan, using defaults');
      }
    }

    // Create default milestones if not from AI
    if (!studyPlan.milestones || studyPlan.milestones.length === 0) {
      studyPlan.milestones = [
        {
          name: 'First Month Target',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Mid-term Review',
          targetDate: new Date(Date.now() + (remainingDays / 2) * 24 * 60 * 60 * 1000)
        },
        {
          name: 'Final Tests',
          targetDate: new Date(targetDate - 15 * 24 * 60 * 60 * 1000)
        }
      ];
    }

    await studyPlan.save();

    res.status(201).json({
      success: true,
      message: 'Study plan created successfully',
      studyPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create study plan', error: error.message });
  }
};

// Get user study plan
exports.getUserStudyPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { examName } = req.query;

    let query = { userId };
    if (examName) query.examName = examName;

    const studyPlans = await StudyPlan.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      studyPlans
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch study plan', error: error.message });
  }
};

// Get study plan details
exports.getStudyPlanDetails = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.userId;

    const studyPlan = await StudyPlan.findOne({ _id: planId, userId });

    if (!studyPlan) {
      return res.status(404).json({ success: false, message: 'Study plan not found' });
    }

    res.json({
      success: true,
      studyPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch study plan', error: error.message });
  }
};

// Update milestone
exports.updateMilestone = async (req, res) => {
  try {
    const { planId, milestoneIndex } = req.params;
    const { completed } = req.body;
    const userId = req.userId;

    const studyPlan = await StudyPlan.findOne({ _id: planId, userId });

    if (!studyPlan) {
      return res.status(404).json({ success: false, message: 'Study plan not found' });
    }

    if (completed) {
      studyPlan.milestones[milestoneIndex].completed = true;
      studyPlan.milestones[milestoneIndex].completedDate = new Date();
    } else {
      studyPlan.milestones[milestoneIndex].completed = false;
      studyPlan.milestones[milestoneIndex].completedDate = null;
    }

    await studyPlan.save();

    res.json({
      success: true,
      message: 'Milestone updated',
      studyPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update milestone', error: error.message });
  }
};

module.exports = exports;
