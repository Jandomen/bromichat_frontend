import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import api from '../services/api';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [confirmModal, setConfirmModal] = useState(null);
    const [settings, setSettings] = useState({});

    const applySettings = useCallback((sets) => {
        if (sets.primaryColor) document.documentElement.style.setProperty('--primary-color', sets.primaryColor);
        if (sets.accentColor) document.documentElement.style.setProperty('--accent-color', sets.accentColor);
        if (sets.appBackground) document.documentElement.style.setProperty('--app-bg', sets.appBackground);
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            const res = await api.get('/admin/settings/public');
            const sets = res.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
            setSettings(sets);
            applySettings(sets);
        } catch (error) {
            console.warn('Could not fetch public app branding settings.');
        }
    }, [applySettings]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const showNotification = useCallback((data, duration = 4000) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, ...data }]);

        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
    }, []);

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
    }, []);

    const showConfirm = useCallback((title, message, onConfirm, onCancel) => {
        setConfirmModal({
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setConfirmModal(null);
            },
            onCancel: () => {
                if (onCancel) onCancel();
                setConfirmModal(null);
            },
        });
    }, []);

    const [selectedPostId, setSelectedPostId] = useState(null);
    const [highlightedCommentId, setHighlightedCommentId] = useState(null);

    const closeConfirm = useCallback(() => setConfirmModal(null), []);

    return (
        <UIContext.Provider value={{
            showToast,
            showConfirm,
            showNotification,
            closeConfirm,
            toasts,
            notifications,
            confirmModal,
            selectedPostId,
            setSelectedPostId,
            highlightedCommentId,
            setHighlightedCommentId,
            appSettings: settings,
            refreshSettings: fetchSettings
        }}>
            {children}
        </UIContext.Provider>
    );
};
