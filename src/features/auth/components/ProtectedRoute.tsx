import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { can } from "@/lib/roles";
import type { RoleName } from "@/types";
import PageLoader from "@/components/ui/PageLoader";

interface ProtectedRouteProps {
  /** When set, the user needs at least one of these roles (SuperAdmins always pass). */
  roles?: RoleName[];
}

export default function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  if (roles && roles.length && !can(user, ...roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
