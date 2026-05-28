// Syllabus Routes
const express = require('express');
const router = express.Router();
const syllabusController = require('../controllers/syllabusController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', syllabusController.getAllSyllabuses);
router.get('/search', syllabusController.searchSyllabus);
router.get('/exam/:examName', syllabusController.getSyllabusByExam);
router.get('/exam/:examName/subjects', syllabusController.getExamSubjects);
router.get('/exam/:examName/subject/:subject/chapters', syllabusController.getChaptersBySubject);
router.get('/chapter/:syllabusId', syllabusController.getChapterDetails);

module.exports = router;
