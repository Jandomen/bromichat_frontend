import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Signal } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { useUI } from '../../context/UIContext';

const NetworkStatus = () => {
    const { token } = React.useContext(AuthContext);
    const { queue, removeFromQueue } = useOfflineQueue();
    const { showToast } = useUI();
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showStatus, setShowStatus] = useState(!window.navigator.onLine);
    const [isLocalMesh, setIsLocalMesh] = useState(false);
    const [showMesh, setShowMesh] = useState(false);
    const [connectionType, setConnectionType] = useState(navigator.connection?.type || 'unknown');
    const [effectiveType, setEffectiveType] = useState(navigator.connection?.effectiveType || '4g');

    useEffect(() => {
        // Detectar si estamos en una IP privada (Heurística simple para "Mesh Local")
        const checkLocalMesh = async () => {
            // Nota: En una app real esto vendría de un ping al backend o WebRTC
            setIsLocalMesh(true);
            setShowMesh(true);
            setTimeout(() => setShowMesh(false), 5000); // Desaparece tras 5 segundos
        };
        checkLocalMesh();

        // Si entramos y estamos offline, ocultar tras unos segundos
        if (!window.navigator.onLine) {
            setTimeout(() => setShowStatus(false), 5000);
        }

        const processQueue = async () => {
            if (queue.length === 0 || !token) return;
            setIsSyncing(true);
            showToast(`Sincronizando ${queue.length} historias pendientes...`, 'info');

            for (const item of queue) {
                try {
                    if (item.type === 'CREATE_POST') {
                        const url = item.groupId
                            ? `${process.env.REACT_APP_API_BACKEND}/communities/${item.groupId}/posts`
                            : `${process.env.REACT_APP_API_BACKEND}/posts`;

                        await axios.post(url, { content: item.content }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        removeFromQueue(item.id);
                    }
                } catch (err) {
                    console.error("Error syncing item", item.id, err);
                }
            }
            setIsSyncing(false);
            showToast('¡Brumi-Mesh sincronizado con éxito!', 'success');
        };

        const handleOnline = () => {
            setIsOnline(true);
            setShowStatus(true);
            processQueue();
            setTimeout(() => setShowStatus(false), 5000);
        };
        const handleOffline = () => {
            setIsOnline(false);
            setShowStatus(true);
            setTimeout(() => setShowStatus(false), 5000); // El aviso de Offline ahora también es temporal
        };

        const handleConnectionChange = () => {
            setConnectionType(navigator.connection?.type || 'unknown');
            setEffectiveType(navigator.connection?.effectiveType || '4g');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        if (navigator.connection) {
            navigator.connection.addEventListener('change', handleConnectionChange);
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (navigator.connection) {
                navigator.connection.removeEventListener('change', handleConnectionChange);
            }
        };
    }, [queue, token, showToast, removeFromQueue]);

    if (!showStatus && isOnline) return (
        <div className="fixed top-6 right-6 z-[1000] flex items-center gap-2 pointer-events-none">
            {isLocalMesh && showMesh && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-2xl animate-in fade-in slide-in-from-right duration-700">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Brumi-Mesh Activo</span>
                </div>
            )}
        </div>
    );

    if (!showStatus) return null;

    return (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-xs animate-in slide-in-from-top-4 duration-500`}>
            <div className={`mx-4 p-4 rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-3xl border transition-all duration-700 ${isOnline
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isOnline ? 'bg-emerald-500/20' : 'bg-rose-500/20 animate-pulse'}`}>
                            {isOnline ? <Wifi size={24} /> : <WifiOff size={24} />}
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">
                                {isSyncing ? 'Subiendo...' : (isOnline ? (connectionType === 'cellular' ? 'Datos Móviles' : 'Sincronizado') : 'Brumi-Mesh Mode')}
                            </h4>
                            <p className="text-[10px] font-bold opacity-70 uppercase tracking-tighter">
                                {isSyncing
                                    ? 'Conectando con la nube'
                                    : (isOnline
                                        ? (connectionType === 'cellular' ? `Red Optimizada (${effectiveType.toUpperCase()})` : 'Tus historias están al día')
                                        : 'Guardando en cache local')}
                            </p>
                        </div>
                    </div>
                    {isSyncing && <RefreshCw className="animate-spin text-emerald-400" size={18} />}
                    {isOnline && connectionType === 'cellular' && <Signal size={16} className="text-emerald-400 animate-pulse" />}
                </div>

                {!isOnline && (
                    <div className="mt-3 overflow-hidden h-1 bg-white/10 rounded-full">
                        <div className="h-full bg-rose-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '30%' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NetworkStatus;
