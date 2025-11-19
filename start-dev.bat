@echo off
title Yayasan Wakaf Cendekia - Development Server

echo ╔════════════════════════════════════════════╗
echo ║   🚀 Starting Development Servers          ║
echo ╚════════════════════════════════════════════╝
echo.

REM Start Backend
echo [1/2] Starting Backend API...
start "Backend API" cmd /k "cd yayasan-api && npm start"
timeout /t 3 /nobreak > nul

REM Start Frontend
echo [2/2] Starting Frontend App...
start "Frontend App" cmd /k "cd yayasan-app && npm start"

echo.
echo ✅ Both servers are starting...
echo.
echo 📍 Backend:  http://localhost:5100
echo 📍 Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul