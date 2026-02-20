import React, { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useUI } from '../context/UIContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Settings,
    AlertTriangle,
    Trash2,
    CheckCircle,
    ShieldAlert,
    Loader2,
    RefreshCcw,
    Search as SearchIcon,
    LayoutDashboard,
    Megaphone,
    Video,
    FileText,
    ChevronRight,
    LogOut,
    UserPlus,
    UserMinus,
    X,
    Shield,
    Clock
} from 'lucide-react';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('user');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Modals
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Generic Confirm Modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    // Suspension Modal
    const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
    const [suspensionData, setSuspensionData] = useState({ days: '3', reason: 'Infracción de las normas' });

    const { showToast } = useUI();
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/dashboard');
            setData(res.data);
        } catch (error) {
            showToast('Error al cargar datos del panel corporativo', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const res = await api.get(`/admin/search?query=${searchQuery}&type=${searchType}`);
            setSearchResults(res.data);
        } catch (error) {
            showToast('Error en la búsqueda avanzada', 'error');
        } finally {
            setSearching(false);
        }
    };

    const handleUpdateSetting = async (key, value) => {
        try {
            await api.post('/admin/settings', { key, value });
            showToast('Configuración empresarial actualizada', 'success');
            fetchDashboardData();
        } catch (error) {
            showToast('Error al actualizar registro configurativo', 'error');
        }
    };

    const handleDeleteUser = (userId) => {
        setConfirmConfig({
            title: '¿ELIMINAR USUARIO?',
            message: 'Esta acción es irreversible a nivel corporativo y purgará toda la información del sujeto.',
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/user/${userId}`);
                    showToast('Usuario purgado del sistema', 'success');
                    setIsInterventionModalOpen(false);
                    setIsConfirmModalOpen(false);
                    fetchDashboardData();
                    if (activeTab === 'search') handleSearch();
                } catch (error) {
                    showToast('Fallo en la purga de usuario', 'error');
                }
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.post('/admin/user/role', { userId, role: newRole });
            showToast(`Usuario actualizado a: ${newRole.toUpperCase()}`, 'success');
            fetchDashboardData();
            if (activeTab === 'search') handleSearch();
            setIsInterventionModalOpen(false);
        } catch (error) {
            showToast('Error al actualizar rol corporativo', 'error');
        }
    };

    const handleDeleteContent = (id, type) => {
        setConfirmConfig({
            title: `¿ELIMINAR ${type.toUpperCase()}?`,
            message: `Esta acción purgará el registro de ${type} permanentemente de la red.`,
            onConfirm: async () => {
                try {
                    if (type === 'post') {
                        await api.delete(`/admin/post/${id}`);
                    } else {
                        await api.delete(`/admin/video/${id}`);
                    }
                    showToast('Contenido purgado por administración', 'success');
                    setIsInterventionModalOpen(false);
                    setIsConfirmModalOpen(false);
                    fetchDashboardData();
                    if (activeTab === 'search') handleSearch();
                } catch (error) {
                    showToast('Fallo en la purga de contenido', 'error');
                }
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handleSuspendUser = (userId) => {
        setSelectedEntity({ ...selectedEntity, targetUserId: userId });
        setIsSuspensionModalOpen(true);
    };

    const confirmSuspension = async () => {
        const { days, reason } = suspensionData;
        const userId = selectedEntity.targetUserId || selectedEntity._id;

        try {
            await api.post('/admin/user/suspend', { userId, days: parseInt(days), reason });
            showToast(`Usuario suspendido por ${days} días`, 'success');
            setIsSuspensionModalOpen(false);
            setIsInterventionModalOpen(false);
            fetchDashboardData();
            if (activeTab === 'search') handleSearch();
        } catch (error) {
            showToast('Error al procesar suspensión', 'error');
        }
    };

    const handleUnsuspendUser = async (userId) => {
        try {
            await api.post('/admin/user/unsuspend', { userId });
            showToast('Suspensión revocada correctamente', 'success');
            setIsInterventionModalOpen(false);
            fetchDashboardData();
            if (activeTab === 'search') handleSearch();
        } catch (error) {
            showToast('Error al revocar suspensión', 'error');
        }
    };

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    const openIntervention = (entity) => {
        setSelectedEntity(entity);
        setIsInterventionModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-16 h-16 text-red-600 animate-spin mx-auto" />
                    <p className="text-[10px] uppercase font-black tracking-[0.5em] animate-pulse">Iniciando Consola de Administración</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex font-['Outfit'] text-white relative">
            {/* Enterprise Sidebar */}
            <div className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 space-y-8 hidden lg:flex">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tighter">BROMICHAT</h2>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Enterprise Console</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem
                        icon={<LayoutDashboard size={18} />}
                        label="Vista General"
                        active={activeTab === 'overview'}
                        onClick={() => setActiveTab('overview')}
                    />
                    <SidebarItem
                        icon={<SearchIcon size={18} />}
                        label="Explorador de Datos"
                        active={activeTab === 'search'}
                        onClick={() => setActiveTab('search')}
                    />
                    <SidebarItem
                        icon={<Megaphone size={18} />}
                        label="Publicidad y Marketing"
                        active={activeTab === 'ads'}
                        onClick={() => setActiveTab('ads')}
                    />
                    <SidebarItem
                        icon={<Settings size={18} />}
                        label="Ciberseguridad"
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                    />
                </nav>

                <div className="space-y-4">
                    <div className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-red-500" size={14} />
                            <p className="text-[10px] font-black uppercase text-red-500">Alerta del Sistema</p>
                        </div>
                        <p className="text-[9px] text-gray-400">Hay {data.reportedUsers.length} usuarios bajo investigación por reportes de infracción.</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white transition-all group"
                    >
                        <LogOut size={18} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Desconectar Terminal</span>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] pointer-events-none rounded-full" />

                <header className="flex justify-between items-center mb-12 relative z-10">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            {activeTab === 'overview' && 'Dashboard de Red'}
                            {activeTab === 'search' && 'Advanced Data Explorer'}
                            {activeTab === 'ads' && 'Control de Mercadeo'}
                            {activeTab === 'security' && 'Protocolos de Acceso'}
                        </h1>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em]">Terminal {activeTab.toUpperCase()}_SECURE_GATEWAY</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 180 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchDashboardData}
                        className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all"
                    >
                        <RefreshCcw className="w-5 h-5 text-red-500" />
                    </motion.button>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard icon={<Users size={20} />} label="Capital Humano" value={data.stats.totalUsers} trend="+12.5%" />
                                <StatCard icon={<FileText size={20} />} label="Registros de Actividad" value={data.stats.totalPosts} trend="+8.2%" />
                                <StatCard icon={<Video size={20} />} label="Media Streaming" value={data.stats.totalVideos} trend="+24.1%" />
                            </div>

                            <section className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
                                <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <ShieldAlert className="text-red-500" size={18} /> Casilleros de Vigilancia
                                </h2>
                                <div className="space-y-4">
                                    {data.reportedUsers.map((u) => (
                                        <div key={u._id} className="flex items-center justify-between p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <img src={u.profilePicture} className="w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
                                                <div>
                                                    <p className="font-bold">{u.username}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{u.reports} Violaciones Reportadas</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.reports >= 25 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                    {u.reports >= 25 ? 'Critical Risk' : 'Under Observation'}
                                                </div>
                                                <button
                                                    onClick={() => openIntervention({ ...u, entityType: 'user' })}
                                                    className="px-4 py-2 bg-red-600 rounded-xl text-[10px] uppercase font-black tracking-widest hover:bg-red-500 transition-all"
                                                >
                                                    Intervenir
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {data.reportedUsers.length === 0 && (
                                        <p className="text-center py-10 text-gray-600 font-bold italic">No se han detectado anomalías de conducta en la plataforma.</p>
                                    )}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <form onSubmit={handleSearch} className="flex gap-4 p-2 bg-[#0a0a0a] rounded-3xl border border-white/5 items-center">
                                <select
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="bg-transparent px-6 py-3 border-r border-white/5 font-black uppercase tracking-widest text-[10px] focus:outline-none"
                                >
                                    <option value="user" className="bg-[#0a0a0a]">Usuarios</option>
                                    <option value="post" className="bg-[#0a0a0a]">Posts</option>
                                    <option value="video" className="bg-[#0a0a0a]">Media</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Buscar por ID, Usuario, Correo o Contenido..."
                                    className="flex-1 bg-transparent px-4 py-3 placeholder-gray-700 outline-none text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="p-4 bg-red-600 rounded-2xl hover:bg-red-500 transition-all">
                                    {searching ? <Loader2 size={18} className="animate-spin" /> : <SearchIcon size={18} />}
                                </button>
                            </form>

                            <div className="grid grid-cols-1 gap-4">
                                {searchResults.map((res) => (
                                    <div key={res._id} className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5 flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black text-xs text-gray-500 border border-white/5 overflow-hidden">
                                                {(searchType === 'user' && res.profilePicture) ? <img src={res.profilePicture} className="w-full h-full object-cover" alt="" /> : searchType.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-black text-lg">
                                                    {searchType === 'user' ? res.username : (res.title || res.content?.substring(0, 40) + '...')}
                                                </p>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">ID: {res._id}</p>
                                                {searchType === 'user' && <p className="text-xs text-gray-500">{res.email} • {res.role.toUpperCase()}</p>}
                                                {searchType !== 'user' && <p className="text-xs text-gray-500">Autor: {res.author?.username || res.userId?.username || 'Desconocido'}</p>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => openIntervention({ ...res, entityType: searchType })}
                                                className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/5 hover:border-red-500/50 transition-all text-[10px] font-black uppercase tracking-widest"
                                            >
                                                Intervenir <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {searchResults.length === 0 && !searching && (
                                    <div className="py-20 text-center text-gray-700 border-2 border-dashed border-white/5 rounded-[3rem]">
                                        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Esperando Datos de Entrada para Indexación</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ads' && (
                        <motion.div
                            key="ads"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-red-900/10 p-8 rounded-[3rem] border border-red-900/20">
                                <div className="max-w-xl">
                                    <h3 className="text-2xl font-black mb-2 tracking-tighter text-red-500">Gestión de Espacios Publicitarios</h3>
                                    <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                                        Active la capa de mercadeo comercial para inyectar publicidad en el banner premium. Use esta herramienta solo bajo protocolos comerciales establecidos.
                                    </p>

                                    <div className="flex items-center justify-between p-6 bg-black/60 rounded-[2rem] border border-white/5 shadow-2xl">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-red-600/20 rounded-2xl">
                                                <Megaphone className="text-red-500" size={24} />
                                            </div>
                                            <div>
                                                <p className="font-bold">Protocolo de Anuncios</p>
                                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Marketing Injection API</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdateSetting('adsEnabled', !data.settings.find(s => s.key === 'adsEnabled')?.value)}
                                            className={`relative h-10 w-20 rounded-full transition-all flex items-center p-1 ${data.settings.find(s => s.key === 'adsEnabled')?.value ? 'bg-red-600' : 'bg-gray-800'}`}
                                        >
                                            <div className={`h-8 w-8 bg-white rounded-full transition-all ${data.settings.find(s => s.key === 'adsEnabled')?.value ? 'translate-x-10' : 'translate-x-0'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem]">
                                <h3 className="font-black tracking-widest uppercase text-xs text-gray-500 mb-6">Contenido del Anuncio Global</h3>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-black/60 border border-white/5 rounded-3xl p-6 text-sm outline-none focus:border-red-500/50 transition-all min-h-[120px]"
                                        value={data.settings.find(s => s.key === 'welcomeMessage')?.value}
                                        onChange={(e) => {
                                            const newData = { ...data };
                                            const setting = newData.settings.find(s => s.key === 'welcomeMessage');
                                            if (setting) setting.value = e.target.value;
                                            setData(newData);
                                        }}
                                        placeholder="Ingrese el texto que verán los usuarios en el banner superior..."
                                    />
                                    <button
                                        onClick={() => handleUpdateSetting('welcomeMessage', data.settings.find(s => s.key === 'welcomeMessage')?.value)}
                                        className="px-8 py-4 bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-600/10"
                                    >
                                        Actualizar Banner Corporativo
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem]">
                                <h3 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2">
                                    <CheckCircle className="text-green-500" size={20} /> Protocolos de Verificación de Identidad
                                </h3>
                                <div className="flex items-center justify-between p-8 bg-black/40 rounded-3xl border border-white/5">
                                    <div>
                                        <p className="font-bold text-lg">Firewall de Correo Electrónico</p>
                                        <p className="text-xs text-gray-500 mt-1">Si este protocolo está activo, el sistema denegará el acceso a cualquier terminal cuya identidad de correo no haya sido auditada.</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateSetting('strictEmailVerification', !data.settings.find(s => s.key === 'strictEmailVerification')?.value)}
                                        className={`relative h-10 w-20 rounded-full transition-all flex items-center p-1 ${data.settings.find(s => s.key === 'strictEmailVerification')?.value ? 'bg-green-600' : 'bg-gray-800'}`}
                                    >
                                        <div className={`h-8 w-8 bg-white rounded-full transition-all ${data.settings.find(s => s.key === 'strictEmailVerification')?.value ? 'translate-x-10' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Intervention Modal */}
                <AnimatePresence>
                    {isInterventionModalOpen && selectedEntity && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsInterventionModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-600/20 rounded-2xl text-red-500">
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tighter uppercase">Protocolo de Intervención</h3>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Entidad ID: {selectedEntity._id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setIsInterventionModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-all">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-8 space-y-8">
                                    <div className="flex items-center gap-6 p-4 bg-white/5 rounded-3xl border border-white/5">
                                        <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                                            {selectedEntity.profilePicture ? <img src={selectedEntity.profilePicture} className="w-full h-full object-cover" alt="" /> : <FileText size={24} className="text-gray-700" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">{selectedEntity.username || selectedEntity.title || 'Contenido'}</p>
                                            <p className="text-sm text-gray-500">{selectedEntity.email || 'Registro de actividad'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        {selectedEntity.entityType === 'user' ? (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <ActionButton
                                                        icon={<UserPlus size={18} />}
                                                        label="Promover a Admin"
                                                        onClick={() => handleUpdateRole(selectedEntity._id, 'admin')}
                                                        disabled={selectedEntity.role === 'admin'}
                                                    />
                                                    <ActionButton
                                                        icon={<UserMinus size={18} />}
                                                        label="Demover a Usuario"
                                                        onClick={() => handleUpdateRole(selectedEntity._id, 'user')}
                                                        disabled={selectedEntity.role === 'user'}
                                                        variant="warning"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    {selectedEntity.isSuspended ? (
                                                        <ActionButton
                                                            icon={<CheckCircle size={18} />}
                                                            label="Revocar Suspensión"
                                                            onClick={() => handleUnsuspendUser(selectedEntity._id)}
                                                            variant="default"
                                                        />
                                                    ) : (
                                                        <ActionButton
                                                            icon={<AlertTriangle size={18} />}
                                                            label="Suspender Cuenta"
                                                            onClick={() => handleSuspendUser(selectedEntity._id)}
                                                            variant="warning"
                                                        />
                                                    )}
                                                    <ActionButton
                                                        icon={<Trash2 size={18} />}
                                                        label="Purgar Usuario"
                                                        onClick={() => handleDeleteUser(selectedEntity._id)}
                                                        variant="danger"
                                                    />
                                                </div>
                                                {selectedEntity.isSuspended && (
                                                    <p className="text-[10px] text-red-500 font-black uppercase text-center bg-red-500/10 p-2 rounded-xl border border-red-500/20">
                                                        ⚠️ Cuenta actualmente bajo suspensión
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <ActionButton
                                                icon={<Trash2 size={18} />}
                                                label={`Purgar ${selectedEntity.entityType.toUpperCase()} de la Red`}
                                                onClick={() => handleDeleteContent(selectedEntity._id, selectedEntity.entityType)}
                                                variant="danger"
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center gap-3">
                                    <Shield size={16} className="text-red-600" />
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                        Toda acción realizada en este panel queda registrada en la auditoría permanente de BROMICHAT Enterprise.
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Logout Confirmation Modal */}
                <AnimatePresence>
                    {isLogoutModalOpen && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-[0_0_100px_-20px_rgba(220,38,38,0.5)]"
                            >
                                <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500">
                                    <LogOut size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">¿Finalizar Sesión?</h3>
                                <p className="text-sm text-gray-500 mb-10 leading-relaxed font-bold">
                                    El acceso a la terminal corporativa será revocado inmediatamente. Deberá autenticarse de nuevo para recuperar el mando.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmLogout}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-red-900/40 transition-all"
                                    >
                                        Confirmar Desconexión
                                    </button>
                                    <button
                                        onClick={() => setIsLogoutModalOpen(false)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                                    >
                                        Mantener Conexión
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Generic Confirmation Modal */}
                <AnimatePresence>
                    {isConfirmModalOpen && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 text-center shadow-2xl"
                            >
                                <div className="w-20 h-20 bg-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-orange-500">
                                    <AlertTriangle size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{confirmConfig.title}</h3>
                                <p className="text-sm text-gray-500 mb-10 leading-relaxed font-bold">
                                    {confirmConfig.message}
                                </p>
                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmConfig.onConfirm}
                                        className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-orange-900/40 transition-all font-['Outfit']"
                                    >
                                        Confirmar Acción
                                    </button>
                                    <button
                                        onClick={() => setIsConfirmModalOpen(false)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                {/* Suspension Configuration Modal */}
                <AnimatePresence>
                    {isSuspensionModalOpen && (
                        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 font-['Outfit']">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsSuspensionModalOpen(false)}
                                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
                            >
                                <div className="w-20 h-20 bg-red-600/20 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-500">
                                    <Clock size={40} />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 text-center">Configurar Sanación</h3>

                                <div className="space-y-6 mb-10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">DURACIÓN (DÍAS)</label>
                                        <input
                                            type="number"
                                            value={suspensionData.days}
                                            onChange={(e) => setSuspensionData({ ...suspensionData, days: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">MOTIVO DE LA RESTRICCIÓN</label>
                                        <textarea
                                            value={suspensionData.reason}
                                            onChange={(e) => setSuspensionData({ ...suspensionData, reason: e.target.value })}
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold focus:border-red-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={confirmSuspension}
                                        className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-red-900/40 transition-all"
                                    >
                                        Aplicar Restricción
                                    </button>
                                    <button
                                        onClick={() => setIsSuspensionModalOpen(false)}
                                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
    >
        {icon}
        <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
    </button>
);

const StatCard = ({ icon, label, value, trend }) => (
    <div className="bg-[#0a0a0a] border border-white/5 p-8 rounded-[2.5rem] hover:border-white/10 transition-all flex flex-col justify-between group h-64">
        <div className="flex justify-between items-start">
            <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-red-600/20 group-hover:text-red-500 transition-all">
                {icon}
            </div>
            <span className="text-green-500 text-[10px] font-black bg-green-500/10 px-3 py-1 rounded-full">{trend}</span>
        </div>
        <div>
            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] mb-1">{label}</p>
            <p className="text-5xl font-black tracking-tighter">{value}</p>
        </div>
    </div>
);

const ActionButton = ({ icon, label, onClick, variant = 'default', disabled = false }) => {
    const variants = {
        default: 'bg-white/5 text-white hover:bg-white/10 border-white/10',
        warning: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20',
        danger: 'bg-red-600 text-white hover:bg-red-500 border-red-500/20 shadow-lg shadow-red-900/20'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30 disabled:grayscale ${variants[variant]}`}
        >
            {icon}
            {label}
        </button>
    );
};

export default AdminDashboard;
