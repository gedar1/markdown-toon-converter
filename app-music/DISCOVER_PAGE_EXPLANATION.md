# Discover Page - How It Works

## Overview

La página Discover muestra TODOS los creadores registrados en la plataforma, independientemente de si están transmitiendo o no.

## What Subscribers See

### All Creators Are Shown

✅ Creadores que están transmitiendo EN VIVO
✅ Creadores con transmisiones programadas
✅ Creadores sin transmisiones activas o programadas
✅ Creadores nuevos sin contenido

**No hay filtrado** - todos los creadores son visibles para descubrimiento.

## Visual Indicators

### 1. LIVE Badge (Red, Animated)

```
🔴 LIVE
```

- Aparece cuando el creador está transmitiendo AHORA
- Badge rojo con animación de pulso
- Prioridad máxima en la visualización

### 2. Scheduled Stream Info (Blue Box)

```
┌─────────────────────────┐
│ 📅 Friday Night Mix     │
│ In 2 days               │
└─────────────────────────┘
```

- Aparece cuando el creador tiene una transmisión programada
- Solo se muestra si NO está en vivo actualmente
- Muestra título y tiempo hasta el inicio
- Permite anticipar la compra

### 3. No Indicators

- Creador sin transmisiones activas o programadas
- Aún así visible y accesible
- Puede tener contenido archivado
- Subscribers pueden comprar acceso anticipado

## Example Cards

### Creator Live Now

```
┌─────────────────────────────┐
│ 🎵 DJ Mike          🔴 LIVE │
│ Electronic                  │
│                             │
│ Great electronic music...   │
│                             │
│ 42 subscribers • 15 streams │
│ [Buy Access - $9.99]        │
└─────────────────────────────┘
```

### Creator with Scheduled Stream

```
┌─────────────────────────────┐
│ 🎵 DJ Sarah                 │
│ House                       │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📅 Friday Night Mix     │ │
│ │ Jan 15, 8:00 PM         │ │
│ └─────────────────────────┘ │
│                             │
│ 42 subscribers • 15 streams │
│ [Buy Access - $9.99]        │
└─────────────────────────────┘
```

### Creator with No Active/Scheduled Streams

```
┌─────────────────────────────┐
│ 🎵 DJ Alex                  │
│ Techno                      │
│                             │
│ Techno beats and more...    │
│                             │
│ 42 subscribers • 15 streams │
│ [Buy Access - $9.99]        │
└─────────────────────────────┘
```

## Benefits for Subscribers

### Discovery

- ✅ See all available creators
- ✅ Find new artists to follow
- ✅ Browse by genre, popularity
- ✅ No FOMO - all creators visible

### Anticipation

- ✅ See upcoming streams
- ✅ Plan ahead for favorite artists
- ✅ Buy access before stream starts
- ✅ Never miss a scheduled stream

### Flexibility

- ✅ Buy access anytime
- ✅ Access to all creator's streams (past, present, future)
- ✅ One payment = full access
- ✅ 30 days of unlimited streaming

## Benefits for Creators

### Visibility

- ✅ Always discoverable
- ✅ Not hidden when offline
- ✅ Scheduled streams promote future content
- ✅ Build audience even when not streaming

### Revenue

- ✅ Advance sales for scheduled streams
- ✅ Subscribers can buy access anytime
- ✅ Not limited to live streaming times
- ✅ Passive income from archived content

### Marketing

- ✅ Scheduled streams act as announcements
- ✅ Creates anticipation and buzz
- ✅ Professional presentation
- ✅ Builds subscriber base

## Data Flow

```typescript
// 1. Load all creators
const creators = await userService.listCreators()
// Returns: { data: CreatorProfile[], total, page, limit }

// 2. Get live streams (for badges)
const liveStreams = await liveService.getActiveStreams()
// Returns: LiveStream[] (only currently live)

// 3. Get scheduled streams (for info boxes)
const scheduledStreams = await liveService.getScheduledStreams()
// Returns: LiveStream[] (only future scheduled)

// 4. Combine data
creators.map(creator => ({
  ...creator,
  isLive: liveStreams.some(s => s.creatorId === creator.id),
  nextScheduledStream: scheduledStreams
    .filter(s => s.creatorId === creator.id)
    .sort(by date)[0] // earliest
}))
```

## API Endpoints Used

### GET /creators

- Returns all creators (paginated)
- No filtering by live status
- Includes profile info, stats, bio

### GET /live/streams/active

- Returns only currently live streams
- Used for LIVE badges
- Real-time status

### GET /live/streams/scheduled

- Returns only future scheduled streams
- Used for scheduled info boxes
- Filtered by scheduledFor >= now

## Search Functionality

### How Search Works

1. User types in search box
2. Searches by: name, genre, bio
3. Returns matching creators
4. Same indicators applied (LIVE, scheduled)
5. No filtering by stream status

### Search Results

- Shows ALL matching creators
- Not limited to live or scheduled
- Maintains same visual indicators
- Consistent UX with browse view

## Edge Cases

### New Creator (No Streams Yet)

- ✅ Still visible in Discover
- ✅ Can be found via search
- ✅ Subscribers can buy access
- ✅ Builds audience before first stream

### Creator on Break

- ✅ Still visible in Discover
- ✅ No LIVE or scheduled indicators
- ✅ Subscribers can access archived content
- ✅ Can schedule comeback stream

### Creator with Only Archived Content

- ✅ Visible in Discover
- ✅ Subscribers can buy access
- ✅ Access to content library
- ✅ Notified when creator goes live (future)

## Technical Details

### State Management

```typescript
const [creators, setCreators] = useState<CreatorWithLiveStatus[]>([]);
// Initialized as empty array (not undefined)
// Prevents "Cannot read properties of undefined" errors
```

### Error Handling

```typescript
// Graceful degradation
const liveStreams = await liveService.getActiveStreams().catch(() => []);
const scheduledStreams = await liveService.getScheduledStreams().catch(() => []);

// If API fails, shows creators without indicators
// Better than showing nothing
```

### Performance

- Loads all data in parallel
- Caches results (React Query)
- Efficient filtering and sorting
- Minimal re-renders

## User Experience Goals

### For Subscribers

1. **Discovery** - Find all creators easily
2. **Transparency** - See what's happening and what's coming
3. **Flexibility** - Buy access anytime
4. **No FOMO** - Never miss a creator or stream

### For Creators

1. **Visibility** - Always discoverable
2. **Marketing** - Promote scheduled streams
3. **Revenue** - Sell access 24/7
4. **Growth** - Build audience continuously

## Comparison with Other Platforms

### Traditional Streaming (Twitch, YouTube Live)

- Only shows creators who are LIVE
- Offline creators hidden
- Hard to discover new creators
- FOMO if you miss a stream

### Our Platform

- ✅ Shows ALL creators always
- ✅ Scheduled streams visible
- ✅ Easy discovery
- ✅ Buy access anytime
- ✅ No FOMO

## Future Enhancements

### Phase 2

- [ ] Filter by "Live Now"
- [ ] Filter by "Has Scheduled Streams"
- [ ] Sort by "Next Stream Time"
- [ ] Follow/Subscribe to creators
- [ ] Notifications for scheduled streams

### Phase 3

- [ ] Personalized recommendations
- [ ] "Creators You Might Like"
- [ ] Genre-based discovery
- [ ] Trending creators
- [ ] New creators spotlight

## Summary

**Key Point**: La página Discover muestra TODOS los creadores, no solo los que están transmitiendo. Esto permite:

1. ✅ Mejor descubrimiento
2. ✅ Anticipación de transmisiones programadas
3. ✅ Compra anticipada de acceso
4. ✅ Visibilidad constante para creadores
5. ✅ Mejor experiencia de usuario

Los indicadores visuales (LIVE badge, scheduled info) ayudan a los subscribers a entender el estado de cada creador sin ocultar a nadie.
