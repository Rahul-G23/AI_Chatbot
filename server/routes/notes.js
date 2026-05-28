// Notes Routes
const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const auth = require('../middleware/auth');

// Protected routes
router.post('/', auth, notesController.createNote);
router.get('/', auth, notesController.getAllNotes);
router.put('/:noteId', auth, notesController.updateNote);
router.put('/:noteId/bookmark', auth, notesController.toggleBookmark);
router.delete('/:noteId', auth, notesController.deleteNote);

module.exports = router;
