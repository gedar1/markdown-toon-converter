# Modo Desarrollo - Bypass de Autenticación

## Descripción

El modo desarrollo permite ver y probar todas las páginas del frontend sin necesidad de autenticarse. Esto es útil para:

- Validar estilos y diseño
- Probar la interfaz de usuario
- Desarrollo rápido sin backend
- Revisar componentes visuales

## Cómo Activar

### 1. Editar el archivo `.env`

```env
# Development Mode (skip authentication for UI testing)
VITE_DEV_MODE=true
VITE_DEV_USER_TYPE=creator
```

### 2. Reiniciar el servidor de desarrollo

```bash
# Detener el servidor (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

## Configuración

### `VITE_DEV_MODE`

- `true` - Activa el modo desarrollo (bypass de autenticación)
- `false` - Modo normal (requiere autenticación)

### `VITE_DEV_USER_TYPE`

- `creator` - Muestra las páginas y navegación de creator
- `subscriber` - Muestra las páginas y navegación de subscriber

## Ejemplos de Uso

### Ver páginas de Creator

```env
VITE_DEV_MODE=true
VITE_DEV_USER_TYPE=creator
```

Páginas accesibles:

- `/creator/dashboard` - Dashboard del creator
- `/creator/content` - Biblioteca de contenido
- `/creator/content/upload` - Subir contenido
- `/creator/live` - Transmisión en vivo

### Ver páginas de Subscriber

```env
VITE_DEV_MODE=true
VITE_DEV_USER_TYPE=subscriber
```

Páginas accesibles:

- `/discover` - Descubrir creators
- `/live` - Transmisiones en vivo
- `/live/:streamId` - Reproductor de stream

## Indicador Visual

Cuando el modo desarrollo está activo, verás un badge amarillo en la navegación:

```
DEV MODE: creator
```

Esto te recuerda que estás en modo desarrollo.

## Navegación Directa

Con el modo desarrollo activo, puedes navegar directamente a cualquier URL:

```
http://localhost:5173/creator/dashboard
http://localhost:5173/creator/live
http://localhost:5173/live
http://localhost:5173/discover
```

## Limitaciones

- Las llamadas API fallarán si el backend no está corriendo
- **Los datos son simulados (mock data)** - verás datos de ejemplo en todas las páginas
- Los formularios funcionarán pero no guardarán datos reales
- El reproductor de video mostrará un mensaje de "modo desarrollo"
- Es solo para validación visual y de UI

## Datos Mock Disponibles

En modo desarrollo, verás datos de ejemplo en todas las páginas:

### Creator Dashboard

- 3 tracks de ejemplo con plays y fechas
- Estadísticas simuladas (subscribers, streams, plays)
- Perfil de creator de ejemplo

### Go Live (Creator)

- 1 stream en vivo simulado
- 1 stream programado simulado
- Puedes crear nuevos streams (solo en memoria)
- RTMP URL y Stream Key de ejemplo

### Live Streams (Subscriber)

- 3 transmisiones en vivo simuladas
- Diferentes géneros y viewer counts
- Cards clickeables que llevan al reproductor

### Live Player (Subscriber)

- Stream simulado con título y descripción
- Estadísticas en tiempo real (mock)
- Mensaje de "modo desarrollo" en el reproductor

## Desactivar Modo Desarrollo

Para volver al modo normal:

```env
VITE_DEV_MODE=false
```

O simplemente comenta la línea:

```env
# VITE_DEV_MODE=true
```

## Notas de Seguridad

⚠️ **IMPORTANTE**:

- Este modo es SOLO para desarrollo local
- NUNCA despliegues con `VITE_DEV_MODE=true` en producción
- El archivo `.env` no debe incluirse en el repositorio (está en `.gitignore`)

## Troubleshooting

### Los cambios no se aplican

- Asegúrate de reiniciar el servidor de desarrollo
- Verifica que el archivo `.env` esté en la raíz de `client-web/`
- Las variables deben empezar con `VITE_`

### Sigo viendo la página de login

- Verifica que `VITE_DEV_MODE=true` (sin espacios)
- Reinicia el servidor completamente
- Limpia la caché del navegador (Ctrl+Shift+R)

### No veo el badge "DEV MODE"

- El badge solo aparece cuando `VITE_DEV_MODE=true`
- Verifica la consola del navegador por errores
