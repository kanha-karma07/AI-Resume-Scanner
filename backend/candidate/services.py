import requests
import logging

logger = logging.getLogger(__name__)

FASTAPI_URL = "http://127.0.0.1:8001/parse-resume"

def analyze_resume(file_path):
    logger.info(f"Preparing to send {file_path} to AI Engine.")
    try:
        with open(file_path, "rb") as file:
            files = {
                "file": file
            }
            logger.info("Sending request to FastAPI...")
            response = requests.post(
                FASTAPI_URL,
                files=files
            )
            
        if response.status_code == 200:
            logger.info("AI Engine returned 200 OK.")
            return response.json()
        
        logger.error(f"AI Engine failed with status {response.status_code}. Response: {response.text}")
        raise Exception(f"AI Engine Error (Status {response.status_code}): {response.text}")
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to connect to AI Engine: {str(e)}")
        raise Exception("AI Engine is not responding. Please ensure the microservice is running.")
