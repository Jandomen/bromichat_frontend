import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';
import { History, Trash2, Eye, Calendar, Clock, ChevronDown, Download, Share2, Filter } from 'lucide-react';

const StoryArchive = () => {
    const { token } = useContext(AuthContext);
    const { showToast, showConfirm } = useUI();
    const [archivedStories, setArchivedStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStory, setSelectedStory] = useState(null);
    const [filter, setFilter] = useState('all'); // all, active, expired

    const fetchArchive = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/stories/archive', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArchivedStories(res.data);
        } catch (error) {
            console.error("Error fetching archive", error);
            showToast("Error al cargar el archivo", "error");
        } finally {
            setLoading(false);
        }
    }, [token, showToast]);

    useEffect(() => {
        fetchArchive();
    }, [fetchArchive]);

    const handleDelete = (storyId) => {
        showConfirm(
            'Eliminar de Colección',
            '¿Deseas eliminar permanentemente esta historia? Desaparecerá de tu archivo personal y no podrá recuperarse.',
            async () => {
                try {
                    await api.delete(`/stories/${storyId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setArchivedStories(prev => prev.filter(s => s._id !== storyId));
                    showToast("Historia eliminada con éxito", "success");
                    if (selectedStory?._id === storyId) setSelectedStory(null);
                } catch (error) {
                    console.error("Error deleting story:", error);
                    showToast("No se pudo eliminar la historia", "error");
                }
            }
        );
    };

    const sortedGroups = useMemo(() => {
        const filtered = archivedStories.filter(s => {
            const isActive = new Date(s.expiresAt) > new Date();
            if (filter === 'active') return isActive;
            if (filter === 'expired') return !isActive;
            return true;
        });

        // Group by creation date (Year-Month-Day)
        const groups = {};
        filtered.forEach(story => {
            const dateStr = new Date(story.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            if (!groups[dateStr]) groups[dateStr] = [];
            groups[dateStr].push(story);
        });

        return Object.entries(groups).map(([date, items]) => ({ date, items }));
    }, [archivedStories, filter]);

    const handleShare = (story) => {
        // Mock share or copy link
        navigator.clipboard.writeText(story.mediaUrl || "Historia de Bromichat");
        showToast("Enlace de contenido copiado", "success");
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <History size={24} className="text-primary-600 animate-pulse" />
                </div>
            </div>
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest animate-pulse">Consultando tu bault...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-12">
            {/* Header with Stats & Filter */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-slate-900 text-white rounded-[1.25rem] shadow-xl">
                            <History size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                            Tu <span className="text-primary-600">Galería</span> de Momentos
                        </h3>
                    </div>
                    <p className="text-sm text-slate-400 font-bold max-w-sm italic">
                        Un espacio privado donde tus historias permanecen vivas para siempre.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                    {[
                        { id: 'all', label: 'Todos', icon: Filter },
                        { id: 'active', label: 'Activos', icon: Eye },
                        { id: 'expired', label: 'Archivo', icon: Clock }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setFilter(btn.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all duration-300 ${filter === btn.id
                                ? 'bg-white text-primary-600 shadow-lg shadow-primary-500/10 scale-105'
                                : 'text-slate-500 hover:text-slate-900'
                                }`}
                        >
                            <btn.icon size={14} strokeWidth={3} />
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {archivedStories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border border-white">
                        <History size={36} className="text-slate-300" />
                    </div>
                    <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Baúl Vacío</h4>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Tus historias archivadas aparecerán aquí automáticamente</p>
                </div>
            ) : sortedGroups.length === 0 ? (
                <div className="text-center py-20 grayscale opacity-40">
                    <Filter size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">No hay resultados para este filtro</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {sortedGroups.map((group) => (
                        <section key={group.date} className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                            <div className="flex items-center gap-4 mb-8 sticky top-0 z-10 bg-[#F8FAFC]/90 backdrop-blur-md py-3 -mx-2 px-2">
                                <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                                <h4 className="flex items-center gap-2 font-black text-slate-700 uppercase tracking-widest text-[11px] bg-white px-5 py-2 rounded-full border border-slate-100 shadow-sm">
                                    <Calendar size={14} className="text-primary-600" />
                                    {group.date}
                                </h4>
                                <div className="h-0.5 flex-1 bg-gradient-to-l from-transparent to-slate-200" />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                {group.items.map((story) => (
                                    <div
                                        key={story._id}
                                        className="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-slate-950 shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-primary-500/10 ring-1 ring-white/10"
                                        onClick={() => setSelectedStory(story)}
                                    >
                                        {/* Media Content */}
                                        <div className="w-full h-full transform transition-transform duration-700 group-hover:scale-110">
                                            {story.type === 'image' && (
                                                <img src={story.mediaUrl} className="w-full h-full object-cover opacity-85" alt="Archive" />
                                            )}
                                            {story.type === 'video' && (
                                                <video src={story.mediaUrl} className="w-full h-full object-cover opacity-85" />
                                            )}
                                            {story.type === 'text' && (
                                                <div className="w-full h-full flex items-center justify-center p-6 text-center text-white font-black text-xs uppercase" style={{ backgroundColor: story.backgroundColor }}>
                                                    <span className="line-clamp-6 leading-relaxed bg-black/10 p-2 rounded-xl backdrop-blur-sm">{story.content}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Badges */}
                                        <div className="absolute top-4 inset-x-4 flex justify-between items-start z-10">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-xl rounded-2xl text-[10px] font-black text-white border border-white/10 shadow-lg">
                                                <Eye size={12} strokeWidth={3} />
                                                {story.views?.length || 0}
                                            </div>

                                            {new Date(story.expiresAt) > new Date() && (
                                                <div className="px-3 py-1.5 bg-green-500/90 backdrop-blur-md rounded-2xl text-[9px] font-black text-white shadow-lg shadow-green-500/20 uppercase tracking-tighter flex items-center gap-1">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                    Activo
                                                </div>
                                            )}
                                        </div>

                                        {/* Hover Actions Bar */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedStory(story); }}
                                                    className="flex-1 bg-white text-black py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                                                >
                                                    Explorar
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(story._id); }}
                                                    className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-500 transition-all active:scale-90 shadow-xl"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Time Badge (Bottom Left) */}
                                        <div className="absolute bottom-5 left-5 right-5 pointer-events-none group-hover:opacity-0 transition-opacity">
                                            <div className="flex items-center gap-2 text-white/70">
                                                <Clock size={12} className="text-white" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                                                    {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}

            {/* Premium Archive Viewer Modal */}
            {selectedStory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/98 backdrop-blur-2xl p-4 sm:p-8 animate-in fade-in duration-500">
                    <button
                        onClick={() => setSelectedStory(null)}
                        className="absolute top-6 right-6 p-4 bg-white/5 text-white hover:bg-white/10 rounded-full transition-all border border-white/5 z-[110]"
                    >
                        <ChevronDown size={28} />
                    </button>

                    <div className="relative w-full max-w-lg aspect-[9/16] md:max-h-[85vh] bg-black rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)] border border-white/5 flex flex-col group/viewer">

                        {/* Top Gradient for visibility */}
                        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none" />

                        {/* Media Content */}
                        <div className="flex-1 w-full bg-black flex items-center justify-center relative">
                            {selectedStory.type === 'image' && <img src={selectedStory.mediaUrl} className="w-full h-full object-contain" alt="View" />}
                            {selectedStory.type === 'video' && <video src={selectedStory.mediaUrl} className="w-full h-full object-contain" controls autoPlay loop />}
                            {selectedStory.type === 'text' && (
                                <div className="w-full h-full flex items-center justify-center p-12 text-center text-white text-3xl font-black leading-tight italic" style={{ backgroundColor: selectedStory.backgroundColor }}>
                                    <span className="bg-black/20 p-6 rounded-[2.5rem] backdrop-blur-md shadow-2xl border border-white/10">
                                        {selectedStory.content}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Story Analytics Overlay (Bottom) */}
                        <div className="absolute bottom-0 inset-x-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                                <Calendar size={18} className="text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest leading-none">Memorizado el</p>
                                                <p className="text-sm font-bold text-white mt-1">
                                                    {new Date(selectedStory.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long' })} • {new Date(selectedStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-center">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase">Vistas</p>
                                            <p className="text-xl font-black text-white">{selectedStory.views?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleShare(selectedStory)}
                                        className="flex-1 h-14 bg-white text-black rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
                                    >
                                        <Share2 size={16} /> Compartir
                                    </button>
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = selectedStory.mediaUrl;
                                            link.download = `story-${selectedStory._id}.jpg`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="w-14 h-14 bg-slate-800 text-white rounded-[1.25rem] flex items-center justify-center shadow-xl hover:bg-slate-700 transition-all border border-white/5 active:scale-90"
                                    >
                                        <Download size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedStory._id)}
                                        className="w-14 h-14 bg-red-600/20 text-red-500 rounded-[1.25rem] flex items-center justify-center shadow-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/20 active:scale-90"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryArchive;

