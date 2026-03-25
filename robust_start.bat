@echo off
echo Killing any existing processes on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /F /PID %%a /T
)
echo Port 8000 cleared.
echo Organizing model files (just in case)...
python organize_model.py
echo.
echo Starting backend...
python api.py > backend.log 2>&1
