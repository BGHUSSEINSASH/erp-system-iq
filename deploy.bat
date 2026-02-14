@echo off
echo ========================================
echo   ERP System - Firebase Deployment
echo ========================================
echo.

echo [1/4] Building frontend...
call npm -w apps/web run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo [2/4] Building Cloud Functions...
cd functions
call npx tsc
cd ..
if %ERRORLEVEL% neq 0 (
    echo ERROR: Functions build failed!
    pause
    exit /b 1
)
echo ✓ Functions built successfully
echo.

echo [3/4] Deploying to Firebase...
call firebase deploy
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Deployment failed!
    echo If you see "Blaze plan" error, upgrade at:
    echo https://console.firebase.google.com/project/erp-system-iq/usage/details
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ Deployment Complete!
echo   URL: https://erp-system-iq.web.app
echo ========================================
pause
