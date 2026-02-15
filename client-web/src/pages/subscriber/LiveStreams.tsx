import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { liveService } from "../../services/liveService";
import { accessService } from "../../services/accessService";
import { userService } from "../../services/userService";
import { paymentService } from "../../services/paymentService";
import { useEffect, useState } from "react";
import { getErrorMessage } from "../../lib/api";

interface StreamWithAccess {
  stream: any;
  hasAccess: boolean;
  creatorName?: string;
}

export function LiveStreams() {
  const navigate = useNavigate();
  const [streamsWithAccess, setStreamsWithAccess] = useState<
    StreamWithAccess[]
  >([]);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [purchasingCreatorId, setPurchasingCreatorId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");

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
        ]
      : liveService.getActiveStreams,
    refetchInterval: isDev ? false : 10000,
  });

  useEffect(() => {
    const checkAccess = async () => {
      if (!streams || streams.length === 0) {
        setStreamsWithAccess([]);
        setIsCheckingAccess(false);
        return;
      }

      setIsCheckingAccess(true);
      const results: StreamWithAccess[] = [];

      for (const stream of streams) {
        try {
          const accessCheck = await accessService.validateAccess(
            stream.creatorId,
          );
          const creatorProfile = await userService.getCreatorProfile(
            stream.creatorId,
          );

          results.push({
            stream,
            hasAccess: accessCheck.hasAccess,
            creatorName: creatorProfile.displayName,
          });
        } catch (err) {
          results.push({
            stream,
            hasAccess: false,
          });
        }
      }

      setStreamsWithAccess(results);
      setIsCheckingAccess(false);
    };

    checkAccess();
  }, [streams]);

  const handleBuyAccess = async (e: React.MouseEvent, creatorId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setPurchasingCreatorId(creatorId);
      setError("");
      const session = await paymentService.createCheckout({
        creatorId,
        customAmount: 999,
        durationDays: 30,
      });
      window.location.href = session.url;
    } catch (err) {
      setError(getErrorMessage(err));
      setPurchasingCreatorId(null);
    }
  };

  if (isLoading || isCheckingAccess) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live streams...</p>
        </div>
      </div>
    );
  }

  const accessibleStreams = streamsWithAccess.filter((s) => s.hasAccess);
  const lockedStreams = streamsWithAccess.filter((s) => !s.hasAccess);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
        <p className="text-gray-600">
          Watch live music streams from creators you have access to
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Accessible Streams */}
      {accessibleStreams.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">🎵 Your Live Streams</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessibleStreams.map(({ stream, creatorName }) => (
              <div
                key={stream.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/live/${stream.id}`)}
              >
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🎵</div>
                      <div className="text-sm font-semibold">LIVE NOW</div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    LIVE
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    👥 {stream.viewerCount}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                    {stream.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{creatorName}</p>
                  {stream.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {stream.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Click to watch</span>
                    {stream.recordingEnabled && <span>📹 Recording</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Streams */}
      {lockedStreams.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">🔒 Get Access to Watch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lockedStreams.map(({ stream, creatorName }) => (
              <div
                key={stream.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <div className="aspect-video bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-4xl mb-2">🔒</div>
                      <div className="text-sm font-semibold">LOCKED</div>
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    LIVE
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                    {stream.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{creatorName}</p>
                  <div className="space-y-2">
                    <button
                      onClick={(e) => handleBuyAccess(e, stream.creatorId)}
                      disabled={purchasingCreatorId === stream.creatorId}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {purchasingCreatorId === stream.creatorId
                        ? "Processing..."
                        : "Buy Access - $9.99"}
                    </button>
                    <Link
                      to={`/creator/${stream.creatorId}`}
                      className="block text-center text-sm text-blue-600 hover:underline"
                    >
                      View creator profile
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Streams */}
      {streamsWithAccess.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎵</div>
          <p className="text-gray-600 mb-4 text-lg">
            No live streams at the moment
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Check back later or discover new creators
          </p>
          <Link
            to="/discover"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Discover Creators
          </Link>
        </div>
      )}

      {/* No Access Message */}
      {accessibleStreams.length === 0 && lockedStreams.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">
            Get access to watch live streams
          </h3>
          <p className="text-blue-800 text-sm">
            Redeem an access code from a creator to watch their live streams.
            Visit their profile to get started.
          </p>
        </div>
      )}
    </div>
  );
}
