const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const auth = require('./server/middleware/auth');
const { aiLimiter } = require('./server/middleware/rateLimiter');
const chatbotController = require('./server/controllers/chatbotController');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connect
const connectDB = require('./server/config/database');
connectDB().catch(err => {
	console.error('Database connection failed:', err.message);
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from the client folder
app.use(express.static(path.join(__dirname, 'client')));

// Auto-mount route files from ./server/routes as /api/<name>
const routesDir = path.join(__dirname, 'server', 'routes');
if (fs.existsSync(routesDir)) {
	fs.readdirSync(routesDir).forEach((file) => {
		if (file.endsWith('.js')) {
			const name = file.replace(/\.js$/i, '');
			try {
				const route = require(path.join(routesDir, file));
				app.use(`/api/${name}`, route);
				console.log(`Mounted /api/${name} -> server/routes/${file}`);
			} catch (err) {
				console.warn(`Failed to mount route file ${file}:`, err.message);
			}
		}
	});
}

// Page routes (serve HTML pages from client/pages)
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'pages', 'index.html'));
});
app.get('/dashboard', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'pages', 'dashboard.html'));
});
app.get('/exams', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'pages', 'exams.html'));
});
app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'pages', 'login.html'));
});
app.get('/register', (req, res) => {
	res.sendFile(path.join(__dirname, 'client', 'pages', 'register.html'));
});
// React prototype route (CDN React, no build step)
// React app and server-side mock preview removed

// Clean alias for chat clients that expect POST /api/chat
app.post('/api/chat', auth, aiLimiter, chatbotController.sendMessage);

// Unauthenticated test endpoint for debugging
app.post('/api/test-chat', chatbotController.sendMessage);

// API utility endpoints used by docs and health scripts
app.get('/api/health', (req, res) => {
	res.json({ status: 'OK', message: 'ExamVerse AI Backend is running' });
});

app.get('/api', (req, res) => {
	res.json({ success: true, message: 'ExamVerse AI API', health: '/api/health' });
});

// Backward-compatible alias for clients using kebab-case route naming.
try {
	app.use('/api/study-plan', require(path.join(routesDir, 'studyPlan.js')));
} catch (err) {
	console.warn('Failed to mount /api/study-plan alias:', err.message);
}

// Fallback: try to serve the requested file from client folder, otherwise
// return 404 for API routes or send index.html for frontend routes (SPA-friendly)
app.use((req, res) => {
	const tryPath = path.join(__dirname, 'client', req.path);
	if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
		return res.sendFile(tryPath);
	}

	if (req.path.startsWith('/api')) {
		return res.status(404).json({ error: 'API route not found' });
	}

	return res.sendFile(path.join(__dirname, 'client', 'pages', 'index.html'));
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

