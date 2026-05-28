# ExamVerse AI - Deployment Guide

Complete guide to deploy ExamVerse AI on FREE hosting platforms.

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│          Frontend (HTML/CSS/JS)                 │
│   Vercel / Netlify / GitHub Pages (FREE)        │
└────────────┬────────────────────────────────────┘
             │
             │ API Calls
             ↓
┌─────────────────────────────────────────────────┐
│   Backend (Node.js/Express)                     │
│   Render / Railway (FREE)                       │
└────────────┬────────────────────────────────────┘
             │
             │ Queries
             ↓
┌─────────────────────────────────────────────────┐
│   Database (MongoDB)                            │
│   MongoDB Atlas Free Tier                       │
└─────────────────────────────────────────────────┘
```

## Frontend Deployment

### Option 1: Vercel (Recommended - Easiest)

#### Step 1: Create Vercel Account
```
1. Visit: https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel
```

#### Step 2: Prepare Deployment
```bash
# From project root
cd client

# Create .vercelignore
echo "node_modules/" > .vercelignore

# Create vercel.json for static site
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "client/pages/index.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "client/pages/$1"
    }
  ]
}
EOF
```

#### Step 3: Deploy
```
1. On Vercel dashboard: "New Project"
2. Select repository
3. Framework: "Other"
4. Build command: (empty)
5. Output directory: "client"
6. Deploy
```

#### Step 4: Configure Environment
```
1. Project Settings
2. Environment Variables
3. Add VITE_API_URL = https://your-backend.herokuapp.com/api
4. Redeploy
```

### Option 2: Netlify

#### Step 1: Create Netlify Account
```
1. Visit: https://netlify.com
2. Sign up with GitHub
```

#### Step 2: Deploy
```
1. Click "New site from Git"
2. Select GitHub repository
3. Branch: main
4. Build command: npm run build (or leave empty)
5. Publish directory: client
6. Deploy
```

#### Step 3: Configure Domain
```
1. Site settings
2. Change site name
3. Add custom domain (if you have)
```

### Option 3: GitHub Pages (Free)

```bash
# Requires GitHub repository

cd client

# Create .github/workflows/deploy.yml
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./client
          cname: your-custom-domain.com
EOF

# Push to GitHub
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment"
git push origin main
```

## Backend Deployment

### Option 1: Render (Recommended - Easiest)

#### Step 1: Prepare Repository
```bash
# From project root
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/examverse.git
git push -u origin main
```

#### Step 2: Create Render Account
```
1. Visit: https://render.com
2. Sign up with GitHub
3. Authorize Render
```

#### Step 3: Deploy Backend
```
1. Dashboard → New +
2. Select "Web Service"
3. Connect GitHub repository
4. Name: examverse-ai-backend
5. Environment: Node
6. Build Command: npm install
7. Start Command: npm start
```

#### Step 4: Add Environment Variables
```
1. Environment tab
2. Add all variables from .env.example:
   MONGODB_URI
   GEMINI_API_KEY
   JWT_SECRET
   NODE_ENV=production
   PORT=5000
3. Deploy
```

#### Step 5: Get Backend URL
```
Backend URL: https://examverse-ai-backend.onrender.com
Add this to frontend API configuration
```

### Option 2: Railway

#### Step 1: Create Railway Account
```
1. Visit: https://railway.app
2. Sign up with GitHub
```

#### Step 2: Deploy
```
1. New Project
2. Deploy from GitHub repo
3. Configure environment variables
4. Deploy
```

#### Step 3: Configure MongoDB
```
1. Add MongoDB plugin
2. Use generated connection string
3. Update MONGODB_URI
```

### Option 3: Heroku (Limited Free)

```bash
# Note: Heroku removed free tier in Nov 2022
# Using paid hobby tier ($5+/month)

# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create examverse-ai-backend

# Set environment variables
heroku config:set MONGODB_URI=your_uri
heroku config:set GEMINI_API_KEY=your_key
heroku config:set JWT_SECRET=your_secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## Database Setup

### MongoDB Atlas Free Tier

#### Step 1: Create MongoDB Account
```
1. Visit: https://mongodb.com/cloud/atlas
2. Sign up (free)
3. Create organization
```

#### Step 2: Create Database
```
1. Create Cluster (AWS, us-east-1, M0 free)
2. Create database user
3. Add IP address to whitelist (0.0.0.0/0 for testing)
4. Create database "examverse"
```

#### Step 3: Get Connection String
```
1. Cluster → Connect
2. Choose "Connect your application"
3. Copy connection string:
   mongodb+srv://user:pass@cluster.mongodb.net/examverse?retryWrites=true&w=majority
```

#### Step 4: Seed Database
```bash
# After deploying backend
curl https://your-backend.onrender.com/api/health

# Run seed from backend terminal
npm run seed
```

## Environment Variables for Production

### Backend (.env)

```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/examverse?retryWrites=true&w=majority

# AI APIs
GEMINI_API_KEY=AIzaSyD...
HUGGINGFACE_API_KEY=hf_xyz...

# Authentication
JWT_SECRET=your-very-long-random-secret-key-minimum-32-chars
JWT_EXPIRE=7d

# CORS
CLIENT_URL=https://your-frontend-domain.com

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=app-specific-password
EMAIL_SERVICE=gmail
```

### Frontend (config.js)

```javascript
const API_BASE_URL = 'https://your-backend.onrender.com/api';
```

## Domain Setup (Optional)

### Add Custom Domain to Vercel

```
1. Project Settings → Domains
2. Add domain
3. Update DNS records
4. Verify domain
```

### Add Custom Domain to Netlify

```
1. Site settings → Domain
2. Add custom domain
3. Update CNAME record in DNS
4. Verify
```

## SSL/HTTPS

- ✅ Vercel: Automatic SSL
- ✅ Netlify: Automatic SSL  
- ✅ Render: Automatic SSL
- ✅ Railway: Automatic SSL

## CI/CD Pipeline

### GitHub Actions Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          git push https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/${{ secrets.HEROKU_APP_NAME }}.git main

      - name: Deploy Frontend
        run: |
          npm run build
          
      - name: Run Tests
        run: npm test
```

## Monitoring & Logs

### Render
```
Service → Logs tab to view real-time logs
```

### Railway
```
Project → Deployments → Logs to view
```

### MongoDB Atlas
```
Atlas → Performance Advisor → View performance metrics
```

## Performance Optimization

### CDN Configuration

**Vercel CDN** (Automatic):
- Automatically caches static assets
- Global edge network

**Netlify CDN** (Automatic):
- Global distribution
- Instant cache purge

### Database Optimization

```javascript
// Add indexes for better performance
db.users.createIndex({ email: 1 });
db.syllabus.createIndex({ examName: 1, subject: 1 });
db.quizresults.createIndex({ userId: 1, completedAt: -1 });
```

### API Response Caching

```bash
# Add cache headers in Express
app.use((req, res, next) => {
    res.set('Cache-Control', 'public, max-age=3600');
    next();
});
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 chars)
- [ ] Enable HTTPS everywhere
- [ ] Set CORS to production domain only
- [ ] Enable rate limiting
- [ ] Monitor API usage
- [ ] Regular security updates
- [ ] Backup MongoDB regularly

## Troubleshooting

### Backend won't start
```
1. Check logs: render logs --tail
2. Verify environment variables
3. Check MongoDB connection
4. Review error messages
```

### API calls failing
```
1. Check CORS settings
2. Verify backend URL in frontend
3. Check rate limiting
4. Review network errors
```

### Database quota exceeded
```
Solution: Upgrade MongoDB plan or delete old data
```

### Images not loading
```
1. Upload to CDN (Cloudinary - FREE)
2. Update image URLs
3. Test on production
```

## Cost Summary (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Frontend (Vercel) | ✅ Unlimited | $0 |
| Backend (Render) | ✅ First 10GB | $0 |
| Database (MongoDB) | ✅ 512MB | $0 |
| Email (SendGrid) | ✅ 100/day | $0 |
| Gemini API | ✅ Generous free | $0 |
| **TOTAL** | | **$0/month** |

## Upgrade Path

When free tier limits are reached:

- **Frontend**: Vercel Pro ($20/mo)
- **Backend**: Render Pro ($7/mo)  
- **Database**: MongoDB M0→M2 ($9/mo)
- **Email**: SendGrid Pro ($80/mo)

## Post-Deployment

### Seed Production Database
```bash
# SSH into Render
render exec npm run seed
```

### Test Production API
```bash
curl https://your-backend.onrender.com/api/health
```

### Monitor Performance
```
1. Render Dashboard
2. MongoDB Atlas Metrics
3. Vercel Analytics
```

### Set Up Monitoring
```
1. Error tracking: Sentry
2. Performance: New Relic
3. Uptime: UptimeRobot
```

## Success Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and working
- [ ] MongoDB running in production
- [ ] Environment variables configured
- [ ] Database seeded
- [ ] SSL/HTTPS working
- [ ] API endpoints responding
- [ ] Error handling working
- [ ] Rate limiting enabled
- [ ] Backups configured

---

**Deployment Complete! 🎉**

Your ExamVerse AI is now live on the internet!

Share your app URL and invite others to use it!
