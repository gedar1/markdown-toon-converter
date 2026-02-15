import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { userService } from "../../services/userService";
import { accessService } from "../../services/accessService";
import { contentService } from "../../services/contentService";
import { liveService } from "../../services/liveService";
import { paymentService } from "../../services/paymentService";
import type { CreatorProfile, Content, LiveStream } from "../../types";
import { getErrorMessage } from "../../lib/api";

export function CreatorProfile() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [liveStream, setLiveStream] = useState<LiveStream | null>(null);
  const [nextScheduledStream, setNextScheduledStream] =
    useState<LiveStream | null>(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (creatorId) {
      loadCreatorProfile();
      checkAccess();
    }
  }, [creatorId]);

  const loadCreatorProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await userService.getCreatorProfile(creatorId!);
      setCreator(profile);

      // Check if creator is live
      const activeStreams = await liveService
        .getActiveStreams()
        .catch(() => []);
      const creatorStream = activeStreams.find(
        (s) => s.creatorId === creatorId,
      );
      setLiveStream(creatorStream || null);

      // Check for next scheduled stream
      const scheduledStreams = await liveService
        .getScheduledStreams()
        .catch(() => []);
      const nextStream = scheduledStreams
        .filter((s) => s.creatorId === creatorId)
        .sort(
          (a, b) =>
            new Date(a.scheduledFor!).getTime() -
            new Date(b.scheduledFor!).getTime(),
        )[0];
      setNextScheduledStream(nextStream || null);

      // If has access, load content
      const accessCheck = await accessService.validateAccess(creatorId!);
      if (accessCheck.hasAccess) {
        const contentData = await contentService.getCreatorLibrary(creatorId!);
        setContent(contentData);
        setHasAccess(true);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = async () => {
    try {
      const result = await accessService.validateAccess(creatorId!);
      setHasAccess(result.hasAccess);
    } catch (err) {
      setHasAccess(false);
    }
  };

  const handleBuyAccess = async () => {
    try {
      setIsPurchasing(true);
      setError("");

      const session = await paymentService.createCheckout({
        creatorId: creatorId!,
        customAmount: 999, // $9.99
        durationDays: 30,
      });

      // Redirect to Stripe Checkout
      window.location.href = session.url;
    } catch (err) {
      setError(getErrorMessage(err));
      setIsPurchasing(false);
    }
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    try {
      setIsRedeeming(true);
      setError("");
      setSuccessMessage("");

      await accessService.redeemAccessCode(accessCode.trim().toUpperCase());
      setSuccessMessage("Access code redeemed successfully!");
      setAccessCode("");

      setTimeout(() => {
        loadCreatorProfile();
        setSuccessMessage("");
        setShowCodeInput(false);
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatScheduledDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 1) {
      return `In ${diffDays} days`;
    } else if (diffHours > 0) {
      return `In ${diffHours} hours`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins > 0 ? `In ${diffMins} minutes` : "Starting soon!";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading creator profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Creator not found</p>
        <Link
          to="/discover"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Creator Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 relative">
            <span className="text-4xl font-bold text-blue-600">
              {creator.displayName.charAt(0).toUpperCase()}
            </span>
            {liveStream && (
              <div className="absolute -top-2 -right-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                LIVE
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              {creator.displayName}
            </h1>
            {creator.genre && (
              <p className="text-lg text-gray-600 mt-1">{creator.genre}</p>
            )}
            {creator.bio && <p className="text-gray-700 mt-3">{creator.bio}</p>}
            <div className="flex gap-6 mt-4 text-sm text-gray-500">
              <span>{creator.subscriberCount} subscribers</span>
              <span>{creator.totalStreams} streams</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE Stream Alert - With Access */}
      {liveStream && hasAccess && (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-2xl font-bold">{liveStream.title}</h3>
                <p className="mt-1 opacity-90">
                  {liveStream.viewerCount} watching now
                </p>
              </div>
            </div>
            <Link
              to={`/live/${liveStream.id}`}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Watch Live →
            </Link>
          </div>
        </div>
      )}

      {/* LIVE Stream Alert - No Access */}
      {liveStream && !hasAccess && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="text-2xl font-bold">
                🔴 {creator.displayName} is LIVE!
              </h3>
              <p className="mt-1 opacity-90">{liveStream.title}</p>
            </div>
          </div>
          <p className="mb-4 text-lg">
            Get instant access to watch this live stream and all future streams
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleBuyAccess}
              disabled={isPurchasing}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isPurchasing ? "Processing..." : "Buy Access - $9.99/month"}
            </button>
            <button
              onClick={() => setShowCodeInput(true)}
              className="border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Have a code?
            </button>
          </div>
        </div>
      )}

      {/* Next Scheduled Stream - With Access */}
      {nextScheduledStream && hasAccess && !liveStream && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">📅</div>
            <div>
              <h3 className="text-xl font-bold">Upcoming Stream</h3>
              <p className="opacity-90">{nextScheduledStream.title}</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Scheduled for</p>
                <p className="font-bold text-lg">
                  {formatScheduledDate(nextScheduledStream.scheduledFor!)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Starts</p>
                <p className="font-bold text-lg">
                  {getTimeUntil(nextScheduledStream.scheduledFor!)}
                </p>
              </div>
            </div>
          </div>
          {nextScheduledStream.description && (
            <p className="mt-3 opacity-90">{nextScheduledStream.description}</p>
          )}
        </div>
      )}

      {/* Next Scheduled Stream - No Access */}
      {nextScheduledStream && !hasAccess && !liveStream && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-3xl">📅</div>
            <div>
              <h3 className="text-2xl font-bold">Upcoming Stream</h3>
              <p className="opacity-90">{nextScheduledStream.title}</p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-90">Scheduled for</p>
                <p className="font-bold text-lg">
                  {formatScheduledDate(nextScheduledStream.scheduledFor!)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Starts</p>
                <p className="font-bold text-lg">
                  {getTimeUntil(nextScheduledStream.scheduledFor!)}
                </p>
              </div>
            </div>
          </div>
          {nextScheduledStream.description && (
            <p className="mb-4 opacity-90">{nextScheduledStream.description}</p>
          )}
          <p className="mb-4 text-lg">
            Get access now to watch this stream and all future streams from{" "}
            {creator.displayName}
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleBuyAccess}
              disabled={isPurchasing}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isPurchasing ? "Processing..." : "Buy Access - $9.99/month"}
            </button>
            <button
              onClick={() => setShowCodeInput(true)}
              className="border-2 border-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Have a code?
            </button>
          </div>
        </div>
      )}

      {/* Access Status */}
      {hasAccess ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            ✓ You have access to this creator's live streams and content
          </p>
        </div>
      ) : !showCodeInput ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Get Access to Live Streams
          </h2>
          <p className="text-gray-600 mb-6">
            Subscribe to watch live streams and access exclusive content from{" "}
            {creator.displayName}
          </p>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎵</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">What you get:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Access to all live streams
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Exclusive content library
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    30 days of unlimited access
                  </li>
                </ul>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">$9.99</div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleBuyAccess}
              disabled={isPurchasing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              {isPurchasing ? "Processing..." : "Buy Access Now"}
            </button>
            <button
              onClick={() => setShowCodeInput(true)}
              className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 px-6 py-4 rounded-lg font-medium transition-colors"
            >
              Have a code?
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Redeem Access Code
          </h2>
          <p className="text-gray-600 mb-4">
            Enter your access code to unlock this creator's content
          </p>

          <form onSubmit={handleRedeemCode} className="space-y-4">
            <div>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter access code (e.g., ABC123)"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                maxLength={10}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isRedeeming || !accessCode.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
              >
                {isRedeeming ? "Redeeming..." : "Redeem Code"}
              </button>
              <button
                type="button"
                onClick={() => setShowCodeInput(false)}
                className="border-2 border-gray-300 px-6 py-2 rounded-md font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content Library */}
      {hasAccess && content.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Content Archive
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Recorded content and tracks from this creator
          </p>

          <div className="space-y-3">
            {content.map((item) => (
              <Link
                key={item.id}
                to={`/play/${item.id}`}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    {item.genre && <span>{item.genre}</span>}
                    {item.duration && (
                      <span>
                        {Math.floor(item.duration / 60)}:
                        {(item.duration % 60).toString().padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-blue-600">
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        to="/discover"
        className="inline-block text-blue-600 hover:underline"
      >
        ← Back to Discover
      </Link>
    </div>
  );
}
