from pydantic import BaseModel
from typing import List, Dict


class ResumeResponse(BaseModel):
    parsed_text: str
    skills: List[str]
    education_data: Dict
    experience_data: Dict
    ats_score: int
    suggestions: List[str]