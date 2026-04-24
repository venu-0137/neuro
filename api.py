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
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import bcrypt
import jwt
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
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

# Global Exception Handler for stability
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"!!! CRITICAL API ERROR: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal neural error occurred. Our engineers are investigating."}
    )

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
    timestamp: Optional[str] = None

class AnalysisResponse(BaseModel):
    text: str
    emotions: dict # Map of label -> score
    pattern: str
    timestamp: str

class DiaryEntry(BaseModel):
    text: str
    mood: str # The emoji or mood name from frontend

class DiaryResponse(BaseModel):
    id: str
    emotion: str
    trigger_message: str

# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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

# --- Chat System Models & Logic ---

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = [] # List of {"role": "user/assistant", "content": "..."}
    personality: str = "calm" # fun, calm, coach

class ChatResponse(BaseModel):
    emotion: str
    topic: str
    reply: str
    follow_up: str
    suggestion: Optional[str] = None
    emotion_summary: Optional[str] = None
    links: List[dict] = []

# --- Memory & Context Helpers ---

async def update_user_profile(user_id: str, message: str, emotion: str, topic: str, role: str = "user"):
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if not profile:
        profile = {
            "user_id": user_id,
            "last_emotion": emotion,
            "last_topics": [topic],
            "last_interaction": datetime.now(timezone.utc),
            "summary_history": []
        }
        await db.user_profiles.insert_one(profile)
    else:
        # Update topics (keep last 5 unique)
        topics = profile.get("last_topics", [])
        if topic not in topics:
            topics = [topic] + topics
        topics = topics[:5]
        
        await db.user_profiles.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "last_emotion": emotion,
                    "last_topics": topics,
                    "last_interaction": datetime.now(timezone.utc)
                }
            }
        )

async def get_memory_hook(user_id: str, current_message: str):
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if not profile:
        return ""
    
    last_interaction = profile.get("last_interaction")
    last_emotion = profile.get("last_emotion", "neutral")
    last_topics = profile.get("last_topics", ["general"])
    last_topic = last_topics[0] if last_topics else "general"
    
    # Human-like memory check for "Do you remember?"
    if any(w in current_message.lower() for w in ["remember", "last time", "what did we talk"]):
        if last_topic != "general":
            return f"Of course! I remember we were talking about {last_topic.replace('_', ' ')} recently. How has that been since then?"
        return f"Yes, I remember our last chat! You seemed to be feeling a bit {last_emotion} back then. What's on your mind now?"

    # Proactive mention of yesterday/past
    now = datetime.now(timezone.utc)
    if last_interaction and (now - last_interaction).days >= 1:
        topic_str = last_topic.replace('_', ' ') if last_topic != 'general' else ""
        context_str = f" about {topic_str}" if topic_str else ""
        return f"I've been thinking about you... You mentioned feeling {last_emotion}{context_str} when we last spoke. How are you feeling today? "
    
    return ""

async def get_unique_reply(user_id: str, options: list):
    """Ensure we don't repeat the same sentence pattern to the same user."""
    profile = await db.user_profiles.find_one({"user_id": user_id})
    recent_responses = profile.get("recent_responses", []) if profile else []
    
    # Filter out options that were used recently
    available = [opt for opt in options if opt not in recent_responses]
    
    # If all options were used, reset or just pick random
    if not available:
        available = options
        
    choice = random.choice(available)
    
    # Update recent responses (keep last 10)
    new_recent = ([choice] + recent_responses)[:10]
    await db.user_profiles.update_one(
        {"user_id": user_id},
        {"$set": {"recent_responses": new_recent}},
        upsert=True
    )
    
    return choice

# --- Advanced logic ---

def detect_topic(text: str) -> str:
    text = text.lower()
    if any(w in text for w in ["fat", "weight", "diet", "gym", "workout", "body", "obese", "skinny", "exercise", "calories", "running"]):
        return "fitness"
    elif any(w in text for w in ["exam", "study", "marks", "test", "fail", "college", "school", "assignment", "grades", "homework", "result", "university"]):
        return "academic_stress"
    elif any(w in text for w in ["love", "relationship", "breakup", "boyfriend", "girlfriend", "crush", "dating", "divorce", "marry", "husband", "wife"]):
        return "relationship"
    elif any(w in text for w in ["alone", "lonely", "loneliness", "no friends", "ignored", "isolated", "single"]):
        return "loneliness"
    elif any(w in text for w in ["job", "career", "future", "work", "boss", "interview", "salary", "promotion", "office", "fired"]):
        return "career"
    elif any(w in text for w in ["pressure", "stressed", "burnout", "overwhelmed", "anxious", "anxiety", "panic", "heavy"]):
        return "stress"
    elif any(w in text for w in ["sad", "worthless", "self-esteem", "confidence", "ugly", "useless"]):
        return "self_esteem"
    return "general"

ACHIEVEMENT_KEYWORDS = ["got a job", "won", "achieved", "selected", "passed", "promotion", "success", "happy news", "hired", "accepted", "won a", "made it"]

# --- New Dynamic Response Engine ---

DYNAMIC_ENGINE = {
    "fitness": {
        "happy": {
            "fun": ["You're absolutely crushing those goals! 🔥", "Look at you go, fitness icon! 💅", "Energy levels: Over 9000! ⚡"],
            "calm": ["I'm so glad to see you feeling good about your body 🤍", "It's wonderful to see you prioritizing your health 😊", "You're doing great, one step at a time ✨"],
            "coach": ["This is what consistency looks like. Keep pushing! 💪", "Great progress! Now let's set the next milestone 🎯", "Stay focused, you're becoming the best version of yourself! 🏆"]
        },
        "sadness": {
            "fun": ["Hey, even superheroes have slow days! 🦸‍♂️", "Don't let one bad day win. We got this! 😄", "Sending you a virtual protein shake and a hug! 🥤💙"],
            "calm": ["Be kind to yourself today 💙. Your worth isn't defined by a scale.", "It's okay to rest. Your body does so much for you 🕊️", "I'm here for you. We'll find your rhythm again ✨"],
            "coach": ["Listen to your body, but don't quit. Rest, then reset. 💪", "One setback is just a setup for a comeback. Let's move. 🚀", "Focus on how you feel, not just the results. You're stronger than you think. ⚔️"]
        }
    },
    "academic_stress": {
        "happy": {
            "fun": ["Smarty pants alert! 🤓🎉", "You absolutely ate those exams! 💅", "Brains AND vibes? You're the whole package! ✨"],
            "calm": ["Your hard work is truly paying off. I'm proud of you 🤍", "It's a relief to see that pressure lifting, isn't it? 😊", "You deserve this success. Enjoy the moment ✨"],
            "coach": ["Well earned! Now use this momentum for the next challenge. 📈", "Consistency leads to excellence. You proved it today. 🎯", "Great job. Keep that focus sharp for what's next. 🚀"]
        },
        "sadness": {
            "fun": ["Exams are just paper, you're a legend! 😄", "Even Einstein had bad days, don't sweat it! 🧠✨", "Let's turn that frown upside down and some pages too! 📖💖"],
            "calm": ["A grade doesn't define your intelligence or your future 💙", "I know it feels heavy right now, but this too shall pass 🕊️", "Take a deep breath. You are much more than a test result ✨"],
            "coach": ["Analyze what happened, learn, and attack again. ⚔️", "Failure is just data. Use it to improve your strategy. 🎯", "Don't let a setback stop your journey. Reset and refocus. 💪"]
        }
    },
    "relationship": {
        "happy": {
            "fun": ["Love is in the air! or is that just your glow? ✨💖", "Cutie alert! I'm living for this energy! 😄", "Relationship goals much? 💅🌟"],
            "calm": ["It's beautiful to see you so happy in your connections 🤍", "Cherish these moments of peace and love 😊", "You deserve all the kindness and affection coming your way ✨"],
            "coach": ["Strong relationships build strong people. Keep nurturing it. 🎯", "Communication is key. You're doing it right. 💪", "Balance is everything. Stay grounded while you fly high. 🚀"]
        },
        "sadness": {
            "fun": ["Their loss, honestly. You're a catch! 🎣✨", "Time for some self-love and maybe some ice cream? 😄🍦", "You're way too iconic to be this sad! 💅💙"],
            "calm": ["Healing isn't linear 💙. Take all the time you need.", "Your heart is resilient. I'm here to hold space for you 🕊️", "It hurts because it mattered. Be gentle with yourself ✨"],
            "coach": ["Use this time to rediscover your own strength. 💪", "Pain is a teacher. What is it showing you about your needs? 🎯", "Focus on your growth. The right people will keep up. 🚀"]
        }
    },
    "career": {
        "happy": {
            "fun": ["CEO energy! 💼✨", "Making moves like a pro! 🚀💅", "Is that a promotion I smell? or just success? 😄"],
            "calm": ["It's wonderful to see your professional journey aligning 🤍", "You've worked hard for this stability. Enjoy it 😊", "I'm so glad you're finding fulfillment in your work ✨"],
            "coach": ["Great win. Now how do we scale this success? 📈", "Stay hungry, stay humble. You're on the right path. 🎯", "Your impact is growing. Keep leading with vision. 💪"]
        },
        "sadness": {
            "fun": ["The workplace doesn't deserve your sparkle today! ✨💼", "Let's find the 'exit' button on this stress! 😄", "You're the boss of your own happiness, remember that! 💅💙"],
            "calm": ["Career paths have twists and turns 💙. This is just one bend.", "It's okay to feel lost sometimes. You'll find your way 🕊️", "Your value isn't just your productivity. Take a breath ✨"],
            "coach": ["What's the one thing you can control right now? Focus there. 🎯", "Every 'no' is a step closer to the right 'yes'. Keep going. 💪", "Don't let a job title define your worth. You are a builder. ⚔️"]
        }
    },
    "loneliness": {
        "happy": {
            "fun": ["You're glowing! Making connections looks good on you! ✨", "Vibe check: Social icon! 💅", "Love to see you surrounded by good energy! 😄"],
            "calm": ["It's wonderful to see you finding your people 🤍", "Cherish these moments of connection 😊", "You deserve a supportive circle ✨"],
            "coach": ["Keep building these bridges. Quality over quantity. 🎯", "Strong bonds take time. You're doing great. 💪", "Never settle for less than true connection. 🚀"]
        },
        "sadness": {
            "fun": ["Hey, you've got me! And I'm pretty iconic, right? 😄💙", "The right people are coming, don't let the silence win! ✨", "You're a whole vibe even when you're alone! 💅💖"],
            "calm": ["I'm right here with you 💙. You don't have to feel alone while talking to me.", "It's okay to feel isolated sometimes. Your company is valuable 🕊️", "I'm listening. Tell me what's on your heart ✨"],
            "coach": ["Use this time to strengthen your relationship with yourself. 💪", "Reach out to one person today. Just one small hello. 🎯", "Being alone isn't the same as being lonely. Let's find your peace. ⚔️"]
        },
        "anxiety": {
            "fun": ["Hey, take a deep breath! You're safe with me. 😄💙", "Let's find some calm together. You're not alone! ✨", "Sending you all the peaceful vibes! 💅💆‍♀️"],
            "calm": ["I'm right here. Let's take it one step at a time. 🧘", "You're safe. I'm listening to everything you want to share. 🕊️", "Breathe with me. We'll get through this feeling. ✨"],
            "coach": ["Focus on what's right in front of you. One small thing. 🎯", "Anxiety is just energy. Let's use it for something small and good. 💪", "You are stronger than this feeling. Stay grounded. ⚔️"]
        }
    },
    "stress": {
        "happy": {
            "fun": ["Pressure into diamonds! You're shining! 🔥✨", "Look at you managing like a boss! 💅", "Stress where? You've got this! 😄"],
            "calm": ["It's such a relief to see you finding your calm 🤍", "You've handled the pressure so well 😊", "Breathe in that success ✨"],
            "coach": ["Great management. Keep that focus sharp. 📈", "Stay disciplined. You're winning the day. 🎯", "Balanced and bold. Keep going. 💪"]
        },
        "sadness": {
            "fun": ["Let's pop that stress bubble! 💥😄", "You're too legendary to be this overwhelmed! ✨", "Sending you a mental spa day! 💅💆‍♀️"],
            "calm": ["Take a deep breath with me 💙. We'll take this one thing at a time.", "The weight won't last forever. I'm here to help carry it 🕊️", "Let's slow everything down for a moment ✨"],
            "coach": ["Focus only on the next 10 minutes. That's it. 🎯", "Action is the enemy of anxiety. What's one small task? 💪", "You've handled hard things before. This is no different. ⚔️"]
        },
        "anxiety": {
            "fun": ["Mental brakes on! Let's slow down together! 😄💙", "You're doing great handling all this pressure! ✨", "Mental spa day starts now! 💅💆‍♀️"],
            "calm": ["I can hear the weight in your words 🧘. Let's set it down for a moment.", "It's okay to feel overwhelmed. We'll take it one bit at a time. 🕊️", "You're doing your best, and that's enough. ✨"],
            "coach": ["Breathe. What is the single most important task right now? 🎯", "Action reduces anxiety. What's one tiny step forward? 💪", "Stay in the present moment. You can handle this. ⚔️"]
        }
    },
    "self_esteem": {
        "happy": {
            "fun": ["You're absolutely shining! ✨", "Confidence looks so good on you! 💅", "Iconic behavior only! 👑"],
            "calm": ["I'm so glad you're seeing your own worth 🤍", "You deserve to feel this proud of yourself 😊", "It's beautiful to see you honoring yourself ✨"],
            "coach": ["Keep this mindset. Your value is non-negotiable. 🎯", "Build on this confidence. You are capable of so much. 💪", "Never dim your light for anyone. 🚀"]
        },
        "sadness": {
            "fun": ["Hey, you're the main character! Don't let the plot holes get you down. 💖", "Sending you a reminder that you're absolutely amazing! ✨", "You're too rare to be feeling this low! 💅💙"],
            "calm": ["I wish you could see yourself through my eyes 💙", "Your worth isn't about what you do, it's about who you are 🕊️", "Be as kind to yourself as you are to others ✨"],
            "coach": ["Negative thoughts are just lies your brain tells when it's tired. ⚔️", "Treat yourself like someone you are responsible for helping. 🎯", "One bad thought doesn't define your truth. Rise up. 💪"]
        }
    },
    "general": {
        "happy": {
            "fun": ["Vibe check: Passed with flying colors! 🌈✨", "Keep that same energy! It's contagious! 😄", "You're glowing today! 💅🌟"],
            "calm": ["I'm so happy to hear things are going well for you 🤍", "It's good to have these peaceful moments, isn't it? 😊", "May this feeling stay with you throughout the day ✨"],
            "coach": ["Maintain this mindset. It's your greatest asset. 🎯", "Positivity is a choice. You're making the right one. 💪", "Build on this good energy. What's the next win? 🚀"]
        },
        "sadness": {
            "fun": ["Sending you a virtual hug and a joke! 😄💙", "Even the moon has phases, it's okay to be dark for a bit. ✨", "You're stronger than any bad day! 💅💖"],
            "calm": ["I'm right here with you 💙. You don't have to carry it all.", "It's okay not to be okay. Take a moment to just be 🕊️", "I'm listening. Tell me everything that's on your mind ✨"],
            "coach": ["Acknowledge the feeling, but don't let it sit in the driver's seat. 🎯", "Small steps forward are still progress. What's one? 💪", "You've survived 100% of your bad days. You're a fighter. ⚔️"]
        },
        "anxiety": {
            "fun": ["Let's dance that nervous energy away! 💃✨", "Brain: 100mph. Us: Let's hit the brakes! 😄", "You're bigger than your worries! 💅💙"],
            "calm": ["Inhale peace, exhale the pressure 🧘. You're safe here.", "Let's ground ourselves together. What are 3 things you see? 🕊️", "I understand... let's take it one minute at a time ✨"],
            "coach": ["Anxiety is just energy without a mission. Let's give it one. 🎯", "Focus on your breath. It's the only thing that's real right now. 💪", "Break it down until it's small enough to manage. ⚔️"]
        }
    }
}

EMPATHY_LINES = {
    "happy": ["I'm so incredibly happy for you! 😄", "That's such a beautiful win! ✨", "I can feel your joy from here! 🤍"],
    "sadness": ["I'm right here with you, and I'm so sorry it hurts 💙", "That sounds really heavy to carry... 🕊️", "I wish I could give you a real hug right now 🤍"],
    "anxiety": ["I hear how much is on your mind right now 🧘", "It's okay to feel overwhelmed, I've got you 💆‍♀️", "Let's just take a slow, deep breath together 🌬️"],
    "anger": ["I totally get why that's making you so upset 😤", "That's honestly so frustrating, I'd be mad too 🔥", "Vent it all out, I'm here to listen 😌"],
    "neutral": ["I'm listening... tell me more about that 🙂", "I'm here for you, no matter what's on your mind 💡", "I really appreciate you sharing that with me ✨"]
}

FOLLOW_UPS = {
    "fitness": ["How does your body feel after that?", "What's the next small goal we can set?", "Are you making sure to get enough rest too?"],
    "academic_stress": ["What's the part that's worrying you the most?", "Do you think a 5-minute reset would help?", "How can I help you tackle the next bit?"],
    "relationship": ["How are you processing everything?", "What do you need most from the people around you right now?", "Have you had a chance to talk to them about how you feel?"],
    "career": ["What's your gut telling you to do next?", "Is there a way we can make the workload feel a bit lighter?", "What would make you feel most successful this week?"],
    "self_esteem": ["What's one thing you actually like about yourself today?", "How can we be a bit kinder to you right now?", "Do you want to tell me more about why you're feeling this way?"],
    "general": ["What's been on your mind the most lately?", "Is there anything else you've been wanting to get off your chest?", "How else can I support you through this today?"],
    "diary_reflection": ["Does writing it down make it feel any more manageable?", "Want to dive a bit deeper into that thought?", "How has your mood changed since you wrote that?"]
}

SUGGESTIONS = {
    "fitness": {
        "text": "Maybe try a light 15-minute stretching routine or a quick walk to refresh your energy.",
        "links": [{"title": "15 Min Full Body Stretch", "url": "https://www.youtube.com/watch?v=v7AYKMP6rOE"}]
    },
    "academic_stress": {
        "text": "Try the Pomodoro technique: 25 mins focus, 5 mins break. It helps manage the 'mountain' of work.",
        "links": [{"title": "Pomodoro Focus Timer", "url": "https://www.youtube.com/watch?v=mUNU636nZxw"}]
    },
    "relationship": {
        "text": "Try journaling your feelings for 10 minutes. It helps separate the emotion from the person.",
        "links": []
    },
    "career": {
        "text": "Update your 'Win List' — write down 3 things you did well this month. It boosts professional confidence.",
        "links": []
    },
    "loneliness": {
        "text": "Try reaching out to one old friend or joining a small community group. Even a quick 'hello' can break the silence.",
        "links": []
    },
    "stress": {
        "text": "Try the 5-4-3-2-1 grounding technique: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste.",
        "links": [{"title": "Quick Grounding Exercise", "url": "https://www.youtube.com/watch?v=30VMIEmA114"}]
    },
    "general": {
        "text": "A quick 5-minute breathing exercise can reset your nervous system completely.",
        "links": [{"title": "Box Breathing Exercise", "url": "https://www.youtube.com/watch?v=inpok4MKVLM"}]
    }
}



async def generate_improved_response(message: str, emotions: dict, pattern: str, history: List[dict], user_id: str, personality: str = "calm"):
    # 1. Topic Detection
    topic = detect_topic(message)
    
    # 2. Main Emotion (dominant one)
    dominant_emotion = list(emotions.keys())[0]
    
    # Map dominant emotion to main buckets
    if dominant_emotion in ["sadness", "disappointment", "grief", "remorse"]: emotion_bucket = "sadness"
    elif dominant_emotion in ["anger", "annoyance", "disgust"]: emotion_bucket = "anger"
    elif dominant_emotion in ["fear", "nervousness", "anxiety"]: emotion_bucket = "anxiety"
    elif dominant_emotion in ["joy", "optimism", "gratitude", "pride", "love", "excitement", "amusement"]: emotion_bucket = "happy"
    else: emotion_bucket = "neutral"

    # 3. Medical Safety Check
    medical_keywords = ["pill", "medicine", "doctor", "suicide", "depressed", "clinical", "medication", "prescription", "kill myself", "end it", "hurt myself"]
    if any(kw in message.lower() for kw in medical_keywords):
        return {
            "reply": "Hey... I'm right here with you, but I need to say that I'm an AI companion, not a professional counselor or doctor. If things feel too heavy, please reach out to someone who can really help you physically.",
            "follow_up": "Would you be open to talking to a professional about this? You don't have to carry it alone.",
            "emotion_summary": "I'm sensing some very deep and serious pain in your words 💙",
            "suggestion": "Your safety is the most important thing to me. Please take care of yourself.",
            "topic": topic
        }

    # 4. Handle History & Profile Awareness
    memory_hook = await get_memory_hook(user_id, message)
    
    # 5. Construct Structured Response
    
    # A. Acknowledge (Empathy)
    empathy = await get_unique_reply(user_id, EMPATHY_LINES.get(emotion_bucket, EMPATHY_LINES["neutral"]))
    
    # B. Natural Response (Core Reply)
    topic_data = DYNAMIC_ENGINE.get(topic, DYNAMIC_ENGINE["general"])
    emotion_data = topic_data.get(emotion_bucket, topic_data.get("neutral", topic_data.get("sadness", {})))
    
    if not emotion_data:
        emotion_data = DYNAMIC_ENGINE["general"]["neutral"]
        
    replies = emotion_data.get(personality, emotion_data.get("calm", ["I'm here for you."]))
    core_reply = await get_unique_reply(user_id, replies)
    
    # C. Cognitive Pattern awareness
    emotion_summary = f"You seem to be feeling {dominant_emotion}"
    if len(emotions) > 1:
        top_two = list(emotions.keys())[:2]
        if emotions[top_two[1]] > 0.3:
            emotion_summary = f"I can feel a mix of {top_two[0]} and {top_two[1]} in your words."
    
    # D. Relatable / Supportive Sentence
    support_sentence = ""
    if not memory_hook:
        support_options = [
            " It's okay to feel exactly how you're feeling right now.",
            " I'm really glad you're sharing this with me.",
            " Thank you for being so open. I'm listening.",
            " You don't have to handle this alone, I'm right here.",
            " I hear you, and I'm really taking in what you're saying."
        ]
        support_sentence = await get_unique_reply(user_id, support_options)
    
    # E. Mandatory Follow-up
    follow_up_options = FOLLOW_UPS.get(topic, FOLLOW_UPS["general"])
    follow_up = await get_unique_reply(user_id, follow_up_options)
    
    # F. Suggestion
    sugg_data = SUGGESTIONS.get(topic, SUGGESTIONS["general"])
    suggestion = sugg_data["text"]
    links = sugg_data.get("links", [])

    # Combine parts for the main reply
    full_reply = f"{memory_hook}{empathy} {core_reply}{support_sentence}"
    
    # Update user profile
    await update_user_profile(user_id, message, emotion_bucket, topic)
    
    return {
        "reply": full_reply,
        "follow_up": follow_up,
        "emotion_summary": emotion_summary,
        "suggestion": suggestion,
        "links": links,
        "topic": topic
    }

# --- Endpoints ---

@app.get("/ping")
async def ping():
    print("!!! PING RECEIVED !!!")
    return {"status": "ok", "message": "API IS ALIVE"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    if engine is None:
        raise HTTPException(status_code=503, detail="Analytics engine not available")
    
    # 1. Analyze multi-label emotions
    emotions_dict, pattern = engine.analyze(request.message)
    
    # Determine predominant emotion for metadata
    dominant_prediction = list(emotions_dict.keys())[0]
    
    # 2. Generate dynamics using the new engine
    response_data = await generate_improved_response(
        request.message, 
        emotions_dict,
        pattern,
        request.history,
        str(current_user["_id"]),
        request.personality
    )
    
    # 3. Log interaction
    chat_doc = {
        "user_id": str(current_user["_id"]),
        "message": request.message,
        "emotion": dominant_prediction,
        "topic": response_data["topic"],
        "reply": response_data["reply"],
        "personality": request.personality,
        "timestamp": datetime.now(timezone.utc)
    }
    await db.chats.insert_one(chat_doc)
    
    return {
        "emotion": dominant_prediction,
        "topic": response_data["topic"],
        "reply": response_data["reply"],
        "follow_up": response_data["follow_up"],
        "suggestion": response_data["suggestion"],
        "emotion_summary": response_data["emotion_summary"],
        "links": response_data["links"]
    }

# --- Diary Functions ---

def get_diary_trigger(emotion: str) -> str:
    triggers = {
        "sadness": "Hey… you seem a bit low today 💙 Want to talk?",
        "anxiety": "You’ve had a stressful day 😔 Let’s clear your mind together.",
        "anger": "That sounds frustrating 😤 Want to talk it out?",
        "joy": "That's wonderful! 🌟 Want to share more about this happy moment?",
        "fear": "It's okay to feel scared. I'm here to support you 🛡️. Want to talk?",
        "disgust": "That sounds unpleasant... talking might help process it. Want to?",
        "surprise": "Wow, sounds like an eventful day! 😲 Want to discuss what happened?",
        "neutral": "Thanks for sharing your thoughts. I'm here if you want to dive deeper into your day."
    }
    return triggers.get(emotion, triggers["neutral"])

@app.post("/diary/add")
async def add_diary(entry: DiaryEntry, current_user: dict = Depends(get_current_user)):
    try:
        # 1. Detect core emotion for the diary text
        if engine is not None:
            # engine.analyze returns (emotions_dict, pattern)
            emotions_dict, pattern = engine.analyze(entry.text)
            prediction = list(emotions_dict.keys())[0] if emotions_dict else "neutral"
        else:
            prediction = "neutral"

        # 2. Save to DB
        diary_doc = {
            "user_id": str(current_user["_id"]),
            "text": entry.text,
            "mood": entry.mood,
            "detected_emotion": prediction,
            "timestamp": datetime.now(timezone.utc)
        }
        res = await db.diary.insert_one(diary_doc)
        
        # 3. Generate proactive trigger
        trigger = get_diary_trigger(prediction)
        
        return {
            "id": str(res.inserted_id),
            "emotion": prediction,
            "trigger_message": trigger
        }
    except Exception as e:
        print(f"Diary Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save diary entry")

@app.get("/diary/history")
async def get_diary_history(current_user: dict = Depends(get_current_user)):
    try:
        cursor = db.diary.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1)
        entries = await cursor.to_list(length=100)
        for entry in entries:
            entry["id"] = str(entry["_id"])
            del entry["_id"]
        return entries
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to fetch history")

@app.put("/diary/update/{entry_id}")
async def update_diary(entry_id: str, entry: DiaryEntry, current_user: dict = Depends(get_current_user)):
    try:
        from bson import ObjectId
        # Check if entry exists and belongs to user
        existing = await db.diary.find_one({"_id": ObjectId(entry_id), "user_id": str(current_user["_id"])})
        if not existing:
            raise HTTPException(status_code=404, detail="Entry not found")
            
        # Re-analyze emotion for the new text
        if engine is not None:
            # engine.analyze returns (emotions_dict, pattern)
            emotions_dict, pattern = engine.analyze(entry.text)
            prediction = list(emotions_dict.keys())[0] if emotions_dict else "neutral"
        else:
            prediction = "neutral"
            
        # Update in DB
        await db.diary.update_one(
            {"_id": ObjectId(entry_id)},
            {"$set": {
                "text": entry.text,
                "mood": entry.mood,
                "detected_emotion": prediction,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        trigger = get_diary_trigger(prediction)
        return {
            "id": entry_id,
            "emotion": prediction,
            "trigger_message": trigger
        }
    except Exception as e:
        print(f"Update Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update diary entry")

@app.post("/register")
async def register(user_data: UserRegister):
    try:
        print(f"--- Registration Attempt: {user_data.username} ({user_data.email}) ---")
        # Check if username or email exists
        ex_user = await db.users.find_one({"username": user_data.username})
        if ex_user:
            print(f"Username {user_data.username} already taken")
            raise HTTPException(status_code=400, detail="Username already taken")
            
        ex_email = await db.users.find_one({"email": user_data.email})
        if ex_email:
            print(f"Email {user_data.email} already takes")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Generate 4-digit password
        generated_password = ''.join(random.choices(string.digits, k=4))
        print(f"Generated password for {user_data.username}: {generated_password}")
        
        user_doc = {
            "username": user_data.username,
            "email": user_data.email,
            "password_hash": hash_password(generated_password),
            "created_at": datetime.now(timezone.utc)
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
    try:
        print(f"--- Login Attempt: {user_data.username} ---")
        user = await db.users.find_one({"username": user_data.username})
        if not user:
            print("User not found in database")
            raise HTTPException(status_code=401, detail="Incorrect username or password")
            
        if not verify_password(user_data.password, user["password_hash"]):
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        
        print("Login successful, generating token...")
        access_token = create_access_token(data={"sub": user["username"]})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        import traceback
        print(f"!!! Login Crash: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest, current_user: dict = Depends(get_current_user)):
    if engine is None:
        raise HTTPException(status_code=503, detail="Analytics engine not available")
    
    # Run multi-label analysis
    emotions_dict, pattern = engine.analyze(request.text)
    
    # Use provided timestamp or current UTC
    ts = request.timestamp or datetime.now(timezone.utc).isoformat()
    
    analysis_doc = {
        "user_id": str(current_user["_id"]),
        "text": request.text,
        "emotions": emotions_dict,
        "pattern": pattern,
        "cognitive_patterns": [],
        "timestamp": ts
    }
    
    await db.analyses.insert_one(analysis_doc)
    
    return {
        "text": request.text,
        "emotions": emotions_dict,
        "pattern": pattern,
        "timestamp": ts
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
    print("\n" + "="*40)
    print("   NEUROTALK API STARTING...")
    print(f"   Listening on: http://127.0.0.1:8080")
    print("="*40 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8080, reload=False)
