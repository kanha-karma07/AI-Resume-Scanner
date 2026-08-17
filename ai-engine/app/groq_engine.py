import os
import json
import time
import re
import logging
from groq import Groq
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

# Try loading from local ai-engine/.env or parent backend/.env
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "../../../backend/.env"))

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "openai/gpt-oss-120b"
GROQ_FALLBACK_MODEL = "openai/gpt-oss-20b"  # Optional fallback model

if GROQ_API_KEY and GROQ_API_KEY.strip() and GROQ_API_KEY != "YOUR_GROQ_API_KEY":
    logger.info("Loaded GROQ_API_KEY : True")
else:
    logger.info("Loaded GROQ_API_KEY : False")
    raise RuntimeError("GROQ_API_KEY is missing. Please configure .env")


def normalize_ai_response(response) -> dict:
    """Normalizes the Groq JSON response to strictly return lists for list fields."""
    if not isinstance(response, dict):
        response = {}
        
    normalized = {
        "education": response.get("education", []),
        "experience": response.get("experience", []),
        "projects": response.get("projects", []),
        "skills": response.get("skills", []),
        "certifications": response.get("certifications", []),
        "languages": response.get("languages", []),
        "suggestions": response.get("suggestions", []),
        "ats_score": response.get("ats_score", 0)
    }
    
    for key in ["education", "experience", "projects", "skills", "certifications", "languages", "suggestions"]:
        val = normalized[key]
        if isinstance(val, dict):
            if "jobs" in val:
                normalized[key] = val.get("jobs", [])
            else:
                normalized[key] = [val]
        elif isinstance(val, str):
            normalized[key] = [val]
        elif val is None:
            normalized[key] = []
        elif not isinstance(val, list):
            normalized[key] = [val]
            
    if isinstance(normalized["ats_score"], (list, dict, str)):
        normalized["ats_score"] = 0
            
    return normalized


def extract_json_from_text(text: str) -> dict:
    """Robustly extract the first valid JSON object from a string containing markdown or conversational text."""
    # Try finding markdown block first
    if "```json" in text:
        match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            text = match.group(1)
    elif "```" in text:
        match = re.search(r'```\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            text = match.group(1)
            
    # Then find the first curly brace block
    match = re.search(r'\{.*\}', text, re.DOTALL)
    if not match:
        raise ValueError("No JSON object could be found in the response.")
        
    json_str = match.group(0)
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON parsed from regex match: {e}")


def extract_structured_resume_data(raw_text: str) -> dict:
    """Uses Groq to parse the raw resume text into strict structured JSON sections."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Cannot perform AI extraction.")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    original_length = len(raw_text)
    # 6. REDUCE TOKEN SIZE
    raw_text = raw_text[:12000]
    logger.info(f"Resume length truncated from {original_length} to {len(raw_text)} characters.")
    
    prompt = f"""
    You are an expert ATS Resume Parser. Your job is to extract sections of the provided resume into a strict JSON format.
    
    STRICT EXTRACTION RULES:
    1. Extract ONLY information explicitly written. Never infer. Never guess. Never hallucinate.
    2. Never create fake skills, projects, internships, or education.
    3. If a section doesn't exist, return an empty array [].
    
    SECTION FILTERS:
    - SKILLS: Return ONLY explicitly mentioned skills. Never infer C, C++, Java, Python unless actually written.
    - EDUCATION: Extract Degree, College, University, Start Year, End Year. Use 'Present' or 'Expected Graduation' if applicable. Do NOT use the current year unless explicitly written.
    - EXPERIENCE: "Internship", "Internships", "Industrial Training", "Training", "Experience", "Work Experience", "Professional Experience", "Project Internship", "Software Developer Intern", "Python Intern", "Backend Intern", "Trainee" MUST all be detected as experience. Be case-insensitive and support different layouts and headings. Never return [] if any internship, training, or work experience exists.
    - PROJECTS: Ignore headers, footers, page numbers, contact details, email, phone, GitHub, LinkedIn. Projects must come ONLY from sections titled "Projects", "Personal Projects", "Academic Projects", "Professional Projects", "Relevant Projects", or "Capstone Project".
    
    EXPECTED FORMAT:
    Return ONLY valid JSON matching this exact schema:
    {{
      "education": [
        {{
          "degree": "",
          "college": "",
          "start_year": "",
          "end_year": ""
        }}
      ],
      "experience": [
        {{
          "type": "",
          "role": "",
          "company": "",
          "start_date": "",
          "end_date": "",
          "duration": ""
        }}
      ],
      "projects": [
        {{
          "title": "",
          "technologies": [],
          "description": ""
        }}
      ],
      "skills": []
    }}
    
    RESUME TEXT:
    {raw_text}
    """
    
    logger.info(f"Prompt length: {len(prompt)} characters.")
    
    retries = 3
    delays = [2, 5, 10]
    
    for attempt in range(retries + 1):
        try:
            logger.info(f"Model Used: {GROQ_MODEL} (Attempt {attempt+1})")
            start_time = time.time()
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=GROQ_MODEL,
                temperature=0.1
                # response_format removed as per requirements
            )
            
            response_time = time.time() - start_time
            logger.info(f"AI response time: {response_time:.2f} seconds.")
            
            text_response = chat_completion.choices[0].message.content.strip()
            
            data = extract_json_from_text(text_response)
            normalized_data = normalize_ai_response(data)
            
            # Logging Extracted Counts
            logger.info("Parsing success: True")
            logger.info(f"Final extracted counts -> Skills: {len(normalized_data['skills'])}, Experience: {len(normalized_data['experience'])}, Projects: {len(normalized_data['projects'])}, Education: {len(normalized_data['education'])}")
            logger.info("Fallback used: False")
            
            return normalized_data
            
        except Exception as e:
            if attempt < retries:
                logger.warning(f"Groq Retry {attempt+1} due to error: {e}. Waiting {delays[attempt]}s...")
                time.sleep(delays[attempt])
            else:
                logger.error(f"Groq Failed after {retries} retries: {e}")
                # Fallback to secondary model on final try
                if GROQ_FALLBACK_MODEL:
                     logger.warning(f"Attempting fallback model: {GROQ_FALLBACK_MODEL}")
                     try:
                         start_time = time.time()
                         chat_completion = client.chat.completions.create(
                             messages=[{"role": "user", "content": prompt}],
                             model=GROQ_FALLBACK_MODEL,
                             temperature=0.1
                         )
                         response_time = time.time() - start_time
                         logger.info(f"Fallback Model response time: {response_time:.2f} seconds.")
                         
                         data = extract_json_from_text(chat_completion.choices[0].message.content.strip())
                         normalized_data = normalize_ai_response(data)
                         
                         logger.info("Parsing success: True")
                         logger.info(f"Final extracted counts -> Skills: {len(normalized_data['skills'])}, Experience: {len(normalized_data['experience'])}, Projects: {len(normalized_data['projects'])}, Education: {len(normalized_data['education'])}")
                         logger.info("Fallback used: True (Fallback Model)")
                         return normalized_data
                     except Exception as e2:
                         logger.error(f"Groq fallback model also failed: {e2}")
                         raise Exception(f"Groq AI Extraction Failed: {e2}")
                else:
                    raise Exception(f"Groq AI Extraction Failed: {e}")


def generate_smart_suggestions(structured_data: dict, ats_score: int) -> list:
    """Generates intelligent suggestions strictly based on the structured JSON to avoid redundancy."""
    
    # Base rule-based suggestions to ensure coverage even if Groq fails or is slow
    suggestions = []
    
    skills = structured_data.get("skills", [])
    experience = structured_data.get("experience", [])
    education = structured_data.get("education", [])
    projects = structured_data.get("projects", [])
    
    # Pre-calculated strict rules to enforce constraints
    has_internship = False
    has_work = False
    if isinstance(experience, list):
        has_internship = any(job.get("type", "").lower() == "internship" for job in experience if isinstance(job, dict))
        has_work = any(job.get("type", "").lower() in ["full time", "part time"] for job in experience if isinstance(job, dict))
        
    has_projects = len(projects) > 0
    has_education = isinstance(education, list) and len(education) > 0
    
    needs_internship = not has_work and not has_internship
    needs_projects = not has_projects
    needs_education = not has_education
    needs_skills = len(skills) < 5
    
    if needs_skills:
        suggestions.append("Consider adding more relevant technical and soft skills to pass ATS keyword filters.")
    if needs_education:
        suggestions.append("Education details seem missing. Ensure you clearly mention your highest degree, university, and graduation year.")
    if needs_internship:
        suggestions.append("Consider adding an Internship or Industrial Training section to demonstrate practical industry experience.")
    if needs_projects:
        suggestions.append("Your resume lacks a Projects section. Adding 2-3 technical projects with measurable outcomes will greatly improve your chances.")
    if ats_score < 60:
        suggestions.append("Your ATS score is low. Try incorporating more action verbs, metrics, and keywords directly from target job descriptions.")
        
    if not GROQ_API_KEY:
        if not suggestions:
            suggestions.append("Excellent Resume. All critical sections are present. Focus on tailoring it to specific job descriptions.")
        return suggestions

    client = Groq(api_key=GROQ_API_KEY)
    
    context = {
        "ats_score": ats_score,
        "skills_detected": skills,
        "has_internship": has_internship,
        "has_projects": has_projects,
        "has_education": has_education,
        "total_experience_entries": len(experience)
    }
    
    prompt = f"""
    You are an expert ATS Resume Reviewer. 
    Analyze the following structured resume data and provide 3 concise, actionable, and highly contextual suggestions for improvement.
    
    STRICT RULES:
    1. NEVER hallucinate missing components. ALWAYS check the provided RESUME DATA first.
    2. If 'has_internship' is true, DO NOT recommend adding an internship.
    3. If 'has_projects' is true, DO NOT recommend adding projects.
    4. If 'has_education' is true, DO NOT recommend adding education.
    5. Review the 'skills_detected' list carefully. DO NOT recommend learning a skill that the candidate already has (e.g. if they have Django, do not suggest learning Django).
    6. Never repeat the same sentence. Use highly professional and ATS-friendly language.
    7. Return ONLY a valid JSON object with a single key 'suggestions' mapped to a list of strings.
    Example: {{"suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]}}
    
    RESUME DATA:
    {json.dumps(context, indent=2)}
    """
    
    retries = 1
    for attempt in range(retries + 1):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=GROQ_MODEL,
                temperature=0.1
            )
            
            text_response = chat_completion.choices[0].message.content.strip()
            ai_data = extract_json_from_text(text_response)
            ai_suggestions = ai_data.get("suggestions", [])
            
            if isinstance(ai_suggestions, list):
                for ai_sug in ai_suggestions:
                    if ai_sug not in suggestions:
                        suggestions.append(ai_sug)
            break
            
        except Exception as e:
            if attempt == retries:
                logger.error(f"Groq API Error generating suggestions: {e}")
            time.sleep(2)
            
    if not suggestions:
        suggestions.append("Excellent Resume. All critical sections are present. Focus on tailoring it to specific job descriptions.")
        
    return suggestions


def analyze_job_match(resume_text: str, job_description: str) -> dict:
    """Compares a resume to a job description using Groq."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Cannot perform AI extraction.")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    You are an expert AI Job Match Analyzer and ATS system.
    Your task is to analyze the provided resume against the provided job description and return a detailed JSON report.
    
    STRICT RULES:
    1. NEVER hallucinate skills, experiences, or projects.
    2. Only compare what is explicitly in the resume against what is explicitly in the job description.
    3. The suggestions MUST explain WHY and HOW to improve based specifically on the job description.
    4. Return ONLY a valid JSON object matching this exact schema:
    
    {{
      "match_score": 0, // Integer between 0 and 100
      "skills_match": ["Skill1", "Skill2"], // Skills present in BOTH
      "missing_skills": ["Skill3"], // Skills in JD but missing in Resume
      "matching_keywords": ["Keyword1"], // Important keywords (non-skills) in BOTH
      "missing_keywords": ["Keyword2"], // Important keywords in JD missing in Resume
      "experience_analysis": {{
        "status": "Good", // Good, Needs Improvement, or Matched
        "details": "Explanation here."
      }},
      "education_analysis": {{
        "status": "Matched", // Good, Needs Improvement, or Matched
        "details": "Explanation here."
      }},
      "project_analysis": {{
        "status": "Needs Improvement", // Good, Needs Improvement, or Matched
        "details": "Explanation here."
      }},
      "strengths": ["Strength 1"],
      "weaknesses": ["Weakness 1"],
      "resume_improvements": ["Suggestion 1 explaining WHY and HOW"]
    }}
    
    RESUME TEXT:
    {resume_text[:8000]}
    
    JOB DESCRIPTION:
    {job_description[:8000]}
    """
    
    retries = 3
    delays = [2, 5, 10]
    
    for attempt in range(retries + 1):
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=GROQ_MODEL,
                temperature=0.1
            )
            text_response = chat_completion.choices[0].message.content.strip()
            data = extract_json_from_text(text_response)
            
            # Basic validation
            if "match_score" not in data:
                data["match_score"] = 0
                
            return data
            
        except Exception as e:
            if attempt < retries:
                logger.warning(f"Groq Match Retry {attempt+1} due to error: {e}")
                time.sleep(delays[attempt])
            else:
                if GROQ_FALLBACK_MODEL:
                     try:
                         chat_completion = client.chat.completions.create(
                             messages=[{"role": "user", "content": prompt}],
                             model=GROQ_FALLBACK_MODEL,
                             temperature=0.1
                         )
                         data = extract_json_from_text(chat_completion.choices[0].message.content.strip())
                         if "match_score" not in data:
                             data["match_score"] = 0
                         return data
                     except Exception as e2:
                         raise Exception(f"Groq Match Fallback Failed: {e2}")
                raise Exception(f"Groq Match Failed: {e}")

def build_resume_structured(user_data: dict) -> dict:
    """Builds a structured JSON resume based strictly on user inputs using Groq."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Cannot perform AI generation.")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    You are an expert ATS Resume Writer. Your task is to generate a professional, highly polished resume in structured JSON format based on the user's inputs.

    STRICT ANTI-HALLUCINATION & FORMATTING RULES:
    1. NEVER invent or fabricate missing information, skills, companies, jobs, projects, or education.
    2. If the user provided 1 project, return EXACTLY 1 project.
    3. If the user provided no certifications, return an empty array for certifications.
    4. Improve grammar, professional tone, action verbs, and formatting, but NEVER repeat the same sentence across descriptions.
    5. Ensure the Professional Summary and Career Objective are highly customized, ATS-friendly, and distinct from generic filler.
    6. For Experience and Projects descriptions, generate detailed, professional bullet points highlighting impact and skills (e.g., "Engineered X using Y"). Do not hallucinate metrics, but improve the wording significantly.

    EXPECTED JSON FORMAT:
    {{
      "personalDetails": {{
        "name": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "portfolio": ""
      }},
      "summary": "Professionally written summary...",
      "objective": "Professionally written career objective...",
      "skills": {{
        "Programming Languages": [],
        "Frameworks": [],
        "Databases": [],
        "Cloud": [],
        "Tools": [],
        "Soft Skills": []
      }},
      "experience": [
        {{
          "title": "",
          "company": "",
          "date": "",
          "description": [
            "Improved bullet point 1",
            "Improved bullet point 2"
          ]
        }}
      ],
      "projects": [
        {{
          "title": "",
          "technologies": "",
          "date": "",
          "description": [
            "Improved bullet point 1"
          ]
        }}
      ],
      "education": [
        {{
          "degree": "",
          "institution": "",
          "date": ""
        }}
      ],
      "certifications": [
        {{
          "name": "",
          "issuer": "",
          "date": ""
        }}
      ],
      "achievements": [
        "Achievement 1"
      ],
      "languages": [
        "Language 1"
      ],
      "extraActivities": [
        "Activity 1"
      ]
    }}

    USER INPUTS:
    {json.dumps(user_data, indent=2)}
    """
    
    retries = 2
    for attempt in range(retries + 1):
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=GROQ_MODEL,
                temperature=0.3
            )
            text_response = chat_completion.choices[0].message.content.strip()
            data = extract_json_from_text(text_response)
            return data
        except Exception as e:
            if attempt < retries:
                time.sleep(3)
            else:
                if GROQ_FALLBACK_MODEL:
                    try:
                        chat_completion = client.chat.completions.create(
                            messages=[{"role": "user", "content": prompt}],
                            model=GROQ_FALLBACK_MODEL,
                            temperature=0.3
                        )
                        return extract_json_from_text(chat_completion.choices[0].message.content.strip())
                    except Exception as e2:
                        raise Exception(f"Groq Builder Fallback Failed: {e2}")
                raise Exception(f"Groq Builder Failed: {e}")

def edit_resume_structured(resume_json: dict, section: str, instruction: str) -> dict:
    """Edits ONLY the specified section of a structured JSON resume based on instructions."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY is missing. Cannot perform AI generation.")
        
    client = Groq(api_key=GROQ_API_KEY)
    
    # We will pass the full JSON as context, but ask it to return ONLY the modified keys.
    prompt = f"""
    You are an expert ATS Resume Editor. 
    You have been given a candidate's full resume in JSON format.
    
    YOUR TASK:
    Modify ONLY the specified section based on the user's custom instruction.
    
    STRICT RULES:
    1. NEVER hallucinate or invent companies, projects, skills, dates, or certifications.
    2. Do NOT modify any section other than the one specified.
    3. Output MUST be valid JSON containing ONLY the keys that were modified.
    4. If the section is "General", you may return the full modified JSON object, but still follow the anti-hallucination rules.
    5. Ensure ATS keywords and professional tone are improved based on the instruction.
    
    TARGET SECTION TO EDIT: "{section}"
    CUSTOM INSTRUCTION: "{instruction}"
    
    FULL RESUME JSON:
    {json.dumps(resume_json, indent=2)}
    
    OUTPUT FORMAT:
    Return ONLY a JSON object representing the modified portion.
    For example, if the section is "Experience", return:
    {{
      "experience": [ ... modified experience array ... ]
    }}
    If the section is "Skills", return:
    {{
      "skills": {{ ... modified skills object ... }}
    }}
    If the section is "General", return the entire modified resume JSON.
    DO NOT output any markdown blocks or explanations, just the JSON string.
    """
    
    retries = 2
    for attempt in range(retries + 1):
        try:
            chat_completion = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=GROQ_MODEL,
                temperature=0.3,
                response_format={"type": "json_object"}
            )
            text_response = chat_completion.choices[0].message.content.strip()
            data = extract_json_from_text(text_response)
            return data
        except Exception as e:
            if attempt < retries:
                time.sleep(3)
            else:
                if GROQ_FALLBACK_MODEL:
                    try:
                        chat_completion = client.chat.completions.create(
                            messages=[{"role": "user", "content": prompt}],
                            model=GROQ_FALLBACK_MODEL,
                            temperature=0.3,
                            response_format={"type": "json_object"}
                        )
                        return extract_json_from_text(chat_completion.choices[0].message.content.strip())
                    except Exception as e2:
                        raise Exception(f"Groq Editor Fallback Failed: {e2}")
                raise Exception(f"Groq Editor Failed: {e}")

def generate_interview_questions(resume_data: dict, job_description: str) -> list:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY missing.")
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    You are an expert Technical Recruiter. Based on the candidate's resume and the job description, generate 5-7 highly specific, challenging interview questions.
    Do NOT generate generic questions like "Tell me about yourself". Focus on their specific projects, skills, and the requirements of the job.
    
    Resume:
    {json.dumps(resume_data, indent=2)}
    
    Job Description:
    {job_description}
    
    OUTPUT FORMAT:
    Return ONLY a JSON array of strings, where each string is a question.
    Example: ["Question 1", "Question 2"]
    """
    
    try:
        res = client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model=GROQ_MODEL, temperature=0.3)
        data = extract_json_from_text(res.choices[0].message.content.strip())
        if isinstance(data, list): return data
        if isinstance(data, dict) and "questions" in data: return data["questions"]
        return []
    except Exception:
        return ["Could not generate interview questions at this time."]

def generate_candidate_insights(resume_data: dict, job_description: str = "") -> dict:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY missing.")
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    You are an expert HR Analyst. Analyze the candidate's resume (and job description if provided) to generate key insights.
    
    Resume:
    {json.dumps(resume_data, indent=2)}
    
    Job Description:
    {job_description}
    
    OUTPUT FORMAT:
    Return ONLY a JSON object exactly matching this schema:
    {{
        "ai_summary": "A 2-3 sentence professional summary of the candidate's profile.",
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"],
        "risk_level": "Low" | "Medium" | "High"
    }}
    """
    try:
        res = client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model=GROQ_MODEL, temperature=0.3)
        return extract_json_from_text(res.choices[0].message.content.strip())
    except Exception:
        return {"ai_summary": "Failed to generate summary.", "strengths": [], "weaknesses": [], "risk_level": "Unknown"}

def generate_structured_jd(role: str, experience: str, skills: str, industry: str, job_type: str) -> dict:
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY missing.")
    client = Groq(api_key=GROQ_API_KEY)
    
    prompt = f"""
    You are an expert HR Manager and Technical Recruiter. Generate a professional, highly-compelling, and complete job description in structured JSON format.
    The output MUST read like a real, high-quality Job Description found on LinkedIn or Indeed.
    
    STRICT RULES:
    1. NEVER generate dummy text or lorem ipsum.
    2. NEVER repeat the same sentence or phrase.
    3. Ensure a highly professional, ATS-friendly tone.
    4. Provide specific and realistic requirements and responsibilities for the role.

    INPUTS:
    Role: {role}
    Industry: {industry}
    Experience Required: {experience}
    Key Skills: {skills}
    Employment Type: {job_type}
    
    OUTPUT FORMAT:
    Return ONLY a JSON object matching exactly this schema. Do not include markdown blocks or any other text outside the JSON:
    {{
        "summary": "3-5 sentences professional overview of the role and the company's mission.",
        "responsibilities": ["Specific Responsibility 1", "Specific Responsibility 2", "Specific Responsibility 3", "Specific Responsibility 4"],
        "requirements": ["Specific Requirement 1", "Specific Requirement 2", "Specific Requirement 3"],
        "preferred_skills": ["Skill 1", "Skill 2", "Skill 3"],
        "benefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
        "tech_stack": ["Tech 1", "Tech 2"]
    }}
    """
    try:
        res = client.chat.completions.create(messages=[{"role": "user", "content": prompt}], model=GROQ_MODEL, temperature=0.3)
        return extract_json_from_text(res.choices[0].message.content.strip())
    except Exception as e:
        raise Exception(f"Failed to generate structured JD: {e}")
