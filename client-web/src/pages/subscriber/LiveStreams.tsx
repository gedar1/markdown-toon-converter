import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { liveService } from "../../services/liveService";

export function LiveStreams() {
  const navigate = useNavigate();

  // Development mode
  const isDev = import.meta.env.VITE_DEV_MODE === "true";

  const { data: streams, isLoading } = useQuery({
    queryKey: ["activeStreams"],
    queryFn: isDev
      ? async () => [
          {
            id: "stream-1",
            creatorId: "creator-1",
            title: "Friday Night Deep House",
            description: "Live DJ set with the best deep house tracks",
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
          },
          {
            id: "stream-2",
            creatorId: "creator-2",
            title: "Techno Madness",
            description: "High energy techno beats all night long",
            scheduledFor: null,
            status: "live" as const,
            streamKey: "sk_hidden",
            rtmpUrl: "rtmps://live.example.com/app",
            playbackUrl: "https://stream.example.com/live/stream2.m3u8",
            viewerCount: 127,
            maxViewers: 150,
            startedAt: new Date(Date.now() - 1800000).toISOString(),
            endedAt: null,
            duration: 1800,
            recordingEnabled: false,
            recordingUrl: null,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "stream-3",
            creatorId: "creator-3",
            title: "Chill Lofi Beats",
            description: "Relaxing lofi hip hop for studying and chilling",
            scheduledFor: null,
            status: "live" as const,
            streamKey: "sk_hidden",
            rtmpUrl: "rtmps://live.example.com/app",
            playbackUrl: "https://stream.example.com/live/stream3.m3u8",
            viewerCount: 89,
            maxViewers: 95,
            startedAt: new Date(Date.now() - 7200000).toISOString(),
            endedAt: null,
            duration: 7200,
            recordingEnabled: true,
            recordingUrl: null,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]
      : liveService.getActiveStreams,
    refetchInterval: isDev ? false : 10000, // Disable auto-refresh in dev mode
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">Cargando transmisiones...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Transmisiones en Vivo</h1>

      {streams && streams.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-600 mb-4">
            No hay transmisiones en vivo en este momento
          </p>
          <p className="text-sm text-gray-500">
            Vuelve más tarde para ver a tus creators favoritos
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams?.map((stream) => (
          <div
            key={stream.id}
            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/live/${stream.id}`)}
          >
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🎵</div>
                  <div className="text-sm font-semibold">EN VIVO</div>
                </div>
              </div>
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                EN VIVO
              </div>
              <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                👥 {stream.viewerCount}
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                {stream.title}
              </h3>
              {stream.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {stream.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Creator ID: {stream.creatorId.slice(0, 8)}...</span>
                {stream.recordingEnabled && <span>📹 Grabando</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
