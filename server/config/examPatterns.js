// Central exam marking and timing patterns
const examPatterns = {
  'neet': { correct: 4, wrong: -1, unanswered: 0, duration: 200 }, // minutes
  'jee main': { correct: 4, wrong: -1, unanswered: 0, duration: 180 },
  'jee advanced': { // flexible - use per-question marks when provided
    default: { correct: 3, wrong: -1 },
    duration: 180
  },
  'upsc': { correct: 2, wrong: -0.66, unanswered: 0, duration: 120 },
  'banking': { correct: 1, wrong: -0.25, unanswered: 0, duration: 120 },
  'ssc': { correct: 2, wrong: -0.5, unanswered: 0, duration: 120 },
  'railway': { correct: 1, wrong: -0.33, unanswered: 0, duration: 120 },
  'cat': { // has MCQ and TITA; default to MCQ
    mcq: { correct: 3, wrong: -1 },
    tita: { correct: 3, wrong: 0 },
    duration: 180
  },
  'gate': { // supports 1 and 2 mark questions
    one: { correct: 1, wrong: -0.33 },
    two: { correct: 2, wrong: -0.66 },
    duration: 180
  },
  'cuet': { correct: 5, wrong: -1, unanswered: 0, duration: 120 },
  'nda': { correct: 2.5, wrong: -0.83, unanswered: 0, duration: 180 },
  'clat': { correct: 1, wrong: -0.25, unanswered: 0, duration: 120 }
};

function normalizeExamName(name = '') {
  return String(name || '').toLowerCase().trim();
}

function getPattern(examName, opts = {}) {
  const key = normalizeExamName(examName);
  const p = examPatterns[key];
  if (!p) return null;

  // If exam has subtypes (CAT/GATE), allow asking by question type
  if (key === 'cat') {
    const qType = (opts.type || 'mcq').toLowerCase();
    return p[qType] || p.mcq;
  }

  if (key === 'gate') {
    const markType = opts.marks === 2 ? 'two' : 'one';
    return p[markType] || p.one;
  }

  if (key === 'jee advanced') return p;

  return p;
}

module.exports = {
  examPatterns,
  getPattern,
  normalizeExamName
};
