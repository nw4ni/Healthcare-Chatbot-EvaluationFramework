@echo off
echo ========================================
echo Healthcare Chatbot Analytics Launcher
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python main.py"
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 8080"
timeout /t 2 /nobreak >nul

echo Opening Application in Browser...
start http://localhost:8080/index.html

echo.
echo ========================================
echo Application is launching!
echo ========================================
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:8080/index.html
echo.
echo Press any key to exit this launcher...
echo (Servers will continue running in separate windows)
pause >nul

