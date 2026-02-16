import { useState, useEffect, useCallback } from 'react';
import { useUI } from '../context/UIContext';

export const useOfflineQueue = () => {
    const [queue, setQueue] = useState([]);
    const { showToast } = useUI();

    // Cargar cola desde cache
    useEffect(() => {
        const savedQueue = localStorage.getItem('offline_queue');
        if (savedQueue) {
            setQueue(JSON.parse(savedQueue));
        }
    }, []);

    // Guardar cola cuando cambie
    useEffect(() => {
        localStorage.setItem('offline_queue', JSON.stringify(queue));
    }, [queue]);

    const addToQueue = useCallback((action) => {
        const newAction = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...action
        };
        setQueue(prev => [...prev, newAction]);
        showToast('Guardado en borrador (Modo Offline)', 'info');
    }, [showToast]);

    const removeFromQueue = useCallback((id) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearQueue = useCallback(() => {
        setQueue([]);
        localStorage.removeItem('offline_queue');
    }, []);

    return { queue, addToQueue, removeFromQueue, clearQueue };
};
