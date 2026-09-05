from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.analysis import AnalysisRequest, AnalysisResponse
from app.services.ai_service import ai_service
from app.database import get_db
from app.models.analysis import ResumeAnalysisModel

router = APIRouter(prefix="/api", tags=["Analysis"])

@router.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_resume(payload: AnalysisRequest, db: Session = Depends(get_db)):
    """
    Analyzes resume text against job description using Gemini AI.
    Validates non-empty input parameters and persists analysis in SQLite.
    """
    if not payload.resume_text or not payload.resume_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text cannot be empty. Please upload a PDF resume or enter text."
        )

    if not payload.job_description or not payload.job_description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty. Please paste a target job description."
        )

    # Perform analysis with Gemini AI (or heuristic fallback)
    result_dict = await ai_service.analyze_match(payload.resume_text.strip(), payload.job_description.strip())

    # Store analysis record in SQLite database
    try:
        db_item = ResumeAnalysisModel(
            resume_text=payload.resume_text,
            job_description=payload.job_description,
            ats_score=result_dict.get("ats_score", 0),
            job_match_score=result_dict.get("job_match_score", 0),
            analysis_result=result_dict
        )
        db.add(db_item)
        db.commit()
    except Exception:
        db.rollback()
        # Database failure is non-blocking for client response
        pass

    return AnalysisResponse(**result_dict)
