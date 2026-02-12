import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: "creator" | "subscriber";
}

export function ProtectedRoute({
  children,
  requiredUserType,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  // Development mode bypass
  const isDev = import.meta.env.VITE_DEV_MODE === "true";
  const devUserType = import.meta.env.VITE_DEV_USER_TYPE || "creator";

  if (isDev) {
    // In dev mode, bypass authentication and use dev user type
    if (requiredUserType && devUserType !== requiredUserType) {
      // Still respect route user type requirements in dev mode
      return <Navigate to="/" replace />;
    }
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && user?.userType !== requiredUserType) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
