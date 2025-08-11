@echo off
echo Starting GridSecureSim...
echo.

echo Starting Backend (Test Mode)...
start "GridSecureSim Backend" cmd /k "cd /d %~dp0 && node backend/server-test.js"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend...
start "GridSecureSim Frontend" cmd /k "cd /d %~dp0\frontend && set PORT=2000 && npm start"

echo.
echo GridSecureSim is starting!
echo Backend: http://localhost:2002
echo Frontend: http://localhost:2000
echo.
echo Press any key to exit this launcher...
pause > nul
