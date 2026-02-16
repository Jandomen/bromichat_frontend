import React, { createContext, useState, useContext, useCallback } from 'react';

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
            setHighlightedCommentId
        }}>
            {children}
        </UIContext.Provider>
    );
};
