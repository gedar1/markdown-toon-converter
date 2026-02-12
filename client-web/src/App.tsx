import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "./store/authStore";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { CreatorDashboard } from "./pages/creator/Dashboard";
import { ContentUpload } from "./pages/creator/ContentUpload";
import { ContentLibrary } from "./pages/creator/ContentLibrary";
import { GoLive } from "./pages/creator/GoLive";
import { Discover } from "./pages/subscriber/Discover";
import { LiveStreams } from "./pages/subscriber/LiveStreams";
import { LivePlayer } from "./pages/subscriber/LivePlayer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { initAuth, isAuthenticated, user } = useAuthStore();

  // Development mode
  const isDev = import.meta.env.VITE_DEV_MODE === "true";
  const devUserType = import.meta.env.VITE_DEV_USER_TYPE || "creator";

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Use dev settings if in dev mode
  const effectiveIsAuthenticated = isDev ? true : isAuthenticated;
  const effectiveUserType = isDev ? devUserType : user?.userType;

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Layout>
          <Routes>
            {/* Public routes */}
            <Route
              path="/login"
              element={
                effectiveIsAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Login />
                )
              }
            />
            <Route
              path="/register"
              element={
                effectiveIsAuthenticated ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register />
                )
              }
            />

            {/* Home redirect */}
            <Route
              path="/"
              element={
                effectiveIsAuthenticated ? (
                  effectiveUserType === "creator" ? (
                    <Navigate to="/creator/dashboard" replace />
                  ) : (
                    <Navigate to="/discover" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Creator routes */}
            <Route
              path="/creator/dashboard"
              element={
                <ProtectedRoute requiredUserType="creator">
                  <CreatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/content"
              element={
                <ProtectedRoute requiredUserType="creator">
                  <ContentLibrary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/content/upload"
              element={
                <ProtectedRoute requiredUserType="creator">
                  <ContentUpload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/creator/live"
              element={
                <ProtectedRoute requiredUserType="creator">
                  <GoLive />
                </ProtectedRoute>
              }
            />

            {/* Subscriber routes */}
            <Route
              path="/discover"
              element={
                <ProtectedRoute requiredUserType="subscriber">
                  <Discover />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live"
              element={
                <ProtectedRoute requiredUserType="subscriber">
                  <LiveStreams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/live/:streamId"
              element={
                <ProtectedRoute requiredUserType="subscriber">
                  <LivePlayer />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
