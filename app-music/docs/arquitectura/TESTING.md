# Guía de Pruebas en Desarrollo

## Probar el Flujo de Acceso Completo

### Método 1: Script Automatizado (Recomendado)

```bash
# Asegúrate de que el backend esté corriendo
cd app-music
npm run dev

# En otra terminal, ejecuta el script
node scripts/test-access-flow.js
```

Este script:

- ✅ Registra un creator
- ✅ Genera un código de acceso
- ✅ Registra un subscriber
- ✅ Canjea el código
- ✅ Valida el acceso

### Método 2: Interfaz Web Manual

#### Paso 1: Crear Creator

1. Abre http://localhost:5173/register
2. Registra un usuario como **Creator**:
   - Email: `creator@test.com`
   - Password: `Test123!`
   - Display Name: `Test Creator`

#### Paso 2: Subir Contenido (Opcional)

1. Login como creator
2. Ve a "My Content" → "Upload Content"
3. Sube un archivo de audio

#### Paso 3: Generar Código de Acceso

**Opción A: Usando cURL**

```bash
# Login como creator
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "creator@test.com",
    "password": "Test123!"
  }'

# Copia el token y userId de la respuesta

# Generar código
curl -X POST http://localhost:3000/access/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "creatorId": "<CREATOR_USER_ID>",
    "paymentId": "test-payment-123",
    "amount": 999,
    "currency": "USD",
    "durationDays": 30
  }'

# Copia el código generado (ej: "ABC123XYZ")
```

**Opción B: Usando Postman/Thunder Client**

- Importa la colección de endpoints
- Ejecuta el request "Generate Access Code"

#### Paso 4: Crear Subscriber

1. Logout del creator
2. Ve a http://localhost:5173/register
3. Registra un usuario como **Subscriber**:
   - Email: `subscriber@test.com`
   - Password: `Test123!`
   - Display Name: `Test Subscriber`

#### Paso 5: Descubrir y Canjear Código

1. Login como subscriber
2. Ve a "Discover" → Busca al creator
3. Click en el perfil del creator
4. En el formulario "Redeem Access Code", ingresa el código
5. Click "Redeem Code"

#### Paso 6: Verificar Acceso

1. Deberías ver el mensaje "✓ You have access to this creator's content"
2. Verás la biblioteca de contenido del creator
3. Ve a "My Library" para ver todo tu contenido

### Método 3: Usando Prisma Studio

```bash
cd app-music
npx prisma studio
```

Puedes:

- Ver todos los usuarios registrados
- Ver códigos de acceso generados
- Ver grants activos
- Modificar datos manualmente para pruebas

### Método 4: SQL Directo

```bash
# Conectarse a PostgreSQL
docker exec -it <postgres-container> psql -U postgres -d music_platform

# Ver creators
SELECT id, email, "userType" FROM "User" WHERE "userType" = 'creator';

# Ver códigos de acceso
SELECT code, "creatorId", "isRedeemed", "isValid" FROM "AccessCode";

# Ver grants activos
SELECT * FROM "AccessGrant" WHERE "isActive" = true;

# Generar código manualmente (para pruebas rápidas)
INSERT INTO "AccessCode" (
  id, code, "creatorId", "paymentId", amount, currency,
  "durationDays", "isRedeemed", "isValid", "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid(),
  'TEST123',
  '<creator-user-id>',
  'manual-test',
  999,
  'USD',
  30,
  false,
  true,
  NOW(),
  NOW()
);
```

## Probar Streaming de Audio

### Requisitos

1. Tener contenido subido
2. Tener acceso al creator (código canjeado)

### Pasos

1. Login como subscriber
2. Ve a "My Library"
3. Click en cualquier canción
4. Deberías ver el reproductor de audio
5. Click en Play

**Nota:** El streaming HLS requiere que el archivo de audio esté segmentado. Si ves errores, verifica:

- El archivo de audio existe en `uploads/audio/`
- El formato es compatible (MP3, WAV, FLAC)

## Endpoints Útiles para Testing

```bash
# Health check
GET http://localhost:3000/

# Listar creators
GET http://localhost:3000/creators

# Buscar creators
GET http://localhost:3000/creators/search?q=test

# Ver contenido de un creator (requiere acceso)
GET http://localhost:3000/content/creator/:creatorId
Authorization: Bearer <subscriber-token>

# Validar acceso
GET http://localhost:3000/access/validate/:creatorId
Authorization: Bearer <subscriber-token>

# Mis grants
GET http://localhost:3000/access/my-grants
Authorization: Bearer <subscriber-token>
```

## Troubleshooting

### "Access code not found"

- Verifica que el código esté en mayúsculas
- Verifica que el código exista en la base de datos
- Verifica que `isValid = true`

### "Access code has already been redeemed"

- Los códigos son de un solo uso
- Genera un nuevo código

### "You already have active access to this creator"

- Ya tienes acceso activo
- No necesitas canjear otro código

### "Content not found"

- El creator no ha subido contenido
- Verifica que el contenido exista en la base de datos

### "Failed to load audio stream"

- Verifica que el archivo de audio exista
- Verifica que el formato sea compatible
- Revisa los logs del backend

## Variables de Entorno para Testing

```env
# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/music_platform"
JWT_SECRET="dev-secret-key-change-in-production"
UPLOAD_DIR="uploads"

# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_DEV_MODE=false
```

## Datos de Prueba Recomendados

### Creators

- creator1@test.com / Test123!
- creator2@test.com / Test123!

### Subscribers

- subscriber1@test.com / Test123!
- subscriber2@test.com / Test123!

### Códigos de Acceso

- Genera códigos únicos para cada prueba
- Usa `paymentId` descriptivos: `test-payment-1`, `test-payment-2`
