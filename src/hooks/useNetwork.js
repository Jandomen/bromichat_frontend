import { useState, useEffect } from 'react';

/**
 * Hook reactivo para detectar el estado de la red (Online/Offline)
 * y cambios en el tipo de conexión.
 */
export const useNetwork = () => {
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);
    const [connectionInfo, setConnectionInfo] = useState({
        type: navigator.connection?.type || 'unknown',
        effectiveType: navigator.connection?.effectiveType || '4g',
        downlink: navigator.connection?.downlink || 0
    });

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        const handleConnectionChange = () => {
            if (navigator.connection) {
                setConnectionInfo({
                    type: navigator.connection.type || 'unknown',
                    effectiveType: navigator.connection.effectiveType || '4g',
                    downlink: navigator.connection.downlink || 0
                });
            }
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
    }, []);

    return { isOnline, ...connectionInfo };
};
