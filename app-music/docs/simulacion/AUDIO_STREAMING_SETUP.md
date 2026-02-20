# 🎵 Guía: Simular Transmisión de Audio en Vivo

Esta guía te muestra cómo simular una transmisión de audio en vivo sin necesidad de OBS o Streamlabs.

## 🎯 Opciones Disponibles

### Opción 1: Subir Archivo de Audio (Más Simple)

- ✅ No requiere software adicional
- ✅ Funciona en cualquier navegador
- ✅ Perfecto para pruebas
- ❌ No es transmisión en vivo real

### Opción 2: Usar ffmpeg (Más Realista)

- ✅ Simula transmisión en vivo real
- ✅ Usa protocolo RTMP
- ❌ Requiere ffmpeg instalado
- ❌ Requiere servidor RTMP

### Opción 3: Usar OBS/Streamlabs (Más Profesional)

- ✅ Transmisión real en vivo
- ✅ Control total
- ❌ Requiere software adicional
- ❌ Más complejo de configurar

---

## 🚀 OPCIÓN 1: Subir Archivo de Audio (Recomendado para Pruebas)

### Paso 1: Preparar Archivo de Audio

Necesitas un archivo de audio en formato MP3, WAV, OGG, etc.

**Opción A: Usar un archivo existente**

- Descarga un archivo de audio de prueba
- Guárdalo en tu computadora

**Opción B: Crear un archivo de prueba con ffmpeg**

```bash
# Instalar ffmpeg (si no lo tienes)
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg

# Crear un archivo de audio de 60 segundos
ffmpeg -f lavfi -i sine=f=440:d=60 -q:a 9 -acodec libmp3lame test-audio.mp3
```

**Opción C: Descargar archivo de prueba**

```bash
# Descargar un archivo de prueba
curl -o test-audio.mp3 https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3
```

### Paso 2: Creator Sube el Archivo

1. Abre el dashboard del creator
2. Ve a **"Content Library"** o **"Upload Content"**
3. Haz clic en **"Upload"**
4. Selecciona el archivo `test-audio.mp3`
5. Completa los detalles:
   - **Title:** `Friday Night Electronic Mix`
   - **Description:** `Deep house and techno session`
   - **Genre:** `Electronic`
6. Haz clic en **"Upload"**

**Resultado esperado:**

- El archivo se sube al servidor
- Se genera una URL HLS
- El archivo aparece en la librería del creator

### Paso 3: Subscriber Reproduce el Audio

1. Ve a la página del creator
2. Haz clic en el archivo en **"Content Archive"**
3. Se abre el reproductor de audio
4. Haz clic en **"Play"**

**Resultado esperado:**

- El audio se reproduce
- Ves la barra de progreso
- Puedes controlar volumen y posición

---

## 🎬 OPCIÓN 2: Simular Transmisión en Vivo con ffmpeg

Esta opción simula una transmisión en vivo real usando RTMP.

### Paso 1: Instalar ffmpeg

**Windows:**

```bash
# Usando Chocolatey
choco install ffmpeg

# O descarga desde: https://ffmpeg.org/download.html
```

**macOS:**

```bash
brew install ffmpeg
```

**Linux:**

```bash
sudo apt-get install ffmpeg
```

### Paso 2: Crear Archivo de Audio de Prueba

```bash
# Crear un archivo de 5 minutos
ffmpeg -f lavfi -i sine=f=440:d=300 -q:a 9 -acodec libmp3lame test-stream.mp3

# O crear un archivo más interesante con múltiples tonos
ffmpeg -f lavfi -i sine=f=440:d=60 -f lavfi -i sine=f=880:d=60 \
  -filter_complex "[0][1]concat=n=5:v=0:a=1[out]" \
  -map "[out]" -q:a 9 -acodec libmp3lame test-stream.mp3
```

### Paso 3: Obtener Stream Key del Creator

1. En el dashboard del creator, ve a **"Go Live"**
2. Crea una transmisión programada
3. Copia el **"Stream Key"** (ej: `sk_live_abc123xyz`)
4. Copia la **"RTMP URL"** (ej: `rtmp://localhost:1935/live`)

### Paso 4: Transmitir con ffmpeg

```bash
# Transmitir el archivo de audio
ffmpeg -re -i test-stream.mp3 \
  -c:a aac \
  -b:a 128k \
  -f flv \
  rtmp://localhost:1935/live/sk_live_abc123xyz

# Explicación:
# -re: Lee el archivo a velocidad real
# -i: Archivo de entrada
# -c:a aac: Codec de audio (AAC)
# -b:a 128k: Bitrate de audio (128 kbps)
# -f flv: Formato de salida (FLV para RTMP)
# rtmp://...: URL de destino
```

**Resultado esperado:**

```
ffmpeg version 4.4.2 ...
Input #0, mp3, from 'test-stream.mp3':
  Duration: 00:05:00.00, start: 0.000000, bitrate: 128 kb/s
    Stream #0:0: Audio: mp3, 44100 Hz, stereo, fltp, 128 kb/s
Output #0, flv, to 'rtmp://localhost:1935/live/sk_live_abc123xyz':
  Stream #0:0: Audio: aac, 44100 Hz, stereo, fltp, 128 kb/s
frame=    0 fps=0.0 q=-1.0 Lsize=N/A time=00:00:00.00 bitrate=N/A speed=N/A
...
```

### Paso 5: Subscriber Ve la Transmisión en Vivo

1. Ve a la página del creator
2. Deberías ver el badge **"🔴 LIVE"**
3. Haz clic en **"Watch Live →"**
4. Se abre el reproductor
5. El audio se reproduce automáticamente

**Resultado esperado:**

- El audio se reproduce en vivo
- Ves el contador de viewers
- La duración aumenta en tiempo real

---

## 🎙️ OPCIÓN 3: Usar OBS (Open Broadcaster Software)

### Paso 1: Descargar e Instalar OBS

1. Ve a https://obsproject.com/
2. Descarga la versión para tu sistema operativo
3. Instala OBS

### Paso 2: Configurar OBS

1. Abre OBS
2. Ve a **Settings** → **Stream**
3. Configura:
   - **Service:** Custom
   - **Server:** `rtmp://localhost:1935/live`
   - **Stream Key:** (copia del dashboard del creator)

### Paso 3: Agregar Fuente de Audio

1. En OBS, ve a **Sources**
2. Haz clic en **"+"**
3. Selecciona **"Audio Input Capture"** o **"Media Source"**
4. Selecciona tu micrófono o archivo de audio

### Paso 4: Iniciar Transmisión

1. Haz clic en **"Start Streaming"**
2. OBS comenzará a transmitir

**Resultado esperado:**

- El estado cambia a "LIVE" en el dashboard
- Los subscribers pueden ver la transmisión
- El contador de viewers aumenta

---

## 📊 Comparación de Opciones

| Característica    | Opción 1      | Opción 2   | Opción 3        |
| ----------------- | ------------- | ---------- | --------------- |
| Complejidad       | ⭐ Muy simple | ⭐⭐ Media | ⭐⭐⭐ Compleja |
| Requiere software | ❌ No         | ✅ ffmpeg  | ✅ OBS          |
| Transmisión real  | ❌ No         | ✅ Sí      | ✅ Sí           |
| Tiempo de setup   | 2 min         | 5 min      | 10 min          |
| Ideal para        | Pruebas       | Desarrollo | Producción      |

---

## 🔧 Troubleshooting

### ❌ "ffmpeg: command not found"

**Problema:** ffmpeg no está instalado

**Solución:**

```bash
# Instalar ffmpeg
# Windows: choco install ffmpeg
# macOS: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg

# Verificar instalación
ffmpeg -version
```

### ❌ "Connection refused" en ffmpeg

**Problema:** No puede conectarse al servidor RTMP

**Solución:**

1. Verifica que el backend está corriendo
2. Verifica que el Stream Key es correcto
3. Verifica que la RTMP URL es correcta
4. Revisa los logs del backend

### ❌ "Stream not found" en el frontend

**Problema:** La transmisión no aparece en vivo

**Solución:**

1. Verifica que ffmpeg está transmitiendo
2. Verifica que el Stream Key es correcto
3. Actualiza la página del frontend
4. Revisa los logs del backend

### ❌ "Audio not playing"

**Problema:** El audio no se reproduce

**Solución:**

1. Verifica que el navegador soporta HLS
2. Abre la consola (F12) para ver errores
3. Verifica que el servidor de streaming está corriendo
4. Intenta en otro navegador

### ❌ "File upload failed"

**Problema:** No puedes subir el archivo de audio

**Solución:**

1. Verifica que el archivo es válido
2. Verifica que el tamaño no es muy grande
3. Verifica que el formato es soportado (MP3, WAV, OGG)
4. Revisa los logs del backend

---

## 📝 Formatos Soportados

### Audio

- MP3 (.mp3)
- WAV (.wav)
- OGG (.ogg)
- FLAC (.flac)
- AAC (.aac)

### Video (si aplica)

- MP4 (.mp4)
- WebM (.webm)
- MKV (.mkv)

---

## 🎯 Flujo Completo con ffmpeg

```bash
#!/bin/bash

# 1. Crear archivo de prueba
echo "1. Creando archivo de audio..."
ffmpeg -f lavfi -i sine=f=440:d=300 -q:a 9 -acodec libmp3lame test-stream.mp3

# 2. Obtener Stream Key (desde el dashboard del creator)
STREAM_KEY="sk_live_abc123xyz"  # Reemplaza con tu Stream Key

# 3. Transmitir
echo "2. Transmitiendo..."
ffmpeg -re -i test-stream.mp3 \
  -c:a aac \
  -b:a 128k \
  -f flv \
  rtmp://localhost:1935/live/$STREAM_KEY

echo "3. ¡Transmisión completada!"
```

---

## 💡 Tips

- **Prueba primero con Opción 1:** Es la más simple y no requiere software adicional
- **Usa ffmpeg para desarrollo:** Simula transmisiones reales sin OBS
- **Usa OBS para producción:** Control total y profesional
- **Monitorea los logs:** Revisa `app-music/logs/` para ver detalles
- **Prueba con múltiples subscribers:** Abre varias ventanas para simular múltiples viewers

---

## 🚀 Próximos Pasos

1. **Implementar chat en vivo:** Agregar mensajes durante la transmisión
2. **Grabar transmisiones:** Guardar las transmisiones para reproducción posterior
3. **Estadísticas:** Mostrar métricas de viewers y engagement
4. **Notificaciones:** Alertar a subscribers cuando una transmisión comienza
5. **Calidad adaptativa:** Ajustar calidad según ancho de banda

---

**¡Listo para transmitir audio en vivo!** 🎵🔴
