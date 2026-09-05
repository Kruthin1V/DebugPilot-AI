# AI CareerPilot - System Architecture

AI CareerPilot is built as a lightweight, robust, full-stack web application for automated PDF resume extraction, job description matching, ATS scoring, and targeted interview preparation.

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

## Key Components

### 1. Frontend Layer (`/frontend`)
- **Framework**: React 18 with TypeScript & Vite build runner.
- **Styling**: Vanilla Tailwind CSS with custom glassmorphism design system, dark mode accents, responsive layout tokens, and micro-animations.
- **State Management**: Reactive component state tracking active tabs, uploaded resume files, extracted text, ATS matching results, and backend connectivity status.

### 2. Backend Layer (`/backend`)
- **Framework**: FastAPI with Pydantic schema validation and Uvicorn ASGI web server.
- **PDF Extraction**: PyMuPDF (`fitz`) service module providing secure text extraction, mime-type verification, and maximum upload size limits (5MB limit).
- **Persistence**: SQLite database configured via SQLAlchemy ORM for persisting user uploaded resume summaries, job analyses, and generated interview prompts.
- **AI Service Abstraction**: Modular Gemini API wrapper accessing credentials purely through server-side environment variables (`GEMINI_API_KEY`), ensuring zero key leakage to clients.

## Security Considerations
- **No Hardcoded Keys**: Server reads configuration through Pydantic BaseSettings from `.env`.
- **Upload Hardening**: Enforces strict size checks and extension validation before parsing PDFs. Uploaded files are never executed.
- **CORS Protection**: Access limited to configured frontend origins (`http://localhost:5173`).
