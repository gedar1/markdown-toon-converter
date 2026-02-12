# Music Streaming Platform - Web Client

React + TypeScript + Vite web application for the Music Streaming Platform.

## Features

- 🎵 User authentication (Login/Register)
- 👤 Creator and Subscriber roles
- 🎨 Modern UI with Tailwind CSS
- 🔄 State management with Zustand
- 🌐 API integration with Axios
- 🎯 Type-safe with TypeScript
- ⚡ Fast development with Vite

## Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **State Management:** Zustand
- **API Client:** Axios
- **Data Fetching:** TanStack Query (React Query)
- **Audio Streaming:** HLS.js

## Project Structure

```
client-web/
├── src/
│   ├── components/       # Reusable components
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/            # Page components
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── creator/      # Creator-specific pages
│   │   │   └── Dashboard.tsx
│   │   └── subscriber/   # Subscriber-specific pages
│   │       └── Discover.tsx
│   ├── services/         # API service layer
│   │   ├── authService.ts
│   │   ├── contentService.ts
│   │   ├── userService.ts
│   │   ├── accessService.ts
│   │   └── streamingService.ts
│   ├── store/            # Zustand stores
│   │   └── authStore.ts
│   ├── types/            # TypeScript types
│   │   └── index.ts
│   ├── lib/              # Utilities
│   │   └── api.ts        # Axios configuration
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env                  # Environment variables
├── .env.example          # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:3000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
# Copy .env.example to .env
copy .env.example .env

# Edit .env with your API URL
VITE_API_URL=http://localhost:3000
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Music Streaming Platform
VITE_APP_VERSION=1.0.0
```

## Features Implemented

### Authentication

- ✅ Login page
- ✅ Registration page (Creator/Subscriber)
- ✅ JWT token management
- ✅ Protected routes
- ✅ Auto-redirect based on user type

### Creator Features

- ✅ Dashboard with stats
- ✅ Profile management
- 🚧 Content upload (coming soon)
- 🚧 Content library (coming soon)
- 🚧 Subscriber list (coming soon)

### Subscriber Features

- ✅ Creator discovery
- ✅ Creator search
- 🚧 Access code redemption (coming soon)
- 🚧 Audio player with HLS (coming soon)
- 🚧 My access list (coming soon)

## API Integration

The app communicates with the backend API using Axios. All API calls are centralized in the `services/` directory:

- `authService.ts` - Authentication endpoints
- `contentService.ts` - Content management
- `userService.ts` - User profiles
- `accessService.ts` - Access control
- `streamingService.ts` - Audio streaming

## State Management

Uses Zustand for global state management:

- `authStore.ts` - Authentication state (user, token, profile)

## Routing

Protected routes ensure users can only access pages appropriate for their role:

- Public: `/login`, `/register`
- Creator: `/creator/dashboard`, `/creator/content`, `/creator/subscribers`
- Subscriber: `/discover`, `/my-access`

## Styling

Tailwind CSS is used for styling with a utility-first approach. Custom styles can be added in `index.css`.

## Next Steps

1. Implement content upload for creators
2. Add audio player with HLS support
3. Implement access code redemption
4. Add playlist management
5. Implement analytics dashboard
6. Add responsive design improvements
7. Add loading states and error handling
8. Implement file upload progress
9. Add toast notifications
10. Write E2E tests

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

Private - Music Streaming Platform
