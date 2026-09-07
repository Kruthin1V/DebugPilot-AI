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

# Phase 3 Bullet Optimizer Schemas
class ImproveBulletRequest(BaseModel):
    bullet_point: str = Field(..., min_length=5, description="Original bullet point to optimize")
    job_description: Optional[str] = Field(None, description="Optional target job description context")
    target_role: Optional[str] = Field(None, description="Optional target job role title")

class ImproveBulletResponse(BaseModel):
    original_bullet: str = Field(..., description="Original bullet point string")
    improved_bullet: str = Field(..., description="Factually grounded optimized bullet point")
    alternatives: List[str] = Field(default_factory=list, description="Factually grounded alternative rewritten versions")
    improvements_made: List[str] = Field(default_factory=list, description="Explanation breakdown of formatting and clarity improvements")
    supported_keywords: List[str] = Field(default_factory=list, description="Keywords already supported by original resume bullet")
    suggested_keywords: List[str] = Field(default_factory=list, description="Keywords in job description NOT supported by original bullet")
    warnings: List[str] = Field(default_factory=list, description="Warnings if original bullet lacks context or quantitative metrics")

# Phase 4 Personalized Interview Preparation Schemas
class InterviewQuestionItem(BaseModel):
    id: str = Field(..., description="Unique question identifier")
    category: str = Field(..., description="Category: Technical, Resume/Project, Behavioral/HR, or Skill Gap")
    difficulty: str = Field(..., description="Difficulty level: Easy, Medium, or Hard")
    question: str = Field(..., description="The interview question text")
    why_this_is_asked: str = Field(..., description="Interviewer intent and objective behind this question")
    expected_topics: List[str] = Field(default_factory=list, description="Key technical or competency topics candidate should cover")
    hint: str = Field(..., description="Strategic tip or hint on how to structure the response")
    sample_answer: str = Field(..., description="Comprehensive sample response adhering to truthfulness rules")
    follow_up_question: str = Field(..., description="Potential follow-up question an interviewer might ask")
    is_general: bool = Field(False, description="True if generated as general role question due to sparse resume context")

class InterviewQuestionsRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, description="Extracted resume text")
    job_description: str = Field(..., min_length=10, description="Target job description posting")
    target_role: Optional[str] = Field("Software Engineer", description="Target job title or role")
    difficulty: Optional[str] = Field("Mixed", description="Desired difficulty: Easy, Medium, Hard, or Mixed")
    number_of_questions: Optional[int] = Field(8, ge=1, le=15, description="Number of questions to generate (1 to 15)")
    question_categories: Optional[List[str]] = Field(
        default_factory=lambda: ["Technical", "Resume/Project", "Behavioral/HR", "Skill Gap"],
        description="Categories to include: Technical, Resume/Project, Behavioral/HR, Skill Gap"
    )

class InterviewQuestionsResponse(BaseModel):
    questions: List[InterviewQuestionItem]
