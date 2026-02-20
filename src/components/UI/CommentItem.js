import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Send, MoreHorizontal, Edit2, Trash2 } from 'lucide-react';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import { useUI } from '../../context/UIContext';

/**
 * Generic Recursive Comment Item
 * Supports posts, videos, and photos.
 * 
 * @param {Object} comment - The current comment object
 * @param {Array} allComments - The full list of comments for the content
 * @param {Function} onReply - Callback when a reply is submitted: (text, parentId) => void
 * @param {Function} onEdit - Callback when a comment is edited: (newText, commentId) => void
 * @param {Function} onDelete - Callback when a comment is deleted: (commentId) => void
 * @param {Object} currentUser - The currently logged-in user object
 * @param {string} themeColor - Optional color for accents (e.g. 'indigo-600', 'red-600')
 * @param {boolean} isReply - Internal flag for indentation
 */
const CommentItem = ({
    comment,
    allComments,
    onReply,
    onEdit,
    onDelete,
    currentUser,
    themeColor = 'indigo-600',
    isReply = false
}) => {
    const { highlightedCommentId, setHighlightedCommentId } = useUI();
    const commentRef = useRef(null);
    const [showReplies, setShowReplies] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.comment);
    const [showMenu, setShowMenu] = useState(false);

    const children = useMemo(() => {
        return allComments.filter(c => {
            const pId = c.parentId?._id || c.parentId;
            return pId?.toString() === comment._id?.toString();
        });
    }, [allComments, comment._id]);

    // Recursive check: am I an ancestor of the highlighted comment?
    const isAncestorOfHighlighted = useMemo(() => {
        if (!highlightedCommentId) return false;

        let currentTargetId = highlightedCommentId;
        while (currentTargetId) {
            const targetId = currentTargetId;
            const current = allComments.find(c => (c._id?.toString() || c._id) === targetId.toString());
            if (!current) break;

            const pId = current.parentId?._id || current.parentId;
            if (!pId) break;

            if (pId.toString() === comment._id?.toString()) return true;
            currentTargetId = pId.toString();
        }
        return false;
    }, [allComments, highlightedCommentId, comment._id]);

    // Auto-expand if a descendant is highlighted
    useEffect(() => {
        if (isAncestorOfHighlighted) {
            setShowReplies(true);
        }
    }, [isAncestorOfHighlighted]);

    // Scroll to me if I'm the highlighted one
    useEffect(() => {
        if (highlightedCommentId?.toString() === comment._id?.toString() && commentRef.current) {
            setTimeout(() => {
                commentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // We clear it so it doesn't re-trigger if the component re-renders
                setTimeout(() => setHighlightedCommentId(null), 2000);
            }, 600); // Wait for parents to finish expanding
        }
    }, [highlightedCommentId, comment._id, setHighlightedCommentId]);

    const handleSubmitReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onReply(replyText, comment._id);
        setReplyText('');
        setIsReplying(false);
    };

    const handleUpdate = () => {
        if (!editText.trim() || editText === comment.comment) {
            setIsEditing(false);
            return;
        }
        onEdit(editText, comment._id);
        setIsEditing(false);
    };

    const isOwner = useMemo(() => {
        const currentUserId = currentUser?._id || currentUser?.id;
        const commentUserId = comment.user?._id || comment.user?.id || comment.user;

        if (!currentUserId || !commentUserId) return false;
        return currentUserId.toString() === commentUserId.toString();
    }, [currentUser, comment.user]);

    return (
        <div
            ref={commentRef}
            className={`group/comment w-full flex flex-col transition-all duration-300 ${highlightedCommentId === comment._id ? 'bg-zinc-100 px-2 py-1 rounded-xl' : ''} ${isReply ? 'ml-6 sm:ml-10 mt-3' : 'mb-5'}`}
        >
            <div className="flex gap-3 w-full items-start">
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5">
                    <img
                        src={getFullImageUrl(comment.user?.profilePicture)}
                        className={`${isReply ? 'w-7 h-7' : 'w-10 h-10'} rounded-2xl object-cover border-2 border-zinc-100 shadow-sm transition-transform active:scale-95`}
                        alt=""
                        onError={e => e.target.src = defaultProfile}
                    />
                </div>

                {/* Content Bubble Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start max-w-full">
                        <div className={`relative px-4 py-3 rounded-[2rem] border shadow-xl shadow-black/5 ${isReply ? 'bg-zinc-100 border-zinc-200' : 'bg-white border-zinc-100'} w-full sm:w-auto`}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm font-black text-zinc-900 leading-none tracking-tight">
                                    {comment.user?.username || 'Usuario'}
                                </span>
                                {comment.isEdited && <span className="text-[10px] text-zinc-500 italic font-medium">(editado)</span>}
                            </div>

                            {isEditing ? (
                                <div className="space-y-3 mt-2 w-full min-w-[200px]">
                                    <textarea
                                        autoFocus
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all resize-none shadow-inner"
                                        rows="3"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Cancelar</button>
                                        <button onClick={handleUpdate} className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-lg">Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[13px] sm:text-sm leading-relaxed text-zinc-800 font-semibold break-words">{comment.comment}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-1 ml-2">
                            <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })}
                            </span>

                            <button
                                onClick={() => {
                                    setIsReplying(!isReplying);
                                    if (!isReplying) setReplyText(`@${comment.user?.username} `);
                                }}
                                className={`text-[12px] font-bold transition-all ${isReplying ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-800'}`}
                            >
                                Responder
                            </button>

                            {isOwner && !isEditing && (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowMenu(!showMenu)}
                                        className={`p-1 transition-colors rounded-full ${showMenu ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>

                                    {showMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-50 cursor-default"
                                                onClick={() => setShowMenu(false)}
                                            />
                                            <div className="absolute left-0 top-full mt-1 w-32 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-2 z-[160] animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                                                <button
                                                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-zinc-700 hover:bg-zinc-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Edit2 size={12} className="text-zinc-400" /> Editar
                                                </button>
                                                <button
                                                    onClick={() => { onDelete(comment._id); setShowMenu(false); }}
                                                    className="w-full text-left px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <Trash2 size={12} className="text-red-400" /> Borrar
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reply Input Form */}
                    {isReplying && (
                        <form
                            onSubmit={handleSubmitReply}
                            className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200 w-full"
                        >
                            <input
                                autoFocus
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                className="flex-1 bg-gray-100 rounded-full px-4 py-1.5 text-xs font-medium text-gray-900 focus:outline-none focus:bg-gray-200 transition-all"
                                placeholder={`Responde a ${comment.user?.username}...`}
                            />
                            <button
                                type="submit"
                                className="px-4 bg-primary-600 rounded-full text-white text-xs font-bold hover:bg-primary-700 active:scale-90 transition-all p-1.5 flex items-center justify-center text-white"
                            >
                                <Send size={12} />
                            </button>
                        </form>
                    )}

                    {/* Show Replies Button */}
                    {children.length > 0 && !showReplies && (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="mt-3 py-2 px-4 bg-white/5 border border-white/10 rounded-full text-xs font-black text-zinc-400 hover:text-white transition-all active:scale-95 flex items-center gap-2 w-fit uppercase tracking-widest shadow-lg"
                        >
                            <div className="w-4 h-4 rounded-full bg-red-600/20 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                            </div>
                            Ver {children.length} {children.length === 1 ? 'respuesta' : 'respuestas'}
                        </button>
                    )}

                    {/* Nested Replies with Connection Line */}
                    {showReplies && children.length > 0 && (
                        <div className="relative mt-3 space-y-2 w-full animate-in fade-in duration-500">
                            {/* NEW: Connecting vertical line for "tree" feel */}
                            <div className="absolute left-[-20px] top-0 bottom-8 w-[2px] bg-gradient-to-b from-red-600/40 via-blue-600/20 to-transparent rounded-full ml-[11px] sm:ml-[15px]"></div>

                            {children.map(child => (
                                <CommentItem
                                    key={child._id}
                                    comment={child}
                                    allComments={allComments}
                                    onReply={onReply}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                    currentUser={currentUser}
                                    themeColor={themeColor}
                                    isReply={true}
                                />
                            ))}

                            {showReplies && (
                                <button
                                    onClick={() => setShowReplies(false)}
                                    className="ml-6 sm:ml-10 py-2 px-4 text-[10px] font-black text-zinc-500 hover:text-red-500 transition-colors uppercase tracking-widest mt-2 flex items-center gap-2"
                                >
                                    <div className="w-4 h-[1px] bg-zinc-700"></div>
                                    Ocultar hilos
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
