import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const PrivacySettings = () => {
    const { user, setUser } = useContext(AuthContext);
    const [profileVisibility, setProfileVisibility] = useState('public');
    const [messagePrivacy, setMessagePrivacy] = useState('everyone');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user?.privacySettings) {
            setProfileVisibility(user.privacySettings.profileVisibility || 'public');
            setMessagePrivacy(user.privacySettings.messagePrivacy || 'everyone');
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        try {
            const res = await api.put('/user/privacy', {
                profileVisibility,
                messagePrivacy
            });
            setMessage('Privacidad actualizada correctamente');

            // Update context
            if (res.data.privacySettings) {
                setUser({
                    ...user,
                    privacySettings: res.data.privacySettings
                });
            }
        } catch (error) {
            console.error('Error updating privacy:', error);
            setMessage('Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow">
            <h3 className="text-lg font-semibold mb-3">Privacidad</h3>
            {message && <div className={`p-2 rounded mb-2 ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message}</div>}

            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Quién puede ver mi perfil</label>
                <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value)}
                    className="w-full border rounded p-2"
                >
                    <option value="public">Público (Todos)</option>
                    <option value="friends">Solo Compas</option>
                    <option value="private">Privado (Solo yo)</option>
                </select>
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm mb-1 font-medium">Quién puede enviarme mensajes</label>
                <select
                    value={messagePrivacy}
                    onChange={(e) => setMessagePrivacy(e.target.value)}
                    className="w-full border rounded p-2"
                >
                    <option value="everyone">Todos</option>
                    <option value="friends">Solo Compas</option>
                </select>
            </div>

            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
        </div>
    );
};

export default PrivacySettings;
