// AI Service using Google Gemini API
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let activeProvider = 'offline';

const setActiveProvider = (provider) => {
  activeProvider = provider;
};

const getActiveProvider = () => activeProvider;

// Exam-specific system prompts
const systemPrompts = {
  GENERAL: `You are a helpful general-purpose AI tutor. Answer clearly, naturally, and step by step when helpful. If the question is a definition or explanation, give a direct concise answer first, then expand if needed.`,
  NEET: `You are an expert NEET (National Eligibility cum Entrance Test) preparation assistant. 
         You have comprehensive knowledge about NEET syllabus, exam pattern, marking scheme, 
         preparation strategies, important concepts, and previous year trends.
         Provide detailed guidance about Biology, Chemistry, and Physics topics for NEET preparation.`,
  'JEE Main': `You are an expert JEE Main preparation assistant with deep knowledge of JEE Main syllabus, 
              exam pattern, marking scheme, and preparation strategies. 
              Help students with Mathematics, Physics, and Chemistry concepts.`,
  'JEE Advanced': `You are an expert JEE Advanced preparation assistant. 
                  Provide advanced-level guidance on challenging concepts in Mathematics, Physics, and Chemistry.`,
  UPSC: `You are an expert UPSC (Union Public Service Commission) preparation assistant. 
         Provide guidance about UPSC syllabus, current affairs, history, geography, polity, and economics.`,
  'KCET/KPSE': `You are an expert KCET preparation assistant for Karnataka students. 
                Help with Physics, Chemistry, Biology, and Mathematics preparation.`,
  Banking: `You are an expert banking exam preparation assistant. 
            Help with quantitative aptitude, reasoning, English, and general awareness.`,
  SSC: `You are an expert SSC exam preparation assistant. 
        Provide guidance on all SSC exams including CGL, CHSL, and MTS preparation.`,
  Railway: `You are an expert Railway exam preparation assistant. 
            Help with quantitative aptitude, reasoning, and general awareness.`,
  CAT: `You are an expert CAT (Common Admission Test) preparation assistant. 
        Help with quantitative aptitude, data interpretation, and verbal ability.`,
  GATE: `You are an expert GATE exam preparation assistant. 
         Provide guidance on engineering subjects and technical preparation.`,
  CUET: `You are an expert CUET (Common University Entrance Test) preparation assistant. 
         Help with domain-specific and general test preparation.`,
  NDA: `You are an expert NDA (National Defence Academy) preparation assistant. 
        Help with mathematics, general knowledge, and physical fitness guidance.`,
  CLAT: `You are an expert CLAT (Common Law Admission Test) preparation assistant. 
         Help with legal reasoning, logical reasoning, and English comprehension.`
};

// Simple safe evaluator for arithmetic expressions (supports + - * / ^ and parentheses)
const safeEval = (input) => {
  try {
    if (!/^[-+()\d\s\.\/*%^]+$/.test(input)) return null;
    const expr = input.replace(/\^/g, '**');
    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    return result;
  } catch (e) {
    return null;
  }
};

// Detect whether input looks like a simple arithmetic expression
const extractExpression = (text) => {
  const trimmed = String(text).trim();
  const pureMatch = trimmed.match(/^[-+()\d\s\.\/*%^]+$/);
  if (pureMatch) return trimmed;
  // try to strip non-expression chars
  const cleaned = trimmed.replace(/[^\d\.+\-*/^()\s]/g, '').trim();
  return cleaned || null;
};

// Format arbitrary text as numbered step-by-step solution
const formatAsSteps = (text) => {
  if (!text || typeof text !== 'string') return '';
  // If already contains numbered steps or explicit line breaks, preserve basic formatting
  if (/^\s*\d+\)/.test(text) || /^\s*Step\s*\d+/i.test(text) || text.includes('\n')) {
    return text.trim();
  }

  // Split into sentences and number them
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  if (sentences.length >= 2) {
    return sentences.map((s, i) => `${i+1}) ${s}`).join('\n');
  }

  // Fallback: produce a 3-step structure
  return `1) Restate the problem: ${text.trim()}\n2) Approach: Analyze the question and apply relevant concepts or calculations.\n3) Solution: ${text.trim()}`;
};

const normalizeWhitespace = (text) => String(text || '').replace(/\s+/g, ' ').trim();

const detectIntent = (message) => {
  const lower = message.toLowerCase();

  if (/[\d)][\s]*[+\-*/^]|[+\-*/^]/.test(lower) && /\d/.test(lower)) {
    return 'math';
  }
  if (/\b(what is|define|meaning of|who is|who was)\b/.test(lower)) return 'definition';
  if (/\b(explain|describe|how does|how do|how to|why does|why is)\b/.test(lower)) return 'explain';
  if (/\b(compare|difference between|differentiate)\b/.test(lower)) return 'compare';
  if (/\b(list|steps|process|prepare|study plan|strategy)\b/.test(lower)) return 'plan';
  return 'general';
};

const extractTopic = (message) => {
  const cleaned = normalizeWhitespace(message)
    .replace(/^what is\s+/i, '')
    .replace(/^define\s+/i, '')
    .replace(/^meaning of\s+/i, '')
    .replace(/^who is\s+/i, '')
    .replace(/^who was\s+/i, '')
    .replace(/^explain\s+/i, '')
    .replace(/^describe\s+/i, '')
    .replace(/^how does\s+/i, '')
    .replace(/^how do\s+/i, '')
    .replace(/^why does\s+/i, '')
    .replace(/^why is\s+/i, '')
    .replace(/^compare\s+/i, '')
    .replace(/^difference between\s+/i, '');

  return cleaned.replace(/[?!.]+$/g, '').trim() || 'this topic';
};

// Normalize topic for presentation: title case, common possessives, and small cleanup
const normalizeTopicForPresentation = (topic) => {
  if (!topic) return 'This topic';
  let t = String(topic).trim();
  // common normalization: "newtons laws" -> "Newton's laws"
  t = t.replace(/\bnewtons\b/i, "Newton's");
  // collapse extra whitespace and fix capitalization (title case for short topics)
  t = t.replace(/\s+/g, ' ');
  // If it's multiple words, capitalize first letter of each (but keep small words lowercase except first)
  const words = t.split(' ');
  if (words.length <= 4) {
    t = words.map((w, i) => {
      if (i > 0 && /^(and|or|of|in|the|a|an|to)$/.test(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  } else {
    t = t.charAt(0).toUpperCase() + t.slice(1);
  }
  return t;
};

const buildMathResponse = (userMessage) => {
  const exprCandidate = extractExpression(userMessage);
  const value = exprCandidate ? safeEval(exprCandidate) : null;

  if (exprCandidate && value !== null) {
    return `1) Interpret expression: ${exprCandidate}\n2) Compute using standard operator precedence\n3) Result: ${value}`;
  }

  return `1) I detected a math-style question: ${userMessage}\n2) I could not safely evaluate it as a plain arithmetic expression\n3) Please resend it as a direct calculation, for example: 12*(3+5)-4^2`;
};

const buildDefinitionResponse = (topic, examName, context) => {
  const presentedTopic = normalizeTopicForPresentation(topic);
  const key = presentedTopic.toLowerCase();

  const library = {
    physics: 'Physics is the branch of science that studies matter, energy, force, motion, and the laws governing them.',
    chemistry: 'Chemistry is the study of substances, their composition, structure, properties, and the changes they undergo.',
    biology: 'Biology is the study of living organisms, their structure, function, growth, evolution, and interactions.',
    "newton's laws": "Newton's laws describe inertia, force and acceleration, and action-reaction pairs that govern motion.",
    inertia: 'Inertia is the tendency of an object to resist changes in its state of rest or motion.',
    force: 'Force is a push or pull that can change the motion of an object or deform it.',
    motion: 'Motion is the change in position of an object with time relative to a reference point.'
  };

  const fact = library[key] || `${presentedTopic} is an important concept in ${examName || 'General'} preparation.`;
  const contextLine = context ? `Relevant syllabus context: ${context}.` : `This topic is commonly tested in ${examName || 'General'}.`;

  // Return a concise, well-formed paragraph rather than numbered steps for simple definitions
  return `${presentedTopic}: ${fact} ${contextLine} If you want, I can provide a short example or a deeper explanation.`;
};

const buildExplainResponse = (topic, examName, context) => {
  const presentedTopic = normalizeTopicForPresentation(topic);
  const contextLine = context ? `Relevant syllabus context: ${context}.` : `Focus this topic within the ${examName || 'General'} syllabus.`;

  const definition = (() => {
    const key = presentedTopic.toLowerCase();
    if (key === "newton's laws" || key.includes('newton')) {
      return "Newton's laws describe inertia, the relation between force and acceleration (F = ma), and action-reaction pairs that govern motion.";
    }
    return `${presentedTopic} is an important concept; start from its definition, then cover main formulas or principles, and finish with an example.`;
  })();

  const example = `Example: For instance, applying a force to a mass causes acceleration given by F = ma, and every force has an equal and opposite reaction.`;

  // Return as clear sentences (no leading numbers) so frontend renders as paragraphs
  return `${presentedTopic}: ${definition} ${contextLine} ${example} If you want, I can expand with step-by-step derivation, worked examples, or exam-focused notes.`;
};

const buildCompareResponse = (topic, examName) => {
  return `1) Comparison request: ${topic}\n2) Compare the two parts by definition, use-case, and exam relevance\n3) For ${examName}, I can turn this into a table if you want a side-by-side revision format.`;
};

const buildPlanResponse = (topic, examName, context) => {
  const contextLine = context ? `Use the syllabus hint: ${context}.` : `Follow the official ${examName} syllabus for the topic.`;
  return `1) Planning request: ${topic}\n2) Start with fundamentals, then examples, then timed practice\n3) ${contextLine}`;
};

const generateDynamicOfflineResponse = (userMessage, examName, context = '') => {
  const intent = detectIntent(userMessage);
  const topic = extractTopic(userMessage);

  switch (intent) {
    case 'math':
      return buildMathResponse(userMessage);
    case 'definition':
      return buildDefinitionResponse(topic, examName, context);
    case 'explain':
      return buildExplainResponse(topic, examName, context);
    case 'compare':
      return buildCompareResponse(topic, examName);
    case 'plan':
      return buildPlanResponse(topic, examName, context);
    default:
      return `1) I read your question: ${userMessage}\n2) Based on ${examName || 'the selected exam'}, here is the direct answer: ${topic}\n3) If you want, I can explain this in simpler words, give an example, or turn it into exam notes.`;
  }
};

// Generate AI response using Gemini
const generateAIResponse = async (userMessage, examName, context = '') => {
  // If user asked a simple expression, compute locally and return step-by-step
  const exprCandidate = extractExpression(userMessage);
  if (exprCandidate) {
    const value = safeEval(exprCandidate);
    if (value !== null) {
      return `1) Interpret expression: ${exprCandidate}\n2) Compute using standard operator precedence\n3) Result: ${value}`;
    }
  }
  // Prefer Gemini/Google Generative Language API when key is configured
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const hasGeminiKey = Boolean(apiKey && apiKey !== 'YOUR_GEMINI_API_KEY');
    if (hasGeminiKey) {
      // Use Gemini generateContent REST endpoint
      const systemPrompt = systemPrompts[examName] || systemPrompts.GENERAL;
      const promptText = `${systemPrompt}\n\nContext: ${context || 'No extra context.'}\n\nUser: ${userMessage}\n\nInstructions: Answer clearly and, when helpful, present the solution as numbered steps.`;

      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const body = {
        contents: [
          {
            parts: [{ text: promptText }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512
        }
      };

      const resp = await axios.post(url, body, { timeout: 15000 });
      let generated = null;
      if (resp && resp.data) {
        const first = resp.data.candidates && resp.data.candidates[0];
        if (first && first.content && first.content.parts && first.content.parts.length > 0) {
          generated = first.content.parts.map(p => p.text || '').join(' ').trim();
        }
      }

      if (generated) {
        setActiveProvider('gemini');
        console.log('AI Provider: Gemini');
        return formatAsSteps(String(generated));
      }

      // If Gemini returned no text, try fallback pipeline
      console.log('AI Provider: Gemini returned empty response, trying fallback');
      return generateAIResponseFallback(userMessage, examName, context);
    }
  } catch (err) {
    // Log HTTP details when available to debug 4xx/5xx responses
    if (err && err.response) {
      console.error('Gemini API HTTP error:', err.response.status, err.response.data);
    } else {
      console.error('Gemini API error, falling back to alternate provider:', err && err.message ? err.message : err);
    }
  }

  return generateAIResponseFallback(userMessage, examName, context);
};

// Fallback AI response using HuggingFace
const generateAIResponseFallback = async (userMessage, examName, context = '') => {
  try {
    const useHuggingFace = process.env.USE_HUGGINGFACE === 'true';
    const hasHuggingFaceKey = Boolean(process.env.HUGGINGFACE_API_KEY && process.env.HUGGINGFACE_API_KEY !== 'YOUR_HUGGINGFACE_API_KEY');
    if (!useHuggingFace || !hasHuggingFaceKey) {
      setActiveProvider('offline');
      console.log('AI Provider: Offline fallback');
      return generateDynamicOfflineResponse(userMessage, examName, context);
    }

    const model = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
    const systemPrompt = systemPrompts[examName] || systemPrompts.GENERAL;
    const response = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userMessage}\n\nContext: ${context || 'No extra context.'}` }
        ],
        max_tokens: 512,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content || 'Unable to generate response. Please try again.';
    setActiveProvider('huggingface');
    console.log('AI Provider: HuggingFace');
    return formatAsSteps(raw);
  } catch (error) {
    console.error('HuggingFace API Error:', error);
    setActiveProvider('offline');
    console.log('AI Provider: Offline fallback (after HF error)');
    return generateDynamicOfflineResponse(userMessage, examName, context);
  }
};

// Offline responses when AI APIs fail
const getOfflineResponse = (userMessage, examName) => {
  return generateDynamicOfflineResponse(userMessage, examName, '');
};

// Generate quiz questions using AI
const generateQuizQuestions = async (examName, subject, topic, numberOfQuestions = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Generate ${numberOfQuestions} multiple choice questions for ${examName} ${subject} about ${topic}.

Format each question as JSON:
{
  "type": "MCQ",
  "statement": "question text",
  "options": ["option1", "option2", "option3", "option4"],
  "correctOption": 0,
  "explanation": "detailed explanation"
}

Return as a JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    return [];
  }
};

// Generate study plan using AI
const generateStudyPlan = async (examName, remainingDays, weakSubjects, dailyHours) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Create a personalized study plan for ${examName} preparation.

Details:
- Remaining Days: ${remainingDays}
- Weak Subjects: ${weakSubjects.join(', ')}
- Daily Study Hours: ${dailyHours}

Provide a structured plan with:
1. Weekly targets
2. Subject allocation
3. Revision schedule
4. Revision checkpoints
5. Tips for weak subjects

Format as JSON with day-by-day breakdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Study Plan Generation Error:', error);
    return null;
  }
};

module.exports = {
  generateAIResponse,
  generateAIResponseFallback,
  getActiveProvider,
  getOfflineResponse,
  generateQuizQuestions,
  generateStudyPlan
};
