const axios = require('axios');
const { generateQuizQuestions } = require('./aiService');

/**
 * Try fetching questions from Open Trivia DB (category mapping may vary).
 * If insufficient questions are returned, fall back to AI generation.
 */
const fetchFromOpenTrivia = async (numberOfQuestions = 10) => {
  try {
    const url = `https://opentdb.com/api.php?amount=${numberOfQuestions}&type=multiple`;
    const resp = await axios.get(url, { timeout: 5000 });
    if (resp.data && resp.data.results && resp.data.results.length) {
      return resp.data.results.map((r) => ({
        type: 'MCQ',
        statement: r.question,
        options: [...r.incorrect_answers, r.correct_answer].sort(),
        correctAnswer: r.correct_answer,
        explanation: '',
        difficulty: r.difficulty || 'medium'
      }));
    }
  } catch (err) {
    console.warn('OpenTrivia fetch failed:', err.message);
  }
  return [];
};

const getQuizQuestions = async ({ examName, subject, topic, numberOfQuestions = 5 }) => {
  // Try free API first
  const external = await fetchFromOpenTrivia(numberOfQuestions);
  if (external && external.length >= numberOfQuestions) return external.slice(0, numberOfQuestions);

  // Fallback to AI generator
  const aiQuestions = await generateQuizQuestions(examName || 'General', subject || 'General', topic || 'General', numberOfQuestions);
  return aiQuestions;
};

module.exports = {
  getQuizQuestions
};
