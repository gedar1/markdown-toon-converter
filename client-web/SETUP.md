# Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
cd client-web
npm install
```

This will install:

- React 19 + React DOM
- TypeScript
- Vite
- React Router v7
- Zustand (state management)
- Axios (HTTP client)
- TanStack Query (data fetching)
- Tailwind CSS (styling)
- HLS.js (audio streaming)

### 2. Configure Environment

```bash
# The .env file is already created with default values
# Edit if needed:
VITE_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at http://localhost:5173

### 4. Start Backend API

Make sure the backend is running:

```bash
cd ../app-music
npm run dev
```

Backend should be at http://localhost:3000

## What's Included

### ✅ Completed

1. **Project Setup**
   - Vite + React + TypeScript
   - Tailwind CSS configured
   - ESLint configured

2. **API Integration**
   - Axios client with interceptors
   - JWT token management
   - Error handling
   - All service layers created

3. **State Management**
   - Zustand store for authentication
   - Persistent auth (localStorage)

4. **Routing**
   - React Router v7
   - Protected routes
   - Role-based access control

5. **Authentication UI**
   - Login page
   - Registration page (Creator/Subscriber)
   - Auto-redirect based on role

6. **Creator Features**
   - Dashboard with stats
   - Profile display

7. **Subscriber Features**
   - Creator discovery page
   - Creator search

### 🚧 To Be Implemented

1. **Content Upload** (Task 16.3)
   - File upload form
   - Progress indicator
   - Validation

2. **Content Library**
   - List creator's content
   - Edit/delete content
   - Playlist management

3. **Audio Player** (Task 16.4)
   - HLS player with hls.js
   - Playback controls
   - Progress bar

4. **Access Code Redemption**
   - Redemption form
   - Access validation
   - My access list

5. **Additional Features**
   - Creator profile editing
   - Subscriber list for creators
   - Analytics dashboard
   - Notifications/toasts

## File Structure

```
src/
├── components/
│   ├── Layout.tsx              ✅ Navigation + footer
│   └── ProtectedRoute.tsx      ✅ Route protection
│
├── pages/
│   ├── Login.tsx               ✅ Login form
│   ├── Register.tsx            ✅ Registration form
│   ├── creator/
│   │   └── Dashboard.tsx       ✅ Creator dashboard
│   └── subscriber/
│       └── Discover.tsx        ✅ Creator discovery
│
├── services/
│   ├── authService.ts          ✅ Auth API calls
│   ├── contentService.ts       ✅ Content API calls
│   ├── userService.ts          ✅ User API calls
│   ├── accessService.ts        ✅ Access API calls
│   └── streamingService.ts     ✅ Streaming API calls
│
├── store/
│   └── authStore.ts            ✅ Auth state management
│
├── types/
│   └── index.ts                ✅ TypeScript types
│
├── lib/
│   └── api.ts                  ✅ Axios configuration
│
├── App.tsx                     ✅ Main app + routes
├── main.tsx                    ✅ Entry point
└── index.css                   ✅ Tailwind imports
```

## Testing the App

### 1. Register a Creator

1. Go to http://localhost:5173/register
2. Select "Share my music (Creator)"
3. Fill in the form
4. Submit

You'll be redirected to `/creator/dashboard`

### 2. Register a Subscriber

1. Go to http://localhost:5173/register
2. Select "Listen to music (Subscriber)"
3. Fill in the form
4. Submit

You'll be redirected to `/discover`

### 3. Test Login

1. Go to http://localhost:5173/login
2. Enter credentials
3. Submit

You'll be redirected based on your role.

## Common Issues

### Port Already in Use

If port 5173 is in use:

```bash
# Kill the process or change port in vite.config.ts
```

### API Connection Error

Make sure:

1. Backend is running on http://localhost:3000
2. CORS is enabled in backend
3. `.env` has correct `VITE_API_URL`

### Tailwind Not Working

```bash
# Reinstall dependencies
npm install
```

## Next Development Steps

1. **Implement Content Upload** (Priority 1)
   - Create upload form component
   - Handle file selection
   - Show upload progress
   - Handle success/error

2. **Implement Audio Player** (Priority 2)
   - Integrate hls.js
   - Create player component
   - Add playback controls

3. **Implement Access Code Redemption** (Priority 3)
   - Create redemption form
   - Validate codes
   - Show access list

## Development Tips

- Use React DevTools for debugging
- Check Network tab for API calls
- Use Zustand DevTools for state inspection
- Tailwind IntelliSense extension recommended
