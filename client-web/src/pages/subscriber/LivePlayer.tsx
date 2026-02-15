import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import Hls from "hls.js";
import { liveService } from "../../services/liveService";

export function LivePlayer() {
  const { streamId } = useParams<{ streamId: string }>();
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);

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

  // Audio visualization
  const setupAudioVisualization = () => {
    if (!audioRef.current || !canvasRef.current) return;

    try {
      const audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      drawVisualization();
    } catch (err) {
      console.error("Audio visualization setup failed:", err);
    }
  };

  const drawVisualization = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(15, 23, 42)"; // slate-900
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height * 0.8;

        // Gradient from blue to purple
        const gradient = ctx.createLinearGradient(
          0,
          canvas.height - barHeight,
          0,
          canvas.height,
        );
        gradient.addColorStop(0, "#3b82f6"); // blue-500
        gradient.addColorStop(1, "#8b5cf6"); // purple-500

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  };

  useEffect(() => {
    if (!stream || !access?.hasAccess || !audioRef.current) return;

    // In dev mode, skip HLS setup
    if (isDev) {
      joinMutation.mutate();
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(stream.playbackUrl);
      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Don't autoplay, wait for user interaction
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError("Error al cargar el stream");
        }
      });

      hlsRef.current = hls;
      joinMutation.mutate();

      return () => {
        hls.destroy();
        if (hasJoined) {
          leaveMutation.mutate();
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else if (audioRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      audioRef.current.src = stream.playbackUrl;
      joinMutation.mutate();
    } else {
      setError("Tu navegador no soporta HLS");
    }
  }, [stream, access]);

  const handlePlayPause = async () => {
    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setError(null);

        // Setup visualization on first play
        if (!audioContextRef.current) {
          setupAudioVisualization();
        }
      } catch (err) {
        console.error("Play failed:", err);
        setError("Error al reproducir");
      }
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

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

      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg shadow-2xl overflow-hidden">
        {/* Audio Visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-64 md:h-80"
          />

          {/* Live Badge Overlay */}
          <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            EN VIVO
          </div>

          {/* Viewer Count */}
          <div className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
            <span>👥</span>
            <span className="font-semibold">
              {stats?.viewerCount || stream.viewerCount}
            </span>
          </div>

          {/* Play Button Overlay (when not playing) */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
              <button
                onClick={handlePlayPause}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
              >
                <svg
                  className="w-10 h-10 text-slate-900 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Stream Info & Controls */}
        <div className="p-6 bg-slate-900 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {stream.title}
              </h1>
              {stream.description && (
                <p className="text-slate-300 text-sm md:text-base">
                  {stream.description}
                </p>
              )}
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              {isPlaying ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-3 flex-1 max-w-xs">
              <svg
                className="w-5 h-5 text-slate-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #334155 ${volume * 100}%, #334155 100%)`,
                }}
              />
              <span className="text-sm text-slate-400 w-12 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-700">
            <div>
              <p className="text-xs text-slate-400 mb-1">Oyentes</p>
              <p className="text-lg font-semibold">
                {stats?.viewerCount || stream.viewerCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Pico</p>
              <p className="text-lg font-semibold">
                {stats?.peakViewers || stream.maxViewers}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Vistas</p>
              <p className="text-lg font-semibold">{stats?.totalViews || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Inicio</p>
              <p className="text-lg font-semibold">
                {stream.startedAt
                  ? new Date(stream.startedAt).toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "--:--"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-700 rounded-lg text-yellow-200 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setError("Error al cargar el audio")}
        />
      </div>

      {/* Chat Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Chat en Vivo</h2>
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
          <div className="text-4xl mb-2">💬</div>
          <p>Chat próximamente...</p>
        </div>
      </div>
    </div>
  );
}
