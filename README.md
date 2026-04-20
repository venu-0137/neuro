# BolMitra - NeuroTalk AI 🧠

BolMitra is an advanced AI-driven emotional analytics platform that leverages high-fidelity neural networks to interpret and track cognitive-emotional states from text and emojis.

## ✨ Features
- **Neural Core Analytics**: Real-time emotion detection with confidence scores.
- **Mood Machine 💫**: Interactive emotional wellness interface.
- **Secure 4-Digit Auth**: System-generated 4-digit passwords for high-speed, secure access.
- **BolMitra Dashboard**: Sleek, glassmorphism-inspired analytics interface.

## 🚀 Setup Instructions (All Laptops)

### 1. Prerequisites
- **Node.js**: (v18 or higher) [Download](https://nodejs.org/)
- **Python**: (v3.9 or higher) [Download](https://www.python.org/)
- **MongoDB**: (Community Edition) [Download](https://www.mongodb.com/try/download/community)

### 2. Dependency Installation
Open your terminal in the project root and run:
```bash
# Install Python Backend dependencies
pip install -r requirements.txt

# Install Frontend dependencies
cd frontend-v2
npm install
cd ..
```

### 3. Launching the System
We have provided a unified startup script for convenience. Simply double-click:
👉 **`launch_system.bat`**

This will automatically:
1. Start the MongoDB database.
2. Launch the FastAPI backend server.
3. Start the Vite development server for the UI.

### 4. Accessing the Platform
Once the scripts are running, open your browser to:
**http://127.0.0.1:5173**

## 👤 Authentication Guide
1. **Sign Up**: Enter your chosen **Username** and **Email**.
2. **Password**: The system will generate a **4-digit numeric password**. **SAVE THIS CODE.**
3. **Login**: Use your **Username** and the **4-digit code** to enter the dashboard.
