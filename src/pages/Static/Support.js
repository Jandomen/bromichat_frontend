import React, { useState, useContext } from 'react';
import Layout from '../../components/Layout/Layout';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { FaLifeRing, FaEnvelope, FaDiscord, FaCommentAlt, FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

const Support = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: user ? `${user.name} ${user.lastName}` : '',
        email: user ? user.email : '',
        subject: 'Problemas Técnicos',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.post('/support/submit', { ...formData, userId: user ? user._id : null });
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'No se pudo enviar el ticket.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 shadow-2xl border border-gray-100 text-center max-w-sm w-full animate-scaleIn">
                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle size={32} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 mb-2 lowercase tracking-tighter">¡enviado!</h2>
                        <p className="text-gray-500 text-xs font-medium mb-8">Te daremos respuesta lo antes posible.</p>
                        <button onClick={() => setSubmitted(false)} className="w-full py-3 bg-gray-900 text-white font-black rounded-xl uppercase tracking-widest text-[10px] hover:bg-black transition-all">volver</button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/30 p-4 sm:p-8 animate-fade-in font-sans">
                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                    {/* Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 xs:p-8 shadow-2xl shadow-gray-200/50 border border-gray-100/50 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-black"></div>
                        <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
                            <FaLifeRing size={28} />
                        </div>
                        <h1 className="text-2xl xs:text-3xl font-black text-gray-900 mb-2 lowercase tracking-tighter">centro de soporte</h1>
                        <p className="text-gray-400 text-[10px] xs:text-xs font-bold uppercase tracking-widest leading-relaxed">ayuda técnica y reportes</p>
                    </div>

                    {/* Support Channels */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 group flex flex-col items-center">
                            <div className="p-4 bg-gray-50 text-gray-600 rounded-[1.5rem] w-fit mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                <FaEnvelope size={24} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 mb-1 lowercase tracking-tight">email</h3>
                            <a href="mailto:soporte@bromichat.com" className="text-red-600 text-xs font-black tracking-tighter hover:underline">soporte@bromichat.com</a>
                        </div>
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 group flex flex-col items-center">
                            <div className="p-4 bg-gray-50 text-gray-600 rounded-[1.5rem] w-fit mb-4 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                                <FaDiscord size={24} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 mb-1 lowercase tracking-tight">discord</h3>
                            <a href="https://discord.com/invite/bromichat" target="_blank" rel="noopener noreferrer" className="text-red-600 text-xs font-black tracking-tighter hover:underline">unirse a bromichat</a>
                        </div>
                    </div>

                    {/* Quick Ticket Form */}
                    <div className="bg-white rounded-[2.5rem] p-6 xs:p-8 shadow-xl shadow-gray-200/30 border border-gray-100/50 space-y-6">
                        <div className="text-center sm:text-left">
                            <h2 className="text-lg font-black text-gray-900 flex items-center justify-center sm:justify-start gap-2 lowercase tracking-tight">
                                <FaCommentAlt size={18} className="text-red-600" />
                                ticket rápido
                            </h2>
                            <p className="text-gray-400 text-[10px] xs:text-xs mt-1 font-bold italic">directo a la administración</p>
                        </div>
                        
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">{error}</div>
                        )}

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">nombre</label>
                                    <input 
                                        type="text" required value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="tu nombre" 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">asunto</label>
                                    <select 
                                        value={formData.subject}
                                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium"
                                    >
                                        <option>problemas técnicos</option>
                                        <option>reportes</option>
                                        <option>sugerencia</option>
                                        <option>otros</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">mensaje</label>
                                <textarea 
                                    required value={formData.message}
                                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                                    placeholder="explica tu problema o duda aquí..." 
                                    rows="4" 
                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:ring-4 focus:ring-red-50 outline-none transition-all font-medium resize-none shadow-inner"
                                ></textarea>
                            </div>
                            <button 
                                disabled={loading}
                                className={`w-full py-4 bg-gradient-to-r from-red-600 to-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50' : 'active:scale-95 shadow-red-600/20'}`}
                            >
                                {loading ? 'enviando...' : 'enviar a administración'}
                                {!loading && <FaPaperPlane size={14} />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Support;
