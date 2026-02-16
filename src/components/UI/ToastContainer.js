import React from 'react';
import { useUI } from '../../context/UIContext';
import { CheckCircle, XCircle, AlertCircle, Info, Bell } from 'lucide-react';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import { useNavigate } from 'react-router-dom';

const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <XCircle className="text-red-500" size={20} />,
    warning: <AlertCircle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
};

const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    warning: 'bg-yellow-50 border-yellow-100',
    info: 'bg-blue-50 border-blue-100',
};

const ToastContainer = () => {
    const { toasts, notifications } = useUI();
    const navigate = useNavigate();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-4 pointer-events-none items-end">
            {/* Real-time Notification Previews (e.g. Messages, Social) */}
            {notifications.map((notif) => (
                <div
                    key={notif.id}
                    onClick={() => { if (notif.link) navigate(notif.link); }}
                    className="pointer-events-auto w-full max-w-[360px] bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-300 animate-slideInRight group"
                >
                    <div className="relative shrink-0">
                        <img
                            src={getFullImageUrl(notif.senderAvatar)}
                            alt="Avatar"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-500/30 group-hover:border-primary-500 transition-colors"
                            onError={(e) => { e.target.src = defaultProfile; }}
                        />
                        <div className="absolute -bottom-1 -right-1 bg-primary-600 rounded-full p-1.5 shadow-lg border-2 border-black">
                            <Bell className="text-white" size={12} />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-primary-500 uppercase tracking-widest mb-0.5">
                            {notif.title || 'Nueva Notificación'}
                        </div>
                        <div className="text-[15px] font-bold text-white truncate group-hover:text-primary-400 transition-colors">
                            {notif.message}
                        </div>
                    </div>
                    <div className="w-1.5 h-10 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full shrink-0 animate-pulse"></div>
                </div>
            ))}

            {/* Standard Toasts (Success/Error) */}
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl border shadow-xl animate-slideInRight min-w-[300px] max-w-md ${bgColors[toast.type] || bgColors.success} backdrop-blur-md`}
                >
                    <div className="shrink-0">
                        {icons[toast.type] || icons.success}
                    </div>
                    <div className="flex-1 text-sm font-semibold text-gray-800">
                        {toast.message}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;
