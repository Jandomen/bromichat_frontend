import React, { useState, useContext, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
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
import { FaShare, FaRegComment, FaThumbsUp, FaEllipsisH } from 'react-icons/fa';
import defaultProfile from '../../assets/default-profile.png';

import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import ReactionsModal from './ReactionsModal';
import ShareModal from './ShareModal';

// El componente CommentItem interno ha sido eliminado para usar el universal de ../UI/CommentItem

const PostItem = ({ post, onUpdate, isDetail = false }) => {
    const { token, user, setUser } = useContext(AuthContext);
    const { showToast, showConfirm, setSelectedPostId } = useUI();
    const [editingPostId, setEditingPostId] = useState(null);
    const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
            const res = await axios.post(
                `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/react`,
                { type },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (onUpdate) onUpdate(res.data);
        } catch (error) {
            showToast('Error al reaccionar', 'error');
            if (onUpdate) onUpdate(previousPost);
        }
    };

    const handleShare = async (postId, shareContent = '') => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/share`,
                { content: shareContent },
                { headers: { Authorization: `Bearer ${token}` } }
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
            const res = await axios.post(
                `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment`,
                { comment: content },
                { headers: { Authorization: `Bearer ${token}` } }
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
            const res = await axios.post(
                `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${parentId}/reply`,
                { comment: content },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (onUpdate) onUpdate(res.data);
            showToast('Respuesta enviada', 'success');
        } catch (error) {
            showToast('Error al responder', 'error');
        }
    };

    const handleEditComment = async (content, commentId) => {
        try {
            const res = await axios.put(
                `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${commentId}`,
                { comment: content },
                { headers: { Authorization: `Bearer ${token}` } }
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
                const res = await axios.delete(
                    `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${commentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
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
                await axios.delete(`${process.env.REACT_APP_API_BACKEND}/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
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
            const res = await axios.post(
                `${process.env.REACT_APP_API_BACKEND}/users/save/${post._id}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
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
            className={`relative bg-white rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.06)] border border-gray-100 transition-all duration-700 animate-fade-in mb-16 group/post overflow-hidden ${!isDetail ? 'cursor-pointer hover:shadow-[0_50px_150px_rgba(0,0,0,0.12)]' : ''}`}
        >
            {/* Upper Section (The Post) */}
            <div className="bg-white">
                {/* Post Header */}
                <div className="p-8 sm:p-12 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Link to={`/user/${post.user?._id}`} className="relative group/avatar shrink-0">
                            <div className="p-1 bg-gradient-to-tr from-primary-200 to-white rounded-[2.5rem] transform transition-all duration-700 group-hover/avatar:scale-105 shadow-md">
                                <img
                                    src={post.user?.profilePicture ? getFullImageUrl(post.user.profilePicture) : defaultProfile}
                                    alt={post.user?.username}
                                    className="w-16 h-16 rounded-[2.2rem] object-cover border-4 border-white"
                                    onError={(e) => (e.target.src = defaultProfile)}
                                />
                            </div>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <Link to={`/user/${post.user?._id}`} className="text-2xl font-black text-slate-900 hover:text-primary-600 transition-colors tracking-tighter">
                                    {post.user?.username || 'Usuario'}
                                </Link>
                                {post.sharedFrom && (
                                    <span className="flex items-center gap-2 text-[9px] font-black text-primary-600 uppercase tracking-[0.25em] bg-primary-50 px-4 py-1.5 rounded-full border border-primary-100">
                                        <FaShare size={9} className="transform -scale-x-100" />
                                        REPOST
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap tabular-nums">
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap tabular-nums">
                                    {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative group/options">
                        <button className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-300 transition-all hover:text-primary-600 border border-transparent hover:border-slate-100">
                            <FaEllipsisH size={18} />
                        </button>
                        <div className="absolute right-0 mt-4 w-64 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] opacity-0 invisible group-hover/options:opacity-100 group-hover/options:visible transition-all duration-500 z-50 p-2 transform translate-y-4 group-hover/options:translate-y-0 scale-95 group-hover/options:scale-100 shadow-xl">
                            {post.user?._id === user?._id && (
                                <>
                                    <button
                                        className="w-full text-left px-6 py-4 hover:bg-primary-50 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-4 transition-colors"
                                        onClick={() => setEditingPostId(post._id)}
                                    >
                                        <span className="text-xl">✍️</span> Editar Historia
                                    </button>
                                    <button
                                        className="w-full text-left px-6 py-4 hover:bg-red-50 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-4 transition-colors"
                                        onClick={() => handleDeletePost(post._id)}
                                    >
                                        <span className="text-xl">🗑️</span> Eliminar
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleSavePost}
                                className={`w-full text-left px-6 py-4 rounded-[1.75rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 transition-all ${isSaved ? 'bg-primary-50 text-primary-600' : 'hover:bg-slate-50 text-slate-700'}`}
                            >
                                <span className={`text-xl transition-transform ${isSaved ? 'scale-110' : ''}`}>{isSaved ? '🔖' : '🔖'}</span>
                                {isSaved ? 'Guardado' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Post Body Section */}
                <div className="px-8 sm:px-12 pb-10">
                    <div className="relative">
                        {editingPostId === post._id ? (
                            <EditPostForm
                                initialContent={post.content}
                                onSave={async (newContent) => {
                                    try {
                                        const res = await axios.put(
                                            `${process.env.REACT_APP_API_BACKEND}/posts/${editingPostId}`,
                                            { content: newContent },
                                            { headers: { Authorization: `Bearer ${token}` } }
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
                            <div className="relative pl-8 border-l-4 border-primary-500/20 py-2 group-hover/post:border-primary-500/40 transition-colors">
                                <p className={`text-slate-900 whitespace-pre-wrap font-bold tracking-tight leading-[1.35] transition-all duration-500 ${post.media?.length === 0 ? 'text-2xl sm:text-5xl' : 'text-xl sm:text-2xl'
                                    }`}>
                                    {post.content}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Media Section */}
                {post.media?.length > 0 && (
                    <div className="px-8 sm:px-12 pb-12">
                        <div className="rounded-[3.5rem] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.12)] border border-gray-100 bg-slate-50 overflow-hidden transform group-hover/post:scale-[1.01] transition-transform duration-1000">
                            <Swiper
                                modules={[Navigation, Pagination, Keyboard]}
                                navigation
                                pagination={{ clickable: true, dynamicBullets: true }}
                                keyboard={{ enabled: true }}
                                className="w-full aspect-square sm:aspect-video"
                            >
                                {post.media.map((file, idx) => (
                                    <SwiperSlide key={idx} className="flex items-center justify-center relative">
                                        {file.mediaType === 'image' ? (
                                            <img
                                                src={getFullImageUrl(file.url)}
                                                alt="Contenido"
                                                className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                                                onClick={() => setSelectedMedia(file)}
                                                onError={(e) => (e.target.src = defaultProfile)}
                                            />
                                        ) : file.mediaType === 'video' ? (
                                            <div className="relative w-full h-full group/video">
                                                <video
                                                    src={getFullImageUrl(file.url)}
                                                    className="w-full h-full object-cover bg-black"
                                                />
                                                <div
                                                    className="absolute inset-0 bg-black/20 group-hover/video:bg-black/40 flex items-center justify-center cursor-pointer transition-all"
                                                    onClick={() => setSelectedMedia(file)}
                                                >
                                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover/video:scale-110 transition-transform">
                                                        <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full bg-white text-gray-400 p-12 text-center">
                                                <span className="text-8xl mb-8 transform group-hover:scale-110 transition-transform">📄</span>
                                                <a
                                                    href={getFullImageUrl(file.url)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="bg-primary-600 text-white px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/30 active:scale-95"
                                                >
                                                    Ver Documento
                                                </a>
                                                <p className="text-[11px] font-black text-slate-300 mt-8 truncate w-full px-20 uppercase tracking-[0.2em]">{file.url.split('/').pop()}</p>
                                            </div>
                                        )}
                                    </SwiperSlide>
                                ))}
                            </Swiper>
                        </div>
                    </div>
                )}
            </div>

            {/* Interaction Stats & Actions (Differentiator Surface) */}
            <div className="relative bg-slate-50/50 border-t border-slate-100">
                <div className="p-8 sm:p-12">
                    {/* Stats */}
                    <div className="flex flex-wrap items-center justify-between gap-6 mb-10 px-4">
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-4 cursor-pointer" onClick={() => setIsReactionsModalOpen(true)}>
                                {post.reactions?.slice(0, 3).map((r, i) => (
                                    <div key={i} className="bg-white rounded-[1.25rem] w-12 h-12 flex items-center justify-center shadow-2xl border border-slate-50 z-[3] hover:z-[10] transition-all hover:-translate-y-2">
                                        <span className="text-2xl transform active:scale-150 transition-transform">
                                            {REACTION_TYPES.find(rt => rt.type === r.type)?.emoji || '👍'}
                                        </span>
                                    </div>
                                ))}
                                {post.reactions?.length > 3 && (
                                    <div className="bg-slate-900 rounded-[1.25rem] w-12 h-12 flex items-center justify-center text-white text-[10px] font-black z-[1] shadow-2xl border-2 border-white">
                                        +{post.reactions.length - 3}
                                    </div>
                                )}
                            </div>
                            <span
                                className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] cursor-pointer hover:text-primary-600 transition-colors"
                                onClick={() => setIsReactionsModalOpen(true)}
                            >
                                {post.reactions?.length || 0} Vibras de Energía
                            </span>
                        </div>
                        <div className="px-6 py-2.5 bg-white border border-slate-100 rounded-full shadow-sm flex items-center gap-3">
                            <span className="text-lg">💬</span>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                {post.comments?.length || 0} Conversaciones
                            </span>
                        </div>
                    </div>

                    {/* Actions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="relative group/react w-full">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleReact(post._id, currentReactionData ? currentReactionData.type : 'like');
                                }}
                                className={`flex items-center justify-center gap-4 w-full py-5 rounded-[2rem] transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-sm hover:shadow-2xl hover:-translate-y-1 border focus:outline-none ${currentReactionData
                                    ? 'bg-primary-600 text-white border-primary-500 shadow-primary-500/20'
                                    : 'bg-white text-slate-400 border-slate-100 hover:text-primary-600 hover:border-primary-100'
                                    }`}
                            >
                                {currentReactionData ? (
                                    <span className="flex items-center gap-3">
                                        <span className="text-2xl animate-bounce-short">{currentReactionData.emoji}</span>
                                        <span>{currentReactionData.label}</span>
                                    </span>
                                ) : (
                                    <>
                                        <FaThumbsUp size={16} className="text-slate-200 group-hover/react:text-primary-400 transition-colors" />
                                        <span>Reaccionar</span>
                                    </>
                                )}
                            </button>
                            <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-500 delay-100 transform translate-y-4 group-hover/react:translate-y-0 z-40">
                                <ReactionPicker
                                    onSelect={(type) => handleReact(post._id, type)}
                                    currentReaction={userReaction?.type}
                                />
                            </div>
                        </div>

                        <button
                            onClick={() => document.getElementById(`comment-input-${post._id}`).focus()}
                            className="flex items-center justify-center gap-4 py-5 bg-white hover:bg-slate-50 rounded-[2rem] border border-slate-100 transition-all font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 shadow-sm hover:shadow-2xl hover:-translate-y-1 group/comment-btn"
                        >
                            <FaRegComment size={16} className="text-slate-200 group-hover/comment-btn:text-primary-400 transition-colors" />
                            <span>Conversar</span>
                        </button>

                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="flex items-center justify-center gap-4 py-5 bg-white hover:bg-slate-50 rounded-[2rem] border border-slate-100 transition-all font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 shadow-sm hover:shadow-2xl hover:-translate-y-1 group/share"
                        >
                            <FaShare size={16} className="text-slate-200 transition-transform group-hover/share:translate-x-1 group-hover/share:text-primary-400" />
                            <span>Compartir</span>
                        </button>
                    </div>
                </div>

                {/* Comments Section (Distinct Surface) */}
                <div className="px-8 sm:px-12 pb-12">
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-xl overflow-hidden p-6 sm:p-10">
                        {/* Separator Title */}
                        <div className="flex items-center gap-6 mb-12">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] whitespace-nowrap">COMENTARIOS RECIENTES</span>
                            <div className="h-px flex-1 bg-slate-100"></div>
                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                <span className="text-lg">👇</span>
                            </div>
                        </div>

                        {/* List of Comments */}
                        <div className="max-h-[800px] overflow-y-auto pr-2 sm:pr-8 scrollbar-thin scrollbar-thumb-primary-100/50 hover:scrollbar-thumb-primary-200 scrollbar-track-transparent touch-pan-y scroll-smooth overscroll-contain">
                            {rootComments.length === 0 ? (
                                <div className="py-24 text-center">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner text-4xl transform rotate-12">🙊</div>
                                    <h4 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-tighter">Silencio Absoluto</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sé el primero en romper el hielo</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
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

                        {/* Sticky Input for Comment */}
                        <form onSubmit={handleComment} className="mt-12 group/form">
                            <div className="flex items-center gap-5 p-3 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] focus-within:bg-white focus-within:ring-[15px] focus-within:ring-primary-50 focus-within:border-primary-200 transition-all duration-700 shadow-inner">
                                <div className="w-14 h-14 rounded-[1.75rem] overflow-hidden flex-shrink-0 border-2 border-white shadow-xl transform transition-transform group-focus-within/form:scale-105">
                                    <img
                                        src={user?.profilePicture ? getFullImageUrl(user.profilePicture) : defaultProfile}
                                        className="w-full h-full object-cover"
                                        alt="Yo"
                                        onError={(e) => e.target.src = defaultProfile}
                                    />
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        id={`comment-input-${post._id}`}
                                        type="text"
                                        name="comment"
                                        autoComplete="off"
                                        placeholder="Escribe una respuesta brillante..."
                                        className="w-full bg-transparent border-none px-2 py-4 text-sm font-bold text-slate-800 placeholder:text-slate-300 outline-none"
                                    />
                                </div>
                                <button type="submit" className="bg-primary-600 text-white w-14 h-14 rounded-[1.75rem] hover:bg-primary-700 transition-all shadow-2xl shadow-primary-500/40 flex items-center justify-center active:scale-90 group/send">
                                    <svg className="w-6 h-6 transform transition-transform group-hover/send:rotate-12 group-hover/send:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
                    className="fixed inset-0 z-[150] bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center p-4 sm:p-12 animate-fade-in"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div className="absolute top-0 left-0 w-full p-6 sm:p-10 flex justify-between items-center z-[160] pointer-events-none">
                        <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 hidden sm:block">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">Vista de Alta Fidelidad</span>
                        </div>
                        <button
                            className="pointer-events-auto text-white/40 hover:text-white transition-all p-5 hover:bg-white/10 rounded-full group/close border border-white/5 bg-white/5 backdrop-blur-xl"
                            onClick={() => setSelectedMedia(null)}
                        >
                            <svg className="w-8 h-8 transition-transform group-hover/close:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="relative w-full h-full flex items-center justify-center animate-zoom-in" onClick={(e) => e.stopPropagation()}>
                        {selectedMedia.mediaType === 'video' ? (
                            <video
                                src={getFullImageUrl(selectedMedia.url)}
                                controls
                                autoPlay
                                className="max-w-full max-h-full rounded-3xl shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/10"
                            />
                        ) : (
                            <img
                                src={getFullImageUrl(selectedMedia.url)}
                                className="max-w-full max-h-full object-contain rounded-3xl shadow-[0_0_150px_rgba(0,0,0,0.8)] border border-white/10"
                                alt="Full size"
                            />
                        )}

                        {/* Meta Info Overlay (Optional but premium) */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500 flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Formato</span>
                                <span className="text-xs font-bold text-white uppercase tracking-tighter">{selectedMedia.mediaType}</span>
                            </div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <a
                                href={getFullImageUrl(selectedMedia.url)}
                                download
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Descargar Original
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </article>
    );
};

export default PostItem;
