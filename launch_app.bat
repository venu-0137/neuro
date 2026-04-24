@echo off
echo Starting Backend on port 8080...
start /b python api.py > backend.log 2>&1
echo Starting Frontend on port 3000...
cd frontend-v2
start /b npm run dev > frontend.log 2>&1
echo Application startup initiated.
