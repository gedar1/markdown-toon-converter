import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { userService } from "../../services/userService";
import type { CreatorProfile } from "../../types";
import { getErrorMessage } from "../../lib/api";

export function Discover() {
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      const response = await userService.listCreators({ page: 1, limit: 20 });
      setCreators(response.data);
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
      setCreators(results);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
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
          Find and support your favorite music creators
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
          <Link
            key={creator.id}
            to={`/creator/${creator.id}`}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
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
            <div className="flex justify-between text-sm text-gray-500">
              <span>{creator.subscriberCount} subscribers</span>
              <span>{creator.totalStreams} streams</span>
            </div>
          </Link>
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
