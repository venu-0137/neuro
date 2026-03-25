@echo off
setlocal
echo ==========================================
echo    NeuroTalk AI Unified Startup Script
echo ==========================================

echo [1/3] Starting MongoDB...
if not exist "mongodb_data" mkdir mongodb_data
start "NeuroTalk DB" cmd /k "mongod --dbpath=mongodb_data || (echo MongoDB Failed && pause)"

echo [2/3] Starting Backend (FastAPI)...
start "NeuroTalk Backend" cmd /k "python api.py || (echo Backend Failed && pause)"

echo [3/3] Starting Frontend (Vite)...
cd frontend-v2
start "NeuroTalk Frontend" cmd /k "npm run dev -- --port 5173 --host 127.0.0.1 || (echo Frontend Failed && pause)"

echo ==========================================
echo All services started! 
echo.
echo 1. Check the new windows for any errors.
echo 2. Open: http://127.0.0.1:5173
echo ==========================================
pause
