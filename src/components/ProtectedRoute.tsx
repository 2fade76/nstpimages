
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "editor" | "user";
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isAdmin, isEditor, isUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole) {
    if (requiredRole === "admin" && !isAdmin) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === "editor" && !isEditor) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === "user" && !isUser) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
