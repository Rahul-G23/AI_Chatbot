// Study Plan Routes
const express = require('express');
const router = express.Router();
const studyPlanController = require('../controllers/studyPlanController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/', auth, studyPlanController.createStudyPlan);
router.get('/', auth, studyPlanController.getUserStudyPlan);
router.get('/:planId', auth, studyPlanController.getStudyPlanDetails);
router.put('/:planId/milestone/:milestoneIndex', auth, studyPlanController.updateMilestone);
router.delete('/:planId', auth, studyPlanController.deleteStudyPlan);

module.exports = router;
