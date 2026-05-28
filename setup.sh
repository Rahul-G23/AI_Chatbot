#!/bin/bash

# ExamVerse AI - Complete Setup Script

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       ExamVerse AI - Installation & Setup Script              ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js installation
echo -e "\n${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed: $(node -v)${NC}"

# Navigate to server directory
echo -e "\n${BLUE}Setting up Backend...${NC}"
cd server

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install

# Create .env if not exists
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update .env with your credentials:${NC}"
    echo "  - MONGODB_URI"
    echo "  - GEMINI_API_KEY"
    echo "  - JWT_SECRET"
fi

echo -e "${GREEN}✓ Backend setup complete${NC}"

# Navigate back
cd ..

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Setup Complete! Follow these steps:                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${BLUE}1. Configure Environment Variables:${NC}"
echo "   - Edit server/.env with your credentials"
echo "   - Add MONGODB_URI, GEMINI_API_KEY, JWT_SECRET"

echo -e "\n${BLUE}2. Seed Database:${NC}"
echo "   cd server"
echo "   npm run seed"

echo -e "\n${BLUE}3. Start Backend Server:${NC}"
echo "   cd server"
echo "   npm run dev"

echo -e "\n${BLUE}4. Start Frontend (in new terminal):${NC}"
echo "   cd client"
echo "   npx http-server -p 3000"
echo "   (or use your preferred local server)"

echo -e "\n${BLUE}5. Access Application:${NC}"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:5000"
echo "   API Docs: http://localhost:5000/api/health"

echo -e "\n${GREEN}Happy Learning! 🚀${NC}"
