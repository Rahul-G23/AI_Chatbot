// Notes Controller
const Note = require('../models/Note');

// Create note
exports.createNote = async (req, res) => {
  try {
    const { title, content, examName, subject, topic, color = '#FFE5B4' } = req.body;
    const userId = req.userId;

    const note = new Note({
      userId,
      title,
      content,
      examName,
      subject,
      topic,
      color
    });

    await note.save();

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create note', error: error.message });
  }
};

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const userId = req.userId;
    const { examName, subject, limit = 20, skip = 0 } = req.query;

    let query = { userId };
    if (examName) query.examName = examName;
    if (subject) query.subject = subject;

    const notes = await Note.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ updatedAt: -1 });

    const total = await Note.countDocuments(query);

    res.json({
      success: true,
      notes,
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notes', error: error.message });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, color, tags } = req.body;
    const userId = req.userId;

    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      {
        title: title || undefined,
        content: content || undefined,
        color: color || undefined,
        tags: tags || undefined,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update note', error: error.message });
  }
};

// Bookmark note
exports.toggleBookmark = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isBookmarked = !note.isBookmarked;
    await note.save();

    res.json({
      success: true,
      message: note.isBookmarked ? 'Note bookmarked' : 'Note bookmark removed',
      note
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to toggle bookmark', error: error.message });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    await Note.deleteOne({ _id: noteId, userId });

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete note', error: error.message });
  }
};

module.exports = exports;
