import requests
import json

url = "http://127.0.0.1:8080/analyze"
data = {"text": "I am so happy that everything is working!"}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, data=json.dumps(data), headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
