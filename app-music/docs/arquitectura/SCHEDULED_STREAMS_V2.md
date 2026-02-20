# Scheduled Streams V2 - Improved UX

## Changes from V1

### Problem with V1

- Separate Schedule page could become confusing with many creators
- Extra navigation step for subscribers
- Information scattered across multiple pages

### Solution in V2

- Show scheduled streams directly in creator cards (Discover page)
- Show next scheduled stream prominently in CreatorProfile
- Remove separate Schedule page
- Cleaner, more intuitive UX

## Implementation

### 1. Discover Page - Shows Next Scheduled Stream

**Location**: `client-web/src/pages/subscriber/Discover.tsx`

**Features**:

- Each creator card shows next scheduled stream (if any)
- Blue info box with stream title and time
- Only shows if creator is NOT currently live
- Time format: "In 2 days" or "Jan 15, 3:00 PM"

**UI Example**:

```
┌─────────────────────────────────┐
│ 🎵 DJ Mike                      │ 🔴 LIVE (if live)
│ Electronic                      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📅 Friday Night Mix         │ │
│ │ Jan 15, 8:00 PM             │ │
│ └─────────────────────────────┘ │
│                                 │
│ 42 subscribers  •  15 streams   │
│                                 │
│ [Buy Access - $9.99]            │
└─────────────────────────────────┘
```

### 2. CreatorProfile - Prominent Next Stream Display

**Location**: `client-web/src/pages/subscriber/CreatorProfile.tsx`

**Features**:

- Large gradient card showing next scheduled stream
- Shows date, time, and countdown
- Different display for users with/without access
- Includes stream description if available

**With Access**:

```
┌────────────────────────────────────────┐
│ 📅 Upcoming Stream                     │
│ Friday Night Mix                       │
│                                        │
│ Scheduled for: Fri, Jan 15, 8:00 PM   │
│ Starts: In 2 days                      │
│                                        │
│ Deep house music session...            │
└────────────────────────────────────────┘
```

**Without Access**:

```
┌────────────────────────────────────────┐
│ 📅 Upcoming Stream                     │
│ Friday Night Mix                       │
│                                        │
│ Scheduled for: Fri, Jan 15, 8:00 PM   │
│ Starts: In 2 days                      │
│                                        │
│ Get access now to watch this stream    │
│ and all future streams from DJ Mike    │
│                                        │
│ [Buy Access - $9.99/month]             │
│ [Have a code?]                         │
└────────────────────────────────────────┘
```

### 3. Removed Components

**Deleted**:

- `client-web/src/pages/subscriber/Schedule.tsx`
- Route `/schedule` from App.tsx
- "📅 Schedule" link from Layout navigation

**Reason**: Information now integrated into existing pages for better UX

## User Flow

### Subscriber Discovers Scheduled Stream

1. **Browse Discover Page**
   - Sees all creators
   - Creators with scheduled streams show info box
   - Can see when next stream is

2. **Click Creator Card**
   - Goes to CreatorProfile
   - Sees large prominent card with stream details
   - Can buy access directly

3. **Purchase Access**
   - Clicks "Buy Access"
   - Completes Stripe payment
   - Gets immediate access

4. **Wait for Stream**
   - Returns to profile to see countdown
   - Gets notified when stream starts (future feature)
   - Can watch when live

### Creator Schedules Stream

1. **Go to "Go Live"**
2. **Check "Programar para más tarde"**
3. **Select date/time**
4. **Click "Programar Transmisión"**
5. **Stream appears**:
   - In Discover cards for all subscribers
   - In CreatorProfile for visitors
   - In creator's own stream list

## API Integration

### Endpoints Used

1. **GET /live/streams/scheduled**
   - Returns all scheduled streams
   - Used in Discover to match with creators
   - Used in CreatorProfile to find next stream

2. **GET /creators**
   - Returns all creators
   - Combined with scheduled streams data

3. **GET /live/streams/active**
   - Returns live streams
   - Used to show LIVE badge

### Data Flow

```typescript
// Discover Page
const creators = await userService.listCreators();
const scheduledStreams = await liveService.getScheduledStreams();
const liveStreams = await liveService.getActiveStreams();

// Combine data
creators.map((creator) => ({
  ...creator,
  isLive: liveStreams.some((s) => s.creatorId === creator.id),
  nextScheduledStream: scheduledStreams
    .filter((s) => s.creatorId === creator.id)
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0],
}));
```

## Time Formatting

### Relative Time (Discover Cards)

- More than 24 hours: "Jan 15, 3:00 PM"
- Less than 24 hours: "In 5h"
- Less than 1 hour: "In 30m"
- Less than 1 minute: "Starting soon!"

### Absolute Time (CreatorProfile)

- Full format: "Fri, Jan 15, 3:00 PM"
- Countdown: "In 2 days" / "In 5 hours" / "In 30 minutes"

## Benefits

### For Subscribers

- ✅ See scheduled streams while browsing
- ✅ No extra navigation needed
- ✅ Clear call-to-action to buy access
- ✅ Better context (see stream info with creator info)
- ✅ Less overwhelming than separate schedule page

### For Creators

- ✅ Better visibility for scheduled streams
- ✅ Increased conversion (shown in discovery)
- ✅ Professional presentation
- ✅ Builds anticipation

### For Platform

- ✅ Cleaner UX
- ✅ Better conversion funnel
- ✅ Less page navigation
- ✅ More intuitive flow

## Files Modified

### Frontend

- ✅ `client-web/src/pages/subscriber/Discover.tsx` - Added next scheduled stream display
- ✅ `client-web/src/pages/subscriber/CreatorProfile.tsx` - Added prominent scheduled stream card
- ✅ `client-web/src/App.tsx` - Removed /schedule route
- ✅ `client-web/src/components/Layout.tsx` - Removed Schedule nav link
- ❌ `client-web/src/pages/subscriber/Schedule.tsx` - Deleted

### Backend

- No changes needed - API already supports scheduled streams

## Testing

### Test Scheduled Stream Display

1. **As Creator**:
   - Go to "Go Live"
   - Create scheduled stream for tomorrow
   - Verify it appears in your stream list

2. **As Subscriber**:
   - Go to Discover
   - Find creator with scheduled stream
   - Verify blue info box shows stream info
   - Click creator card
   - Verify large card shows stream details
   - Verify countdown is accurate

3. **Test Purchase Flow**:
   - Click "Buy Access" on scheduled stream
   - Complete payment
   - Return to creator profile
   - Verify scheduled stream card shows "You have access"

### Test Edge Cases

1. **Creator with multiple scheduled streams**:
   - Only shows NEXT (earliest) stream
   - Others hidden until that one passes

2. **Creator live + has scheduled stream**:
   - Shows LIVE alert (priority)
   - Scheduled stream hidden while live

3. **Creator with no scheduled streams**:
   - No info box in Discover
   - No scheduled card in profile
   - Normal display

## Migration Notes

### For Existing Users

- No data migration needed
- Existing scheduled streams automatically appear
- No breaking changes

### For Developers

- Remove any bookmarks to /schedule
- Update any documentation referencing Schedule page
- Test scheduled stream display in Discover

## Future Enhancements

### Phase 2

- [ ] Filter Discover by "Has upcoming streams"
- [ ] Sort by "Next stream time"
- [ ] Calendar view (optional, if requested)
- [ ] Email reminders for scheduled streams
- [ ] Push notifications when stream starts

### Phase 3

- [ ] Subscribe to creator's schedule
- [ ] Add to personal calendar (Google, iCal)
- [ ] Stream series (recurring events)
- [ ] Early bird pricing for scheduled streams

## Status

✅ **COMPLETED** - V2 implementation with improved UX
