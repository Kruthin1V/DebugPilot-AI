from fastapi import APIRouter, File, UploadFile, status, HTTPException
from app.schemas.analysis import ResumeUploadResponse, ImproveBulletRequest, ImproveBulletResponse
from app.services.pdf_service import pdf_service
from app.services.ai_service import ai_service

router = APIRouter(prefix="/api/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeUploadResponse, status_code=status.HTTP_200_OK)
async def upload_resume(file: UploadFile = File(...)):
    """
    Accepts single PDF file, validates constraints (size <= 5MB, %PDF header, non-empty),
    and returns extracted plain text using PyMuPDF.
    """
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided in request."
        )

    extracted_text, file_size, page_count = await pdf_service.extract_text_from_pdf(file)
    
    return ResumeUploadResponse(
        filename=file.filename,
        file_size_bytes=file_size,
        extracted_text=extracted_text,
        page_count=page_count
    )

@router.post("/improve", response_model=ImproveBulletResponse, status_code=status.HTTP_200_OK)
async def improve_bullet(payload: ImproveBulletRequest):
    """
    Rewrites a resume bullet point using Gemini AI while strictly enforcing factuality rules.
    Never invents metrics, percentages, tools, or leadership/collaboration claims.
    Returns supported_keywords (from resume) and suggested_keywords (from job post).
    """
    if not payload.bullet_point or not payload.bullet_point.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bullet point text cannot be empty."
        )

    result_dict = await ai_service.improve_bullet(
        bullet_point=payload.bullet_point.strip(),
        job_description=payload.job_description.strip() if payload.job_description else None,
        target_role=payload.target_role.strip() if payload.target_role else None
    )

    return ImproveBulletResponse(
        original_bullet=payload.bullet_point.strip(),
        improved_bullet=result_dict.get("improved_bullet", payload.bullet_point),
        alternatives=result_dict.get("alternatives", []),
        improvements_made=result_dict.get("improvements_made", []),
        supported_keywords=result_dict.get("supported_keywords", []),
        suggested_keywords=result_dict.get("suggested_keywords", []),
        warnings=result_dict.get("warnings", [])
    )
