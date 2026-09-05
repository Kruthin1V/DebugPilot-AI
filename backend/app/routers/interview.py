from fastapi import APIRouter, status
from app.schemas.analysis import InterviewQuestionsRequest, InterviewQuestionsResponse, InterviewQuestionItem

router = APIRouter(prefix="/api/interview", tags=["Interview"])

@router.post("/questions", response_model=InterviewQuestionsResponse, status_code=status.HTTP_200_OK)
async def generate_interview_questions(payload: InterviewQuestionsRequest):
    """Generates categorized interview practice questions based on resume and job description."""
    questions = [
        InterviewQuestionItem(
            category="Technical",
            question="Can you explain your experience building REST APIs with Python/FastAPI and how you handle async performance?",
            difficulty="Medium"
        ),
        InterviewQuestionItem(
            category="Technical",
            question="How do you structure React component architecture and optimize client-side state management?",
            difficulty="Hard"
        ),
        InterviewQuestionItem(
            category="Behavioral / HR",
            question="Tell me about a project where you identified missing requirements or technical debt and how you resolved it.",
            difficulty="Medium"
        ),
        InterviewQuestionItem(
            category="Project-Based",
            question="Walk me through the design choices in your most recent full-stack project.",
            difficulty="Easy"
        )
    ]
    return InterviewQuestionsResponse(questions=questions)
