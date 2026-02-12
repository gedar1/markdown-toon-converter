import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { contentService } from "../../services/contentService";
import { streamingService } from "../../services/streamingService";
import type { Content, CreatorProfile } from "../../types";
import { getErrorMessage } from "../../lib/api";

export function CreatorDashboard() {
  const { profile } = useAuthStore();

  // Development mode mock data
  const isDev = import.meta.env.VITE_DEV_MODE === "true";
  const mockProfile: CreatorProfile = {
    id: "dev-creator-id",
    userId: "dev-user-id",
    displayName: "Dev Creator",
    bio: "This is a development profile for testing",
    avatarUrl: null,
    genre: "Electronic",
    subscriberCount: 42,
    totalStreams: 156,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const creatorProfile = (isDev ? mockProfile : profile) as CreatorProfile;

  const [content, setContent] = useState<Content[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalStreams: number;
    totalDuration: number;
    totalBytes: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // In dev mode, use mock data
    if (isDev) {
      setContent([
        {
          id: "1",
          creatorId: "dev-creator-id",
          title: "Summer Vibes Mix",
          description: "A chill summer mix",
          audioUrl: "/mock/audio1.mp3",
          coverUrl: null,
          duration: 180,
          format: "mp3",
          fileSize: 5242880,
          playCount: 234,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "2",
          creatorId: "dev-creator-id",
          title: "Deep House Session",
          description: "Late night deep house",
          audioUrl: "/mock/audio2.mp3",
          coverUrl: null,
          duration: 240,
          format: "mp3",
          fileSize: 7340032,
          playCount: 189,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          updatedAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: "3",
          creatorId: "dev-creator-id",
          title: "Techno Beats",
          description: "High energy techno",
          audioUrl: "/mock/audio3.mp3",
          coverUrl: null,
          duration: 300,
          format: "wav",
          fileSize: 10485760,
          playCount: 567,
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          updatedAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ]);
      setAnalytics({
        totalStreams: 156,
        totalDuration: 45600,
        totalBytes: 1073741824,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [contentData, analyticsData] = await Promise.all([
        contentService.getCreatorLibrary(creatorProfile.id),
        streamingService.getCreatorAnalytics(creatorProfile.id),
      ]);
      setContent(contentData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
        <Link
          to="/creator/content/upload"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Upload Content
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Content</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {content.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Subscribers</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {creatorProfile.subscriberCount}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Streams</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {analytics?.totalStreams || creatorProfile.totalStreams}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm font-medium text-gray-600">Total Plays</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {content.reduce((sum, c) => sum + c.playCount, 0)}
          </p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Profile</h2>
          <Link
            to="/creator/profile"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Edit Profile
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Display Name:</span>{" "}
            {creatorProfile.displayName}
          </p>
          {creatorProfile.genre && (
            <p className="text-gray-700">
              <span className="font-medium">Genre:</span> {creatorProfile.genre}
            </p>
          )}
          {creatorProfile.bio && (
            <p className="text-gray-700">
              <span className="font-medium">Bio:</span> {creatorProfile.bio}
            </p>
          )}
        </div>
      </div>

      {/* Recent Content */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Content</h2>
            <Link
              to="/creator/content"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="p-6">
          {content.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">
                You haven't uploaded any content yet
              </p>
              <Link
                to="/creator/content/upload"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Upload Your First Track
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {content.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">
                      {item.playCount} plays • {item.format.toUpperCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
