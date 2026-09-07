# 🚀 AI CareerPilot

**AI CareerPilot** is a production-quality, resume-worthy AI-powered Resume and Job Matching platform. It empowers job seekers to upload PDF resumes, extract clean text content, compare their profile against job descriptions, evaluate ATS compatibility scores, rewrite weak bullets without inventing false metrics, and practice personalized interview preparation questions.

---

## ✨ Features
- 📄 **PDF Resume Upload & Parser**: Secure text extraction from PDF documents using PyMuPDF.
- 🎯 **ATS Compatibility & Job Match Scoring**: Automated scoring (0-100) analyzing keyword density and matching skills.
- 🔍 **Skills Gap & Keyword Identification**: Breakdown of matching skills, missing technical skills, strengths, and weaknesses.
- ✍️ **Fact-Preserved AI Resume Bullet Optimizer**: Interactive bullet optimizer with strict truthfulness constraints (never invents numbers, percentages, or ungrounded leadership claims).
- 💬 **Personalized AI Interview Preparation**: Customized interview questions (Technical, Resume/Project, Behavioral/HR, Skill Gap) tailored to candidate resume, target job description, target role, and identified skill gaps, with expected topics, hints, sample answers, and follow-ups.
- 💾 **Local Persistence**: Zero-complexity SQLite database via SQLAlchemy.
- 🔒 **Security-First Design**: API keys stored in environment variables, file size validation (5MB limit), and file execution safeguards.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite
- **Styling**: Vanilla Tailwind CSS with custom glassmorphism design system & micro-animations
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Validation**: Pydantic & Pydantic-Settings
- **PDF Engine**: PyMuPDF (`fitz`)
- **Database**: SQLite & SQLAlchemy ORM
- **Web Server**: Uvicorn

### AI Integration
- **Engine**: Google Gemini API via clean service abstraction (`app/services/ai_service.py`)

---

## 🏗️ System Architecture

```
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|       (TypeScript + Vite + Tailwind CSS + Interactive Dashboard)        |
+-------------------------------------------------------------------------+
                                    |  HTTP / REST API (JSON & Multipart)
                                    v
+-------------------------------------------------------------------------+
|                             FASTAPI BACKEND                             |
|  +---------------------+  +---------------------+  +-----------------+  |
|  | Resume Extractor    |  | SQLite Storage      |  | Gemini AI       |  |
|  | (PyMuPDF Service)   |  | (SQLAlchemy ORM)    |  | Service         |  |
|  +---------------------+  +---------------------+  +-----------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    v
                       +-------------------------+
                       |    Google Gemini API    |
                       +-------------------------+
```

---

## 🚀 Quick Start Guide (Windows local, No Docker/WSL)

### 1. Environment Setup
Copy the environment template:
```powershell
Copy-Item .env.example .env
```
Edit `.env` to add your `GEMINI_API_KEY`.

### 2. Start Backend Server
```powershell
# Navigate to backend
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start FastAPI Uvicorn server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
Backend Health Check URL: [http://localhost:8000/api/health](http://localhost:8000/api/health)

### 3. Start Frontend Dashboard
Open a new terminal window:
```powershell
# Navigate to frontend
cd frontend

# Install npm packages
npm install

# Launch Vite server
npm run dev
```
Frontend Web Dashboard: [http://localhost:5173](http://localhost:5173)

---

## 📖 Documentation
- [Architecture Details](docs/ARCHITECTURE.md)
- [REST API Specifications](docs/API.md)
- [Developer Setup Guide](docs/DEVELOPMENT.md)

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
