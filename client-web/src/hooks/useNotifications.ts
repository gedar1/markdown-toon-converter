import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

// ============================================
// Types matching backend notification.types.ts
// ============================================

export interface StreamStartedPayload {
  streamId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description?: string;
  playbackUrl: string;
  startedAt: string;
}

export interface StreamEndedPayload {
  streamId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  endedAt: string;
  duration: number;
}

export interface ViewerCountPayload {
  streamId: string;
  viewerCount: number;
  maxViewers: number;
}

export interface LiveNotification {
  id: string;
  type: 'stream:started' | 'stream:ended';
  payload: StreamStartedPayload | StreamEndedPayload;
  timestamp: Date;
}

// ============================================
// Hook
// ============================================

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useNotifications() {
  const socketRef = useRef<Socket | null>(null);
  const { token, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Generate unique id for each notification
  const generateId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Clear a specific notification
  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Watch a specific stream (for viewer count updates)
  const watchStream = useCallback((streamId: string) => {
    socketRef.current?.emit('stream:watch', streamId);
  }, []);

  // Stop watching a stream
  const unwatchStream = useCallback((streamId: string) => {
    socketRef.current?.emit('stream:unwatch', streamId);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect if not authenticated
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to Socket.IO
    const socket = io(API_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('[Notifications] Connected to Socket.IO');
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      console.log('[Notifications] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Notifications] Connection error:', error.message);
    });

    // Listen for stream started events
    socket.on('stream:started', (payload: StreamStartedPayload) => {
      console.log('[Notifications] Stream started:', payload);
      setNotifications((prev) => [
        ...prev,
        {
          id: generateId(),
          type: 'stream:started',
          payload,
          timestamp: new Date(),
        },
      ]);
    });

    // Listen for stream ended events
    socket.on('stream:ended', (payload: StreamEndedPayload) => {
      console.log('[Notifications] Stream ended:', payload);
      setNotifications((prev) => [
        ...prev,
        {
          id: generateId(),
          type: 'stream:ended',
          payload,
          timestamp: new Date(),
        },
      ]);
    });

    // Cleanup on unmount or token change
    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, token, generateId]);

  return {
    notifications,
    isConnected,
    clearNotification,
    clearAllNotifications,
    watchStream,
    unwatchStream,
  };
}
