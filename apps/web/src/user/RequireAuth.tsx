import { useUserService } from "@teachersnet/user";
import { Navigate, useLocation } from "react-router-dom";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  let {isAuthenticated, isLoading} = useUserService();
  let location = useLocation();

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
