import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw, Signal } from 'lucide-react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import { useUI } from '../../context/UIContext';
import { useNetwork } from '../../hooks/useNetwork';

const NetworkStatus = () => {
    const { token } = React.useContext(AuthContext);
    const { queue, removeFromQueue } = useOfflineQueue();
    const { showToast } = useUI();
    const { isOnline, type: connectionType, effectiveType } = useNetwork();
    
    const [isSyncing, setIsSyncing] = useState(false);
    const [showStatus, setShowStatus] = useState(!isOnline);

    const [lastConnectionState, setLastConnectionState] = useState(isOnline);
    const [isInitialMount, setIsInitialMount] = useState(true);

    useEffect(() => {
        if (isInitialMount) {
            setIsInitialMount(false);
            return;
        }

        if (!isOnline) {
            setShowStatus(true);
            const timer = setTimeout(() => setShowStatus(false), 5000);
            setLastConnectionState(false);
            return () => clearTimeout(timer);
        } else if (isOnline && lastConnectionState === false) {
            // SOLO si venimos de estar offline (recuperación real)
            setShowStatus(true);
            const timer = setTimeout(() => setShowStatus(false), 5000);
            
            const processQueue = async () => {
                if (queue.length === 0 || !token) return;
                setIsSyncing(true);
                showToast(`Sincronizando ${queue.length} historias pendientes...`, 'info');

                for (const item of queue) {
                    try {
                        if (item.type === 'CREATE_POST') {
                            const url = item.groupId
                                ? `/communities/${item.groupId}/posts`
                                : `/posts`;

                            await api.post(url, { content: item.content });
                            removeFromQueue(item.id);
                        }
                    } catch (err) {
                        console.error("Error syncing item", item.id, err);
                    }
                }
                setIsSyncing(false);
                showToast('¡Brumi-Mesh sincronizado con éxito!', 'success');
            };
            
            processQueue();
            setLastConnectionState(true);
            return () => clearTimeout(timer);
        }
    }, [isOnline, queue, token, showToast, removeFromQueue, isInitialMount, lastConnectionState]);

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
