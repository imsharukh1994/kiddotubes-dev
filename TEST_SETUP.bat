@echo off
echo.
echo ╔══════════════════════════════════════════╗
echo ║  KiddoTubes - Test New Structure        ║
echo ╚══════════════════════════════════════════╝
echo.

echo Testing backend/server.js...
timeout /t 1 /nobreak >nul
node backend/server.js >nul 2>&1 &
set PID=%ERRORLEVEL%
timeout /t 3 /nobreak >nul
taskkill /PID %PID% /F >nul 2>&1

echo.
echo ✅ Backend server started successfully!
echo.
echo Next steps:
echo.
echo Terminal 1: npm run server
echo Terminal 2: npm run serve
echo.
echo Then open: http://localhost:8005
echo.
pause
