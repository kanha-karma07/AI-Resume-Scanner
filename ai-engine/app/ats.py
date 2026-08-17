import re

def calculate_ats_score(structured_data: dict) -> int:
    score = 0
    breakdown = {}
    
    # 1. Skills (Max 30)
    skills = structured_data.get("skills", [])
    skill_count = len(skills)
    if skill_count >= 15:
        skill_score = 30
    elif skill_count >= 10:
        skill_score = 25
    elif skill_count >= 5:
        skill_score = 15
    elif skill_count > 0:
        skill_score = 5
    else:
        skill_score = 0
    score += skill_score
    breakdown["Skills"] = f"{skill_score}/30"
        
    # 2. Experience / Internship (Max 20)
    experience = structured_data.get("experience", [])
    exp_score = 0
    
    if isinstance(experience, list) and len(experience) > 0:
        has_work = False
        for job in experience:
            if isinstance(job, dict):
                job_type = job.get("type", "").lower()
                if job_type in ["full time", "part time", "work experience", "professional experience", "experience"]:
                    has_work = True
                    break
            
        if has_work:
            exp_score = 20
        else:
            # If there's experience but it's not explicitly full time, assume internship/training
            exp_score = 15
    score += exp_score
    breakdown["Experience"] = f"{exp_score}/20"
        
    # 3. Projects (Max 20)
    projects = structured_data.get("projects", [])
    proj_score = 0
    if len(projects) >= 2:
        proj_score = 20
    elif len(projects) == 1:
        proj_score = 15
    score += proj_score
    breakdown["Projects"] = f"{proj_score}/20"
        
    # 4. Education (Max 15)
    education = structured_data.get("education", [])
    edu_score = 0
    if isinstance(education, list) and len(education) > 0:
        edu_score = 15
    score += edu_score
    breakdown["Education"] = f"{edu_score}/15"
        
    # 5. Resume Structure (Max 10)
    # Check if multiple sections are present
    section_count = 0
    if skill_count > 0: section_count += 1
    if edu_score > 0: section_count += 1
    if exp_score > 0: section_count += 1
    if proj_score > 0: section_count += 1
    if len(structured_data.get("certifications", [])) > 0: section_count += 1
    if len(structured_data.get("languages", [])) > 0: section_count += 1

    struct_score = 0
    if section_count >= 5:
        struct_score = 10
    elif section_count >= 3:
        struct_score = 5
    score += struct_score
    breakdown["Structure"] = f"{struct_score}/10"
        
    # 6. Contact Details (Max 5)
    raw_text = structured_data.get("raw_text", "").lower()
    has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text))
    has_phone = bool(re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", raw_text))
    
    contact_score = 0
    if has_email and has_phone:
        contact_score = 5
    elif has_email or has_phone:
        contact_score = 3
    score += contact_score
    breakdown["Contact"] = f"{contact_score}/5"
    
    # Store breakdown temporarily in the dict so main.py can print it
    structured_data["_ats_breakdown"] = breakdown
        
    return min(score, 100)