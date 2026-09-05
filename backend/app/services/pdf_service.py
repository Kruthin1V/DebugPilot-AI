import pymupdf  # PyMuPDF
from fastapi import HTTPException, UploadFile, status
from app.core.config import settings

class PDFService:
    @staticmethod
    async def extract_text_from_pdf(file: UploadFile) -> tuple[str, int, int]:
        """
        Validates uploaded PDF and extracts text using PyMuPDF.
        Returns: (extracted_text, file_size_bytes, page_count)
        """
        filename = file.filename or "resume.pdf"
        ext = filename.split(".")[-1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type '.{ext}'. Only PDF resumes are supported."
            )

        content = await file.read()
        file_size = len(content)
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        
        if file_size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded PDF file is empty (0 bytes)."
            )

        if file_size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({round(file_size / (1024*1024), 2)}MB) exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB}MB."
            )

        # Validate PDF magic header
        if not content.startswith(b"%PDF"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid PDF file structure. The uploaded file does not contain a valid PDF signature."
            )

        try:
            doc = pymupdf.open(stream=content, filetype="pdf")
            page_count = len(doc)
            
            if page_count == 0:
                doc.close()
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="The PDF file contains zero pages."
                )

            extracted_pages = []
            for page_num in range(page_count):
                page = doc.load_page(page_num)
                text = page.get_text("text")
                if text and text.strip():
                    extracted_pages.append(text.strip())
            
            doc.close()
            full_text = "\n\n".join(extracted_pages).strip()

            if not full_text:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Could not extract readable text from the PDF. The file may be scanned or image-only."
                )

            return full_text, file_size, page_count
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error parsing PDF document: {str(e)}"
            )

pdf_service = PDFService()
