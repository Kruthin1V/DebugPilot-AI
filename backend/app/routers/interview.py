from fastapi import APIRouter, status, HTTPException
from app.schemas.analysis import InterviewQuestionsRequest, InterviewQuestionsResponse
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/interview", tags=["Interview"])

@router.post("/questions", response_model=InterviewQuestionsResponse, status_code=status.HTTP_200_OK)
async def generate_interview_questions(payload: InterviewQuestionsRequest):
    """
    Generates personalized interview practice questions tailored to candidate's resume,
    target job description, target role, and identified skill gaps.
    """
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text cannot be empty. Please upload a PDF resume or enter text."
        )

    if not payload.job_description or not payload.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty. Please enter target job description."
        )

    questions = await ai_service.generate_interview_questions(
        resume_text=payload.resume_text.strip(),
        job_description=payload.job_description.strip(),
        target_role=payload.target_role.strip() if payload.target_role else "Software Engineer",
        difficulty=payload.difficulty or "Mixed",
        number_of_questions=payload.number_of_questions or 8,
        question_categories=payload.question_categories
    )

    return InterviewQuestionsResponse(questions=questions)
