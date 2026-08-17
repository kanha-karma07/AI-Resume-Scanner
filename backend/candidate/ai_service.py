import os
from django.conf import settings
import json
import random

class AIService:
    def __init__(self):
        self.api_key = getattr(settings, 'AI_API_KEY', None)
        self.is_configured = bool(self.api_key)

    def build_resume(self, user_data):
        import requests
        FASTAPI_URL = "http://127.0.0.1:8001/build-resume"
        try:
            response = requests.post(FASTAPI_URL, json={"user_data": user_data})
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"AI Engine returned {response.status_code}: {response.text}")
        except Exception as e:
            raise Exception(f"AI Resume Builder Failed: {str(e)}")

    def generate_section(self, section, prompt):
        """Generates content for a specific resume section."""
        prompt_lower = prompt.lower()
        if section == "summary":
            return f"Results-driven professional with expertise in {prompt}. Proven ability to lead cross-functional teams, deliver impactful solutions, and drive continuous improvement. Strong analytical and communication skills, dedicated to achieving organizational goals and exceeding expectations."
        elif section == "experience":
            return f"- Spearheaded {prompt} initiatives, improving overall efficiency by 25%.\n- Collaborated with key stakeholders to define project requirements and deliver on-time results.\n- Mentored junior team members and fostered a culture of continuous learning.\n- Developed and implemented best practices that reduced errors by 15%."
        elif section == "skills":
            base_skills = ["Communication", "Problem Solving", "Leadership", "Agile Methodology", "Project Management"]
            if "python" in prompt_lower or "developer" in prompt_lower:
                base_skills.extend(["Python", "Django", "REST APIs", "SQL", "Git", "Docker"])
            elif "design" in prompt_lower:
                base_skills.extend(["UI/UX", "Figma", "Wireframing", "Adobe Creative Suite"])
            return ", ".join(base_skills)
        elif section == "projects":
            return f"**{prompt.title()} Project**\n- Designed and developed the core architecture for the {prompt} system.\n- Utilized modern frameworks to ensure scalable and responsive design.\n- Successfully launched to 10k+ users, resulting in positive feedback and increased engagement."
        else:
            return f"AI Generated Content for {section} based on: '{prompt}'."

    def edit_resume(self, original_text, section, instruction):
        """Improves specific resume section based on instructions using FastAPI Engine."""
        import requests
        FASTAPI_URL = "http://127.0.0.1:8001/edit-resume"
        try:
            # Check if original_text is a string, and if so parse it to a dictionary
            import json
            resume_json = original_text
            if isinstance(original_text, str):
                try:
                    resume_json = json.loads(original_text)
                except Exception:
                    pass
            
            payload = {
                "resume_json": resume_json,
                "section": section,
                "instruction": instruction
            }
            response = requests.post(FASTAPI_URL, json=payload)
            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"AI Engine returned {response.status_code}: {response.text}")
        except Exception as e:
            raise Exception(f"AI Resume Editor Failed: {str(e)}")



    def generate_insights(self, resume_data):
        """Generates career insights based on resume."""
        text = str(resume_data).lower()
        
        skills = ["Python", "React", "AWS", "SQL"]
        if "design" in text:
            skills = ["Figma", "UI/UX", "Wireframing", "Prototyping"]
        elif "data" in text:
            skills = ["Python", "Machine Learning", "Pandas", "SQL"]

        return {
            "top_skills": skills[:2],
            "missing_skills": ["Docker", "Kubernetes", "GraphQL"] if "python" in text else ["Data Analysis", "Agile", "SEO"],
            "learning_roadmap": [
                "1. Master Advanced System Design (Month 1-2)",
                "2. Obtain Cloud Certification (AWS/Azure) (Month 3)",
                "3. Build 2 End-to-End Portfolio Projects (Month 4-5)",
                "4. Contribute to Open Source (Month 6)"
            ],
            "certifications": ["AWS Certified Solutions Architect", "Google Professional Cloud Architect"],
            "career_level": "Mid-Senior Level",
            "industry_readiness": "85% Ready"
        }

    def generate_cover_letter(self, resume_text, company_name, role, job_desc):
        """Generates a tailored cover letter."""
        return f"""Dear Hiring Manager at {company_name},

I am writing to express my strong interest in the {role} position. With a solid background in delivering high-quality results and a deep passion for innovation, I am confident that my skills align perfectly with your team's needs.

In reviewing the job description for the {role}, I was particularly drawn to your focus on {job_desc[:50]}... My previous experience has equipped me with the exact technical and soft skills required to thrive in this environment. I have consistently demonstrated the ability to tackle complex challenges, collaborate effectively across departments, and drive projects to successful completion.

I am particularly impressed by {company_name}'s commitment to excellence and would be thrilled to bring my expertise to your organization. I am eager to contribute to your ongoing success and help the team achieve its ambitious goals.

Thank you for considering my application. I look forward to the opportunity to discuss how my background, skills, and enthusiasm make me a perfect fit for the {role} role.

Sincerely,
[Your Name]
"""

    def generate_interview_questions(self, resume_text):
        """Generates interview prep questions."""
        is_tech = "developer" in str(resume_text).lower() or "engineer" in str(resume_text).lower()
        
        tech_questions = [
            "Can you explain the architecture of the most complex system you've built?",
            "How do you handle performance bottlenecks in your applications?",
            "Describe your experience with CI/CD pipelines and deployment strategies.",
            "How do you ensure your code is secure and scalable?",
            "What is your approach to testing and test-driven development?"
        ] if is_tech else [
            "Walk me through your process for managing complex projects.",
            "How do you prioritize tasks when faced with tight deadlines?",
            "Can you provide an example of a time you improved a business process?",
            "How do you measure the success of your initiatives?",
            "Describe a challenging stakeholder management situation and how you resolved it."
        ]

        return {
            "technical": tech_questions,
            "behavioral": [
                "Tell me about a time you failed and what you learned from it.",
                "Describe a situation where you had to work with a difficult team member.",
                "Give an example of a time you showed initiative at work.",
                "How do you handle constructive criticism?",
                "Tell me about a time you had to learn a new skill quickly."
            ],
            "hr": [
                "Why do you want to work for our company?",
                "Where do you see yourself in 5 years?",
                "What are your salary expectations?",
                "Why are you leaving your current role?",
                "What is your greatest professional achievement?"
            ]
        }



    def compare_resumes(self, resume1_text, resume2_text):
        """Compares two resumes."""
        score1 = random.randint(70, 95)
        score2 = random.randint(60, 85)
        
        winner = "Resume A" if score1 >= score2 else "Resume B"
        
        return {
            "resume_a": {
                "ats_score": score1,
                "strengths": ["Clear formatting", "Strong action verbs", "Good keyword density"],
                "weaknesses": ["Lacks measurable results", "Summary is too generic"]
            },
            "resume_b": {
                "ats_score": score2,
                "strengths": ["Excellent education section", "Good technical skills listed"],
                "weaknesses": ["Formatting is inconsistent", "Missing core soft skills"]
            },
            "winner": winner,
            "overall_suggestion": f"{winner} is stronger for ATS parsing, but could still benefit from more quantifiable achievements."
        }
