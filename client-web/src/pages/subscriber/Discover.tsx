import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userService } from "../../services/userService";
import { liveService } from "../../services/liveService";
import { paymentService } from "../../services/paymentService";
import type { CreatorProfile } from "../../types";
import { getErrorMessage } from "../../lib/api";

interface CreatorWithLiveStatus extends CreatorProfile {
  isLive?: boolean;
  liveStreamId?: string;
  nextScheduledStream?: {
    id: string;
    title: string;
    scheduledFor: string;
  };
}

export function Discover() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CreatorWithLiveStatus[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchasingCreatorId, setPurchasingCreatorId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await userService.listCreators({ page: 1, limit: 20 });

      // Get live streams to check which creators are live
      const liveStreams = await liveService.getActiveStreams().catch(() => []);
      const liveCreatorIds = new Set(liveStreams.map((s) => s.creatorId));

      // Get scheduled streams
      const scheduledStreams = await liveService
        .getScheduledStreams()
        .catch(() => []);

      // response.data should be the array of creators
      const creatorsList = response.data || [];

      if (!Array.isArray(creatorsList)) {
        throw new Error("Invalid response from server");
      }

      // Add live status and next scheduled stream to creators
      const creatorsWithStatus = creatorsList.map((creator) => {
        const nextStream = scheduledStreams
          .filter((s) => s.creatorId === creator.userId)
          .sort(
            (a, b) =>
              new Date(a.scheduledFor!).getTime() -
              new Date(b.scheduledFor!).getTime(),
          )[0];

        return {
          ...creator,
          isLive: liveCreatorIds.has(creator.userId),
          liveStreamId: liveStreams.find((s) => s.creatorId === creator.userId)
            ?.id,
          nextScheduledStream: nextStream
            ? {
                id: nextStream.id,
                title: nextStream.title,
                scheduledFor: nextStream.scheduledFor!,
              }
            : undefined,
        };
      });

      setCreators(creatorsWithStatus);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadCreators();
      return;
    }

    try {
      setIsLoading(true);
      const results = await userService.searchCreators(searchQuery);

      // Get live streams
      const liveStreams = await liveService.getActiveStreams().catch(() => []);
      const liveCreatorIds = new Set(liveStreams.map((s) => s.creatorId));

      // Get scheduled streams
      const scheduledStreams = await liveService
        .getScheduledStreams()
        .catch(() => []);

      // Validate results
      if (!results || !Array.isArray(results)) {
        throw new Error("Invalid search results");
      }

      const resultsWithStatus = results.map((creator) => {
        const nextStream = scheduledStreams
          .filter((s) => s.creatorId === creator.userId)
          .sort(
            (a, b) =>
              new Date(a.scheduledFor!).getTime() -
              new Date(b.scheduledFor!).getTime(),
          )[0];

        return {
          ...creator,
          isLive: liveCreatorIds.has(creator.userId),
          liveStreamId: liveStreams.find((s) => s.creatorId === creator.userId)
            ?.id,
          nextScheduledStream: nextStream
            ? {
                id: nextStream.id,
                title: nextStream.title,
                scheduledFor: nextStream.scheduledFor!,
              }
            : undefined,
        };
      });

      setCreators(resultsWithStatus);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyAccess = async (e: React.MouseEvent, creatorId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setPurchasingCreatorId(creatorId);
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

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (diffHours > 0) {
      return `In ${diffHours}h`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins > 0 ? `In ${diffMins}m` : "Starting soon!";
    }
  };

  if (isLoading && creators.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creators...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Discover Creators</h1>
        <p className="mt-2 text-gray-600">
          Find creators and get access to their live streams
        </p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search creators..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creators.map((creator) => (
          <div
            key={creator.userId}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 relative"
          >
            {/* LIVE Badge */}
            {creator.isLive && (
              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 bg-white rounded-full"></span>
                LIVE
              </div>
            )}

            <Link to={`/creator/${creator.userId}`} className="block">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {creator.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">
                    {creator.displayName}
                  </h3>
                  {creator.genre && (
                    <p className="text-sm text-gray-500">{creator.genre}</p>
                  )}
                </div>
              </div>
              {creator.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {creator.bio}
                </p>
              )}

              {/* Next Scheduled Stream */}
              {creator.nextScheduledStream && !creator.isLive && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600">📅</span>
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 line-clamp-1">
                        {creator.nextScheduledStream.title}
                      </p>
                      <p className="text-blue-700 text-xs">
                        {formatScheduledDate(
                          creator.nextScheduledStream.scheduledFor,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between text-sm text-gray-500 mb-4">
                <span>{creator.subscriberCount} subscribers</span>
                <span>{creator.totalStreams} streams</span>
              </div>
            </Link>

            <button
              onClick={(e) => handleBuyAccess(e, creator.userId)}
              disabled={purchasingCreatorId === creator.userId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {purchasingCreatorId === creator.userId
                ? "Processing..."
                : "Buy Access - $9.99"}
            </button>
          </div>
        ))}
      </div>

      {creators.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No creators found</p>
        </div>
      )}
    </div>
  );
}
