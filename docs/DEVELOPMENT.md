# AI CareerPilot - Development Guide

This guide details setting up AI CareerPilot locally on Windows without using Docker or WSL.

## System Prerequisites
- **Python**: 3.10+ (Verified on Python 3.14)
- **Node.js**: v18+ (Verified on Node v24)
- **npm**: 9+ (Verified on npm 11)
- **Git**: Installed and configured

---

## 1. Backend Setup

```powershell
# Move to backend directory
cd C:\github\DebugPilot-AI\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (PowerShell)
.\venv\Scripts\Activate.ps1

# Upgrade pip & install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Run backend development server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Verify backend health at: `http://localhost:8000/api/health`

---

## 2. Frontend Setup

```powershell
# Open a second PowerShell terminal window
cd C:\github\DebugPilot-AI\frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open the application at: `http://localhost:5173`

---

## 3. Environment Variables Setup

Ensure `.env` exists in `C:\github\DebugPilot-AI\.env` with your API configuration:

```env
PROJECT_NAME="AI CareerPilot"
PORT=8000
HOST="127.0.0.1"
DATABASE_URL="sqlite:///./careerpilot.db"
GEMINI_API_KEY="your_gemini_api_key_here"
```
