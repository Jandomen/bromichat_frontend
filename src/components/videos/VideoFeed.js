import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Heart, MessageCircle, Share2, User, Music, PlayCircle, MoreVertical, X, Send } from 'lucide-react';
import defaultProfile from '../../assets/default-profile.png';
import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import ShareModal from '../posts/ShareModal';
import CommentItem from '../UI/CommentItem';

const VideoFeed = () => {
    const { token, user: currentUser } = useContext(AuthContext);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showX, setShowX] = useState(true);
    const containerRef = useRef(null);
    const xTimeoutRef = useRef(null);

    const resetXTimeout = () => {
        setShowX(true);
        if (xTimeoutRef.current) clearTimeout(xTimeoutRef.current);
        xTimeoutRef.current = setTimeout(() => setShowX(false), 3000);
    };

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
                const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/feed`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVideos(res.data);
            } catch (err) {
                console.error("Error fetching video feed", err);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchFeed();

        const handleInteraction = () => resetXTimeout();
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        resetXTimeout();

        return () => {
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            if (xTimeoutRef.current) clearTimeout(xTimeoutRef.current);
        };
    }, [token]);

    if (loading) return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={`flex flex-col overflow-y-scroll snap-y snap-mandatory hide-scrollbar bg-black transition-all duration-500 ${isFullscreen ? 'fixed inset-0 h-screen w-screen z-[200] rounded-none' : 'h-[85vh] rounded-2xl shadow-2xl'}`}
        >
            {/* Close button for Fullscreen */}
            {isFullscreen && (
                <button
                    onClick={() => setIsFullscreen(false)}
                    className={`fixed top-6 right-6 z-[210] p-4 bg-white/10 hover:bg-red-600 text-white rounded-full backdrop-blur-xl border border-white/20 transition-all duration-500 shadow-2xl active:scale-90 ${showX ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <X size={28} />
                </button>
            )}

            {videos.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white">
                    No hay videos para mostrar aún.
                </div>
            ) : (
                videos.map((video) => (
                    <VideoCard
                        key={video._id}
                        video={video}
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

const VideoCard = ({ video, token, currentUser, isFullscreen, onToggleFullscreen }) => {
    const videoRef = useRef(null);
    const [localVideo, setLocalVideo] = useState(video);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showInfo, setShowInfo] = useState(true);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const { showToast } = useUI();
    const infoTimeoutRef = useRef(null);

    useEffect(() => {
        const options = { threshold: 0.7 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    videoRef.current?.play().catch(() => { });
                    setIsPlaying(true);
                    resetInfoTimeout();
                } else {
                    videoRef.current?.pause();
                    setIsPlaying(false);
                }
            });
        }, options);
        if (videoRef.current) observer.observe(videoRef.current);
        return () => {
            observer.disconnect();
            if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        };
    }, []);

    const resetInfoTimeout = () => {
        setShowInfo(true);
        if (infoTimeoutRef.current) clearTimeout(infoTimeoutRef.current);
        infoTimeoutRef.current = setTimeout(() => { setShowInfo(false); }, 4000);
    };

    const handleReact = async (type) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${video._id}/react`, { type }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocalVideo(prev => ({ ...prev, reactions: res.data }));
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (e, commentId = null, textOverride = null) => {
        if (e) e.preventDefault();
        const text = textOverride || commentText;
        if (!text.trim()) return;

        try {
            let res;
            if (commentId) {
                res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${video._id}/comment/${commentId}/reply`, { comment: text }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${video._id}/comment`, { comment: text }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCommentText('');
            }
            setLocalVideo(prev => ({ ...prev, comments: res.data }));
        } catch (err) { console.error(err); }
    };

    const handleEditComment = async (text, commentId) => {
        try {
            const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/videos/${video._id}/comment/${commentId}`, { comment: text }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocalVideo(prev => ({ ...prev, comments: res.data }));
            showToast('Comentario actualizado', 'success');
        } catch (err) { console.error(err); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            const res = await axios.delete(`${process.env.REACT_APP_API_BACKEND}/videos/${video._id}/comment/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLocalVideo(prev => ({ ...prev, comments: res.data }));
            showToast('Comentario eliminado', 'success');
        } catch (err) { console.error(err); }
    };

    const handleShare = async (shareContent) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${video._id}/share`, { content: shareContent }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showToast('¡Video compartido en tu muro!', 'success');
        } catch (err) {
            showToast('Error al compartir', 'error');
        }
    };

    const togglePlay = () => {
        if (!isFullscreen) {
            onToggleFullscreen();
            return;
        }
        if (isPlaying) videoRef.current.pause();
        else videoRef.current.play();
        setIsPlaying(!isPlaying);
        resetInfoTimeout();
    };

    const userReaction = localVideo.reactions?.find(r => r.user === currentUser?._id);
    const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction?.type);

    const [showFullDescription, setShowFullDescription] = useState(false);

    const truncateDescription = (text, maxLength = 80) => {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <div className="relative h-full w-full flex-shrink-0 snap-start flex items-center justify-center bg-black group">
            <video
                ref={videoRef}
                onClick={togglePlay}
                src={video.videoUrl}
                loop
                playsInline
                className={`h-full w-full transition-all duration-700 cursor-pointer ${isFullscreen ? 'object-contain' : 'object-contain md:object-cover md:max-w-4xl lg:max-w-5xl'}`}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* NEW: Integrated Social Dashboard (Moving away from TikTok style) */}
            <div className={`absolute bottom-6 inset-x-4 sm:inset-x-8 transition-all duration-700 transform ${showInfo && !showComments ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-4 sm:p-6 shadow-2xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                        {/* User & Description Info */}
                        <div className="flex items-center gap-4 flex-grow">
                            <div className="relative group/avatar cursor-pointer">
                                <img
                                    src={getFullImageUrl(video.user?.profilePicture)}
                                    className="w-14 h-14 rounded-[1.25rem] border-2 border-red-500/50 shadow-lg object-cover transform transition-transform group-hover/avatar:scale-105"
                                    alt=""
                                    onError={e => e.target.src = defaultProfile}
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-zinc-900 rounded-full" />
                            </div>

                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-black text-white text-lg tracking-tight truncate">@{video.user?.username}</span>
                                    {/* Small animated music tag */}
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600/20 text-red-400 text-[9px] font-black uppercase rounded-md border border-red-600/30">
                                        <Music size={10} className="animate-pulse" />
                                        <span>Audio Original</span>
                                    </div>
                                </div>

                                <div className="mt-1">
                                    <p className="text-zinc-300 text-sm leading-relaxed font-medium">
                                        {showFullDescription ? (video.description || video.title) : truncateDescription(video.description || video.title)}
                                        {(video.description || video.title)?.length > 80 && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowFullDescription(!showFullDescription); }}
                                                className="ml-2 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-widest"
                                            >
                                                {showFullDescription ? 'Ver menos' : 'Ver más'}
                                            </button>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* NEW: Horizontal Interaction Bar (Consistent with PhotoFeed) */}
                        <div className="flex items-center justify-center gap-2 sm:gap-4 bg-black/40 p-2 rounded-[1.75rem] border border-white/5 self-center md:self-auto">
                            {/* Reaction Button Case */}
                            <div className="relative group/react">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const userReaction = localVideo.reactions?.find(r => r.user === currentUser?._id);
                                        if (userReaction) {
                                            handleReact(userReaction.type);
                                        } else {
                                            handleReact('like');
                                        }
                                    }}
                                    className="flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 hover:bg-white/5 group/btn"
                                >
                                    <div className={`transition-all duration-300 transform group-hover/btn:scale-110 ${currentReactionData ? 'scale-110' : ''}`}>
                                        {currentReactionData ? <span className="text-2xl drop-shadow-md">{currentReactionData.emoji}</span> : <Heart className="w-5 h-5 text-zinc-400 group-hover/btn:text-white transition-all" />}
                                    </div>
                                    <span className="text-xs font-black text-white">{localVideo.reactions?.length || 0}</span>
                                </button>

                                <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-500 delay-150 transform translate-y-1 group-hover/react:translate-y-0 z-[150]">
                                    <ReactionPicker
                                        onSelect={(type) => handleReact(type)}
                                        currentReaction={localVideo.reactions?.find(r => r.user === currentUser?._id)?.type}
                                        align="center"
                                    />
                                </div>
                            </div>

                            <div className="w-[1px] h-8 bg-white/10 mx-1" />

                            {/* Comment Button */}
                            <button
                                onClick={() => setShowComments(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 hover:bg-white/5 group/btn"
                            >
                                <MessageCircle className="w-5 h-5 text-zinc-400 group-hover/btn:text-white transition-colors" />
                                <span className="text-xs font-black text-white">{localVideo.comments?.length || 0}</span>
                            </button>

                            <div className="w-[1px] h-8 bg-white/10 mx-1" />

                            {/* Share Button */}
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl transition-all duration-300 hover:bg-white/5 group/btn"
                            >
                                <Share2 className="w-5 h-5 text-zinc-400 group-hover/btn:text-white transition-colors" />
                                <span className="text-xs font-black text-white uppercase tracking-tighter">Compartir</span>
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            {/* Comments Drawer (TikTok Style) */}
            {showComments && (
                <div className="absolute inset-x-0 bottom-0 top-1/4 bg-zinc-900 rounded-t-3xl z-[100] flex flex-col animate-in slide-in-from-bottom duration-300 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/10">
                    <div className="p-4 flex items-center justify-between border-b border-white/5">
                        <span className="text-white font-black text-sm uppercase tracking-widest">{localVideo.comments?.length || 0} Comentarios</span>
                        <button onClick={() => setShowComments(false)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {localVideo.comments?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full opacity-30">
                                <MessageCircle size={48} className="text-zinc-500 mb-2" />
                                <p className="text-white text-sm font-medium uppercase tracking-widest">No hay comentarios aún</p>
                            </div>
                        ) : (
                            localVideo.comments?.filter(c => !c.parentId).map(c => (
                                <CommentItem
                                    key={c._id}
                                    comment={c}
                                    allComments={localVideo.comments}
                                    onReply={(text, pId) => handleComment(null, pId, text)}
                                    onEdit={handleEditComment}
                                    onDelete={handleDeleteComment}
                                    currentUser={currentUser}
                                    themeColor="red-600"
                                />
                            ))
                        )}
                    </div>

                    <form onSubmit={handleComment} className="p-4 bg-black/50 border-t border-white/5 flex gap-2">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Añade un comentario..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                        />
                        <button type="submit" className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors shadow-lg">
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            {!isPlaying && !showComments && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none transition-opacity duration-300">
                    <div className="bg-white/10 p-8 rounded-full backdrop-blur-md border border-white/20 animate-pulse">
                        <PlayCircle size={80} className="text-white fill-white/20" />
                    </div>
                </div>
            )}
            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShare}
                item={video}
                type="post"
            />
        </div>
    );
};

export default VideoFeed;
