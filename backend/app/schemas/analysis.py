from typing import List, Optional
from pydantic import BaseModel, Field

class HealthResponse(BaseModel):
    status: str
    app: str
    version: str
    environment: str
    timestamp: str

class ResumeUploadResponse(BaseModel):
    filename: str
    file_size_bytes: int
    extracted_text: str
    page_count: int

class AnalysisRequest(BaseModel):
    resume_text: str = Field(..., min_length=15, description="Raw text extracted from candidate resume")
    job_description: str = Field(..., min_length=15, description="Target job description posting")

class AnalysisResponse(BaseModel):
    ats_score: int = Field(..., ge=0, le=100, description="ATS structural and formatting score (0-100)")
    job_match_score: int = Field(..., ge=0, le=100, description="Technical skill and qualification match score (0-100)")
    matching_skills: List[str] = Field(default_factory=list, description="Skills present in both resume and job post")
    missing_skills: List[str] = Field(default_factory=list, description="Required job skills missing from candidate resume")
    important_keywords: List[str] = Field(default_factory=list, description="Critical industry keywords identified in job post")
    resume_strengths: List[str] = Field(default_factory=list, description="Candidate strengths relative to target role")
    resume_weaknesses: List[str] = Field(default_factory=list, description="Candidate gaps or weak points relative to job post")
    improvement_suggestions: List[str] = Field(default_factory=list, description="Actionable suggestions to improve ATS compliance")
    potential_issues: List[str] = Field(default_factory=list, description="Potential ATS or recruiter red flags")
    recommended_changes: List[str] = Field(default_factory=list, description="Specific rewrites or additions recommended")

class ImproveBulletRequest(BaseModel):
    bullet_point: str = Field(..., min_length=5, description="Original bullet point to rewrite")

class ImproveBulletResponse(BaseModel):
    original_bullet: str
    improved_bullet: str

class InterviewQuestionItem(BaseModel):
    category: str
    question: str
    difficulty: str

class InterviewQuestionsRequest(BaseModel):
    resume_text: str
    job_description: str

class InterviewQuestionsResponse(BaseModel):
    questions: List[InterviewQuestionItem]
