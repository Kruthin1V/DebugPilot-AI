# AI CareerPilot - API Specification

Base URL: `http://localhost:8000/api`

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Server health check and API readiness status |
| `POST` | `/resume/upload` | Upload PDF resume & extract raw text |
| `POST` | `/analyze` | Analyze resume against job description & return ATS scores |
| `POST` | `/resume/improve` | Rewrite & optimize specific resume bullet points (fact-preserved) |
| `POST` | `/interview/questions` | Generate personalized interview practice questions & strategies |

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
Generates ATS-optimized bullet point rewrites while strictly preserving original level of responsibility (no invented metrics or ungrounded claims).

**Request Body**:
```json
{
  "bullet_point": "Worked on backend APIs for company web app using Python and FastAPI.",
  "target_role": "Backend Developer",
  "job_description": "Python, FastAPI, React, SQL, REST API"
}
```

**Response `200 OK`**:
```json
{
  "original_bullet": "Worked on backend APIs for company web app using Python and FastAPI.",
  "improved_bullet": "Worked on backend APIs for company web application using Python and FastAPI.",
  "alternatives": [
    "Worked on backend APIs for company web application using Python and FastAPI.",
    "Contributed to backend APIs for company web application using Python and FastAPI.",
    "Assisted with backend APIs for company web application using Python and FastAPI."
  ],
  "improvements_made": [
    "Improved grammar, spelling, and sentence conciseness.",
    "Polished phrasing for ATS parser readability while strictly preserving original level of responsibility.",
    "Maintained strict factual alignment without introducing ungrounded claims or hallucinated metrics."
  ],
  "supported_keywords": ["Python", "Fastapi", "Backend", "Apis"],
  "suggested_keywords": ["React", "Sql", "Rest Api"],
  "warnings": [
    "Notice: The original bullet lacks quantitative metrics (e.g. %, user count, latency reduction). Consider adding verified numbers to maximize ATS impact."
  ]
}
```

---

### 5. `POST /api/interview/questions`
Generates personalized interview practice questions tailored to candidate's resume, job description, target role, and identified skill gaps.

**Request Body**:
```json
{
  "resume_text": "Backend Developer with experience in Python, FastAPI, SQL, and REST APIs...",
  "job_description": "Seeking Backend Developer proficient in Python, FastAPI, SQL, REST APIs, and Cloud deployment...",
  "target_role": "Backend Developer",
  "difficulty": "Mixed",
  "number_of_questions": 8,
  "question_categories": ["Technical", "Resume/Project", "Behavioral/HR", "Skill Gap"]
}
```

**Response `200 OK`**:
```json
{
  "questions": [
    {
      "id": "q_1",
      "category": "Technical",
      "difficulty": "Medium",
      "question": "How do you structure request validation and exception handling in FastAPI to ensure clean REST API design?",
      "why_this_is_asked": "Tests your practical knowledge of API validation and exception handling in FastAPI.",
      "expected_topics": ["Pydantic Schemas", "HTTP Exception Handling", "REST Best Practices"],
      "hint": "Reference Pydantic models, custom exception handlers, and standard HTTP status codes.",
      "sample_answer": "Based on your resume: Explain using Pydantic BaseModels for automatic request body validation and raising FastAPI HTTPException with descriptive error messages.",
      "follow_up_question": "How do you handle CORS policy and security headers in your APIs?",
      "is_general": false
    },
    {
      "id": "q_2",
      "category": "Skill Gap",
      "difficulty": "Medium",
      "question": "The target job requires experience with Cloud/DevOps. How would you bridge your background in Python to work effectively with Cloud deployment?",
      "why_this_is_asked": "Evaluates your ability to rapidly ramp up on required job skills (Cloud) not present on your resume.",
      "expected_topics": ["Cloud Integration", "Adaptability", "Transferable Skills"],
      "hint": "Connect your solid foundation in existing tools to how quickly you pick up new technologies.",
      "sample_answer": "A strong general answer would be: Explain how your foundational experience in Python backend design translates directly to mastering Cloud concepts quickly.",
      "follow_up_question": "How would you troubleshoot an issue involving Cloud deployment in your first month?",
      "is_general": true
    }
  ]
}
```
