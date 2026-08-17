import os
from google import genai
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "../backend/.env"))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

models_to_test = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"]
for m in models_to_test:
    try:
        response = client.models.generate_content(
            model=m,
            contents="Say hi"
        )
        print(f"{m} worked!")
    except Exception as e:
        print(f"{m} failed: {e}")
