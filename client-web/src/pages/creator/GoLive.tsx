import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { liveService } from "../../services/liveService";
import type { LiveStream } from "../../types";

export function GoLive() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recordingEnabled, setRecordingEnabled] = useState(true);
  const [scheduledFor, setScheduledFor] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [createdStream, setCreatedStream] = useState<LiveStream | null>(null);

  // Development mode
  const isDev = import.meta.env.VITE_DEV_MODE === "true";

  const { data: myStreams, refetch } = useQuery({
    queryKey: ["myStreams"],
    queryFn: isDev
      ? async () => [
          {
            id: "stream-1",
            creatorId: "dev-creator-id",
            title: "Friday Night Mix",
            description: "Live DJ set",
            scheduledFor: null,
            status: "live" as const,
            streamKey: "sk_dev_abc123xyz789",
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
          },
          {
            id: "stream-2",
            creatorId: "dev-creator-id",
            title: "Sunday Chill Session",
            description: "Relaxing vibes",
            scheduledFor: new Date(Date.now() + 86400000).toISOString(),
            status: "scheduled" as const,
            streamKey: "sk_dev_def456uvw012",
            rtmpUrl: "rtmps://live.example.com/app",
            playbackUrl: "https://stream.example.com/live/stream2.m3u8",
            viewerCount: 0,
            maxViewers: 0,
            startedAt: null,
            endedAt: null,
            duration: 0,
            recordingEnabled: false,
            recordingUrl: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      : () => liveService.getMyStreams(),
  });

  const createMutation = useMutation({
    mutationFn: isDev
      ? async (data: {
          title: string;
          description?: string;
          scheduledFor?: string;
          recordingEnabled?: boolean;
        }) => ({
          id: `stream-${Date.now()}`,
          creatorId: "dev-creator-id",
          title: data.title,
          description: data.description || null,
          scheduledFor: null,
          status: "scheduled" as const,
          streamKey: `sk_dev_${Math.random().toString(36).substring(7)}`,
          rtmpUrl: "rtmps://live.example.com/app",
          playbackUrl: `https://stream.example.com/live/stream${Date.now()}.m3u8`,
          viewerCount: 0,
          maxViewers: 0,
          startedAt: null,
          endedAt: null,
          duration: 0,
          recordingEnabled: data.recordingEnabled || false,
          recordingUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      : liveService.createStream,
    onSuccess: (stream) => {
      setCreatedStream(stream);
      refetch();
    },
  });

  const endMutation = useMutation({
    mutationFn: isDev
      ? async (streamId: string) => ({
          id: streamId,
          creatorId: "dev-creator-id",
          title: "Ended Stream",
          description: null,
          scheduledFor: null,
          status: "ended" as const,
          streamKey: "sk_dev_ended",
          rtmpUrl: "rtmps://live.example.com/app",
          playbackUrl: "https://stream.example.com/live/ended.m3u8",
          viewerCount: 0,
          maxViewers: 42,
          startedAt: new Date(Date.now() - 7200000).toISOString(),
          endedAt: new Date().toISOString(),
          duration: 7200,
          recordingEnabled: true,
          recordingUrl: "https://recordings.example.com/stream.mp4",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          updatedAt: new Date().toISOString(),
        })
      : liveService.endStream,
    onSuccess: () => {
      setCreatedStream(null);
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: isDev ? async () => {} : liveService.deleteStream,
    onSuccess: () => {
      refetch();
    },
  });

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      description: description || undefined,
      scheduledFor: isScheduled && scheduledFor ? scheduledFor : undefined,
      recordingEnabled,
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const liveStreams =
    myStreams?.filter((s: LiveStream) => s.status === "live") || [];
  const scheduledStreams =
    myStreams?.filter((s: LiveStream) => s.status === "scheduled") || [];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Transmisión en Vivo</h1>

      {/* Create Stream Form */}
      {!createdStream && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Crear Nueva Transmisión
          </h2>
          <form onSubmit={handleCreateStream} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-white text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mi Set en Vivo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-white border text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describe tu transmisión..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="scheduled"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="scheduled" className="text-sm">
                Programar para más tarde
              </label>
            </div>

            {isScheduled && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-4 py-2 bg-white text-gray-900 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required={isScheduled}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Los subscribers podrán ver esta transmisión programada y
                  comprar acceso anticipado
                </p>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="recording"
                checked={recordingEnabled}
                onChange={(e) => setRecordingEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="recording" className="text-sm">
                Habilitar grabación
              </label>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400"
            >
              {createMutation.isPending
                ? "Creando..."
                : isScheduled
                  ? "Programar Transmisión"
                  : "Crear Transmisión"}
            </button>
          </form>
        </div>
      )}

      {/* Stream Details */}
      {createdStream && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{createdStream.title}</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm mt-2 ${
                  createdStream.status === "live"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {createdStream.status === "live" ? "🔴 EN VIVO" : "Programado"}
              </span>
            </div>
            <button
              onClick={() => endMutation.mutate(createdStream.id)}
              disabled={endMutation.isPending}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Terminar Stream
            </button>
          </div>

          <div className="space-y-4 mt-6">
            <div>
              <label className="block text-sm font-medium mb-2">RTMP URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createdStream.rtmpUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border text-zinc-800 rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(createdStream.rtmpUrl)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stream Key
              </label>
              <div className="flex gap-2">
                <input
                  type={showStreamKey ? "text" : "password"}
                  value={createdStream.streamKey}
                  readOnly
                  className="flex-1 px-4 py-2 text-zinc-800 border rounded-lg bg-gray-50"
                />
                <button
                  onClick={() => setShowStreamKey(!showStreamKey)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  {showStreamKey ? "Ocultar" : "Mostrar"}
                </button>
                <button
                  onClick={() => copyToClipboard(createdStream.streamKey)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Copiar
                </button>
              </div>
            </div>

            <div className="bg-blue-50 font text-zinc-800 border-blue-200 rounded-lg p-4 mt-6">
              <h3 className="font-semibold mb-2">
                Configuración de OBS Studio
              </h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Abre OBS Studio</li>
                <li>Ve a Settings → Stream</li>
                <li>Service: Custom</li>
                <li>Server: Pega el RTMP URL</li>
                <li>Stream Key: Pega el Stream Key</li>
                <li>Click "Start Streaming"</li>
              </ol>
            </div>

            {createdStream.status === "live" && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  👥 Viewers actuales: {createdStream.viewerCount}
                </p>
                <p className="text-green-800">
                  📊 Máximo de viewers: {createdStream.maxViewers}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Streams */}
      {liveStreams.length > 0 && !createdStream && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Transmisiones Activas</h2>
          <div className="space-y-4">
            {liveStreams.map((stream: LiveStream) => (
              <div
                key={stream.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{stream.title}</h3>
                  <p className="text-sm text-gray-600">
                    👥 {stream.viewerCount} viewers
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatedStream(stream)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => endMutation.mutate(stream.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Terminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled Streams */}
      {scheduledStreams.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Transmisiones Programadas
          </h2>
          <div className="space-y-4">
            {scheduledStreams.map((stream: LiveStream) => (
              <div
                key={stream.id}
                className="border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{stream.title}</h3>
                  <p className="text-sm text-gray-600">
                    {stream.scheduledFor
                      ? new Date(stream.scheduledFor).toLocaleString()
                      : "Sin programar"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreatedStream(stream)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Ver Detalles
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(stream.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
