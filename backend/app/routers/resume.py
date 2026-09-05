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
    """Rewrites bullet point into an ATS-optimized action statement."""
    if not payload.bullet_point or not payload.bullet_point.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bullet point text cannot be empty."
        )

    improved = await ai_service.improve_bullet(payload.bullet_point.strip())
    
    return ImproveBulletResponse(
        original_bullet=payload.bullet_point,
        improved_bullet=improved
    )
