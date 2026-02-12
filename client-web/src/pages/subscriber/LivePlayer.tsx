import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Hls from "hls.js";
import { liveService } from "../../services/liveService";

export function LivePlayer() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Development mode
  const isDev = import.meta.env.VITE_DEV_MODE === "true";

  const { data: stream, isLoading } = useQuery({
    queryKey: ["stream", streamId],
    queryFn: isDev
      ? async () => ({
          id: streamId!,
          creatorId: "creator-1",
          title: "Friday Night Deep House",
          description:
            "Live DJ set with the best deep house tracks from around the world",
          scheduledFor: null,
          status: "live" as const,
          streamKey: "sk_hidden",
          rtmpUrl: "rtmps://live.example.com/app",
          playbackUrl: "https://stream.example.com/live/stream1.m3u8",
          viewerCount: 42,
          maxViewers: 58,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          endedAt: null,
          duration: 3600,
          recordingEnabled: true,
          recordingUrl: null,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date().toISOString(),
        })
      : () => liveService.getStream(streamId!),
    enabled: !!streamId,
  });

  const { data: access } = useQuery({
    queryKey: ["streamAccess", streamId],
    queryFn: isDev
      ? async () => ({ hasAccess: true })
      : () => liveService.checkAccess(streamId!),
    enabled: !!streamId,
  });

  const { data: stats } = useQuery({
    queryKey: ["streamStats", streamId],
    queryFn: isDev
      ? async () => ({
          streamId: streamId!,
          viewerCount: 42,
          peakViewers: 58,
          totalViews: 150,
          averageWatchTime: 1200,
          startedAt: new Date(Date.now() - 3600000).toISOString(),
          endedAt: null,
        })
      : () => liveService.getStreamStats(streamId!),
    enabled: !!streamId && hasJoined,
    refetchInterval: isDev ? false : 5000,
  });

  const joinMutation = useMutation({
    mutationFn: isDev
      ? async () => {}
      : () => liveService.joinStream(streamId!),
    onSuccess: () => {
      setHasJoined(true);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: isDev
      ? async () => {}
      : () => liveService.leaveStream(streamId!),
  });

  useEffect(() => {
    if (!stream || !access?.hasAccess || !videoRef.current) return;

    // In dev mode, skip HLS setup since we don't have a real stream
    if (isDev) {
      joinMutation.mutate();
      setError("Modo desarrollo: reproductor simulado");
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(stream.playbackUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current?.play().catch((err) => {
          console.error("Autoplay failed:", err);
          setError("Click para reproducir");
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError("Error al cargar el stream");
        }
      });

      hlsRef.current = hls;

      // Join stream
      joinMutation.mutate();

      return () => {
        hls.destroy();
        if (hasJoined) {
          leaveMutation.mutate();
        }
      };
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = stream.playbackUrl;
      videoRef.current.play().catch((err) => {
        console.error("Autoplay failed:", err);
        setError("Click para reproducir");
      });

      joinMutation.mutate();
    } else {
      setError("Tu navegador no soporta HLS");
    }
  }, [stream, access]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Cargando stream...</div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Stream no encontrado</div>
      </div>
    );
  }

  if (access && !access.hasAccess) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
          <p className="text-gray-600 mb-6">
            Necesitas canjear un código de acceso para ver esta transmisión
          </p>
          <button
            onClick={() => navigate("/discover")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Ir a Descubrir
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => navigate("/live")}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        ← Volver a transmisiones
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Video Player */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full aspect-video"
            controls
            playsInline
            onClick={() => {
              if (error === "Click para reproducir") {
                videoRef.current?.play();
                setError(null);
              }
            }}
          />
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white">
              {error}
            </div>
          )}
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            EN VIVO
          </div>
        </div>

        {/* Stream Info */}
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-2">{stream.title}</h1>
          {stream.description && (
            <p className="text-gray-600 mb-4">{stream.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>👥</span>
              <span>{stats?.viewerCount || stream.viewerCount} viewers</span>
            </div>
            {stats && (
              <>
                <div className="flex items-center gap-2">
                  <span>📊</span>
                  <span>Pico: {stats.peakViewers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👁️</span>
                  <span>Total: {stats.totalViews}</span>
                </div>
              </>
            )}
            {stream.recordingEnabled && (
              <div className="flex items-center gap-2">
                <span>📹</span>
                <span>Grabando</span>
              </div>
            )}
          </div>

          {stream.startedAt && (
            <div className="mt-4 text-sm text-gray-500">
              Inició:{" "}
              {new Date(stream.startedAt).toLocaleString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat placeholder */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Chat en Vivo</h2>
        <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
          Chat próximamente...
        </div>
      </div>
    </div>
  );
}
