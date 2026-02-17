import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SuspensionScreen from "../components/SuspensionScreen";

const ProtectedRoute = ({ children }) => {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isSuspended) {
    return <SuspensionScreen />;
  }

  return children;
};

export default ProtectedRoute;
