// ExamVerse AI - Backend Server
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const auth = require('./middleware/auth');
const { aiLimiter } = require('./middleware/rateLimiter');
const chatbotController = require('./controllers/chatbotController');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/examverse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✓ MongoDB Connected'))
.catch(err => console.error('✗ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chatbot', require('./routes/chatbot'));
app.use('/api/syllabus', require('./routes/syllabus'));
app.use('/api/quiz', require('./routes/quiz'));
// Mock test routes removed
app.use('/api/user', require('./routes/user'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/countdown', require('./routes/countdown'));
app.use('/api/study-plan', require('./routes/studyPlan'));
app.use('/api/notes', require('./routes/notes'));

// Alias for clients expecting POST /api/chat
app.post('/api/chat', auth, aiLimiter, chatbotController.sendMessage);

// Unauthenticated test endpoint for debugging (remove in production)
app.post('/api/test-chat', chatbotController.sendMessage);

// Simple ping for routing checks
app.get('/api/ping', (req, res) => res.json({ ok: true, now: Date.now() }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ExamVerse AI Backend is running' });
});

// Browser-friendly landing page
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>ExamVerse AI - Competitive Exam Preparation</title>
        <style>
          :root {
            --primary: #6366f1;
            --secondary: #ec4899;
            --card: rgba(15, 23, 42, 0.82);
            --text: #e2e8f0;
            --muted: #cbd5e1;
    // React app and server-side mock preview removed
          .brand { display: flex; flex-direction: column; gap: 2px; }
          .brand strong { font-size: 1.1rem; }
          .brand span { font-size: 0.85rem; color: var(--muted); }
          .nav-links { display: flex; flex-wrap: wrap; gap: 10px; }
          .pill {
            padding: 10px 14px;
            border-radius: 999px;
            border: 1px solid rgba(56, 189, 248, 0.35);
            background: rgba(56, 189, 248, 0.08);
            color: #dbeafe;
          }
          .hero {
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 24px;
            align-items: center;
            padding: 52px 0 26px;
          }
          .hero-card, .section-card {
            border: 1px solid var(--border);
            border-radius: 24px;
            background: var(--card);
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.28);
          }
          .hero-card { padding: 34px; }
          .eyebrow {
            display: inline-block;
            margin-bottom: 14px;
            padding: 8px 12px;
            border-radius: 999px;
            color: #dbeafe;
            background: rgba(99, 102, 241, 0.18);
            border: 1px solid rgba(99, 102, 241, 0.3);
            font-size: 0.9rem;
          }
          h1 {
            margin: 0;
            font-size: clamp(2rem, 5vw, 4.2rem);
            line-height: 1.05;
          }
          .accent {
            background: linear-gradient(90deg, #93c5fd, #f9a8d4, #c4b5fd);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .hero p, .section-copy {
            color: var(--muted);
            line-height: 1.7;
            font-size: 1.02rem;
          }
          .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 24px;
          }
          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 46px;
            padding: 0 18px;
            border-radius: 14px;
            font-weight: 700;
          }
          .button.primary {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
          }
          .button.secondary {
            border: 1px solid rgba(148, 163, 184, 0.4);
            background: rgba(255, 255, 255, 0.04);
          }
          .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
          .stat {
            padding: 18px;
            border-radius: 20px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(148, 163, 184, 0.18);
          }
          .stat strong { display: block; font-size: 1.3rem; margin-bottom: 4px; }
          .stat span { color: var(--muted); font-size: 0.92rem; }
          .section { margin-top: 20px; }
          .section-card { padding: 26px; }
          .section h2 {
            margin: 0 0 14px;
            font-size: clamp(1.4rem, 3vw, 2rem);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 16px;
          }
          .tile {
            padding: 18px;
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(148, 163, 184, 0.16);
          }
          .tile h3 { margin: 0 0 8px; }
          .tile p { margin: 0; color: var(--muted); line-height: 1.55; }
          .exam-list { display: flex; flex-wrap: wrap; gap: 10px; }
          .exam {
            padding: 10px 14px;
            border-radius: 999px;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.18), rgba(236, 72, 153, 0.18));
            border: 1px solid rgba(148, 163, 184, 0.22);
          }
          .footer {
            padding: 26px 6px 0;
            text-align: center;
            color: var(--muted);
            font-size: 0.95rem;
          }
          .note {
            margin-top: 14px;
            font-size: 0.95rem;
            color: #e0f2fe;
          }
          @media (max-width: 900px) {
            .hero { grid-template-columns: 1fr; }
            .nav { position: static; }
          }
          @media (max-width: 640px) {
            .page { width: min(100% - 20px, 1200px); }
            .hero-card, .section-card { padding: 20px; border-radius: 20px; }
            .nav { flex-direction: column; align-items: flex-start; }
            .stat-grid { grid-template-columns: 1fr; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <header class="nav">
            <div class="brand">
              <strong>ExamVerse AI</strong>
              <span>Free • Open-source • No admin panel</span>
            </div>
            <nav class="nav-links">
              <a class="pill" href="/api/health">Health Check</a>
              <a class="pill" href="/api">API Index</a>
            </nav>
          </header>

          <section class="hero">
            <div class="hero-card">
              <div class="eyebrow">AI-powered competitive exam preparation</div>
              <h1>Master <span class="accent">NEET, JEE, UPSC</span> and more with one smart platform.</h1>
              <p>
                ExamVerse AI brings together chatbot support, syllabus tracking, quizzes,
                countdowns, study planning, notes, and analytics for Indian exam prep.
              </p>
              <div class="actions">
                <a class="button primary" href="/api/health">Open API Status</a>
                <a class="button secondary" href="/api">Browse API Routes</a>
              </div>
              <div class="note">Built to stay lightweight, browser-friendly, and easy to extend.</div>
            </div>

            <div class="stat-grid">
              <div class="stat"><strong>13+</strong><span>Supported competitive exams</span></div>
              <div class="stat"><strong>AI</strong><span>Chatbot-powered guidance</span></div>
              <div class="stat"><strong>Free</strong><span>Open-source stack</span></div>
              <div class="stat"><strong>Fast</strong><span>Simple API landing page</span></div>
            </div>
          </section>

          <section class="section section-card">
            <h2>What ExamVerse AI includes</h2>
            <p class="section-copy">A focused feature set for exam preparation without any admin dashboard overhead.</p>
            <div class="grid">
              <div class="tile"><h3>AI Chatbot</h3><p>Ask doubt-based questions and get instant study help.</p></div>
              <div class="tile"><h3>Syllabus Module</h3><p>Track topics for NEET, JEE, UPSC, banking, SSC, and more.</p></div>
              <div class="tile"><h3>Quiz System</h3><p>Practice with adaptive quizzes and topic-wise testing.</p></div>
              <!-- Mock tests feature removed -->
            </div>
          </section>

          <section class="section section-card">
            <h2>Supported exams</h2>
            <div class="exam-list">
              <span class="exam">NEET</span>
              <span class="exam">JEE Main</span>
              <span class="exam">JEE Advanced</span>
              <span class="exam">UPSC</span>
              <span class="exam">KCET/KPSE</span>
              <span class="exam">Banking</span>
              <span class="exam">SSC</span>
              <span class="exam">Railway</span>
              <span class="exam">CAT</span>
              <span class="exam">GATE</span>
              <span class="exam">CUET</span>
              <span class="exam">NDA</span>
              <span class="exam">CLAT</span>
            </div>
          </section>

          <footer class="footer">
            ExamVerse AI Backend is running • GET /api/health • GET /api
          </footer>
        </div>
      </body>
    </html>
  `);
});

// API index
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ExamVerse AI API',
    health: '/api/health'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   ExamVerse AI Backend Server              ║
║   Running on http://localhost:${PORT}        ║
║   Environment: ${process.env.NODE_ENV || 'development'}              ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;
