// Frontend quiz service: calls backend quiz endpoints

export async function fetchQuizzes({ examName = '', subject = '', topic = '', limit = 20, skip = 0 } = {}) {
  const params = new URLSearchParams({ examName, subject, topic, limit, skip });
  const resp = await fetch(`/api/quiz?${params.toString()}`);
  return resp.json();
}

export async function fetchQuizDetails(quizId) {
  const resp = await fetch(`/api/quiz/${quizId}`);
  return resp.json();
}

export async function generateAIQuiz(payload) {
  const resp = await fetch(`/api/quiz/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return resp.json();
}
