#!/bin/bash

# Docker Helper Script - Facilita comandos comunes

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Mostrar menú
show_menu() {
    echo ""
    echo -e "${BLUE}=== Docker Helper ===${NC}"
    echo "1. Iniciar servicios (up -d)"
    echo "2. Detener servicios (down)"
    echo "3. Ver estado (ps)"
    echo "4. Ver logs (logs -f)"
    echo "5. Reconstruir imágenes (build)"
    echo "6. Ejecutar migraciones de BD"
    echo "7. Abrir Prisma Studio"
    echo "8. Acceder a shell del backend"
    echo "9. Acceder a shell del frontend"
    echo "10. Acceder a PostgreSQL"
    echo "11. Limpiar todo (down -v)"
    echo "12. Salir"
    echo ""
}

# Ejecutar comando seleccionado
execute_command() {
    case $1 in
        1)
            print_info "Iniciando servicios..."
            docker-compose up -d
            print_success "Servicios iniciados"
            docker-compose ps
            ;;
        2)
            print_info "Deteniendo servicios..."
            docker-compose down
            print_success "Servicios detenidos"
            ;;
        3)
            print_info "Estado de servicios:"
            docker-compose ps
            ;;
        4)
            print_info "Mostrando logs (Ctrl+C para salir)..."
            docker-compose logs -f
            ;;
        5)
            print_info "Reconstruyendo imágenes..."
            docker-compose build --no-cache
            print_success "Imágenes reconstruidas"
            ;;
        6)
            print_info "Ejecutando migraciones de Prisma..."
            docker-compose exec backend npx prisma migrate dev
            print_success "Migraciones completadas"
            ;;
        7)
            print_info "Abriendo Prisma Studio..."
            docker-compose exec backend npx prisma studio
            ;;
        8)
            print_info "Accediendo a shell del backend..."
            docker-compose exec backend sh
            ;;
        9)
            print_info "Accediendo a shell del frontend..."
            docker-compose exec frontend sh
            ;;
        10)
            print_info "Conectando a PostgreSQL..."
            docker-compose exec postgres psql -U music_user -d music_streaming_platform
            ;;
        11)
            print_warning "Esto eliminará todos los contenedores y volúmenes (datos)"
            read -p "¿Estás seguro? (s/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                print_info "Limpiando..."
                docker-compose down -v
                print_success "Limpieza completada"
            else
                print_info "Cancelado"
            fi
            ;;
        12)
            print_info "Saliendo..."
            exit 0
            ;;
        *)
            print_error "Opción inválida"
            ;;
    esac
}

# Main loop
if [ $# -eq 0 ]; then
    # Modo interactivo
    while true; do
        show_menu
        read -p "Selecciona una opción: " choice
        execute_command $choice
    done
else
    # Modo comando directo
    execute_command $1
fi
