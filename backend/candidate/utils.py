import fitz
import re

def extract_text_from_pdf(pdf_path):
    document = fitz.open(pdf_path)
    text = ""
    for page in document:
        text += page.get_text()
    document.close()
    return text

def clean_resume_text(text):
    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r"\s+", " ", text)
    text = text.strip()
    return text

def extract_skills(text):
    skill_list = [
        "Python", "Java", "C", "C++", "C#", "Ruby", "PHP", "Go", "Swift", "Kotlin", "Rust", "TypeScript",
        "Django", "FastAPI", "Flask", "Spring Boot", "Express.js", "Laravel", "Ruby on Rails",
        "React", "Next.js", "Vue.js", "Angular", "Svelte", "HTML", "CSS", "Tailwind CSS", "Bootstrap",
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "Cassandra", "DynamoDB", "SQLite",
        "Git", "GitHub", "GitLab", "Bitbucket", "Docker", "Kubernetes", "Jenkins", "Travis CI", "CircleCI",
        "AWS", "Google Cloud Platform", "Azure", "Heroku", "Vercel", "Netlify",
        "NLP", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Scikit-Learn", "Pandas", "NumPy", "Keras", "OpenCV",
        "Linux", "Bash", "REST API", "GraphQL", "gRPC", "WebSockets", "Microservices",
        "Communication", "Leadership", "Problem Solving", "Teamwork", "Agile", "Scrum", "Project Management"
    ]
    
    found_skills = set()
    text_lower = text.lower()
    
    for skill in skill_list:
        # Use regex with word boundaries to avoid partial matches like "c" in "machine"
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        # For C++, escape might handle ++ but word boundary might fail on special chars, so handle exceptions
        if skill == "C++":
            pattern = r'\bc\+\+'
        elif skill == "C#":
            pattern = r'\bc#'
        elif skill == "C":
            pattern = r'\bc\b'
        elif skill == ".NET":
            pattern = r'\.net\b'
            
        if re.search(pattern, text_lower):
            found_skills.add(skill)
            
    return list(found_skills)

def extract_education(text):
    education = {
        "degree": None,
        "college": None,
        "university": None,
        "passing_year": None,
        "has_education": False
    }

    degree_list = [
        "Master of Computer Applications", "MCA", "Bachelor of Technology", "B.Tech", 
        "Bachelor of Engineering", "B.E", "Bachelor of Computer Applications", "BCA", 
        "Master of Technology", "M.Tech", "MBA", "B.Sc", "M.Sc", "Diploma", "B.A", "M.A", "Ph.D", "BBA"
    ]

    text_lower = text.lower()

    for degree in degree_list:
        pattern = r'\b' + re.escape(degree.lower()) + r'\b'
        if re.search(pattern, text_lower):
            education["degree"] = degree
            education["has_education"] = True
            break
            
    # Passing Year
    years = re.findall(r"\b(19\d{2}|20\d{2})\b", text)
    if years:
        education["passing_year"] = years[-1]
        
    if "university" in text_lower or "college" in text_lower or "institute" in text_lower:
        education["has_education"] = True

    return education

def extract_experience(text):
    experience = {
        "is_fresher": True,
        "total_experience": "0 Years",
        "has_internship": False,
        "has_projects": False,
        "has_freelance": False
    }
    
    text_lower = text.lower()

    # Experience duration detection
    pattern = r'(\d+)\+?\s*(year|years|yr|yrs|month|months)'
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    total_months = 0
    if matches:
        for match in matches:
            val = int(match[0])
            unit = match[1].lower()
            if val < 30: # sanity check
                if unit.startswith('year') or unit.startswith('yr'):
                    total_months += val * 12
                else:
                    total_months += val
                    
    if total_months > 0:
        experience["is_fresher"] = False
        years = total_months // 12
        months = total_months % 12
        if years > 0:
            experience["total_experience"] = f"{years} Years" + (f" {months} Months" if months > 0 else "")
        else:
            experience["total_experience"] = f"{months} Months"
            
    # Internship detection
    internship_keywords = [r"\bintern\b", r"\binternship\b", r"\bsummer internship\b", r"\bindustrial training\b", r"\btrainee\b", r"\bapprenticeship\b"]
    for keyword in internship_keywords:
        if re.search(keyword, text_lower):
            experience["has_internship"] = True
            break
            
    # Project detection
    project_keywords = [r"\bprojects?\b", r"\bpersonal project\b", r"\bacademic project\b"]
    for keyword in project_keywords:
        if re.search(keyword, text_lower):
            experience["has_projects"] = True
            break
            
    # Freelance / Contract detection
    freelance_keywords = [r"\bfreelance\b", r"\bcontract\b", r"\bvolunteer\b"]
    for keyword in freelance_keywords:
        if re.search(keyword, text_lower):
            experience["has_freelance"] = True
            break

    return experience

def calculate_ats_score(resume):
    score = 0

    # ---------- Skills (Max 30) ----------
    skill_count = len(resume.skills)
    if skill_count >= 15:
        score += 30
    elif skill_count >= 10:
        score += 25
    elif skill_count >= 5:
        score += 15
    elif skill_count > 0:
        score += 5

    # ---------- Education (Max 20) ----------
    if resume.education_data.get("has_education") or resume.education_data.get("degree"):
        score += 20

    # ---------- Experience/Projects (Max 30) ----------
    experience = resume.experience_data
    exp_points = 0
    if experience.get("is_fresher") is False:
        exp_points += 20
    if experience.get("has_internship"):
        exp_points += 15
    if experience.get("has_projects"):
        exp_points += 15
    
    score += min(exp_points, 30)

    # ---------- Resume Content Length & Formatting (Max 20) ----------
    text_len = len(resume.parsed_text)
    if text_len > 1500:
        score += 20
    elif text_len > 800:
        score += 15
    elif text_len > 500:
        score += 10

    return min(score, 100)

def generate_resume_suggestions(resume):
    suggestions = []
    
    exp_data = resume.experience_data
    edu_data = resume.education_data

    # Skills
    if len(resume.skills) < 5:
        suggestions.append("Consider adding more relevant technical and soft skills to pass ATS keyword filters.")
    elif len(resume.skills) < 10:
        suggestions.append("Your skills section is good, but adding more specialized tools (e.g. Cloud, Docker, CI/CD) could strengthen your profile.")

    # Education
    if not edu_data.get("has_education"):
        suggestions.append("Education details seem missing. Ensure you clearly mention your highest degree, university, and graduation year.")

    # Experience / Projects
    if exp_data.get("is_fresher"):
        if not exp_data.get("has_internship"):
            suggestions.append("Consider adding an Internship or Industrial Training section to demonstrate practical industry experience.")
        if not exp_data.get("has_projects"):
            suggestions.append("Your resume lacks a Projects section. Adding 2-3 technical projects with measurable outcomes will greatly improve your chances.")
    
    # Resume Length
    if len(resume.parsed_text) < 700:
        suggestions.append("Your resume content is quite short. Expand on your responsibilities using action verbs and quantifiable metrics.")

    # ATS Score
    if resume.ats_score < 60:
        suggestions.append("Your ATS score is low. Try incorporating more keywords directly from the target job descriptions.")

    if len(suggestions) == 0:
        suggestions.append("Excellent Resume. All critical sections are present. Focus on tailoring it to specific job descriptions.")

    return suggestions

def extract_jd_skills(jd_text):
    return extract_skills(jd_text)

def get_matching_skills(resume_skills, jd_skills):
    return [skill for skill in resume_skills if skill in jd_skills]

def get_missing_skills(resume_skills, jd_skills):
    return [skill for skill in jd_skills if skill not in resume_skills]

def calculate_match_percentage(resume_skills, jd_skills):
    if not jd_skills:
        return 0
    matched = get_matching_skills(resume_skills, jd_skills)
    return int((len(matched) / len(jd_skills)) * 100)

def match_resume_with_jd(resume, job):
    matched_skills = get_matching_skills(resume.skills, job.skills)
    missing_skills = get_missing_skills(resume.skills, job.skills)
    match_percentage = calculate_match_percentage(resume.skills, job.skills)

    return {
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "match_percentage": match_percentage,
    }