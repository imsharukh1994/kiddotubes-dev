@echo off
REM ========================================
REM KiddoTubes - Complete Setup Script
REM ========================================

echo.
echo ╔════════════════════════════════════════════╗
echo ║   🎬 KiddoTubes - Complete Setup          ║
echo ║   Web + Mobile (React Native)              ║
echo ╚════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

node -v
npm -v
echo.

REM Setup Web Version
echo ════════════════════════════════════════════
echo 📡 Setting up WEB version...
echo ════════════════════════════════════════════
cd Kiddotubes
if not exist node_modules (
    echo Installing web dependencies...
    call npm install
) else (
    echo ✅ Web dependencies already installed
)

echo.
echo ✅ Web version setup complete!
echo.

REM Setup Mobile Version
echo ════════════════════════════════════════════
echo 📱 Setting up MOBILE version...
echo ════════════════════════════════════════════

cd ..

if exist KiddoTubes-Mobile (
    echo KiddoTubes-Mobile folder already exists
) else (
    echo Creating React Native project...
    call npx create-expo-app KiddoTubes-Mobile
)

cd KiddoTubes-Mobile

if not exist node_modules (
    echo Installing mobile dependencies...
    call npm install react-native-video expo-av
    call npm install axios
    call npm install @react-navigation/native @react-navigation/bottom-tabs
    call npm install react-native-screens react-native-safe-area-context
    call npm install firebase expo-auth-session expo-web-browser
    call npm install -D typescript @types/react-native
) else (
    echo ✅ Mobile dependencies already installed
)

cd ..

echo.
echo ════════════════════════════════════════════
echo ✅ SETUP COMPLETE!
echo ════════════════════════════════════════════
echo.
echo 📁 Project Structure:
echo.
echo  Shaharukh project's/
echo  ├── Kiddotubes/           (Web version)
echo  └── KiddoTubes-Mobile/    (React Native)
echo.
echo 🚀 To Start Development:
echo.
echo Terminal 1 - Backend Server:
echo   cd Kiddotubes
echo   npm run server
echo.
echo Terminal 2 - Web Frontend:
echo   cd Kiddotubes
echo   npm run serve
echo   Open: http://localhost:8005
echo.
echo Terminal 3 - Mobile:
echo   cd KiddoTubes-Mobile
echo   npm start
echo   Press 'w' for web, 'a' for Android, 'i' for iOS
echo.
echo 📖 Documentation:
echo   - README.md - Project overview
echo   - REACT_NATIVE_SETUP.md - Mobile setup guide
echo   - SHARED_BACKEND.md - How web+mobile share data
echo   - TESTING.md - Testing guide
echo.
echo ════════════════════════════════════════════
pause
