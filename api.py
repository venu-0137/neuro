import sys
import subprocess

def _ensure_dependencies():
    try:
        import bcrypt
        import jwt
        import fastapi
        import uvicorn
        import motor
        import passlib
    except ImportError as e:
        print(f"Missing dependency detected: {e}. Auto-installing now...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "bcrypt", "motor", "PyJWT", "fastapi", "uvicorn", "passlib[bcrypt]", "python-multipart", "email-validator"])
        print("Installation complete.")

_ensure_dependencies()

import os
import random
import string
from datetime import datetime, timedelta
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr
from inference import NeuroTalkInference

# Configuration
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = "neurotalk_db"
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

app = FastAPI(title="NeuroTalk AI API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Client
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Models for Request/Response
class UserRegister(BaseModel):
    username: str
    email: EmailStr

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class AnalysisRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    text: str
    emotions: List[dict]
    timestamp: datetime

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"username": username})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Initialize inference engine
try:
    engine = NeuroTalkInference(model_path="neurotalk_model_updated", num_labels=28)
except Exception as e:
    print(f"Warning: Could not load model: {e}")
    engine = None

# Endpoints
@app.post("/register")
async def register(user_data: UserRegister):
    try:
        # Check if username or email exists
        if await db.users.find_one({"username": user_data.username}):
            raise HTTPException(status_code=400, detail="Username already taken")
        if await db.users.find_one({"email": user_data.email}):
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Generate 4-digit password
        generated_password = ''.join(random.choices(string.digits, k=4))
        
        user_doc = {
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hash_password(generated_password),
            "created_at": datetime.utcnow()
        }
        
        await db.users.insert_one(user_doc)
        return {"username": user_data.username, "password": generated_password}
    except Exception as e:
        import traceback
        print(f"Registration Error: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    if engine is None:
        raise HTTPException(status_code=503, detail="Analytics engine not available")
    
    # Run analysis
    # Note: NeuroTalkInference.analyze currently returns a string, but the prompt says 'emotions: array'
    # I should adjust the engine to return structured data if possible, or wrap the string.
    # Assuming the user wants structured data saved.
    prediction, score = engine.analyze(request.text)
    
    analysis_doc = {
        "user_id": str(current_user["_id"]),
        "text": request.text,
        "emotions": [{"label": prediction, "score": score}],
        "cognitive_patterns": [],
        "timestamp": datetime.utcnow()
    }
    
    await db.analyses.insert_one(analysis_doc)
    
    return {
        "text": request.text,
        "emotions": analysis_doc["emotions"],
        "timestamp": analysis_doc["timestamp"]
    }

@app.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    cursor = db.analyses.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1)
    history = await cursor.to_list(length=100)
    # Convert ObjectId to string for JSON serialization
    for item in history:
        item["_id"] = str(item["_id"])
    return history

@app.get("/")
async def root():
    return {"message": "NeuroTalk AI API with Authentication is running."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8080, reload=True)
