import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/keyboard';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import CommentItem from '../UI/CommentItem';
import EditPostForm from './EditPostForm';
import {
    Share2,
    MoreHorizontal,
    Send,
    X,
    Play,
    Smile,
    Lightbulb,
    Users
} from 'lucide-react';
import defaultProfile from '../../assets/default-profile.png';

import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import ReactionsModal from './ReactionsModal';
import ShareModal from './ShareModal';

// El componente CommentItem interno ha sido eliminado para usar el universal de ../UI/CommentItem

const PostItem = ({ post, onUpdate, isDetail = false }) => {
    const { user, setUser } = useContext(AuthContext);
    const { showToast, showConfirm, setSelectedPostId } = useUI();
    const [editingPostId, setEditingPostId] = useState(null);
    const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [showComments, setShowComments] = useState(isDetail);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (selectedMedia) setSelectedMedia(null);
                if (isReactionsModalOpen) setIsReactionsModalOpen(false);
                if (isShareModalOpen) setIsShareModalOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedMedia, isReactionsModalOpen, isShareModalOpen]);

    const handlePostClick = (e) => {
        // Don't open if already in detail view or if clicking an interactive element
        if (isDetail) return;

        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SVG', 'PATH'];
        if (interactiveTags.includes(e.target.tagName) || e.target.closest('button') || e.target.closest('a')) {
            return;
        }

        setSelectedPostId(post._id);
    };

    const handleReact = async (postId, type) => {
        const previousPost = { ...post };
        const existingReactionIndex = post.reactions?.findIndex(r => r.user?._id === user?._id || r.user === user?._id);
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
            const res = await api.post(
                `/posts/${postId}/react`,
                { type }
            );
            if (onUpdate) onUpdate(res.data);
        } catch (error) {
            showToast('Error al reaccionar', 'error');
            if (onUpdate) onUpdate(previousPost);
        }
    };

    const handleShare = async (postId, shareContent = '') => {
        try {
            await api.post(
                `/posts/${postId}/share`,
                { content: shareContent }
            );
            showToast('¡Publicación compartida!', 'success');
            if (onUpdate) onUpdate();
        } catch (error) {
            showToast('Error al compartir', 'error');
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        const content = e.target.comment.value;
        if (!content.trim()) return;

        try {
            const res = await api.post(
                `/posts/${post._id}/comment`,
                { comment: content }
            );
            if (onUpdate) onUpdate(res.data);
            e.target.reset();
            showToast('Comentario enviado', 'success');
        } catch (error) {
            showToast('No se pudo enviar el comentario', 'error');
        }
    };

    const handleReplyComment = async (content, parentId) => {
        try {
            const res = await api.post(
                `/posts/${post._id}/comment/${parentId}/reply`,
                { comment: content }
            );
            if (onUpdate) onUpdate(res.data);
            showToast('Respuesta enviada', 'success');
        } catch (error) {
            showToast('Error al responder', 'error');
        }
    };

    const handleEditComment = async (content, commentId) => {
        try {
            const res = await api.put(
                `/posts/${post._id}/comment/${commentId}`,
                { comment: content }
            );
            if (onUpdate) onUpdate(res.data);
            showToast('Comentario actualizado', 'success');
        } catch (error) {
            showToast('Error al editar comentario', 'error');
        }
    };

    const handleDeleteComment = async (commentId) => {
        showConfirm('Eliminar comentario', '¿Deseas eliminar este comentario?', async () => {
            try {
                const res = await api.delete(
                    `/posts/${post._id}/comment/${commentId}`
                );
                if (onUpdate) onUpdate(res.data.post || res.data);
                showToast('Comentario eliminado', 'success');
            } catch (error) {
                showToast('Error al eliminar comentario', 'error');
            }
        });
    };

    const handleDeletePost = async (postId) => {
        showConfirm('Eliminar publicación', '¿Eliminar esta publicación permanente?', async () => {
            try {
                await api.delete(`/posts/${postId}`);
                showToast('Publicación eliminada', 'success');
                if (onUpdate) onUpdate(null, postId);
            } catch (error) {
                showToast('Error al eliminar', 'error');
            }
        });
    };

    const userReaction = post.reactions?.find(r => (r.user?._id || r.user) === user?._id);
    const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction?.type);
    const isSaved = user?.savedPosts?.some(spId => (spId?._id || spId) === post._id);

    const handleSavePost = async (e) => {
        e.stopPropagation();
        try {
            const res = await api.post(
                `/users/save/${post._id}`
            );

            // Optimistically update user.savedPosts in AuthContext
            const newSavedPosts = isSaved
                ? user.savedPosts.filter(spId => (spId?._id || spId) !== post._id)
                : [...(user.savedPosts || []), post._id];

            setUser({ ...user, savedPosts: newSavedPosts });
            showToast(res.data.message, 'success');
        } catch (error) {
            showToast('Error al guardar publicación', 'error');
        }
    };

    const rootComments = useMemo(() =>
        (post.comments || []).filter(c => {
            if (!c.parentId) return true;
            // Handle cases where parentId might be an object or a string placeholder
            const pId = typeof c.parentId === 'object' ? c.parentId._id : c.parentId;
            return !pId || pId === 'null' || pId === '';
        }),
        [post.comments]);

    return (
        <article
            onClick={handlePostClick}
            className={`relative bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-300 animate-fade-in mb-4 group/post overflow-hidden ${!isDetail ? 'cursor-pointer hover:bg-gray-50/50' : ''}`}
        >
            {/* Upper Section (The Post) */}
            <div className="bg-white">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to={`/user/${post.user?._id}`} className="relative group/avatar shrink-0">
                            <img
                                src={post.user?.profilePicture ? getFullImageUrl(post.user.profilePicture) : defaultProfile}
                                alt={post.user?.username}
                                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                                loading="lazy"
                                onError={(e) => (e.target.src = defaultProfile)}
                            />
                        </Link>
                        <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <Link to={`/user/${post.user?._id}`} className="text-[15px] font-bold text-gray-900 hover:underline transition-colors leading-tight">
                                    {post.user?.username || 'Usuario'}
                                </Link>
                                {post.sharedFrom && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                                        <Share2 size={8} className="transform -scale-x-100" />
                                        REPOST
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] text-gray-500 font-medium">
                                    {new Date(post.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })}
                                </span>
                                <span className="w-0.5 h-0.5 bg-gray-300 rounded-full"></span>
                                <span className="text-[11px] text-gray-500 font-medium">
                                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group/options">
                        <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-all hover:text-gray-600">
                            <MoreHorizontal size={16} />
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover/options:opacity-100 group-hover/options:visible transition-all duration-200 z-50 p-1 transform translate-y-2 group-hover/options:translate-y-0">
                            {post.user?._id === user?._id && (
                                <>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md text-[13px] font-medium text-gray-700 flex items-center gap-3 transition-colors"
                                        onClick={() => setEditingPostId(post._id)}
                                    >
                                        <span className="text-base">✍️</span> Editar
                                    </button>
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-red-50 rounded-md text-[13px] font-medium text-red-600 flex items-center gap-3 transition-colors"
                                        onClick={() => handleDeletePost(post._id)}
                                    >
                                        <span className="text-base">🗑️</span> Eliminar
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleSavePost}
                                className={`w-full text-left px-4 py-2 rounded-md text-[13px] font-medium flex items-center gap-3 transition-all ${isSaved ? 'text-primary-600' : 'hover:bg-gray-50 text-gray-700'}`}
                            >
                                <span className="text-base">{isSaved ? '🔖' : '🔖'}</span>
                                {isSaved ? 'Guardado' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Post Body Section */}
                <div className="px-4 pb-3">
                    <div className="relative">
                        {editingPostId === post._id ? (
                            <EditPostForm
                                initialContent={post.content}
                                onSave={async (newContent) => {
                                    try {
                                        const res = await api.put(
                                            `/posts/${editingPostId}`,
                                            { content: newContent }
                                        );
                                        setEditingPostId(null);
                                        if (onUpdate) onUpdate(res.data);
                                    } catch (error) {
                                        showToast('Error al editar la historia', 'error');
                                    }
                                }}
                                onCancel={() => setEditingPostId(null)}
                            />
                        ) : (
                            <div className="py-1">
                                <p className={`text-gray-800 whitespace-pre-wrap font-normal leading-normal tracking-normal transition-all duration-500 ${post.media?.length === 0 && post.content?.length < 80 ? 'text-xl font-medium' : 'text-[15px]'
                                    }`}>
                                    {post.content}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Shared Post Content Rendering */}
                {post.sharedFrom && post.sharedFrom._id && (
                    <div className="mx-4 mb-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 mb-2">
                            <img
                                src={getFullImageUrl(post.sharedFrom.user?.profilePicture)}
                                className="w-6 h-6 rounded-full object-cover"
                                alt=""
                                onError={(e) => (e.target.src = defaultProfile)}
                            />
                            <span className="text-[12px] font-bold text-gray-700">
                                {post.sharedFrom.user?.username}
                            </span>
                        </div>
                        <p className="text-[13px] text-gray-600 line-clamp-3 mb-2">
                            {post.sharedFrom.content}
                        </p>
                        {post.sharedFrom.media && post.sharedFrom.media.length > 0 && (
                            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden border border-gray-100 shadow-sm max-h-[200px]">
                                {post.sharedFrom.media.slice(0, 4).map((m, i) => (
                                    <div
                                        key={i}
                                        className="relative aspect-square cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedMedia(m);
                                        }}
                                    >
                                        {m.mediaType === 'video' ? (
                                            <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 via-slate-900 to-black flex items-center justify-center relative group-hover:from-indigo-600/30 transition-all duration-500 overflow-hidden">
                                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                                <div className="relative w-10 h-10 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500">
                                                    <Play size={14} className="text-white fill-white translate-x-0.5" />
                                                </div>
                                                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-indigo-600/80 backdrop-blur-md rounded text-[7px] font-black text-white uppercase tracking-[0.2em] border border-white/10 shadow-xl">
                                                    REEL
                                                </div>
                                            </div>
                                        ) : (
                                            <img
                                                src={getFullImageUrl(m.url)}
                                                className="w-full h-full object-cover"
                                                alt=""
                                                onError={(e) => (e.target.src = defaultProfile)}
                                            />
                                        )}
                                        {i === 3 && post.sharedFrom.media.length > 4 && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-xs">
                                                +{post.sharedFrom.media.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Media Section */}
                {post.media?.length > 0 && (
                    <div className="border-y border-gray-100 bg-gray-50">
                        <Swiper
                            modules={[Navigation, Pagination, Keyboard]}
                            navigation
                            pagination={{ clickable: true, dynamicBullets: true }}
                            keyboard={{ enabled: true }}
                            className="w-full"
                            style={{ aspectRatio: post.media.length === 1 && post.media[0].mediaType === 'image' ? 'auto' : '1/1' }}
                        >
                            {post.media.map((file, idx) => (
                                <SwiperSlide key={idx} className="flex items-center justify-center relative bg-black">
                                    {file.mediaType === 'image' ? (
                                        <img
                                            src={getFullImageUrl(file.url)}
                                            alt="Contenido"
                                            className="w-full h-full object-contain max-h-[600px] cursor-pointer"
                                            loading="lazy"
                                            onClick={() => setSelectedMedia(file)}
                                            onError={(e) => (e.target.src = defaultProfile)}
                                        />
                                    ) : file.mediaType === 'video' ? (
                                        <div className="relative w-full aspect-square sm:aspect-video flex items-center justify-center group/video bg-black">
                                            <video
                                                src={getFullImageUrl(file.url)}
                                                className="max-w-full max-h-full"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                            />
                                            <div
                                                className="absolute inset-0 bg-black/10 group-hover/video:bg-black/40 flex items-center justify-center cursor-pointer transition-all duration-300"
                                                onClick={() => setSelectedMedia(file)}
                                            >
                                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border-2 border-white/30 group-hover/video:scale-110 group-hover/video:border-white transition-all duration-500 shadow-2xl">
                                                    <Play size={32} className="text-white fill-white translate-x-1" />
                                                </div>
                                                <div className="absolute top-4 right-4 px-3 py-1 bg-indigo-600/80 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20 shadow-lg">
                                                    Video HD
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-64 bg-white text-gray-400 p-8 text-center">
                                            <span className="text-5xl mb-4">📄</span>
                                            <a
                                                href={getFullImageUrl(file.url)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary-700 transition-all shadow-lg active:scale-95"
                                            >
                                                Ver Documento
                                            </a>
                                            <p className="text-[11px] font-medium text-gray-400 mt-4 truncate w-full px-10">{file.url.split('/').pop()}</p>
                                        </div>
                                    )}
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}
            </div>

            {/* Interaction Stats & Actions */}
            <div className="relative bg-white">
                <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center bg-white">
                    {/* Stats */}
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-1 cursor-pointer" onClick={() => setIsReactionsModalOpen(true)}>
                            {post.reactions?.slice(0, 3).map((r, i) => (
                                <div key={i} className="bg-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm border border-gray-100 z-[3]">
                                    <span className="text-[10px]">
                                        {REACTION_TYPES.find(rt => rt.type === r.type)?.emoji || '👍'}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <span
                            className="text-[13px] text-gray-500 hover:underline cursor-pointer font-medium"
                            onClick={() => setIsReactionsModalOpen(true)}
                        >
                            {post.reactions?.length || 0}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="text-[13px] text-gray-500 font-medium hover:underline"
                        >
                            {post.comments?.length || 0} comentarios
                        </button>
                    </div>
                </div>

                {/* Actions Grid */}
                <div className="flex p-1 gap-1">
                    <div className="relative group/react flex-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReact(post._id, currentReactionData ? currentReactionData.type : 'like');
                            }}
                            className={`flex items-center justify-center gap-2 w-full py-2 rounded-md transition-all font-semibold text-[13px] hover:bg-gray-100 focus:outline-none ${currentReactionData
                                ? 'text-primary-600'
                                : 'text-gray-600'
                                }`}
                        >
                            {currentReactionData ? (
                                <span className="flex items-center gap-2">
                                    <span className="text-lg animate-bounce-short">{currentReactionData.emoji}</span>
                                    <span>{currentReactionData.label}</span>
                                </span>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Smile size={18} className="text-gray-400" />
                                    <span>Me late</span>
                                </div>
                            )}
                        </button>
                        <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-300 absolute bottom-full left-0 mb-2 z-40 bg-white shadow-xl rounded-2xl p-1 border border-gray-100 transform translate-y-1 group-hover/react:translate-y-0">
                            <ReactionPicker
                                onSelect={(type) => handleReact(post._id, type)}
                                currentReaction={userReaction?.type}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (!showComments) {
                                setShowComments(true);
                                // Focus after render
                                setTimeout(() => {
                                    const input = document.getElementById(`comment-input-${post._id}`);
                                    if (input) input.focus();
                                }, 150);
                            } else {
                                const input = document.getElementById(`comment-input-${post._id}`);
                                if (input) input.focus();
                            }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-all font-semibold text-[13px] text-gray-600"
                    >
                        <Lightbulb size={18} className="text-gray-400" />
                        <span>Opinar</span>
                    </button>

                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-100 rounded-md transition-all font-semibold text-[13px] text-gray-600"
                    >
                        <Users size={18} className="text-gray-400" />
                        <span>Viralizar</span>
                    </button>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50/20 animate-in slide-in-from-top-1 duration-200">
                        {/* List of Comments */}
                        <div className="space-y-3 mt-3">
                            {rootComments.length === 0 ? (
                                <div className="py-4 text-center">
                                    <p className="text-[12px] text-gray-500">Sé el primero en comentar.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {rootComments.map(c => (
                                        <CommentItem
                                            key={c._id}
                                            comment={c}
                                            allComments={post.comments}
                                            onReply={handleReplyComment}
                                            onEdit={handleEditComment}
                                            onDelete={handleDeleteComment}
                                            currentUser={user}
                                            themeColor="primary-600"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Input for Comment */}
                        <form onSubmit={handleComment} className="mt-4 flex gap-2 items-center pb-[env(safe-area-inset-bottom)] sm:pb-0">
                            <img
                                src={user?.profilePicture ? getFullImageUrl(user.profilePicture) : defaultProfile}
                                className="w-8 h-8 rounded-full object-cover border border-gray-100"
                                alt="Yo"
                                onError={(e) => e.target.src = defaultProfile}
                            />
                            <div className="flex-1 relative flex items-center bg-gray-100 rounded-2xl px-4 py-1.5 focus-within:bg-gray-200 transition-colors">
                                <input
                                    id={`comment-input-${post._id}`}
                                    type="text"
                                    name="comment"
                                    autoComplete="off"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            handleComment(e);
                                        }
                                    }}
                                    placeholder="Escribe un comentario..."
                                    className="w-full bg-transparent border-none text-[13px] text-gray-800 placeholder:text-gray-500 outline-none"
                                />
                                <button type="submit" className="text-primary-600 p-1 hover:bg-white rounded-full transition-all active:scale-90 font-bold text-xs uppercase tracking-tighter sm:px-2">
                                    <Send size={14} />
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <ReactionsModal
                isOpen={isReactionsModalOpen}
                onClose={() => setIsReactionsModalOpen(false)}
                reactions={post.reactions || []}
            />
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={(content) => handleShare(post._id, content)}
                item={post}
                type="post"
            />

            {/* Lightbox / Media Viewer */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-fade-in"
                    onClick={() => setSelectedMedia(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white bg-black/40 p-4 rounded-full backdrop-blur-md border border-white/20 hover:bg-red-600 transition-all z-[200] flex items-center justify-center shadow-2xl"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMedia(null);
                        }}
                    >
                        <X size={32} strokeWidth={3} />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.mediaType === 'video' ? (
                            <video
                                src={getFullImageUrl(selectedMedia.url)}
                                controls
                                autoPlay
                                className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                            />
                        ) : (
                            <img
                                src={getFullImageUrl(selectedMedia.url)}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                                alt="Full size"
                            />
                        )}
                    </div>
                </div>
            )}
        </article>
    );
};

export default React.memo(PostItem);
