@echo off
echo ========================================
echo Music Platform - Database Setup
echo ========================================
echo.

echo [1/4] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta instalado o no esta corriendo
    echo Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)
echo Docker OK!
echo.

echo [2/4] Starting PostgreSQL container...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: No se pudo iniciar PostgreSQL
    pause
    exit /b 1
)
echo PostgreSQL started!
echo.

echo [3/4] Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul
echo PostgreSQL ready!
echo.

echo [4/4] Running Prisma migrations...
cd app-music
call npm run prisma:migrate
if errorlevel 1 (
    echo ERROR: No se pudieron ejecutar las migraciones
    cd ..
    pause
    exit /b 1
)
cd ..
echo.

echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo PostgreSQL is running on: localhost:5432
echo Database: music_streaming_platform
echo Username: postgres
echo Password: postgres
echo.
echo Next steps:
echo 1. Start backend: cd app-music ^&^& npm run dev
echo 2. Start frontend: cd client-web ^&^& npm run dev
echo 3. Open Prisma Studio: cd app-music ^&^& npm run prisma:studio
echo.
pause
