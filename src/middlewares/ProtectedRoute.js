import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SuspensionScreen from "../components/SuspensionScreen";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isSuspended) {
    return <SuspensionScreen />;
  }

  return children;
};

export default ProtectedRoute;
