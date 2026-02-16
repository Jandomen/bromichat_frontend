import React, { useState } from 'react';
import api from '../../services/api';
import { Lock, Save } from 'lucide-react';

const ChangePassword = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Las nuevas contraseñas no coinciden');
            return;
        }

        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);
        try {
            await api.put('/user/password', {
                currentPassword,
                newPassword
            });

            setMessage('Contraseña actualizada correctamente');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar la contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {message && <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-sm border border-green-100">{message}</div>}
            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5 ml-1">Contraseña Actual</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                        required
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5 ml-1">Nueva Contraseña</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                        required
                        placeholder="••••••••"
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1.5 ml-1">Confirmar Nueva Contraseña</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                        required
                        placeholder="••••••••"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-900 text-white shadow-lg shadow-gray-500/30 hover:shadow-gray-500/50 hover:bg-black transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Actualizando...' : (
                            <>
                                <Lock className="w-4 h-4" />
                                Actualizar Contraseña
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePassword;
