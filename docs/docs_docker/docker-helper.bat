@echo off
REM Docker Helper Script para Windows

setlocal enabledelayedexpansion

:menu
cls
echo.
echo ===== Docker Helper =====
echo 1. Iniciar servicios (up -d)
echo 2. Detener servicios (down)
echo 3. Ver estado (ps)
echo 4. Ver logs (logs -f)
echo 5. Reconstruir imágenes (build)
echo 6. Ejecutar migraciones de BD
echo 7. Abrir Prisma Studio
echo 8. Acceder a shell del backend
echo 9. Acceder a shell del frontend
echo 10. Acceder a PostgreSQL
echo 11. Limpiar todo (down -v)
echo 12. Salir
echo.
set /p choice="Selecciona una opción: "

if "%choice%"=="1" (
    echo Iniciando servicios...
    docker-compose up -d
    docker-compose ps
    pause
    goto menu
)

if "%choice%"=="2" (
    echo Deteniendo servicios...
    docker-compose down
    pause
    goto menu
)

if "%choice%"=="3" (
    echo Estado de servicios:
    docker-compose ps
    pause
    goto menu
)

if "%choice%"=="4" (
    echo Mostrando logs (Ctrl+C para salir)...
    docker-compose logs -f
    goto menu
)

if "%choice%"=="5" (
    echo Reconstruyendo imágenes...
    docker-compose build --no-cache
    pause
    goto menu
)

if "%choice%"=="6" (
    echo Ejecutando migraciones de Prisma...
    docker-compose exec backend npx prisma migrate dev
    pause
    goto menu
)

if "%choice%"=="7" (
    echo Abriendo Prisma Studio...
    docker-compose exec backend npx prisma studio
    goto menu
)

if "%choice%"=="8" (
    echo Accediendo a shell del backend...
    docker-compose exec backend sh
    goto menu
)

if "%choice%"=="9" (
    echo Accediendo a shell del frontend...
    docker-compose exec frontend sh
    goto menu
)

if "%choice%"=="10" (
    echo Conectando a PostgreSQL...
    docker-compose exec postgres psql -U music_user -d music_streaming_platform
    goto menu
)

if "%choice%"=="11" (
    echo ADVERTENCIA: Esto eliminará todos los contenedores y volúmenes
    set /p confirm="¿Estás seguro? (s/n): "
    if /i "%confirm%"=="s" (
        docker-compose down -v
        echo Limpieza completada
    ) else (
        echo Cancelado
    )
    pause
    goto menu
)

if "%choice%"=="12" (
    echo Saliendo...
    exit /b 0
)

echo Opción inválida
pause
goto menu
