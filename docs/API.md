# AI CareerPilot - API Specification

Base URL: `http://localhost:8000/api`

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check and API readiness status |
| `POST` | `/resume/upload` | Upload PDF resume & extract raw text |
| `POST` | `/analyze` | Analyze resume against job description & return ATS scores |
| `POST` | `/resume/improve` | Rewrite & optimize specific resume bullet points |
| `POST` | `/interview/questions` | Generate interview preparation questions by category |

---

## Endpoint Details

### 1. `GET /api/health`
Checks backend service health and runtime configuration state.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "app": "AI CareerPilot",
  "version": "1.0.0",
  "environment": "development",
  "timestamp": "2026-09-05T12:00:00Z"
}
```

---

### 2. `POST /api/resume/upload`
Uploads a single PDF file (max 5MB) and extracts plain text content safely.

**Request**: `multipart/form-data`
- `file`: PDF binary file stream.

**Response `200 OK`**:
```json
{
  "filename": "john_doe_resume.pdf",
  "file_size_bytes": 1048576,
  "extracted_text": "John Doe - Senior Software Engineer...",
  "page_count": 2
}
```

---

### 3. `POST /api/analyze`
Compares extracted resume text with target job description.

**Request Body**:
```json
{
  "resume_text": "Experienced Python & React developer...",
  "job_description": "We are seeking a Full Stack Engineer..."
}
```

**Response `200 OK`**:
```json
{
  "ats_score": 85,
  "job_match_score": 88,
  "matching_skills": ["Python", "React", "TypeScript", "FastAPI"],
  "missing_skills": ["Docker", "Kubernetes"],
  "important_keywords": ["Full Stack", "REST API", "State Management"],
  "resume_strengths": ["Strong backend experience", "Modern frontend stack"],
  "resume_weaknesses": ["Lacks mention of cloud deployment"],
  "improvement_suggestions": ["Highlight system design achievements"],
  "potential_issues": ["No explicit metrics in recent role"],
  "recommended_changes": ["Quantify impact in bullet points"]
}
```

---

### 4. `POST /api/resume/improve`
Generates optimized ATS bullet points.

**Request Body**:
```json
{
  "bullet_point": "Worked on backend APIs for company web application."
}
```

**Response `200 OK`**:
```json
{
  "original_bullet": "Worked on backend APIs for company web application.",
  "improved_bullet": "Architected high-throughput FastAPI REST endpoints serving 50k+ daily active users with 99.9% uptime."
}
```

---

### 5. `POST /api/interview/questions`
Generates customized interview practice questions based on resume & job match.

**Request Body**:
```json
{
  "resume_text": "...",
  "job_description": "..."
}
```

**Response `200 OK`**:
```json
{
  "questions": [
    {
      "category": "Technical",
      "question": "How do you manage state and asynchronous actions in complex React applications?",
      "difficulty": "Medium"
    },
    {
      "category": "Behavioral / HR",
      "question": "Describe a scenario where you had to refactor a legacy API endpoint under a tight deadline.",
      "difficulty": "Hard"
    }
  ]
}
```
