import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useNotifications,
  type LiveNotification,
  type StreamStartedPayload,
} from '../hooks/useNotifications';

const AUTO_DISMISS_MS = 10000;

/**
 * NotificationToast
 *
 * Renders animated toast notifications when a creator goes live or ends a stream.
 * Auto-dismisses after 10 seconds. Clicking "Ver ahora" navigates to the live stream.
 */
export const NotificationToast = () => {
  const { notifications, clearNotification } = useNotifications();

  return (
    <div className="fixed top-2 right-2 left-2 z-[9999] flex flex-col gap-3 pointer-events-none w-full sm:top-4 sm:right-4 sm:left-auto sm:w-[400px]">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={clearNotification}
        />
      ))}
    </div>
  );
}

const Toast = ({
  notification,
  onDismiss,
}: {
  notification: LiveNotification;
  onDismiss: (id: string) => void;
}) => {
  const navigate = useNavigate();

  const handleDismiss = useCallback(() => {
    onDismiss(notification.id);
  }, [notification.id, onDismiss]);

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    const timer = setTimeout(handleDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [handleDismiss]);

  const isStreamStarted = notification.type === 'stream:started';
  const payload = notification.payload;

  const handleWatchNow = () => {
    if (isStreamStarted) {
      const startedPayload = payload as StreamStartedPayload;
      navigate(`/live/${startedPayload.streamId}`);
      handleDismiss();
    }
  };

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.08)] 
        animate-toast-slide-in pointer-events-auto transition-all duration-300
        ${isStreamStarted 
          ? 'bg-gradient-to-br from-red-500/15 to-red-600/10 border-l-[3px] border-red-500' 
          : 'bg-gradient-to-br from-gray-500/15 to-gray-600/10 border-l-[3px] border-gray-500'}
      `}
    >
      <div className={`
        shrink-0 flex items-center justify-center w-10 h-10 rounded-full
        ${isStreamStarted ? 'bg-red-500/20' : 'bg-gray-500/20'}
      `}>
        {isStreamStarted ? (
          <span className="inline-block w-3 h-3 rounded-full bg-red-500 animate-pulse-live" />
        ) : (
          <span className="text-xl">⏹</span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-white/95 whitespace-nowrap overflow-hidden text-ellipsis">
            {payload.creatorName}
          </span>
          <span className={`
            text-[0.7rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
            ${isStreamStarted 
              ? 'bg-red-500/30 text-red-300' 
              : 'bg-gray-500/30 text-gray-300'}
          `}>
            {isStreamStarted ? 'EN VIVO' : 'Finalizó'}
          </span>
        </div>
        <p className="text-[0.8125rem] text-white/70 m-0 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
          {payload.title}
        </p>
        {isStreamStarted && (
          <button
            className="bg-gradient-to-br from-red-500 to-red-600 text-white border-none py-1.5 px-3.5 rounded-lg text-[0.8125rem] font-semibold cursor-pointer transition-transform duration-150 hover:scale-[1.03] hover:shadow-[0_4px_12px_rgba(239,68,68,0.4)]"
            onClick={handleWatchNow}
          >
            ▶ Ver ahora
          </button>
        )}
      </div>

      <button
        className="shrink-0 bg-transparent border-none text-white/40 text-base cursor-pointer p-1 leading-none transition-colors duration-150 hover:text-white/80"
        onClick={handleDismiss}
        aria-label="Cerrar notificación"
      >
        ✕
      </button>
    </div>
  );
}
