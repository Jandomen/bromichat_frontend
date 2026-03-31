import { useState, useEffect, useCallback } from 'react';
import { useUI } from '../context/UIContext';

export const useOfflineQueue = () => {
    const [queue, setQueue] = useState([]);
    const { showToast } = useUI();

    const MAX_QUEUE_SIZE = 50;
    const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 horas

    // Cargar cola desde cache con limpieza de expirados
    useEffect(() => {
        try {
            const savedQueue = localStorage.getItem('offline_queue');
            if (savedQueue) {
                const parsed = JSON.parse(savedQueue);
                const now = Date.now();
                // Solo mantenemos los que tengan menos de 24h
                const validItems = parsed.filter(item => (now - item.id) < CACHE_EXPIRATION_MS);
                setQueue(validItems);
            }
        } catch (e) {
            console.error("Error loading offline queue", e);
        }
    }, [CACHE_EXPIRATION_MS]);

    // Guardar cola de forma eficiente
    useEffect(() => {
        if (queue.length > 0) {
            localStorage.setItem('offline_queue', JSON.stringify(queue));
        } else {
            localStorage.removeItem('offline_queue');
        }
    }, [queue]);

    const addToQueue = useCallback((action) => {
        setQueue(prev => {
            if (prev.length >= MAX_QUEUE_SIZE) {
                showToast('Límite de borrados alcanzado', 'error');
                return prev;
            }
            const newAction = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...action
            };
            showToast('Guardado temporalmente (Modo Offline)', 'info');
            return [...prev, newAction];
        });
    }, [showToast, MAX_QUEUE_SIZE]);

    const removeFromQueue = useCallback((id) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    const clearQueue = useCallback(() => {
        setQueue([]);
        localStorage.removeItem('offline_queue');
    }, []);

    return { queue, addToQueue, removeFromQueue, clearQueue };
};
