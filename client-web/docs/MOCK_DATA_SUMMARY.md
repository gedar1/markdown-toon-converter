# Mock Data Summary - Modo Desarrollo

## Resumen

Todas las páginas del frontend ahora tienen datos mock (simulados) cuando `VITE_DEV_MODE=true`. Esto permite ver y probar la UI completa sin necesidad de backend o autenticación.

## Páginas con Mock Data

### ✅ Creator Dashboard (`/creator/dashboard`)

**Mock Profile:**

- Display Name: "Dev Creator"
- Genre: "Electronic"
- Subscribers: 42
- Total Streams: 156

**Mock Content (3 tracks):**

1. Summer Vibes Mix - 234 plays
2. Deep House Session - 189 plays
3. Techno Beats - 567 plays

**Mock Analytics:**

- Total Streams: 156
- Total Duration: 45,600 seconds
- Total Bytes: 1 GB

### ✅ Go Live (`/creator/live`)

**Mock Streams (2):**

1. **Live Stream:**
   - Title: "Friday Night Mix"
   - Status: Live
   - Viewers: 42
   - Stream Key: `sk_dev_abc123xyz789`
   - RTMP URL: `rtmps://live.example.com/app`

2. **Scheduled Stream:**
   - Title: "Sunday Chill Session"
   - Status: Scheduled
   - Scheduled for: Tomorrow

**Funcionalidad:**

- Crear nuevos streams (solo en memoria)
- Ver detalles de RTMP y Stream Key
- Copiar al portapapeles funciona
- Terminar/eliminar streams

### ✅ Live Streams (`/live`)

**Mock Streams (3):**

1. **Friday Night Deep House**
   - Viewers: 42
   - Recording: Yes
   - Started: 1 hour ago

2. **Techno Madness**
   - Viewers: 127
   - Recording: No
   - Started: 30 minutes ago

3. **Chill Lofi Beats**
   - Viewers: 89
   - Recording: Yes
   - Started: 2 hours ago

**Funcionalidad:**

- Grid de cards responsive
- Click para ir al reproductor
- Auto-refresh desactivado en dev mode

### ✅ Live Player (`/live/:streamId`)

**Mock Stream:**

- Title: "Friday Night Deep House"
- Description: "Live DJ set with the best deep house tracks..."
- Viewers: 42
- Peak Viewers: 58
- Total Views: 150
- Recording: Yes

**Mock Stats:**

- Viewer Count: 42
- Peak Viewers: 58
- Total Views: 150
- Average Watch Time: 20 minutes

**Funcionalidad:**

- Reproductor simulado (muestra mensaje de dev mode)
- Estadísticas en tiempo real (mock)
- Join/Leave automático (simulado)
- Botón de volver funcional

### ✅ Content Library (`/creator/content`)

- Usa los mismos 3 tracks del Dashboard
- Grid de cards con información
- Botones de editar/eliminar (simulados)

### ✅ Content Upload (`/creator/content/upload`)

- Formulario funcional
- Drag & drop simulado
- Validación de archivos
- Progress bar simulado

## Cómo Funciona

### 1. Detección de Modo Dev

```typescript
const isDev = import.meta.env.VITE_DEV_MODE === "true";
```

### 2. Datos Mock en Queries

```typescript
const { data } = useQuery({
  queryKey: ["myData"],
  queryFn: isDev
    ? async () => mockData // Retorna datos simulados
    : () => apiService.getData(), // Llama al backend real
});
```

### 3. Mutations Simuladas

```typescript
const mutation = useMutation({
  mutationFn: isDev
    ? async (data) => ({ ...data, id: "mock-id" }) // Simula respuesta
    : apiService.create, // Llama al backend real
});
```

## Ventajas

✅ Ver todas las páginas sin backend  
✅ Probar navegación completa  
✅ Validar estilos y diseño  
✅ Testear responsive design  
✅ Revisar flujos de usuario  
✅ Desarrollo rápido de UI  
✅ No requiere base de datos  
✅ No requiere autenticación

## Limitaciones

⚠️ Los datos no persisten (solo en memoria)  
⚠️ El reproductor de video no funciona (no hay stream real)  
⚠️ Las mutaciones no afectan el backend  
⚠️ No hay validación de permisos real  
⚠️ Auto-refresh desactivado en algunas páginas

## Activar/Desactivar

### Activar

```env
# client-web/.env
VITE_DEV_MODE=true
VITE_DEV_USER_TYPE=creator
```

### Desactivar

```env
# client-web/.env
VITE_DEV_MODE=false
```

## Cambiar Vista

### Ver como Creator

```env
VITE_DEV_USER_TYPE=creator
```

Acceso a: Dashboard, Content, Go Live

### Ver como Subscriber

```env
VITE_DEV_USER_TYPE=subscriber
```

Acceso a: Discover, Live Streams, Live Player

## Indicador Visual

Cuando el modo dev está activo, verás un badge amarillo en la navegación:

```
DEV MODE: creator
```

## Próximos Pasos

Para conectar con el backend real:

1. Configurar PostgreSQL
2. Ejecutar migraciones de Prisma
3. Iniciar backend: `cd app-music && npm run dev`
4. Cambiar `VITE_DEV_MODE=false`
5. Registrar un usuario real
6. Login y usar la aplicación normalmente
