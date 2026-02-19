import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Smile, Lightbulb, Users, X, Send, Trash2, Eye, Plus } from 'lucide-react';
import defaultProfile from '../../assets/default-profile.png';
import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import ShareModal from '../posts/ShareModal';
import CommentItem from '../UI/CommentItem';

const PhotoFeed = () => {
    const { token, user: currentUser } = useContext(AuthContext);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsFullscreen(false);
            if (!containerRef.current) return;
            const container = containerRef.current;
            const itemHeight = container.clientHeight;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                container.scrollBy({ top: itemHeight, behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                container.scrollBy({ top: -itemHeight, behavior: 'smooth' });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const res = await api.get('/gallery/feed');
                setPhotos(res.data);
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchFeed();
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={`flex flex-col overflow-y-scroll snap-y snap-mandatory hide-scrollbar bg-zinc-950 transition-all duration-500 ${isFullscreen ? 'fixed inset-0 h-screen w-screen z-[200] rounded-none' : 'h-[85vh] rounded-2xl shadow-2xl mt-[env(safe-area-inset-top)]'}`}
        >
            {/* Close button for Fullscreen */}
            {isFullscreen && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsFullscreen(false);
                    }}
                    className="fixed top-[calc(1.5rem+env(safe-area-inset-top))] right-6 z-[250] p-4 bg-black/40 hover:bg-red-600 text-white rounded-full backdrop-blur-xl border border-white/20 transition-all duration-500 shadow-2xl active:scale-90 opacity-100"
                >
                    <X size={28} strokeWidth={3} />
                </button>
            )}

            {photos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white font-medium">
                    No hay fotos para mostrar aún.
                </div>
            ) : (
                photos.map((photo) => (
                    <PhotoCard
                        key={photo._id}
                        photo={photo}
                        token={token}
                        currentUser={currentUser}
                        isFullscreen={isFullscreen}
                        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                    />
                ))
            )}
        </div>
    );
};

const PhotoCard = ({ photo, token, currentUser, isFullscreen, onToggleFullscreen }) => {
    const [localPhoto, setLocalPhoto] = useState(photo);
    const [showInfo, setShowInfo] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const { showToast, showConfirm } = useUI();
    const infoTimeoutRef = useRef(null);

    useEffect(() => {
        resetInfoTimeout();
        return () => { if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current); };
    }, []);

    const resetInfoTimeout = () => {
        setShowInfo(true);
        if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        infoTimeoutRef.current = setTimeout(() => { setShowInfo(false); }, 5000);
    };

    const handleReact = async (type) => {
        try {
            const res = await api.post(`/gallery/${photo._id}/react`, { type });
            setLocalPhoto(prev => ({ ...prev, reactions: res.data }));
        } catch (err) { console.error(err); }
    };

    const handleComment = async (e, commentId = null, textOverride = null) => {
        if (e) e.preventDefault();
        const text = textOverride || commentText;
        if (!text.trim()) return;
        try {
            let res;
            if (commentId) {
                res = await api.post(`/gallery/${photo._id}/comment/${commentId}/reply`, { comment: text });
            } else {
                res = await api.post(`/gallery/${photo._id}/comment`, { comment: text });
                setCommentText('');
            }
            setLocalPhoto(prev => ({ ...prev, comments: res.data }));
        } catch (err) { console.error(err); }
    };

    const handleEditComment = async (text, commentId) => {
        try {
            const res = await api.put(`/gallery/${photo._id}/comment/${commentId}`, { comment: text });
            setLocalPhoto(prev => ({ ...prev, comments: res.data }));
            showToast('Comentario actualizado', 'success');
        } catch (err) { console.error(err); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await api.delete(`/gallery/${photo._id}/comment/${commentId}`);
            setLocalPhoto(prev => ({ ...prev, comments: res.data }));
            showToast('Comentario eliminado', 'success');
        } catch (err) { console.error(err); }
    };

    const handleDeletePhoto = async () => {
        showConfirm('Eliminar contenido', '¿Estás seguro de que deseas eliminar este contenido permanentemente?', async () => {
            try {
                await api.delete(`/gallery/${photo._id}`);
                showToast('Contenido eliminado', 'success');
                window.location.reload(); // Quick way to refresh feed
            } catch (err) {
                showToast('Error al eliminar', 'error');
            }
        });
    };

    const handleShare = async (shareContent) => {
        try {
            await api.post(`/gallery/${photo._id}/share`, { content: shareContent });
            showToast('¡Foto viralizada en tu muro!', 'success');
        } catch (err) { showToast('Error al viralizar', 'error'); }
    };

    const userReaction = localPhoto.reactions?.find(r => r.user === currentUser?._id);
    const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction?.type);

    const [showFullDescription, setShowFullDescription] = useState(false);

    const truncateDescription = (text, maxLength = 80) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="relative h-full w-full flex-shrink-0 snap-start flex items-center justify-center bg-zinc-950 group" onClick={resetInfoTimeout}>
            {/* The Main Media */}
            {photo.imageUrl?.toLowerCase().includes('.mp4') || photo.mediaType === 'video' ? (
                <video
                    src={photo.imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onClick={onToggleFullscreen}
                    className={`h-full w-full transition-all duration-1000 cursor-pointer ${isFullscreen ? 'object-contain' : 'object-contain md:object-cover md:max-w-4xl lg:max-w-5xl group-hover:scale-105'}`}
                />
            ) : (
                <img
                    src={photo.imageUrl}
                    alt={photo.description || photo.title}
                    onClick={onToggleFullscreen}
                    className={`h-full w-full transition-all duration-1000 cursor-pointer ${isFullscreen ? 'object-contain' : 'object-contain md:object-cover md:max-w-4xl lg:max-w-5xl group-hover:scale-105'}`}
                />
            )}

            {/* Gradient Overlay for Readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* NEW: TikTok Style UI (Less Cluttered) */}
            <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-500 ${showInfo && !showComments ? 'opacity-100' : 'opacity-0'}`}>

                {/* Right Side Interaction Bar */}
                <div className="absolute right-4 bottom-32 flex flex-col items-center gap-6 pointer-events-auto">
                    {/* Profile */}
                    <div className="relative group/avatar">
                        <Link to={`/user/${photo.user?._id}`} onClick={(e) => e.stopPropagation()}>
                            <img
                                src={getFullImageUrl(photo.user?.profilePicture)}
                                className="w-12 h-12 rounded-full border-2 border-white shadow-xl object-cover"
                                alt=""
                                onError={e => e.target.src = defaultProfile}
                            />
                        </Link>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-lg">
                            <Plus size={12} className="text-white" />
                        </div>
                    </div>

                    {/* Like/Reaction */}
                    <div className="flex flex-col items-center gap-1 group/react relative">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const userReaction = localPhoto.reactions?.find(r => r.user === currentUser?._id);
                                if (userReaction) {
                                    handleReact(userReaction.type);
                                } else {
                                    handleReact('like');
                                }
                            }}
                            className="w-12 h-12 rounded-full bg-zinc-900/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all shadow-lg"
                        >
                            {currentReactionData ? <span className="text-2xl">{currentReactionData.emoji}</span> : <Smile className="w-6 h-6" />}
                        </button>
                        <span className="text-[10px] font-black text-white drop-shadow-lg">{localPhoto.reactions?.length || 0}</span>

                        {/* Reaction Picker on side */}
                        <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-300 absolute right-14 top-0">
                            <ReactionPicker
                                onSelect={(type) => handleReact(type)}
                                currentReaction={localPhoto.reactions?.find(r => r.user === currentUser?._id)?.type}
                                align="right"
                            />
                        </div>
                    </div>

                    {/* Comments */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
                            className="w-12 h-12 rounded-full bg-zinc-900/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all shadow-lg"
                        >
                            <Lightbulb className="w-6 h-6" />
                        </button>
                        <span className="text-[10px] font-black text-white drop-shadow-lg">{localPhoto.comments?.length || 0}</span>
                    </div>

                    {/* Views */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-zinc-900/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg">
                            <Eye className="w-6 h-6 text-zinc-300" />
                        </div>
                        <span className="text-[10px] font-black text-white drop-shadow-lg">{localPhoto.views || 0}</span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}
                            className="w-12 h-12 rounded-full bg-zinc-900/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all shadow-lg"
                        >
                            <Users className="w-6 h-6" />
                        </button>
                        <span className="text-[10px] font-bold text-white uppercase tracking-tighter drop-shadow-lg">VIRAL</span>
                    </div>

                    {/* Delete (Owner) */}
                    {currentUser?._id === photo.user?._id && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDeletePhoto(); }}
                            className="w-10 h-10 rounded-full bg-red-600/40 backdrop-blur-md flex items-center justify-center text-white border border-red-600/50 active:scale-95 transition-all shadow-lg sm:opacity-50 sm:hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                {/* Bottom Left Info Panel */}
                <div className="absolute left-4 bottom-8 right-20 flex flex-col gap-2 pointer-events-auto">
                    <div className="flex items-center gap-2">
                        <span className="font-black text-white text-base tracking-tight drop-shadow-lg">
                            @{photo.user?.username || 'Cargando...'}
                        </span>
                        <div className="px-1.5 py-0.5 bg-indigo-600/60 rounded text-[8px] font-black text-white uppercase border border-indigo-400/50">CREATIVO</div>
                    </div>

                    <div className="max-h-24 overflow-y-auto no-scrollbar">
                        <p className="text-white text-sm font-medium leading-snug drop-shadow-md">
                            {showFullDescription ? photo.description : truncateDescription(photo.description, 100)}
                            {photo.description?.length > 100 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowFullDescription(!showFullDescription); }}
                                    className="ml-1 text-zinc-300 font-bold"
                                >
                                    {showFullDescription ? ' [Menos]' : ' [Ver más]'}
                                </button>
                            )}
                        </p>
                    </div>
                </div>

            </div>

            {/* Comments Drawer (TikTok Style) */}
            {showComments && (
                <div className="absolute inset-x-0 bottom-0 top-1/4 bg-zinc-900 rounded-t-3xl z-[100] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10">
                    <div className="p-4 flex items-center justify-between border-b border-white/5">
                        <span className="text-white font-black text-sm uppercase tracking-widest">{localPhoto.comments?.length || 0} Comentarios</span>
                        <button onClick={() => setShowComments(false)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar overscroll-contain touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {localPhoto.comments?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <Lightbulb size={48} className="text-zinc-500 mb-2" />
                                <p className="text-white text-sm font-medium">No hay opiniones todavía</p>
                            </div>
                        ) : (
                            localPhoto.comments?.filter(c => !c.parentId).map(c => (
                                <CommentItem
                                    key={c._id}
                                    comment={c}
                                    allComments={localPhoto.comments}
                                    onReply={(text, pId) => handleComment(null, pId, text)}
                                    onEdit={handleEditComment}
                                    onDelete={handleDeleteComment}
                                    currentUser={currentUser}
                                    themeColor="indigo-600"
                                />
                            ))
                        )}
                    </div>

                    <form onSubmit={handleComment} className="p-4 bg-black/50 border-t border-white/5 flex gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Añade un comentario..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-600/50 transition-all"
                        />
                        <button type="submit" className="p-3 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors shadow-lg">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShare}
                item={photo}
                type="post"
            />
        </div>
    );
};


export default PhotoFeed;
