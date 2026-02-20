# Script para configurar la base de datos en Windows

Write-Host "🗄️  Configurando Base de Datos..." -ForegroundColor Cyan

# Paso 1: Instalar dependencias
Write-Host "`n1️⃣  Instalando dependencias..." -ForegroundColor Yellow
npm install

# Paso 2: Aplicar migraciones
Write-Host "`n2️⃣  Aplicando migraciones..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# Paso 3: Generar cliente Prisma
Write-Host "`n3️⃣  Generando cliente Prisma..." -ForegroundColor Yellow
npx prisma generate

# Paso 4: Verificar
Write-Host "`n4️⃣  Verificando base de datos..." -ForegroundColor Yellow
npx prisma db execute --stdin < $null

Write-Host "`n✅ Base de datos configurada correctamente!" -ForegroundColor Green
Write-Host "`n🚀 Ahora ejecuta: npm run dev" -ForegroundColor Cyan
