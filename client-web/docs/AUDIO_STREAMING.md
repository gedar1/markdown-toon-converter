# Audio Streaming - Guía de Configuración

## Descripción General

La plataforma ahora está optimizada para streaming de audio en vivo tipo emisora de radio. El reproductor incluye visualización de audio en tiempo real y controles optimizados para música.

## Características del Reproductor

### 1. Visualización de Audio

- Analizador de frecuencias en tiempo real usando Web Audio API
- Visualización tipo espectro con gradiente azul-púrpura
- Canvas responsivo que se adapta al tamaño de pantalla

### 2. Controles de Reproducción

- Botón play/pause grande y accesible
- Control de volumen con slider visual
- Indicador de estado en vivo con animación
- Contador de oyentes en tiempo real

### 3. Estadísticas

- Oyentes actuales
- Pico de oyentes
- Total de vistas
- Hora de inicio

## Configuración en OBS Studio

### Para Streaming Solo de Audio:

1. **Abrir OBS Studio**

2. **Configurar Fuentes de Audio:**
   - Click en "+" en Sources
   - Agregar "Audio Input Capture" para micrófono
   - Agregar "Audio Output Capture" para audio del sistema
   - O agregar "Audio Input Capture" para interfaz de audio externa

3. **NO agregar fuentes de video:**
   - No agregues "Video Capture Device"
   - No agregues "Display Capture"
   - Solo mantén fuentes de audio

4. **Configurar Stream:**
   - Settings → Stream
   - Service: Custom
   - Server: [RTMP URL del backend]
   - Stream Key: [Tu stream key]

5. **Configuración de Audio (Recomendado):**
   - Settings → Audio
   - Sample Rate: 48 kHz
   - Channels: Stereo

6. **Configuración de Output:**
   - Settings → Output
   - Output Mode: Advanced
   - Streaming Tab:
     - Audio Encoder: AAC
     - Audio Bitrate: 128 kbps (o 192 kbps para mejor calidad)
     - No configurar video encoder

7. **Iniciar Stream:**
   - Click "Start Streaming"
   - El stream será solo audio

## Alternativas para Audio Streaming

### Opción 1: AWS IVS (Actual)

**Pros:**

- Ya configurado en el backend
- Soporta audio-only automáticamente
- Escalable y confiable
- HLS con baja latencia

**Contras:**

- Costo por hora de streaming
- Latencia de 3-5 segundos (HLS)

**Uso:**

```typescript
// El código actual ya soporta audio-only
// Solo necesitas no enviar video desde OBS
```

### Opción 2: Icecast/SHOUTcast

**Pros:**

- Diseñado específicamente para radio
- Menor latencia (1-2 segundos)
- Más económico
- Soporta múltiples formatos (MP3, AAC, Ogg)

**Contras:**

- Requiere servidor propio
- Más configuración inicial

**Implementación:**

```bash
# Instalar Icecast
sudo apt-get install icecast2

# Configurar en /etc/icecast2/icecast.xml
# Luego usar en OBS:
# Server: icecast://tu-servidor:8000/stream
```

### Opción 3: WebRTC

**Pros:**

- Latencia ultra baja (< 1 segundo)
- Ideal para interacción en tiempo real
- Peer-to-peer posible

**Contras:**

- Más complejo de implementar
- Requiere servidor TURN/STUN
- Escalabilidad limitada

## Configuración de Interfaz de Audio

### Para DJs con Mezcladora:

1. **Conectar Mezcladora:**
   - Conecta la salida de tu mezcladora a la interfaz de audio USB
   - O usa la salida de auriculares directamente a la entrada de línea de la PC

2. **En OBS:**
   - Agregar "Audio Input Capture"
   - Seleccionar tu interfaz de audio
   - Ajustar niveles para que no haya clipping (rojo)

3. **Monitoreo:**
   - Settings → Audio → Advanced
   - Monitoring Device: Tus auriculares
   - Esto te permite escuchar lo que estás transmitiendo

## Calidad de Audio Recomendada

### Para Música:

- **Bitrate:** 192 kbps (alta calidad) o 128 kbps (buena calidad)
- **Sample Rate:** 48 kHz
- **Codec:** AAC (mejor compresión que MP3)

### Para Voz/Podcast:

- **Bitrate:** 64-96 kbps
- **Sample Rate:** 44.1 kHz
- **Codec:** AAC

## Troubleshooting

### El audio suena distorsionado:

- Reducir el bitrate en OBS
- Verificar que no haya clipping (niveles en rojo)
- Ajustar ganancia en la mezcladora

### Latencia muy alta:

- Considerar cambiar a Icecast para menor latencia
- Verificar configuración de buffer en OBS

### No se escucha audio:

- Verificar que las fuentes de audio estén activas en OBS
- Revisar que el volumen no esté en mute
- Verificar permisos de micrófono en el navegador

## Próximas Mejoras

- [ ] Agregar chat en tiempo real
- [ ] Agregar sistema de solicitudes de canciones
- [ ] Agregar grabación automática
- [ ] Agregar estadísticas detalladas de oyentes
- [ ] Agregar programación de streams
- [ ] Agregar notificaciones push cuando un DJ va en vivo

## Recursos Adicionales

- [OBS Studio Documentation](https://obsproject.com/wiki/)
- [AWS IVS Documentation](https://docs.aws.amazon.com/ivs/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [HLS.js Documentation](https://github.com/video-dev/hls.js/)
