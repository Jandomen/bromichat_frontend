import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/keyboard';
import 'swiper/css/pagination';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import CommentItem from '../UI/CommentItem';
import EditPostForm from './EditPostForm';
import {
    Share2,
    MessageCircle,
    MoreHorizontal,
    Smile,
    CheckCircle2,
    ChevronRight
} from 'lucide-react';
import defaultProfile from '../../assets/default-profile.png';
import formatTime from '../../utils/formatTime';

import { REACTION_TYPES } from '../UI/ReactionPicker';
import ReactionsModal from './ReactionsModal';
import ShareModal from './ShareModal';

const PostItem = ({ post, onUpdate, isDetail = false }) => {
    const { user } = useContext(AuthContext);
    const { showToast, showConfirm, setSelectedPostId } = useUI();
    const [editingPostId, setEditingPostId] = useState(null);
    const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(isDetail);
    const [viewerIndex, setViewerIndex] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (isReactionsModalOpen) setIsReactionsModalOpen(false);
                if (isShareModalOpen) setIsShareModalOpen(false);
                if (viewerIndex !== null) setViewerIndex(null);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isReactionsModalOpen, isShareModalOpen, viewerIndex]);

    const handlePostClick = (e) => {
        if (isDetail) return;
        
        // Tags that should ALWAYS be interactive and NOT trigger the modal
        const strictlyInteractive = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SVG', 'PATH'];
        if (strictlyInteractive.includes(e.target.tagName) || e.target.closest('button') || e.target.closest('a')) {
            return;
        }

        // If it's a VIDEO or IMAGE and we are in the feed, we want to open the focused detail view
        setSelectedPostId(post._id);
    };

    const handleReact = async (postId, type) => {
        const previousPost = { ...post };
        const existingReactionIndex = post.reactions?.findIndex(r => (r.user?._id || r.user) === user?._id);
        let newReactions = [...(post.reactions || [])];

        if (existingReactionIndex > -1) {
            if (newReactions[existingReactionIndex].type === type) {
                newReactions.splice(existingReactionIndex, 1);
            } else {
                newReactions[existingReactionIndex] = { ...newReactions[existingReactionIndex], type };
            }
        } else {
            newReactions.push({ user: { _id: user?._id, username: user?.username }, type });
        }

        const optimisticPost = { ...post, reactions: newReactions };
        if (onUpdate) onUpdate(optimisticPost);

        try {
            const res = await api.post(`/posts/${postId}/react`, { type });
            if (onUpdate) onUpdate(res.data);
        } catch (error) {
            showToast('Error al reaccionar', 'error');
            if (onUpdate) onUpdate(previousPost);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        const content = e.target.comment.value;
        if (!content.trim()) return;

        try {
            const res = await api.post(`/posts/${post._id}/comment`, { comment: content });
            if (onUpdate) onUpdate(res.data);
            e.target.reset();
            showToast('Opinión enviada', 'success');
        } catch (error) {
            showToast('No se pudo enviar la opinión', 'error');
        }
    };

    const handleReply = async (content, parentId) => {
        if (!content.trim()) return;
        try {
            const res = await api.post(`/posts/${post._id}/comment`, { comment: content, parentId });
            if (onUpdate) onUpdate(res.data);
            showToast('Respuesta enviada', 'success');
        } catch (error) {
            showToast('Error al responder', 'error');
        }
    };

    const handleEditComment = async (content, commentId) => {
        if (!content.trim()) return;
        try {
            const res = await api.put(`/posts/${post._id}/comment/${commentId}`, { comment: content });
            if (onUpdate) onUpdate(res.data);
            showToast('Respuesta editada', 'success');
        } catch (error) {
            showToast('Error al editar', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        const confirmed = await showConfirm('¿Seguro que quieres borrar esta opinión?');
        if (!confirmed) return;
        try {
            const res = await api.delete(`/posts/${post._id}/comment/${commentId}`);
            if (onUpdate) onUpdate(res.data);
            showToast('Opinión eliminada', 'success');
        } catch (error) {
            showToast('No se pudo borrar', 'error');
        }
    };

    const userReaction = post.reactions?.find(r => (r.user?._id || r.user) === user?._id);
    const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction?.type);

    const rootComments = useMemo(() =>
        (post.comments || []).filter(c => !c.parentId),
    [post.comments]);

    return (
        <div 
            onClick={handlePostClick}
            className={`w-full mb-4 shadow-[0_4px_30px_rgb(0,0,0,0.06)] flex flex-col font-sans select-none relative transition-all overflow-hidden ${isDetail ? 'bg-white rounded-[2.5rem] border border-gray-100' : 'bg-white rounded-3xl border border-gray-100'}`}
        >
            {/* Sophisticated Header: Clean & Professional */}
            <header className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b ${isDetail ? 'bg-white border-gray-100' : 'border-gray-50 bg-gray-50/20'}`}>
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link to={`/user/${post.user?._id || post.user}`} className="relative group/avatar">
                        <img
                            src={getFullImageUrl(post.user?.profilePicture)}
                            className={`w-11 h-11 rounded-3xl object-cover border border-gray-100 shadow-sm transition-transform group-hover/avatar:scale-105`}
                            alt={post.user?.username}
                            onError={(e) => (e.target.src = defaultProfile)}
                        />
                        {post.user?.role === 'admin' && (
                            <div className="absolute -bottom-1 -right-1 bg-red-600 rounded-full p-0.5 shadow-lg border-2 border-white">
                                <CheckCircle2 size={10} className="text-white fill-white" />
                            </div>
                        )}
                    </Link>
                    <div className="flex flex-col min-w-0">
                        <Link to={`/user/${post.user?._id || post.user}`} className={`text-[14.5px] sm:text-[15.5px] font-bold leading-tight tracking-tight hover:text-red-600 transition-colors truncate max-w-[150px] sm:max-w-none text-gray-900`}>
                            {post.user?.username}
                        </Link>
                        <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5 whitespace-nowrap overflow-hidden text-gray-400`}>
                            {formatTime(post.createdAt)} <span className="w-1.5 h-1.5 bg-red-600/50 rounded-full shrink-0"></span> <span className="opacity-70 truncate font-semibold">Global</span>
                        </span>
                    </div>
                </div>
                {(user?._id === (post.user?._id || post.user)) && (
                    <button 
                        onClick={() => setEditingPostId(post._id)}
                        className={`p-2.5 rounded-xl transition-all ${isDetail ? 'text-gray-400 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-400 hover:bg-white hover:text-gray-900'}`}
                    >
                        <MoreHorizontal size={20} />
                    </button>
                )}
            </header>

            {/* Content: Clean & Sophisticated font-sans */}
            <div className={`px-5 sm:px-8 pb-5 sm:pb-8 pt-3 sm:pt-6 ${isDetail ? 'bg-white' : ''}`}>
                {editingPostId ? (
                    <EditPostForm post={post} onUpdate={onUpdate} onCancel={() => setEditingPostId(null)} />
                ) : (
                    <p className={`whitespace-pre-wrap leading-relaxed tracking-tight text-gray-800 font-normal ${post.content?.length < 80 && (!post.media || post.media.length === 0) ? 'text-[17px] sm:text-[22px] font-medium text-center py-8 sm:py-14 px-4 sm:px-12 bg-gray-50/50 rounded-[2rem] border border-gray-100 italic' : 'text-[14px] sm:text-[15px]'}`}>
                        {post.content}
                    </p>
                )}
            </div>

            {/* Media Section: Edge-to-Edge PRO Swiper */}
            {post.media?.length > 0 && (
                <div className="w-full bg-gray-100 relative group/media overflow-hidden border-y border-gray-100 cursor-pointer">
                    <Swiper
                        modules={[Keyboard, Pagination]}
                        keyboard={{ enabled: true }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        className="w-full h-full"
                        style={{ aspectRatio: post.media[0].mediaType === 'video' ? '9/16' : '1/1' }}
                    >
                        {post.media.map((file, idx) => (
                            <SwiperSlide key={idx} className="flex justify-center items-center bg-black cursor-pointer">
                                {file.mediaType === 'image' ? (
                                    <img
                                        src={getFullImageUrl(file.url)}
                                        className="w-full h-full object-contain"
                                        alt=""
                                        loading="lazy"
                                    />
                                ) : (
                                    <video
                                        src={getFullImageUrl(file.url)}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        muted
                                        loop
                                    />
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    {post.media.length > 1 && (
                        <div className="absolute top-3 right-3 z-10 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/10 pointer-events-none">
                            1 / {post.media.length}
                        </div>
                    )}
                </div>
            )}

            {/* Stats Area */}
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 mx-1">
                <div className="flex items-center gap-1.5 cursor-pointer hover:underline" onClick={() => setIsReactionsModalOpen(true)}>
                    <div className="flex -space-x-1.5 mr-0.5">
                        <div className="w-4.5 h-4.5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-[10px]">👍</span>
                        </div>
                        <div className="w-4.5 h-4.5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-[10px]">❤️</span>
                        </div>
                    </div>
                    <span className="text-[13px] font-bold text-gray-500">{post.reactions?.length || 0}</span>
                </div>
                <div className="flex items-center gap-4 text-[13px] font-bold text-gray-500">
                    <button onClick={() => setShowComments(!showComments)} className="hover:underline">
                        {post.comments?.length || 0} opiniones
                    </button>
                    <button className="hover:underline">8 viralizados</button>
                </div>
            </div>

            {/* Reactions Summary: Sophisticated horizontal display */}
            {post.reactions?.length > 0 && (
                <div className={`px-5 py-3 flex items-center justify-between border-t border-gray-50 ${isDetail ? 'bg-gray-50/10' : 'bg-transparent'}`}>
                    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                        {REACTION_TYPES.map(rt => {
                            const count = post.reactions.filter(r => r.type === rt.type).length;
                            if (count === 0) return null;
                            return (
                                <div key={rt.type} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-100 rounded-full shadow-sm hover:scale-105 transition-transform active:scale-95 shrink-0">
                                    <span className="text-sm">{rt.emoji}</span>
                                    <span className="text-[10px] font-bold text-gray-600">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                    {isDetail && <ChevronRight size={14} className="text-gray-300 ml-2" />}
                </div>
            )}

            {/* Premium Action Bar */}
            <div className={`flex px-2 sm:px-4 py-2.5 gap-1.5 sm:gap-2 border-t border-gray-50 ${isDetail ? 'bg-white' : 'bg-gray-50/20'}`}>
                <div className="relative group/react flex-1">
                    <button 
                        onClick={() => handleReact(post._id, currentReactionData?.type || 'like')}
                        className={`flex items-center justify-center gap-1.5 sm:gap-3 py-3 rounded-2xl transition-all font-bold text-[10px] sm:text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 flex-1 w-full ${currentReactionData ? 'text-red-600 bg-red-600/5 border border-red-100' : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'}`}
                    >
                        {currentReactionData ? (
                            <span className="flex items-center gap-1.5 animate-in slide-in-from-bottom-2">
                                <span className="text-[18px] sm:text-[20px]">{currentReactionData.emoji}</span>
                                <span className="truncate max-w-[60px] sm:max-w-none">{currentReactionData.label}</span>
                            </span>
                        ) : (
                            <><Smile size={16} className="sm:size-[18px]" /> <span className="truncate">Vibrar</span></>
                        )}
                    </button>
                    {/* Floating Reaction Picker: Responsive width */}
                    <div className={`opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all absolute bottom-full left-0 mb-3 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1.5 sm:p-2 border scale-75 origin-bottom-center group-hover/react:scale-100 duration-300 flex gap-0.5 sm:gap-1 rounded-full ${isDetail ? 'bg-[#111111]/90 backdrop-blur-2xl border-white/10' : 'bg-white/95 backdrop-blur-xl border-gray-100'} max-w-[90vw] overflow-x-auto no-scrollbar`}>
                        {REACTION_TYPES.map(r => (
                            <button
                                key={r.type}
                                onClick={() => handleReact(post._id, r.type)}
                                className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-xl sm:text-2xl hover:scale-150 transition-transform duration-300 transform active:scale-90 hover:bg-red-600/10 rounded-full shrink-0"
                                title={r.label}
                            >
                                {r.emoji}
                            </button>
                        ))}
                    </div>
                </div>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 flex-1 ${isDetail ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                >
                    <MessageCircle size={16} className="sm:size-[18px] stroke-[2.5px]" /> <span className="truncate">Opinar</span>
                </button>
                <button 
                    onClick={() => setIsShareModalOpen(true)}
                    className={`flex items-center justify-center gap-1.5 sm:gap-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 flex-1 ${isDetail ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-white hover:text-gray-900'}`}
                >
                    <Share2 size={16} className="sm:size-[18px] stroke-[2.5px]" /> <span className="truncate">Viral</span>
                </button>
            </div>

            {/* Opinion Section */}
            {showComments && (
                <div className="border-t border-gray-100 bg-gray-50/10 p-3 space-y-4">
                    <form onSubmit={handleComment} className="flex gap-2">
                        <img src={getFullImageUrl(user?.profilePicture)} className="w-8 h-8 rounded-full border border-gray-200" alt="" />
                        <div className="flex-1 relative">
                            <input 
                                name="comment"
                                type="text" 
                                placeholder={`Da tu opinión como ${user?.username}...`}
                                className="w-full bg-gray-100 rounded-full px-4 py-2 text-[13px] border-none outline-none focus:ring-1 focus:ring-gray-300 transition-all"
                            />
                        </div>
                    </form>
                    <div className="space-y-4">
                        {rootComments.slice(0, 3).map(comment => (
                            <CommentItem 
                                key={comment._id} 
                                comment={comment} 
                                post={post} 
                                user={user} 
                                currentUser={user}
                                allComments={post.comments || []}
                                onReply={handleReply}
                                onEdit={handleEditComment}
                                onDelete={handleDeleteComment}
                                themeColor="red-600"
                            />
                        ))}
                        {rootComments.length > 3 && (
                            <button className="text-[13px] font-bold text-gray-500 hover:underline px-2">Ver more opiniones...</button>
                        )}
                    </div>
                </div>
            )}

            {isReactionsModalOpen && (
                <ReactionsModal 
                    isOpen={true} 
                    onClose={() => setIsReactionsModalOpen(false)} 
                    reactions={post.reactions || []} 
                />
            )}
            {isShareModalOpen && (
                <ShareModal 
                    isOpen={true} 
                    onClose={() => setIsShareModalOpen(false)} 
                    onShare={(content) => {}} 
                    item={post}
                />
            )}
        </div>
    );
};

export default PostItem;
