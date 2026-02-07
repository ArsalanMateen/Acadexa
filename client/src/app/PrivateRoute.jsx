import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/session/auth-helper";

export default function PrivateRoute({ children, instructorOnly = false }) {
  const location = useLocation();
  const authState = useAuth();

  if (!authState) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (instructorOnly && !authState.user.instructor) {
    return <Navigate to="/" replace />;
  }

  return children;
}
