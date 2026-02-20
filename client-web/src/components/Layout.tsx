import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ThemeToggle } from "./ThemeToggle";

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
    <div id="layout" className="min-h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-200">
      {/* Navigation */}
      <nav id="layout-nav" className="bg-white dark:bg-zinc-800 shadow-sm border-b border-gray-100 dark:border-zinc-700">
        <div id="layout-nav-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div id="layout-nav-content" className="flex justify-between h-16">
            <div id="layout-nav-content-left" className="flex">
              <Link to="/" className="flex items-center">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  🎵 DJ App
                </span>
              </Link>

              {effectiveIsAuthenticated && (
                <div id="layout-nav-content-links" className="ml-10 flex items-center space-x-4">
                  {effectiveUserType === "creator" ? (
                    <>
                      <Link
                        to="/creator/dashboard"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/creator/content"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Content
                      </Link>
                      <Link
                        to="/creator/live"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        🔴 Go Live
                      </Link>
                      <Link
                        to="/creator/subscribers"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Subscribers
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/live"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        🔴 Live Streams
                      </Link>
                      <Link
                        to="/discover"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Discover
                      </Link>
                      <Link
                        to="/library"
                        className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Library
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div id="layout-nav-content-right" className="flex items-center gap-4">
              <ThemeToggle />
              
              {effectiveIsAuthenticated ? (
                <div id="layout-nav-content-right-auth" className="flex items-center space-x-4">
                  {isDev && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      DEV MODE: {devUserType}
                    </span>
                  )}
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {profile && "displayName" in profile
                      ? profile.displayName
                      : isDev
                        ? `Dev ${devUserType}`
                        : user?.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div id="layout-nav-content-right-guest" className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
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
      <main id="layout-main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer id="layout-footer" className="bg-white dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700 mt-auto">
        <div id="layout-footer-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p id="layout-footer-text" className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © 2024 Music Streaming Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
