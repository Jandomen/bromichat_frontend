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
        <div className="w-full">
            {message && <div className={`p-2 rounded mb-2 text-xs xs:text-sm ${message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>{message}</div>}

            <div className="space-y-3 xs:space-y-4">
                <div>
                    <label className="block text-[10px] xs:text-xs sm:text-sm text-gray-700 font-medium mb-1 ml-1">Quién puede ver mi perfil</label>
                    <select
                        value={profileVisibility}
                        onChange={(e) => setProfileVisibility(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm border border-gray-200 rounded-lg xs:rounded-xl bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                    >
                        <option value="public">Público (Todos)</option>
                        <option value="friends">Solo Compas</option>
                        <option value="private">Privado (Solo yo)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] xs:text-xs sm:text-sm text-gray-700 font-medium mb-1 ml-1">Quién puede enviarme mensajes</label>
                    <select
                        value={messagePrivacy}
                        onChange={(e) => setMessagePrivacy(e.target.value)}
                        className="w-full px-3 xs:px-4 py-2 xs:py-2.5 text-xs xs:text-sm border border-gray-200 rounded-lg xs:rounded-xl bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
                    >
                        <option value="everyone">Todos</option>
                        <option value="friends">Solo Compas</option>
                    </select>
                </div>

                <div className="pt-1 xs:pt-2">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full sm:w-auto px-4 xs:px-6 py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base font-medium bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg xs:rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        {loading ? 'Guardando...' : 'Guardar Configuración'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacySettings;
