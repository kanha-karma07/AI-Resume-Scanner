import requests

url = "http://127.0.0.1:8000/api/admin/login/"
payload = {
    "email": "admin@resumescanner.com",
    "password": "AdminPassword123!"
}
try:
    response = requests.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
