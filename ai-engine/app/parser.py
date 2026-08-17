import fitz
import pdfplumber
import re
import logging

logger = logging.getLogger(__name__)

def clean_text(text: str) -> str:
    """Cleans extracted text by removing extra spaces, broken lines, etc."""
    # Replace multiple newlines with a single newline
    text = re.sub(r'\n+', '\n', text)
    # Replace multiple spaces with a single space
    text = re.sub(r' +', ' ', text)
    # Remove non-ascii characters that might cause issues, keeping basic punctuation
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)
    return text.strip()

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extracts text using PyMuPDF, with a fallback to pdfplumber."""
    text = ""
    try:
        # Try PyMuPDF first
        document = fitz.open(pdf_path)
        for page in document:
            # simple text extraction
            page_text = page.get_text()
            if page_text:
                text += page_text + "\n"
        document.close()
        
        # If extraction yielded very little text, it might be an image PDF or weird encoding
        # Fallback to pdfplumber if less than 50 chars
        if len(text.strip()) < 50:
            raise ValueError("Insufficient text extracted via PyMuPDF")
            
    except Exception as e:
        logger.warning(f"PyMuPDF failed or returned insufficient text: {e}. Falling back to pdfplumber.")
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e2:
            logger.error(f"Both PyMuPDF and pdfplumber failed: {e2}")
            return ""

    return clean_text(text)


def local_extract_structured_resume_data(raw_text: str) -> dict:
    """Fallback local parser using Regex and keywords."""
    structured_data = {
        "education": [],
        "experience": [],
        "projects": [],
        "skills": [],
        "certifications": [],
        "languages": []
    }
    
    if not raw_text:
        return structured_data
        
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
    
    current_section = None
    
    sections = {
        "education": ["education", "academic background", "academics"],
        "experience": ["experience", "employment", "work history", "internship", "career"],
        "projects": ["projects", "personal projects", "academic projects"],
        "skills": ["skills", "technologies", "core competencies", "technical skills"],
        "certifications": ["certifications", "certificates"],
        "languages": ["languages"]
    }
    
    # Simple predefined list of common skills for regex match fallback
    common_skills = [
        "python", "java", "c++", "javascript", "react", "node.js", "sql", "aws", "docker", 
        "kubernetes", "machine learning", "data science", "html", "css", "django", "flask", 
        "fastapi", "git", "linux", "agile", "scrum", "communication", "leadership", 
        "problem solving", "typescript", "angular", "vue"
    ]
    
    text_lower = raw_text.lower()
    for skill in common_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            structured_data["skills"].append(skill.title())
    
    for line in lines:
        lower_line = line.lower()
        
        # Determine section
        found_section = False
        for sec, keywords in sections.items():
            if lower_line in keywords or any(lower_line.startswith(kw) for kw in keywords):
                current_section = sec
                found_section = True
                break
                
        if found_section:
            continue
            
        if current_section == "education":
            if "university" in lower_line or "college" in lower_line or "institute" in lower_line or "school" in lower_line or "degree" in lower_line or "btech" in lower_line or "bsc" in lower_line or "msc" in lower_line:
                if len(structured_data["education"]) == 0 or structured_data["education"][-1].get("college"):
                    structured_data["education"].append({"degree": line, "college": line, "start_year": "", "end_year": ""})
                else:
                    structured_data["education"][-1]["college"] = line
        
        elif current_section == "experience":
            if len(structured_data["experience"]) < 5 and len(line) > 10:
                is_intern = "intern" in lower_line or "internship" in lower_line
                emp_type = "Internship" if is_intern else "Full Time"
                
                # Check for dates
                has_date = bool(re.search(r'\b(19|20)\d{2}\b', line)) or bool(re.search(r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b', line, re.IGNORECASE))
                if has_date or "software" in lower_line or "engineer" in lower_line or "developer" in lower_line or "manager" in lower_line:
                    structured_data["experience"].append({
                        "type": emp_type,
                        "role": line[:50],
                        "company": line[:50],
                        "start_date": "",
                        "end_date": "",
                        "duration": ""
                    })

        elif current_section == "projects":
            if len(line) > 10 and not line.startswith("•") and not line.startswith("-"):
                structured_data["projects"].append({
                    "title": line[:50],
                    "technologies": [],
                    "description": line
                })
                
        elif current_section == "certifications":
            if len(line) > 5 and len(structured_data["certifications"]) < 10:
                structured_data["certifications"].append(line)
                
        elif current_section == "languages":
            lang_match = re.findall(r'\b[A-Z][a-z]+\b', line)
            for l in lang_match:
                if l not in structured_data["languages"] and len(l) > 3 and len(structured_data["languages"]) < 10:
                    structured_data["languages"].append(l)

    # Deduplicate skills
    structured_data["skills"] = list(set(structured_data["skills"]))
    
    return structured_data