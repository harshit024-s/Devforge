@echo off
echo ========================================================
echo        DevForge Platform - Starting Services
echo ========================================================

echo.
echo [1/3] Starting Local PostgreSQL on Port 5433...
start "DevForge-PostgreSQL" /B "C:\Program Files\PostgreSQL\18\bin\postgres.exe" -D "d:\mini\.pgdata" -p 5433

timeout /t 2 /nobreak >nul

echo [2/3] Starting Backend API (Port 5000)...
start "DevForge-Backend" cmd /k "cd /d d:\mini && node src\server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Starting Next.js Frontend (Port 3000)...
start "DevForge-Frontend" cmd /k "cd /d d:\mini\client && npm run dev"

echo.
echo ========================================================
echo All services launched!
echo - Frontend:  http://localhost:3000
echo - Backend:   http://localhost:5000
echo - Database:  localhost:5433 (elearning_db)
echo ========================================================
pause
