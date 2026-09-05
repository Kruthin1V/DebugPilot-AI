import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from app.database import Base

class ResumeAnalysisModel(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=True)
    resume_text = Column(Text, nullable=False)
    job_description = Column(Text, nullable=False)
    ats_score = Column(Integer, default=0)
    job_match_score = Column(Integer, default=0)
    analysis_result = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
