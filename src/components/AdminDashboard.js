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
    Activity,
    Video,
    FileText,
    LogOut,
    UserPlus,
    X,
    Clock,
    Menu,
    LifeBuoy,
    Calendar,
    Mail,
    Send,
    Image as ImageIcon,
    PlayCircle,
    Palette
} from 'lucide-react';
import { getFullImageUrl } from '../utils/getProfilePicture';
import bLogo from '../assets/b-removebg-preview.png';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState({ stats: {}, reportedUsers: [], recentUsers: [], recentPosts: [], recentVideos: [], settings: [] });
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('user');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    const [annTitle, setAnnTitle] = useState('');
    const [annMessage, setAnnMessage] = useState('');
    const [sendingAnn, setSendingAnn] = useState(false);

    const [ticketFilter, setTicketFilter] = useState('open');

    const [selectedEntity, setSelectedEntity] = useState(null);
    const [isInterventionModalOpen, setIsInterventionModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

    const [mediaSearchQuery, setMediaSearchQuery] = useState('');
    const { showToast, refreshSettings } = useUI();
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const [dashboardRes, ticketsRes] = await Promise.all([
                api.get('/admin/dashboard'),
                api.get('/support/all')
            ]);
            setData(dashboardRes.data);
            setTickets(ticketsRes.data);
        } catch (error) {
            showToast('Error al cargar datos del panel corporativo', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const handleSendAnnouncement = async (e) => {
        if (e) e.preventDefault();
        if (!annTitle.trim() || !annMessage.trim()) return;
        setSendingAnn(true);
        try {
            await api.post('/admin/announce', { title: annTitle, message: annMessage });
            showToast('Anuncio global enviado con éxito', 'success');
            setAnnTitle('');
            setAnnMessage('');
        } catch (error) {
            showToast('Fallo al enviar el anuncio', 'error');
        } finally {
            setSendingAnn(false);
        }
    };

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
            refreshSettings();
        } catch (error) {
            showToast('Error al actualizar registro configurativo', 'error');
        }
    };

    const handleDeleteUser = (userId) => {
        setConfirmConfig({
            title: '¿ELIMINAR USUARIO?',
            message: 'Acción irreversible que pugará toda la información corporativa del sujeto.',
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
            message: `Esta acción purgará el registro permanentemente de la red.`,
            onConfirm: async () => {
                try {
                    if (type === 'post') await api.delete(`/admin/post/${id}`);
                    else await api.delete(`/admin/video/${id}`);
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

    const handleUpdateTicketStatus = async (id, status) => {
        try {
            await api.patch(`/support/${id}/status`, { status });
            showToast(`Ticket marcado como ${status.toUpperCase()}`, 'success');
            fetchDashboardData();
        } catch (error) {
            showToast('Error al actualizar ticket', 'error');
        }
    };

    const handleDeleteTicket = (id) => {
        setConfirmConfig({
            title: '¿ELIMINAR TICKET?',
            message: 'El registro se borrará permanentemente de la base de datos de soporte.',
            onConfirm: async () => {
                try {
                    await api.delete(`/support/${id}`);
                    showToast('Ticket purgado correctamente', 'success');
                    setIsConfirmModalOpen(false);
                    fetchDashboardData();
                } catch (error) {
                    showToast('Fallo al eliminar ticket', 'error');
                }
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handlePermanentlyBanUser = (userId) => {
        setConfirmConfig({
            title: '¿BANEO PERMANENTE (IP)?',
            message: 'Se revocará el acceso y se bloqueará la dirección IP del terminal de forma indefinida.',
            onConfirm: async () => {
                try {
                    await api.post('/admin/user/ban', { userId, reason: 'Infracción crítica de seguridad' });
                    showToast('IP y Usuario baneados de la red', 'success');
                    setIsInterventionModalOpen(false);
                    setIsConfirmModalOpen(false);
                    fetchDashboardData();
                    if (activeTab === 'search') handleSearch();
                } catch (error) {
                    showToast('Fallo al ejecutar baneo de IP', 'error');
                }
            }
        });
        setIsConfirmModalOpen(true);
    };

    const handleLogout = () => setIsLogoutModalOpen(true);
    const confirmLogout = () => { logout(); navigate('/admin'); };

    const [auditIdLoading, setAuditIdLoading] = useState(false);
    const [auditIdValue, setAuditIdValue] = useState('');

    const handleIdAudit = async (e) => {
        if (e) e.preventDefault();
        if (!auditIdValue.trim()) return;
        setAuditIdLoading(true);
        try {
            const res = await api.get(`/admin/audit/${auditIdValue}`);
            // Format for intervention modal
            const formatted = {
                ...res.data.data,
                entityType: res.data.entityType
            };
            setSelectedEntity(formatted);
            setIsInterventionModalOpen(true);
            setAuditIdValue('');
        } catch (error) {
            showToast(error.response?.data?.error || 'ID no encontrado en la red.', 'error');
        } finally {
            setAuditIdLoading(false);
        }
    };

    const openIntervention = (entity) => {
        setSelectedEntity(entity);
        setIsInterventionModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto" />
                    <p className="text-[10px] uppercase font-black tracking-widest animate-pulse">Cargando Administración</p>
                </div>
            </div>
        );
    }

    const filteredTickets = tickets.filter(t => {
        if (ticketFilter === 'all') return true;
        if (ticketFilter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
        return t.status === 'open' || t.status === 'pending';
    });

    const getSetting = (key) => (data?.settings || []).find(s => s.key === key)?.value;

    return (
        <div className="min-h-screen bg-[#050505] flex font-['Outfit'] text-white relative flex-col lg:flex-row">

            <header className="lg:hidden flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-white/5 sticky top-0 z-[60]">
                <div className="flex items-center gap-3">
                    <img src={bLogo} className="w-9 h-9 object-contain" alt="BromiLogo" />
                    <div className="flex flex-col justify-center">
                        <h2 className="text-xs font-black tracking-tight uppercase leading-none">BROMICHAT</h2>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Enterprise Console</p>
                    </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg border border-white/10">
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden fixed inset-0 top-[61px] bg-[#050505]/95 backdrop-blur-xl z-50 p-6 flex flex-col space-y-4"
                    >
                        <SidebarItem icon={<LayoutDashboard size={18} />} label="Vista General" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsMobileMenuOpen(false); }} />
                        <SidebarItem icon={<SearchIcon size={18} />} label="Explorador" active={activeTab === 'search'} onClick={() => { setActiveTab('search'); setIsMobileMenuOpen(false); }} />
                        <SidebarItem icon={<ImageIcon size={18} />} label="Galería Media" active={activeTab === 'media'} onClick={() => { setActiveTab('media'); setIsMobileMenuOpen(false); }} />
                        <SidebarItem icon={<Palette size={18} />} label="Apariencia" active={activeTab === 'appearance'} onClick={() => { setActiveTab('appearance'); setIsMobileMenuOpen(false); }} />
                        <SidebarItem icon={<LifeBuoy size={18} />} label="Soporte y Tickets" active={activeTab === 'support'} onClick={() => { setActiveTab('support'); setIsMobileMenuOpen(false); }} />
                        <SidebarItem icon={<Megaphone size={18} />} label="Marketing / Anuncios" active={activeTab === 'ads'} onClick={() => { setActiveTab('ads'); setIsMobileMenuOpen(false); }} />
                        <SidebarItem icon={<Settings size={18} />} label="Protocolos" active={activeTab === 'security'} onClick={() => { setActiveTab('security'); setIsMobileMenuOpen(false); }} />
                        <div className="mt-auto border-t border-white/10 pt-4">
                            <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 rounded-xl bg-red-600 font-black uppercase text-[10px] tracking-widest">
                                Desconectar Terminal <LogOut size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-72 bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 space-y-8 hidden lg:flex h-screen sticky top-0 overflow-y-auto">
                <div className="flex items-center gap-3 mb-10">
                    <img src={bLogo} className="w-12 h-12 object-contain" alt="BromiLogo" />
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black tracking-tighter uppercase leading-none">BROMICHAT</h2>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Enterprise Console</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem icon={<LayoutDashboard size={18} />} label="Vista General" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                    <SidebarItem icon={<SearchIcon size={18} />} label="Explorador de Datos" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                    <SidebarItem icon={<ImageIcon size={18} />} label="Galería Media" active={activeTab === 'media'} onClick={() => setActiveTab('media')} />
                    <SidebarItem icon={<Palette size={18} />} label="Apariencia" active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} />
                    <SidebarItem icon={<LifeBuoy size={18} />} label="Soporte y Tickets" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
                    <SidebarItem icon={<Megaphone size={18} />} label="Marketing / Anuncios" active={activeTab === 'ads'} onClick={() => setActiveTab('ads')} />
                    <SidebarItem icon={<Settings size={18} />} label="Ciberseguridad" active={activeTab === 'security'} onClick={() => setActiveTab('security')} />
                    
                    <div className="mt-8 px-4 py-3 bg-[#111] rounded-2xl border border-white/5">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">PLATFORM_REACH</p>
                        <div className="flex items-end gap-1">
                            <span className="text-2xl font-black text-white">{data.stats.totalUsers || 0}</span>
                            <span className="text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-tighter">Usuarios</span>
                        </div>
                    </div>
                </nav>

                <div className="space-y-4">
                    <div className="p-4 bg-red-900/10 border border-red-900/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-red-500" size={14} />
                            <p className="text-[10px] font-black uppercase text-red-500 tracking-widest">Alerta</p>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Investigación activa: {data?.reportedUsers?.length || 0} sujectos.</p>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-gray-400 hover:bg-red-600 hover:text-white transition-all">
                        <LogOut size={18} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Desconectar</span>
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 xs:p-6 lg:p-12 relative pb-24 lg:pb-12">
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[150px] pointer-events-none rounded-full hidden sm:block" />

                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 lg:mb-12 relative z-10 gap-4">
                    <div>
                        <h1 className="text-xl xs:text-3xl font-black uppercase tracking-tighter">
                            {activeTab === 'overview' && 'Dashboard de Red'}
                            {activeTab === 'search' && 'Advanced Data Explorer'}
                            {activeTab === 'media' && 'Moderación Media'}
                            {activeTab === 'appearance' && 'Visual Branding'}
                            {activeTab === 'support' && 'Soporte al Usuario'}
                            {activeTab === 'ads' && 'Control Comunicativo'}
                            {activeTab === 'security' && 'Protocolos de Acceso'}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{activeTab.toUpperCase()}_GATEWAY_SECURE</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.95 }} onClick={fetchDashboardData} className="p-2.5 bg-white/5 border border-white/10 rounded-xl">
                        <RefreshCcw className="w-5 h-5 text-red-500" />
                    </motion.button>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 lg:space-y-12">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                                <StatCard icon={<Users size={20} />} label="Total" value={data.stats.totalUsers} trend="+12%" trendType="up" />
                                <StatCard
                                    icon={<Activity size={20} className="text-green-500" />}
                                    label="En Línea"
                                    value={data.stats.onlineCount || 0}
                                    trend="LIVE"
                                    trendType="up"
                                    showPulse={true}
                                />
                                <StatCard icon={<FileText size={20} />} label="Posts" value={data.stats.totalPosts} trend="+8%" trendType="up" />
                                <StatCard icon={<Video size={20} />} label="Media" value={data.stats.totalVideos} trend="+24%" trendType="up" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <section className="bg-gradient-to-br from-blue-600/10 to-transparent border border-white/5 rounded-[2rem] p-6">
                                    <h3 className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-4 flex items-center gap-2">
                                        <FileText size={16} /> Post Más Comentado
                                    </h3>
                                    {data.stats.topCommentedPost ? (
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img src={getFullImageUrl(data.stats.topCommentedPost.user?.profilePicture)} className="w-10 h-10 rounded-xl" alt="" />
                                                <div>
                                                    <p className="text-xs font-bold line-clamp-1">{data.stats.topCommentedPost.content || "Sin texto"}</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase">{data.stats.topCommentedPost.user?.username} • {data.stats.topCommentedPost.comments?.length} comentarios</p>
                                                </div>
                                            </div>
                                            <button onClick={() => openIntervention({ ...data.stats.topCommentedPost, entityType: 'post' })} className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase">Ver</button>
                                        </div>
                                    ) : <p className="text-[10px] text-gray-600 italic">No hay datos de interacción aún.</p>}
                                </section>

                                <section className="bg-gradient-to-br from-yellow-600/10 to-transparent border border-white/5 rounded-[2rem] p-6">
                                    <h3 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest mb-4 flex items-center gap-2">
                                        <Activity size={16} /> Mayor Reacción
                                    </h3>
                                    {data.stats.topReactedPost ? (
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img src={getFullImageUrl(data.stats.topReactedPost.user?.profilePicture)} className="w-10 h-10 rounded-xl" alt="" />
                                                <div>
                                                    <p className="text-xs font-bold line-clamp-1">{data.stats.topReactedPost.content || "Sin texto"}</p>
                                                    <p className="text-[8px] text-gray-500 font-bold uppercase">{data.stats.topReactedPost.user?.username} • {data.stats.topReactedPost.reactions?.length} reacciones</p>
                                                </div>
                                            </div>
                                            <button onClick={() => openIntervention({ ...data.stats.topReactedPost, entityType: 'post' })} className="px-4 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase">Ver</button>
                                        </div>
                                    ) : <p className="text-[10px] text-gray-600 italic">No hay datos de interacción aún.</p>}
                                </section>
                            </div>

                            <section className="bg-gradient-to-r from-green-900/10 to-transparent border border-white/5 rounded-[2rem] p-6 lg:p-10">
                                <div className="flex flex-col lg:flex-row items-center gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black uppercase tracking-tighter text-green-500 mb-2">Auditoría Cuántica de IDs</h3>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ingresa cualquier ID de la red para extraer sus propiedades técnicas completas.</p>
                                    </div>
                                    <form onSubmit={handleIdAudit} className="w-full lg:w-96 flex bg-black/40 border border-white/10 rounded-2xl p-1.5 focus-within:border-green-500/50 transition-all">
                                        <input 
                                            type="text" 
                                            placeholder="HEX_ID_DE_REGISTRO" 
                                            className="bg-transparent flex-1 px-4 py-3 text-xs font-bold outline-none font-mono"
                                            value={auditIdValue}
                                            onChange={(e) => setAuditIdValue(e.target.value)}
                                        />
                                        <button 
                                            type="submit" 
                                            disabled={auditIdLoading} 
                                            className="px-6 bg-green-600 hover:bg-green-500 text-white font-black uppercase text-[10px] rounded-xl flex items-center justify-center gap-2 transition-all"
                                        >
                                            {auditIdLoading ? <Loader2 size={14} className="animate-spin" /> : 'Extraer Datos'}
                                        </button>
                                    </form>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                <section className="bg-white/5 border border-white/5 rounded-[1.5rem] lg:rounded-[2.5rem] p-5 lg:p-8">
                                    <h2 className="text-xs lg:text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                        <UserPlus size={18} className="text-green-500" /> Nuevos Ingresos
                                    </h2>
                                    <div className="space-y-4">
                                        {data.recentUsers?.map((user) => (
                                            <div key={user._id} className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                                                        {user.profilePicture ? (
                                                            <img src={getFullImageUrl(user.profilePicture)} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full bg-white/5 flex items-center justify-center text-[10px] font-black">{user.username[0].toUpperCase()}</div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs">{user.username}</p>
                                                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-green-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                                                        <Clock size={10} /> {new Date(user.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="bg-white/5 border border-white/5 rounded-[1.5rem] lg:rounded-[2.5rem] p-5 lg:p-8">
                                    <h2 className="text-xs lg:text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                        <ShieldAlert size={18} className="text-red-600" /> Casilleros de Vigilancia
                                    </h2>
                                    <div className="space-y-3">
                                        {data.reportedUsers.map((u) => (
                                            <div key={u._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 gap-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={getFullImageUrl(u.profilePicture)} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                                                    <div>
                                                        <p className="font-bold text-sm tracking-tight">{u.username}</p>
                                                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{u.reports} reporte(s)</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border flex-1 text-center ${u.reports >= 25 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                                        {u.reports >= 25 ? 'CRITICAL' : 'OBSERVACIÓN'}
                                                    </div>
                                                    <button onClick={() => openIntervention({ ...u, entityType: 'user' })} className="px-3 py-1.5 bg-red-600 rounded-lg text-[9px] uppercase font-black tracking-widest flex-1 text-center">
                                                        Intervenir
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'appearance' && (
                        <motion.div key="appearance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <section className="bg-white/5 border border-white/5 p-6 xs:p-8 rounded-[2rem] space-y-8">
                                <div>
                                    <h3 className="text-xl font-black mb-2 tracking-tighter text-white uppercase flex items-center gap-2">
                                        <Palette size={24} className="text-red-600" /> Identidad Visual
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight italic">Modifica el ADN estético de la red global.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Color Primario (Botones, Destacados)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-2xl overflow-hidden"
                                                value={getSetting('primaryColor') || '#ef4444'}
                                                onChange={(e) => handleUpdateSetting('primaryColor', e.target.value)}
                                            />
                                            <p className="text-xs font-mono font-bold uppercase">{getSetting('primaryColor')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">Color de Acento (Hovers, Bordes)</label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                className="w-16 h-16 bg-transparent border-none cursor-pointer rounded-2xl overflow-hidden"
                                                value={getSetting('accentColor') || '#dc2626'}
                                                onChange={(e) => handleUpdateSetting('accentColor', e.target.value)}
                                            />
                                            <p className="text-xs font-mono font-bold uppercase">{getSetting('accentColor')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[9px] font-black uppercase text-gray-500 ml-2">URL del Logo (Branding Corporativo)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-[11px] outline-none focus:border-red-500 transition-all font-bold"
                                                value={getSetting('appLogo') || '/logo.png'}
                                                onChange={(e) => {
                                                    const newData = { ...data };
                                                    const s = newData.settings.find(x => x.key === 'appLogo');
                                                    if (s) s.value = e.target.value;
                                                    setData(newData);
                                                }}
                                            />
                                            <button onClick={() => handleUpdateSetting('appLogo', getSetting('appLogo'))} className="px-6 bg-white text-black font-black uppercase text-[9px] rounded-xl">Aplicar</button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'media' && (
                        <motion.div key="media" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                            <div className="p-4 bg-[#0a0a0a] rounded-2xl border border-white/5 flex items-center gap-3">
                                <SearchIcon className="text-gray-500" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por contenido, título o usuario..." 
                                    className="bg-transparent flex-1 text-xs font-bold font-['Outfit'] outline-none placeholder:text-gray-700"
                                    value={mediaSearchQuery}
                                    onChange={(e) => setMediaSearchQuery(e.target.value)}
                                />
                                {mediaSearchQuery && (
                                    <button onClick={() => setMediaSearchQuery('')} className="p-1 hover:bg-white/5 rounded-full"><X size={14} /></button>
                                )}
                            </div>

                            <section>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                    <ImageIcon size={18} /> Publicaciones Recientes ({data.recentPosts?.filter(p => p.content?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || p.user?.username?.toLowerCase().includes(mediaSearchQuery.toLowerCase())).length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {data.recentPosts?.filter(post => 
                                        post.content?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || 
                                        post.user?.username?.toLowerCase().includes(mediaSearchQuery.toLowerCase())
                                    ).map((post) => (
                                        <MediaCard 
                                            key={post._id}
                                            type="post"
                                            id={post._id}
                                            content={post.content}
                                            media={getFullImageUrl(post.media?.[0]?.url)}
                                            author={post.user}
                                            date={post.createdAt}
                                            onDelete={(e) => { e.stopPropagation(); handleDeleteContent(post._id, 'post'); }}
                                            onView={() => openIntervention({ ...post, entityType: 'post' })}
                                            reactionsCount={post.reactions?.length}
                                        />
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500 mb-6 flex items-center gap-2">
                                    <PlayCircle size={18} /> Videos Recientes ({data.recentVideos?.filter(v => v.title?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || v.user?.username?.toLowerCase().includes(mediaSearchQuery.toLowerCase())).length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {data.recentVideos?.filter(video => 
                                        video.title?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || 
                                        video.user?.username?.toLowerCase().includes(mediaSearchQuery.toLowerCase())
                                    ).map((video) => (
                                        <MediaCard 
                                            key={video._id}
                                            type="video"
                                            id={video._id}
                                            content={video.title}
                                            media={getFullImageUrl(video.videoUrl)}
                                            author={video.user}
                                            date={video.createdAt}
                                            thumbnail={getFullImageUrl(video.thumbnailUrl)}
                                            onDelete={(e) => { e.stopPropagation(); handleDeleteContent(video._id, 'video'); }}
                                            onView={() => openIntervention({ ...video, entityType: 'video' })}
                                            reactionsCount={video.reactions?.length}
                                        />
                                    ))}
                                </div>
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'support' && (
                        <motion.div key="support" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="flex gap-2 p-1.5 bg-[#0a0a0a] rounded-2xl border border-white/5 w-fit">
                                <button onClick={() => setTicketFilter('open')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${ticketFilter === 'open' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>Activos</button>
                                <button onClick={() => setTicketFilter('resolved')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${ticketFilter === 'resolved' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>Resueltos</button>
                                <button onClick={() => setTicketFilter('all')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${ticketFilter === 'all' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>Todos</button>
                            </div>

                            <div className="bg-white/5 border border-white/5 rounded-[1.5rem] lg:rounded-[2.5rem] p-5 lg:p-8">
                                <h2 className="text-xs lg:text-lg font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                                    <LifeBuoy size={18} className="text-blue-500" /> Historial de Soporte ({filteredTickets.length})
                                </h2>
                                <div className="space-y-4">
                                    {filteredTickets.map((t) => (
                                        <div key={t._id} className={`p-5 bg-black/40 rounded-2xl border transition-all space-y-4 ${t.status === 'resolved' ? 'border-green-500/10' : 'border-white/5 hover:border-red-600/20'}`}>
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        <Mail size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-xs uppercase tracking-tight">{t.name}</p>
                                                        <p className="text-[9px] text-gray-600">{t.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border ${t.status === 'resolved' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'}`}>
                                                        {t.status === 'open' ? 'Pendiente' : t.status === 'resolved' ? 'Resuelto' : t.status}
                                                    </span>
                                                    <div className="flex items-center justify-end gap-1 mt-2 text-[8px] text-gray-700 font-black uppercase">
                                                        <Calendar size={10} /> {new Date(t.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/5 rounded-2xl">
                                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-widest">{t.subject}</p>
                                                <p className="text-[11px] text-gray-300 leading-relaxed italic">"{t.message}"</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {t.status === 'open' ? (
                                                    <button onClick={() => handleUpdateTicketStatus(t._id, 'resolved')} className="flex-1 py-3 bg-green-600 text-white font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-green-500 transition-all flex items-center justify-center gap-2">
                                                        <CheckCircle size={14} /> Marcar Resuelto
                                                    </button>
                                                ) : (
                                                    <button onClick={() => handleUpdateTicketStatus(t._id, 'open')} className="flex-1 py-3 bg-white/5 text-gray-500 border border-white/5 font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-white/10 transition-all">
                                                        Reabrir Ticket
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteTicket(t._id)} className="px-4 py-3 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'search' && (
                        <motion.div key="search" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 p-2 bg-[#0a0a0a] rounded-[1.5rem] border border-white/5">
                                <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="bg-white/5 sm:bg-transparent px-4 py-2.5 sm:py-3 border-white/5 font-black uppercase tracking-widest text-[9px] outline-none rounded-xl sm:rounded-none sm:border-r">
                                    <option value="user" className="bg-[#0a0a0a]">Usuarios</option>
                                    <option value="post" className="bg-[#0a0a0a]">Posts</option>
                                    <option value="video" className="bg-[#0a0a0a]">Media</option>
                                </select>
                                <input type="text" placeholder="Búsqueda avanzada..." className="flex-1 bg-transparent px-3 py-2.5 sm:py-3 placeholder-gray-700 outline-none text-[11px] font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <button type="submit" className="p-2.5 sm:p-4 bg-red-600 rounded-xl sm:rounded-2xl hover:bg-red-500 transition-all flex items-center justify-center">
                                    {searching ? <Loader2 size={16} className="animate-spin" /> : <SearchIcon size={16} />}
                                </button>
                            </form>
                            <div className="grid grid-cols-1 gap-3">
                                {searchResults.map((res) => (
                                    <div key={res._id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center font-black text-xs text-gray-500 border border-white/10 overflow-hidden">
                                                {(searchType === 'user' && res.profilePicture) ? <img src={res.profilePicture} className="w-full h-full object-cover" alt="" /> : searchType.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm tracking-tight">{searchType === 'user' ? res.username : (res.title || res.content?.substring(0, 30) + '...')}</p>
                                                <p className="text-[8px] font-black uppercase text-red-500 tracking-widest">ID_{res._id.substring(0, 8)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => openIntervention({ ...res, entityType: searchType })} className="w-full sm:w-auto px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                                            Administrar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'ads' && (
                        <motion.div key="ads" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                            <section className="bg-gradient-to-br from-red-600/10 to-transparent border border-white/5 p-6 xs:p-8 rounded-[2rem] space-y-6">
                                <div>
                                    <h3 className="text-xl font-black mb-2 tracking-tighter text-red-500 uppercase flex items-center gap-2">
                                        <Megaphone size={24} /> Modo Megáfono
                                    </h3>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight italic">Envía una notificación global a toda la red de Bromichat.</p>
                                </div>
                                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Asunto"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[11px] outline-none focus:border-red-500 transition-all font-bold"
                                        value={annTitle}
                                        onChange={(e) => setAnnTitle(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Mensaje..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-[11px] outline-none focus:border-red-500 transition-all min-h-[120px] font-medium"
                                        value={annMessage}
                                        onChange={(e) => setAnnMessage(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="submit"
                                        disabled={sendingAnn || !annTitle || !annMessage}
                                        className="w-full py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-red-500 transition-all disabled:opacity-30"
                                    >
                                        {sendingAnn ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} /> Emitir Anuncio Global</>}
                                    </button>
                                </form>
                            </section>

                            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem] space-y-6">
                                <div className="flex items-center justify-between p-4 bg-black/60 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Settings className="text-gray-400" size={18} />
                                        <p className="text-xs font-bold uppercase tracking-tighter">Anuncios en Banner</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateSetting('adsEnabled', !data.settings.find(s => s.key === 'adsEnabled')?.value)}
                                        className={`relative h-7 w-12 rounded-full transition-all flex items-center p-0.5 ${data.settings.find(s => s.key === 'adsEnabled')?.value ? 'bg-red-600' : 'bg-gray-800'}`}
                                    >
                                        <div className={`h-6 w-6 bg-white rounded-full transition-all ${data.settings.find(s => s.key === 'adsEnabled')?.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <textarea
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs outline-none focus:border-red-500 transition-all min-h-[100px] font-medium"
                                        value={data.settings.find(s => s.key === 'welcomeMessage')?.value || ''}
                                        onChange={(e) => {
                                            const newData = { ...data };
                                            const setting = newData.settings.find(s => s.key === 'welcomeMessage');
                                            if (setting) setting.value = e.target.value;
                                            setData(newData);
                                        }}
                                    />
                                    <button onClick={() => handleUpdateSetting('welcomeMessage', data.settings.find(s => s.key === 'welcomeMessage')?.value)} className="w-full lg:w-auto px-6 py-3 bg-white text-black font-black uppercase text-[9px] tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                        Actualizar Banner
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-[2rem]">
                                <h3 className="text-lg font-black tracking-tighter mb-6 flex items-center gap-2 uppercase">
                                    <ShieldAlert className="text-green-500" size={18} /> Identidad
                                </h3>
                                <div className="p-5 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-xs uppercase tracking-tight">Verificación Estricta</p>
                                        <p className="text-[9px] text-gray-500 mt-1">Denegar acceso a terminales sin auditoría de email.</p>
                                    </div>
                                    <button
                                        onClick={() => handleUpdateSetting('strictEmailVerification', !data.settings.find(s => s.key === 'strictEmailVerification')?.value)}
                                        className={`relative h-7 w-12 rounded-full transition-all flex items-center p-0.5 ${data.settings.find(s => s.key === 'strictEmailVerification')?.value ? 'bg-green-600' : 'bg-gray-800'}`}
                                    >
                                        <div className={`h-6 w-6 bg-white rounded-full transition-all ${data.settings.find(s => s.key === 'strictEmailVerification')?.value ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isInterventionModalOpen && selectedEntity && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 xs:p-6 bg-black/80 backdrop-blur-sm">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden">
                                <div className="p-5 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-sm font-black uppercase tracking-tighter">Intervención</h3>
                                    <button onClick={() => setIsInterventionModalOpen(false)} className="p-1.5 hover:bg-white/5 rounded-full"><X size={18} /></button>
                                </div>
                                <div className="p-5 space-y-6">
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center overflow-hidden">
                                            {selectedEntity.profilePicture ? <img src={selectedEntity.profilePicture} className="w-full h-full object-cover" alt="" /> : <ImageIcon size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-xs">{selectedEntity.username || selectedEntity.title || 'Contenido'}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedEntity.entityType === 'user' ? (
                                            <>
                                                <ActionButton label="Promover a Admin" onClick={() => handleUpdateRole(selectedEntity._id, 'admin')} disabled={selectedEntity.role === 'admin'} />
                                                <ActionButton label="Quitar Rango" onClick={() => handleUpdateRole(selectedEntity._id, 'user')} disabled={selectedEntity.role === 'user'} variant="warning" />
                                                <ActionButton label="BAN PERMANENTE (IP)" onClick={() => handlePermanentlyBanUser(selectedEntity._id)} variant="danger" />
                                                <ActionButton label="Purgar Usuario" onClick={() => handleDeleteUser(selectedEntity._id)} variant="danger" />
                                            </>
                                        ) : (
                                            <div className="space-y-4">
                                                {/* Visibility of content for Audit */}
                                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">AUDITORÍA DE CONTENIDO</p>
                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600/10 rounded-full border border-red-500/20">
                                                            <Activity size={10} className="text-red-500" />
                                                            <span className="text-[9px] font-black">{selectedEntity.reactions?.length || 0} REACCIONES</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {selectedEntity.media?.[0]?.url && (
                                                        <img 
                                                            src={getFullImageUrl(selectedEntity.media[0].url)} 
                                                            className="w-full aspect-video object-contain rounded-xl bg-black border border-white/5" 
                                                            alt="Media Evidence" 
                                                        />
                                                    )}
                                                    {selectedEntity.videoUrl && (
                                                        <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center">
                                                            <img src={getFullImageUrl(selectedEntity.thumbnailUrl)} className="w-full h-full object-contain opacity-40" alt="Video Preview" />
                                                            <PlayCircle className="absolute text-red-600" size={32} />
                                                        </div>
                                                    )}
                                                    
                                                    <div className="p-3 bg-black/40 rounded-xl">
                                                        <p className="text-[11px] text-gray-300 font-bold leading-relaxed">
                                                            {selectedEntity.content || selectedEntity.title || "No hay texto adjunto."}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex gap-2 text-[8px] font-black uppercase text-gray-500">
                                                        <span>ID: {selectedEntity._id}</span>
                                                        <span>•</span>
                                                        <span>CR: {new Date(selectedEntity.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                
                                                <ActionButton label={`Eliminar ${selectedEntity.entityType.toUpperCase()} Permanentemente`} onClick={() => handleDeleteContent(selectedEntity._id, selectedEntity.entityType)} variant="danger" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {isConfirmModalOpen && (
                        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 text-center">
                                <AlertTriangle size={48} className="mx-auto text-red-600 mb-4" />
                                <h3 className="text-sm font-black uppercase mb-2 text-white">{confirmConfig.title}</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-8 leading-relaxed">{confirmConfig.message}</p>
                                <div className="space-y-2">
                                    <button onClick={confirmConfig.onConfirm} className="w-full py-4 bg-red-600 text-white text-[9px] font-black uppercase rounded-2xl shadow-xl shadow-red-900/30">Confirmar Acción</button>
                                    <button onClick={() => setIsConfirmModalOpen(false)} className="w-full py-4 text-gray-600 text-[9px] font-black uppercase">Cancelar</button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {isLogoutModalOpen && (
                        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xs bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-8 text-center">
                                <LogOut size={32} className="mx-auto text-red-600 mb-4" />
                                <h3 className="text-sm font-black uppercase mb-2 text-white">¿Desconectar Mando?</h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-6">El acceso será revocado de esta terminal.</p>
                                <div className="space-y-2">
                                    <button onClick={confirmLogout} className="w-full py-3 bg-red-600 text-white text-[9px] font-black uppercase rounded-xl">Confirmar</button>
                                    <button onClick={() => setIsLogoutModalOpen(false)} className="w-full py-3 bg-white/5 text-gray-500 text-[9px] font-black uppercase rounded-xl">Cancelar</button>
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
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-3 rounded-xl transition-all ${active ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}>
        {icon}
        <span className="text-[10px] uppercase font-black tracking-widest">{label}</span>
    </button>
);

const StatCard = ({ icon, label, value, trend, trendType = 'up', showPulse = false }) => (
    <div className="bg-[#0a0a0a] border border-white/5 p-5 rounded-[1.5rem] lg:rounded-[2.5rem] hover:border-white/10 transition-all flex flex-col justify-between group h-40 lg:h-64">
        <div className="flex justify-between items-start">
            <div className="p-3 bg-white/5 rounded-xl group-hover:bg-red-600 transition-all">
                {showPulse ? (
                    <div className="relative">
                        {icon}
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                ) : icon}
            </div>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${trendType === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{trend}</span>
        </div>
        <div>
            <p className="text-gray-500 text-[8px] lg:text-[10px] uppercase font-black tracking-widest mb-1">{label}</p>
            <p className="text-2xl lg:text-5xl font-black tracking-tighter">{value}</p>
        </div>
    </div>
);

const MediaCard = ({ type, content, media, author, date, onDelete, onView, thumbnail, reactionsCount }) => {
    return (
        <div 
            onClick={onView}
            className="bg-black/60 border border-white/5 rounded-2xl overflow-hidden group hover:border-red-600/30 transition-all relative cursor-pointer"
        >
        <div className="aspect-video bg-white/5 relative overflow-hidden flex items-center justify-center">
            {type === 'post' && media ? (
                <img src={media} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" alt="" />
            ) : type === 'video' ? (
                <div className="w-full h-full flex items-center justify-center relative">
                    <img src={thumbnail} className="w-full h-full object-contain opacity-60" alt="" />
                    <PlayCircle className="absolute text-white/50 group-hover:text-red-600 transition-colors" size={40} />
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-red-600/5 text-gray-700">
                    <FileText size={40} />
                </div>
            )}
            
            {/* Branding Indicator (Logo B) */}
            <div className="absolute bottom-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 opacity-60 group-hover:opacity-100 transition-opacity">
                <img src={bLogo} className="w-3 h-3 xs:w-4 xs:h-4 object-contain" alt="" />
            </div>
            
            <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
                <Activity size={10} className="text-red-500" />
                <span className="text-[8px] font-black">{reactionsCount || 0}</span>
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <div className="p-4">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10">
                        <img src={getFullImageUrl(author?.profilePicture)} className="w-full h-full object-cover" alt="" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400">{author?.username}</p>
                </div>
                <p className="text-[8px] text-gray-600 font-bold uppercase">{new Date(date).toLocaleDateString()}</p>
            </div>
            <p className="text-[10px] text-gray-300 font-medium line-clamp-2 mb-4 h-8">{content || "Sin descripción"}</p>
            <button
                onClick={onDelete}
                className="w-full py-2.5 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                <Trash2 size={12} /> Eliminar Registro
            </button>
        </div>
        </div>
    );
};

const ActionButton = ({ label, onClick, variant = 'default', disabled = false }) => {
    const variants = {
        default: 'bg-white/5 text-white border-white/10',
        warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        danger: 'bg-red-600 text-white border-red-500/20'
    };
    return (
        <button onClick={onClick} disabled={disabled} className={`w-full py-3.5 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-30 ${variants[variant]}`}>
            {label}
        </button>
    );
};

export default AdminDashboard;
