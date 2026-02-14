@echo off
chcp 65001 >nul
title ERP System - Local Network Server
color 0A

echo ╔══════════════════════════════════════════════════════════╗
echo ║          نظام ERP المتكامل - خادم الشبكة المحلية         ║
echo ║          ERP System - Local Network Server               ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

:: Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168"') do (
    set LOCAL_IP=%%a
)
set LOCAL_IP=%LOCAL_IP: =%

echo [1/3] Building Frontend...
call npm -w apps/web run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built

echo.
echo [2/3] Building Backend...
call npm -w apps/api run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)
echo ✓ Backend built

echo.
echo [3/3] Starting Server...
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║  النظام يعمل الآن! System is running!                    ║
echo ╠══════════════════════════════════════════════════════════╣
echo ║                                                          ║
echo ║  Local:   http://localhost:4000                           ║
echo ║  Network: http://%LOCAL_IP%:4000                     ║
echo ║                                                          ║
echo ║  Demo Accounts:                                          ║
echo ║    admin/admin  - مدير النظام                             ║
echo ║    ceo/ceo      - المدير العام                            ║
echo ║    hr/hr        - الموارد البشرية                         ║
echo ║    finance/finance - المالية                              ║
echo ║    sales/sales  - المبيعات                                ║
echo ║    manager/manager - مدير                                 ║
echo ║                                                          ║
echo ║  Press Ctrl+C to stop the server                         ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

node apps/api/dist/index.js
pause
