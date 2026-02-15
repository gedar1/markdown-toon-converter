import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { accessService } from "../../services/accessService";
import { contentService } from "../../services/contentService";
import { userService } from "../../services/userService";
import type { Content } from "../../types";
import { getErrorMessage } from "../../lib/api";

interface CreatorWithContent {
  creatorId: string;
  creatorName: string;
  content: Content[];
}

export function MyLibrary() {
  const [library, setLibrary] = useState<CreatorWithContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      setIsLoading(true);

      // Get all access grants
      const grants = await accessService.getMyAccessGrants();

      // Load content for each creator
      const libraryData: CreatorWithContent[] = [];

      for (const grant of grants) {
        try {
          // Get creator profile for name
          const creatorProfile = await userService.getCreatorProfile(
            grant.creatorId,
          );
          const contentData = await contentService.getCreatorLibrary(
            grant.creatorId,
          );

          libraryData.push({
            creatorId: grant.creatorId,
            creatorName: creatorProfile.displayName,
            content: contentData,
          });
        } catch (err) {
          console.error(
            `Failed to load content for creator ${grant.creatorId}:`,
            err,
          );
        }
      }

      setLibrary(libraryData);
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
          <p className="mt-4 text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
        <p className="mt-2 text-gray-600">
          All content from creators you have access to
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {library.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">
            You don't have access to any content yet
          </p>
          <Link
            to="/discover"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium"
          >
            Discover Creators
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {library.map((creator) => (
            <div
              key={creator.creatorId}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {creator.creatorName}
                </h2>
                <Link
                  to={`/creator/${creator.creatorId}`}
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Profile
                </Link>
              </div>

              {creator.content.length === 0 ? (
                <p className="text-gray-500">No content available</p>
              ) : (
                <div className="space-y-3">
                  {creator.content.map((item) => (
                    <Link
                      key={item.id}
                      to={`/play/${item.id}`}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
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
                          {item.format && (
                            <span>{item.format.toUpperCase()}</span>
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
