import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SuspensionScreen from "../components/SuspensionScreen";

const ProtectedRoute = ({ children }) => {
  const { user, loadingUser } = useAuth();

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex flex-col items-center justify-center gap-6 overflow-hidden relative">
        {/* Background dynamic blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>

        <div className="relative flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-4 border-red-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-white/5 border-b-transparent rounded-full animate-spin-slow"></div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-white font-black tracking-[0.2em] text-xl uppercase animate-pulse">Bromichat</h2>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-1">Sincronizando señal...</p>
          </div>
        </div>
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
