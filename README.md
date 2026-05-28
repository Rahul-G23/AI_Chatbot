# ExamVerse AI — Full-stack Exam Prep Platform

ExamVerse AI is a full-stack project combining an Express.js backend and a static frontend for competitive exam preparation. It includes chatbot endpoints, syllabus/quiz modules, study planning, notes, and optional AI integrations.

This README focuses on how to run the project locally and how to protect secrets (API keys) before sharing the repository.

## Prerequisites

- Node.js (16+ recommended)
- npm or yarn
- MongoDB (local or Atlas) for persistence

## Quick local setup

1. Copy the environment template and edit it:

```bash
cp .env.example .env
# Edit .env and fill values: MONGODB_URI, JWT_SECRET, GEMINI_API_KEY, etc.
```

2. Install backend dependencies and start the server (recommended):

```bash
npm install
npm run dev
```

This runs the top-level server (`server.js`) which serves the API under `/api/*` and the static frontend from the `client/` folder. The default server port is `5000`.

3. (Optional) Run the frontend locally instead of using the built-in static server:

```bash
cd client
# Start a simple static server (client/package.json includes a dev script)
npm run dev
# Open http://localhost:3000
```

4. (Optional) If you prefer running the backend from `server/` directly:

```bash
cd server
npm install
npm run dev
```

## Environment variables (overview)

- `MONGODB_URI` — MongoDB connection URI
- `JWT_SECRET` — JSON Web Token secret for auth
- `GEMINI_API_KEY`, `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY` — optional AI keys
- `PORT` — server port (default 5000)

The repository includes `.env.example` as a template. Do not commit your `.env` file.

## Security notice (important)

This repository references API keys and other secrets. Do not upload or push this code to a public GitHub repository while those secrets are present.

Recommended actions before sharing the repo:

- Remove hard-coded keys from source files and rotate exposed credentials.
- Keep secrets in a local `.env` (already listed in `.gitignore`).
- Commit `.env.example` only (do not commit `.env`).

Example `.gitignore` entries (if missing):

```
.env
.env.local
.vscode/
node_modules/
```

## Helpful links

- Setup guide: [GETTING_STARTED.md](GETTING_STARTED.md)
- Quick reference: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

## Project layout (high level)

- `client/` — static frontend (HTML, CSS, JS, pages)
- `server/` — backend source (routes, controllers, models)
- `server.js` — top-level server entry that mounts `server/` routes and serves `client/`
- `.env.example` — environment template

## Need help cleaning secrets?

I can:

- Add a `.env.example` if missing, and create `.env.example` entries for all detected keys.
- Add/extend `.gitignore` to exclude secret files.
- Scan the repository for likely API keys and help remove or redact them safely.

Tell me which of the above you'd like me to do next.
