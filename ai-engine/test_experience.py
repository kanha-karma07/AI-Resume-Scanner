import json
from app.utils import extract_experience

resumes = [
    {
        "role": "Python Backend", 
        "text": "SUMMARY\nExperienced backend dev. \nWORK EXPERIENCE\nGoogle\nSoftware Engineer\nJan 2024 - Present\nDeveloped microservices.\nFacebook\nJunior Dev\n2022 - 2023\nCreated APIs.\nEDUCATION\nB.Tech"
    },
    {
        "role": "AI Intern", 
        "text": "EDUCATION\nB.Tech 2024\nEXPERIENCE\nTechCorp\nML Intern\n01/2023 - 05/2023\nDid internship.\nSKILLS\nPython"
    },
    {
        "role": "Fresher", 
        "text": "EDUCATION\nBCA 2025\nSKILLS\nPython, SQL"
    }
]

def run_tests():
    for r in resumes:
        print(f"\n--- Testing: {r['role']} ---")
        exp = extract_experience(r['text'])
        print(json.dumps(exp, indent=2))
        
if __name__ == "__main__":
    run_tests()
