import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, user, profile, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  // Development mode
  const isDev = import.meta.env.VITE_DEV_MODE === "true";
  const devUserType = import.meta.env.VITE_DEV_USER_TYPE || "creator";

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  // Use dev user type if in dev mode
  const effectiveUserType = isDev ? devUserType : user?.userType;
  const effectiveIsAuthenticated = isDev ? true : isAuthenticated;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600">
                  🎵 DJ App
                </span>
              </Link>

              {effectiveIsAuthenticated && (
                <div className="ml-10 flex items-center space-x-4">
                  {effectiveUserType === "creator" ? (
                    <>
                      <Link
                        to="/creator/dashboard"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/creator/content"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Content
                      </Link>
                      <Link
                        to="/creator/live"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        🔴 Go Live
                      </Link>
                      <Link
                        to="/creator/subscribers"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Subscribers
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/live"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        🔴 Live Streams
                      </Link>
                      <Link
                        to="/discover"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Discover
                      </Link>
                      <Link
                        to="/library"
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Library
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center">
              {effectiveIsAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {isDev && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      DEV MODE: {devUserType}
                    </span>
                  )}
                  <span className="text-sm text-gray-700">
                    {profile && "displayName" in profile
                      ? profile.displayName
                      : isDev
                        ? `Dev ${devUserType}`
                        : user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Music Streaming Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
