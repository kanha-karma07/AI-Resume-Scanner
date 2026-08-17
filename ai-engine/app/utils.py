import re
import datetime
from dateutil import parser as date_parser

def clean_resume_text(text):

    text = re.sub(r"\n+", "\n", text)
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def extract_skills(text):

    skill_list = [
        "Python",
        "Java",
        "C",
        "C++",
        "Django",
        "FastAPI",
        "Flask",
        "REST API",
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "Git",
        "GitHub",
        "Docker",
        "AWS",
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Next.js",
        "Node.js",
        "NLP",
        "Machine Learning",
        "Deep Learning",
        "TensorFlow",
        "PyTorch",
        "Pandas",
        "NumPy"
    ]

    found_skills = []

    text = text.lower()

    for skill in skill_list:
        # Escape the skill name to safely use in regex
        # Use \b to ensure word boundaries (e.g. prevent "C" matching "React")
        # Special case for C++ / C# since + and # are non-word characters
        escaped_skill = re.escape(skill.lower())
        pattern = r"(?<!\w)" + escaped_skill + r"(?!\w)"
        
        if re.search(pattern, text):
            found_skills.append(skill)

    return found_skills


def extract_education(text):

    education = {
        "degree": None,
        "college": None,
        "start_year": None,
        "end_year": None
    }

    degree_list = [
        "Master of Computer Applications",
        "MCA",
        "Bachelor of Technology",
        "B.Tech",
        "Bachelor of Engineering",
        "B.E",
        "Bachelor of Computer Applications",
        "BCA",
        "Master of Technology",
        "M.Tech",
        "MBA",
        "B.Sc",
        "M.Sc",
        "Diploma"
    ]

    lines = text.split('\n')
    degree_line_idx = -1

    for i, line in enumerate(lines):
        for degree in degree_list:
            # Escaping the degree name to ensure exact matches with word boundaries is safer, but simpler string matching was used before.
            # Using simple word boundaries for degree to avoid partial matches
            escaped_degree = re.escape(degree.lower())
            if re.search(r"(?<!\w)" + escaped_degree + r"(?!\w)", line.lower()):
                education["degree"] = degree
                degree_line_idx = i
                break
        if education["degree"]:
            break

    if degree_line_idx != -1:
        # Check the degree line and the next two lines for graduation info
        search_text = " ".join(lines[degree_line_idx:degree_line_idx+3])
        
        range_match = re.search(r"(19\d{2}|20\d{2})\s*(?:-|–|to)\s*(19\d{2}|20\d{2}|present|current)", search_text, re.IGNORECASE)
        expected_match = re.search(r"(?:expected|graduation|class of)[^\d]*((?:19|20)\d{2})", search_text, re.IGNORECASE)
        
        if expected_match:
            education["end_year"] = expected_match.group(1)
        elif range_match:
            education["start_year"] = range_match.group(1)
            if range_match.group(2).lower() in ["present", "current"]:
                education["end_year"] = "Present"
            else:
                education["end_year"] = range_match.group(2)
        else:
            years = re.findall(r"\b(19\d{2}|20\d{2})\b", search_text)
            if years:
                # If there are multiple years, typically the larger or last one is the passing year
                education["end_year"] = max(years)

    return [education] if education["degree"] else []


def extract_experience(text):
    # Returning a list to match Groq schema
    
    # Define experience section headers
    headers = [
        "experience", "work experience", "professional experience",
        "employment", "employment history", "career history",
        "work history", "relevant experience", "industry experience",
        "internship", "industrial training", "summer internship"
    ]
    
    # Define stop headers (things that aren't experience)
    stop_headers = [
        "education", "academic", "projects", "skills", "certifications",
        "certificates", "languages", "achievements", "summary", "objective"
    ]
    
    # Find the experience block
    lines = text.split('\n')
    exp_lines = []
    in_exp_section = False
    
    for line in lines:
        cleaned_line = line.strip().lower()
        
        # Check if line is a header
        if len(cleaned_line) < 40 and cleaned_line:
            is_header = False
            for h in headers:
                if h == cleaned_line or h + ":" == cleaned_line:
                    in_exp_section = True
                    is_header = True
                    break
            
            if not is_header and in_exp_section:
                for sh in stop_headers:
                    if sh in cleaned_line or sh + ":" == cleaned_line:
                        in_exp_section = False
                        break
                        
        if in_exp_section:
            exp_lines.append(line.strip())
            
    if not exp_lines:
        # If no explicit header, we fallback to regex scanning but usually resumes have headers
        exp_lines = lines
        
    # Regex for date ranges: e.g. "Jan 2024 - Present", "2021 - 2023", "01/2023 - 05/2024"
    date_pattern = re.compile(
        r'((?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{4}|\d{1,2}/\d{4})'
        r'\s*(?:-|–|to)\s*'
        r'((?:(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+)?\d{4}|\d{1,2}/\d{4}|present|current|till date)',
        re.IGNORECASE
    )
    
    jobs = []
    current_job = {}
    current_text_block = []
    
    for i, line in enumerate(exp_lines):
        if not line.strip():
            continue
            
        match = date_pattern.search(line)
        if match:
            # We found a date range!
            start_str = match.group(1)
            end_str = match.group(2)
            
            if current_job:
                # Save previous job
                current_job['responsibilities'] = "\n".join(current_text_block).strip()
                jobs.append(current_job)
                current_text_block = []
                
            current_job = {
                "company": "",
                "role": "",
                "start_date": start_str,
                "end_date": end_str,
                "type": "Full-Time",
                "responsibilities": ""
            }
            
            # Look at previous 1-3 lines for company and title
            if len(current_text_block) > 0:
                current_job["company"] = current_text_block[-1]
                if len(current_text_block) > 1:
                    current_job["role"] = current_text_block[-2]
            
            current_text_block = [] # reset for responsibilities
            
            # Check employment type
            line_lower = line.lower()
            if "intern" in line_lower or "internship" in line_lower:
                current_job["type"] = "Internship"
            elif "freelance" in line_lower:
                current_job["type"] = "Freelance"
            elif "contract" in line_lower:
                current_job["type"] = "Contract"
            elif "part time" in line_lower or "part-time" in line_lower:
                current_job["type"] = "Part-Time"
                
        else:
            current_text_block.append(line)
            
    if current_job:
        current_job['responsibilities'] = "\n".join(current_text_block).strip()
        jobs.append(current_job)
        
    # Calculate duration
    total_months = 0
    valid_jobs = []
    today = datetime.datetime.now()
    
    for job in jobs:
        # Re-check employment type from title or company just in case
        title_company = (job["role"] + " " + job["company"]).lower()
        if "intern" in title_company or "internship" in title_company:
            job["type"] = "Internship"
        elif "freelance" in title_company:
            job["type"] = "Freelance"
        elif "contract" in title_company:
            job["type"] = "Contract"
        
        start_str = job["start_date"]
        end_str = job["end_date"]
        
        try:
            start_date = date_parser.parse(start_str, default=datetime.datetime(2000, 1, 1))
            
            if end_str.lower() in ["present", "current", "till date"]:
                end_date = today
                job["is_present"] = True
            else:
                end_date = date_parser.parse(end_str, default=datetime.datetime(2000, 1, 1))
                job["is_present"] = False
                
            duration_months = (end_date.year - start_date.year) * 12 + (end_date.month - start_date.month)
            if duration_months > 0:
                job["duration_months"] = duration_months
                total_months += duration_months
                valid_jobs.append(job)
        except Exception:
            # If parsing fails, just keep the job without duration
            valid_jobs.append(job)
            
    return valid_jobs

def extract_projects(text):
    projects = []
    headers = [
        "projects", "project experience", "academic projects", "personal projects", 
        "major project", "minor project", "portfolio", "capstone project", 
        "technical projects", "research project", "industrial project"
    ]
    stop_headers = [
        "experience", "work experience", "education", "skills", "certificates", 
        "certifications", "achievements", "languages", "interests", "summary", 
        "references", "contact"
    ]
    
    reject_patterns = [
        r"[\w\.-]+@[\w\.-]+\.\w+", # email
        r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", # phone
        r"linkedin\.com", r"github\.com", r"contact information",
        r"address", r"pin code"
    ]
    
    tech_keywords = [
        "python", "django", "fastapi", "react", "next.js", "node.js", "java", 
        "spring boot", "mysql", "mongodb", "postgresql", "tensorflow", "opencv", 
        "flutter", "docker", "aws", "git"
    ]
    action_words = [
        "developed", "built", "implemented", "designed", "created", 
        "engineered", "integrated", "optimized", "automated"
    ]
    
    lines = text.split('\n')
    in_section = False
    current_project_lines = []
    
    for line in lines:
        cleaned_line = line.strip().lower()
        if not cleaned_line:
            if in_section:
                current_project_lines.append("") # keep empty lines to split later
            continue
            
        if len(cleaned_line) < 40:
            is_header = False
            for h in headers:
                if h == cleaned_line or h + ":" == cleaned_line:
                    in_section = True
                    is_header = True
                    break
            if not is_header and in_section:
                for sh in stop_headers:
                    if sh in cleaned_line or sh + ":" == cleaned_line:
                        in_section = False
                        break
                        
        if in_section and not is_header:
            current_project_lines.append(line.strip())
            
    if not current_project_lines:
        return projects
        
    project_text = "\n".join(current_project_lines).strip()
    import re
    raw_projects = re.split(r'\n\s*\n', project_text)
    
    for rp in raw_projects:
        rp_clean = rp.strip()
        if len(rp_clean) < 15:
            continue
            
        rp_lower = rp_clean.lower()
        
        # Validation 1: Reject if contains contact info
        is_rejected = False
        for pat in reject_patterns:
            if re.search(pat, rp_lower):
                is_rejected = True
                break
        if "city" in rp_lower or "candidate name" in rp_lower:
            is_rejected = True
            
        if is_rejected:
            continue
            
        # Validation 2: Must satisfy one rule
        has_tech = any(tech in rp_lower for tech in tech_keywords)
        has_action = any(act in rp_lower for act in action_words)
        has_duration = bool(re.search(r"\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\b", rp_lower)) or bool(re.search(r"\b\d{4}\s*-\s*\d{4}\b", rp_lower))
        
        if not (has_tech or has_action or has_duration):
            continue
            
        lines_p = rp_clean.split('\n')
        title = lines_p[0].strip() if lines_p else "Unknown Project"
        description = rp_clean
        
        found_techs = [tech for tech in tech_keywords if tech in rp_lower]
        techs_str = ", ".join(found_techs).title()
        
        duration = ""
        dur_match = re.search(r"\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}\s*(?:-|to)\s*(?:present|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{4}|\d{4}))\b", rp_lower)
        if dur_match:
            duration = dur_match.group(1).title()
            
        projects.append({
            "title": title,
            "description": description,
            "technologies": techs_str,
            "duration": duration
        })
                
    return projects

def extract_certifications(text):
    certifications = []
    headers = ["certifications", "certificates", "courses", "licenses"]
    stop_headers = ["experience", "work experience", "education", "skills", "projects", "languages", "achievements", "summary"]
    
    lines = text.split('\n')
    in_section = False
    
    for line in lines:
        cleaned_line = line.strip().lower()
        if not cleaned_line:
            continue
            
        if len(cleaned_line) < 40:
            is_header = False
            for h in headers:
                if h == cleaned_line or h + ":" == cleaned_line:
                    in_section = True
                    is_header = True
                    break
            if not is_header and in_section:
                for sh in stop_headers:
                    if sh in cleaned_line or sh + ":" == cleaned_line:
                        in_section = False
                        break
                        
        if in_section and not is_header:
            if len(line.strip()) > 5:
                certifications.append(line.strip().lstrip("-").strip())
                
    return certifications

def extract_languages(text):
    languages = []
    headers = ["languages", "language proficiency"]
    stop_headers = ["experience", "work experience", "education", "skills", "projects", "certifications", "achievements", "summary"]
    
    lines = text.split('\n')
    in_section = False
    
    for line in lines:
        cleaned_line = line.strip().lower()
        if not cleaned_line:
            continue
            
        if len(cleaned_line) < 40:
            is_header = False
            for h in headers:
                if h == cleaned_line or h + ":" == cleaned_line:
                    in_section = True
                    is_header = True
                    break
            if not is_header and in_section:
                for sh in stop_headers:
                    if sh in cleaned_line or sh + ":" == cleaned_line:
                        in_section = False
                        break
                        
        if in_section and not is_header:
            # simple comma split or bullet split
            cleaned_str = line.strip().lstrip("-").strip()
            parts = [p.strip() for p in cleaned_str.replace(";", ",").split(",") if p.strip()]
            languages.extend(parts)
                
    return languages