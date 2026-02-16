import React, { useState, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Mail } from 'lucide-react';

const ChangeEmail = () => {
    const { user, setUser } = useContext(AuthContext);
    const [email, setEmail] = useState(user?.email || '');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const res = await api.put('/user/email', { email });
            setMessage(res.data.message);
            // Update local context
            if (res.data.user) {
                setUser({ ...user, email: res.data.user.email });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al actualizar el email');
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
                    <label className="block text-gray-700 text-sm font-medium mb-1.5 ml-1">Nuevo Correo</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                        required
                        placeholder="tu@correo.com"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium bg-gray-900 text-white shadow-lg shadow-gray-500/30 hover:shadow-gray-500/50 hover:bg-black transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : (
                            <>
                                <Mail className="w-4 h-4" />
                                Guardar Email
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangeEmail;
