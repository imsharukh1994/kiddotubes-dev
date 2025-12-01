@echo off
REM ===== KIDDOTUBES FULL STACK STARTUP SCRIPT =====
REM This script starts both the backend and frontend servers

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║         🎥 KIDDOTUBES - Full Stack Startup          ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install it from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Check if npm packages are installed
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    echo ✅ Dependencies installed
    echo.
)

REM Display MongoDB connection status
echo 📊 MongoDB Configuration:
if exist .env (
    echo   ✅ .env file found
    echo   📝 Update .env with your MongoDB connection string
) else (
    echo   ⚠️  .env file not found - creating template
    (
        echo # MongoDB Atlas Connection
        echo MONGODB_URI=mongodb+srv://Superadmin:db_password@YOUR_CLUSTER.mongodb.net/kiddotubes?retryWrites=true^&w=majority
        echo # Server Configuration
        echo PORT=5000
    ) > .env
    echo   ✅ Template created at .env
)
echo.

REM Start Backend Server
echo 🚀 Starting Backend Server (MongoDB API)...
echo   📍 Running on http://localhost:5000
timeout /t 2 >nul
start cmd /k "npm run server:dev"
echo.

REM Wait for backend to start
echo ⏳ Waiting 3 seconds for backend to start...
timeout /t 3 >nul

REM Start Frontend Server
echo 🚀 Starting Frontend Server (Web UI)...
echo   📍 Running on http://localhost:8005
timeout /t 1 >nul
start cmd /k "npm start"
echo.

echo ╔══════════════════════════════════════════════════════╗
echo ║              ✅ STARTUP COMPLETE                    ║
echo ╠══════════════════════════════════════════════════════╣
echo ║  Backend API:      http://localhost:5000            ║
echo ║  Frontend UI:      http://localhost:8005            ║
echo ║  MongoDB:          Check .env file                  ║
echo ║                                                      ║
echo ║  Setup Guide:      See MONGODB_SETUP.md             ║
echo ║  Quick Start:      See MONGODB_QUICK_START.md       ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 📝 Notes:
echo   - Two new terminal windows will open
echo   - Keep both terminals running
echo   - Monitor for errors in each terminal
echo   - Press Ctrl+C in each terminal to stop
echo.
pause
