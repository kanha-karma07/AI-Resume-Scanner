from fastapi import FastAPI, UploadFile, File, HTTPException
from app.parser import extract_text_from_pdf, local_extract_structured_resume_data
from app.utils import clean_resume_text
from app.ats import calculate_ats_score
from app.groq_engine import generate_smart_suggestions, extract_structured_resume_data, analyze_job_match
from pydantic import BaseModel
import tempfile
import os
import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Resume Scanner Engine",
    description="AI Microservice for Resume Parsing and ATS Analysis",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "AI Engine is Running Successfully 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    temp_path = None
    try:
        logger.info("=== STARTING RESUME ANALYSIS PIPELINE ===")
        logger.info(f"Resume uploaded to AI Engine: {file.filename}")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
            temp.write(await file.read())
            temp_path = temp.name
            
        logger.info(f"File path created: {temp_path}")

        # PDF Text Extraction
        try:
            parsed_text = extract_text_from_pdf(temp_path)
            logger.info("PDF opened successfully")
            if not parsed_text or len(parsed_text.strip()) == 0:
                raise ValueError("Text extracted is empty.")
        except Exception as e:
            logger.error(f"PDF Extraction Failed: {e}")
            raise HTTPException(status_code=400, detail="Invalid or corrupted PDF file. Please upload a valid PDF resume.")

        cleaned_text = clean_resume_text(parsed_text)
        logger.info(f"Text extracted. Text length: {len(cleaned_text)} chars")
        
        # AI Parsing
        try:
            structured_data = extract_structured_resume_data(cleaned_text)
            logger.info("AI Extracted structured JSON sections successfully. (Groq Success)")
        except Exception as e:
            logger.error(f"Groq Failed: {e}")
            logger.info("Fallback Activated.")
            structured_data = local_extract_structured_resume_data(cleaned_text)
            logger.info("Fallback Completed.")
        
        skills = structured_data.get("skills", [])
        education_data = structured_data.get("education", [])
        experience_data = structured_data.get("experience", [])
        projects = structured_data.get("projects", [])
        
        # We need raw_text in structured_data for ats_score metrics check
        structured_data["raw_text"] = cleaned_text
        
        ats_score = calculate_ats_score(structured_data)
        breakdown = structured_data.pop("_ats_breakdown", {})
        
        # Debug Output requested by user
        print("\n====================================")
        print("Projects Found:")
        if projects:
            for p in projects: print(f"- {str(p)[:100].replace(chr(10), ' ')}...")
        else:
            print("None")
        print("\nExperience Found:")
        print(experience_data)
        print("\nSkills Found:")
        print(skills)
        print("\nEducation Found:")
        print(education_data)
        print("\nATS Breakdown:")
        for k, v in breakdown.items():
            print(f"{k}: {v}")
        print(f"\nFinal ATS: {ats_score}")
        print("====================================\n")
        
        logger.info(f"ATS score calculated: {ats_score}%")
        
        logger.info("AI request sent (Groq)")
        suggestions = generate_smart_suggestions(structured_data, ats_score)
        
        # Validation Layer to remove contradictory suggestions
        validated_suggestions = []
        jobs = experience_data if isinstance(experience_data, list) else []
        has_internship = len(jobs) > 0
        
        logger.info(f"--- DEBUGGING LOGS ---")
        logger.info(f"Extracted Experience Section: {jobs}")
        logger.info(f"Number of Internship/Experience Entries Found: {len(jobs)}")
        logger.info(f"Experience Score: {breakdown.get('Experience', '0/20')}")
        
        
        for sug in suggestions:
            s_lower = sug.lower()
            if len(projects) > 0 and "project" in s_lower:
                continue
            if has_internship and ("internship" in s_lower or "industrial training" in s_lower):
                continue
            if isinstance(education_data, list) and len(education_data) > 0 and "education" in s_lower:
                continue
            if len(skills) >= 5 and "skill" in s_lower:
                continue
            validated_suggestions.append(sug)
            
        suggestions = validated_suggestions
        if not suggestions:
            suggestions.append("Excellent Resume. All critical sections are present. Focus on tailoring it to specific job descriptions.")
            
        logger.info(f"AI response received. Suggestions generated after validation: {len(suggestions)}")
        logger.info(f"Final Suggestions: {suggestions}")

        import json
        return {
            "parsed_text": json.dumps(structured_data),
            "skills": skills,
            "education": education_data,
            "experience": experience_data,
            "projects": projects,
            "ats_score": ats_score,
            "ats_breakdown": breakdown,
            "suggestions": suggestions
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Pipeline crashed with exception:\n{error_trace}")
        # Return a 500 error instead of silently returning default empty values
        raise HTTPException(status_code=500, detail=str(e))
        
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

class JobMatchRequest(BaseModel):
    resume_text: str
    job_description: str

@app.post("/analyze-job-match")
async def analyze_job_match_endpoint(request: JobMatchRequest):
    try:
        logger.info("=== STARTING JOB MATCH ANALYSIS ===")
        logger.info(f"Resume Text Length: {len(request.resume_text)}")
        logger.info(f"JD Text Length: {len(request.job_description)}")
        
        result = analyze_job_match(request.resume_text, request.job_description)
        logger.info(f"Job Match Score: {result.get('match_score')}")
        return result
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Job Match Failed:\n{error_trace}")
        raise HTTPException(status_code=500, detail=str(e))

from typing import Dict, Any
from app.groq_engine import build_resume_structured

class ResumeBuildRequest(BaseModel):
    user_data: Dict[str, Any]

@app.post("/build-resume")
async def build_resume_endpoint(request: ResumeBuildRequest):
    try:
        logger.info("=== STARTING RESUME BUILDER ===")
        result = build_resume_structured(request.user_data)
        logger.info("Resume successfully built.")
        return result
    except Exception as e:
        error_trace = traceback.format_exc()
        logger.error(f"Resume Builder Failed:\n{error_trace}")
        raise HTTPException(status_code=500, detail=str(e))

from app.groq_engine import edit_resume_structured

class ResumeEditRequest(BaseModel):
    resume_json: Dict[str, Any]
    section: str
    instruction: str

@app.post("/edit-resume")
async def edit_resume_endpoint(request: ResumeEditRequest):
    try:
        logger.info(f"=== STARTING RESUME EDITOR ({request.section}) ===")
        result = edit_resume_structured(request.resume_json, request.section, request.instruction)
        logger.info("Resume successfully edited.")
        return result
    except Exception as e:
        error_trace = traceback.format_exc()
        raise HTTPException(status_code=500, detail=str(e))

from app.groq_engine import generate_interview_questions, generate_candidate_insights, generate_structured_jd

class InterviewQuestionsRequest(BaseModel):
    resume_data: dict
    job_description: str

@app.post("/generate-interview-questions")
async def generate_interview_questions_endpoint(request: InterviewQuestionsRequest):
    try:
        logger.info("=== STARTING INTERVIEW QUESTIONS GENERATOR ===")
        questions = generate_interview_questions(request.resume_data, request.job_description)
        return {"questions": questions}
    except Exception as e:
        logger.error(f"Interview Questions Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class CandidateInsightsRequest(BaseModel):
    resume_data: dict
    job_description: str = ""

@app.post("/generate-candidate-insights")
async def generate_candidate_insights_endpoint(request: CandidateInsightsRequest):
    try:
        logger.info("=== STARTING CANDIDATE INSIGHTS GENERATOR ===")
        insights = generate_candidate_insights(request.resume_data, request.job_description)
        return insights
    except Exception as e:
        logger.error(f"Candidate Insights Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class StructuredJDRequest(BaseModel):
    role: str
    experience: str
    skills: str
    industry: str
    job_type: str

@app.post("/generate-structured-jd")
async def generate_structured_jd_endpoint(request: StructuredJDRequest):
    try:
        logger.info("=== STARTING STRUCTURED JD GENERATOR ===")
        jd_data = generate_structured_jd(
            request.role, request.experience, request.skills, request.industry, request.job_type
        )
        return jd_data
    except Exception as e:
        logger.error(f"Structured JD Failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))