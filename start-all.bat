@echo off
echo ========================================
echo Car Rental System - Starting All Services
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && run_backend.bat"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Dev Server...
start "Frontend Dev Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ========================================
echo Both services are starting in separate windows
echo Backend: http://localhost:7060
echo Frontend: http://localhost:7050
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
