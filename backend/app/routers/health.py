import datetime
from fastapi import APIRouter
from app.core.config import settings
from app.schemas.analysis import HealthResponse

router = APIRouter(prefix="/api", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Returns backend application health and environment configuration status."""
    return HealthResponse(
        status="healthy",
        app=settings.PROJECT_NAME,
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        timestamp=datetime.datetime.utcnow().isoformat() + "Z"
    )
