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
 * @param {number} depth - How deep the reply tree is, used to stop indenting too far
 */
const CommentItem = ({
    comment,
    allComments = [],
    onReply,
    onEdit,
    onDelete,
    currentUser,
    themeColor = 'indigo-600',
    isReply = false,
    depth = 0
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

    // Flatten comment tree after depth 1
    const indentClass = isReply 
        ? (depth === 1 ? 'ml-8 xs:ml-10 mt-1.5 xs:mt-2' : 'ml-0 mt-1.5 xs:mt-2') 
        : 'mb-2.5 xs:mb-3 sm:mb-4';

    return (
        <div
            ref={commentRef}
            className={`group/comment w-full flex flex-col transition-all duration-300 ${highlightedCommentId === comment._id ? 'bg-zinc-100 px-1.5 py-0.5 xs:px-2 xs:py-1 rounded-xl' : ''} ${indentClass}`}
        >
            <div className="flex gap-2 w-full items-start">
                {/* Avatar */}
                <div className="relative shrink-0 mt-0.5 z-10">
                    <img
                        src={getFullImageUrl(comment.user?.profilePicture)}
                        className={`${isReply ? 'w-5 h-5 xs:w-6 xs:h-6' : 'w-6 h-6 xs:w-7 xs:h-7'} rounded-[0.6rem] xs:rounded-xl object-cover border-[1px] xs:border-[1.5px] border-zinc-100 shadow-sm transition-transform active:scale-95`}
                        alt=""
                        onError={e => e.target.src = defaultProfile}
                    />
                </div>

                {/* Content Bubble Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start max-w-full">
                        <div className={`relative px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 sm:py-2 rounded-[1.2rem] xs:rounded-[1.5rem] border shadow-sm xs:shadow-md shadow-black/5 flex-wrap ${isReply ? 'bg-zinc-50 border-zinc-200' : 'bg-white border-zinc-100'} w-fit max-w-[95%]`}>
                            <div className="flex items-center gap-1.5 xs:gap-2 mb-0.5">
                                <span className="text-[9px] xs:text-[10px] sm:text-xs font-black text-zinc-900 leading-none tracking-tight">
                                    {comment.user?.username || 'Usuario'}
                                </span>
                                {comment.isEdited && <span className="text-[7.5px] xs:text-[8px] sm:text-[9px] text-zinc-500 italic font-medium">(editado)</span>}
                            </div>

                            {isEditing ? (
                                <div className="space-y-2 xs:space-y-3 mt-1.5 xs:mt-2 w-full min-w-[150px] xs:min-w-[200px]">
                                    <textarea
                                        autoFocus
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg xs:rounded-xl px-2.5 xs:px-4 py-2 xs:py-3 text-[10px] xs:text-[11px] sm:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all resize-none shadow-inner"
                                        rows="3"
                                    />
                                    <div className="flex justify-end gap-1.5 xs:gap-2">
                                        <button onClick={() => setIsEditing(false)} className="px-2 xs:px-4 py-1 xs:py-2 text-[9px] xs:text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors">Cancelar</button>
                                        <button onClick={handleUpdate} className="px-3 xs:px-5 py-1 xs:py-2 bg-red-600 text-white rounded-lg xs:rounded-xl text-[9px] xs:text-xs font-black uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all shadow-md xs:shadow-lg">Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[9.5px] xs:text-[10.5px] sm:text-[12px] leading-tight text-zinc-800 font-semibold break-words whitespace-pre-wrap">{comment.comment}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 xs:gap-3 mt-0.5 ml-1">
                            <span className="text-[7.5px] xs:text-[8.5px] sm:text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' })}
                            </span>

                            <button
                                onClick={() => {
                                    setIsReplying(!isReplying);
                                    if (!isReplying) setReplyText(`@${comment.user?.username} `);
                                }}
                                className={`text-[7.5px] xs:text-[8.5px] sm:text-[10px] font-bold transition-all ${isReplying ? 'text-red-600' : 'text-zinc-500 hover:text-zinc-800'}`}
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
                            className="mt-1.5 xs:mt-2 flex gap-1 xs:gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200 w-full"
                        >
                            <input
                                autoFocus
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        handleSubmitReply(e);
                                    }
                                }}
                                className="flex-1 bg-gray-100 rounded-full px-2 xs:px-3 py-1 xs:py-1.5 text-[8.5px] xs:text-[10px] font-medium text-gray-900 focus:outline-none focus:bg-gray-200 transition-all border border-gray-200/50 shadow-inner"
                                placeholder={`Responde a ${comment.user?.username}...`}
                            />
                            <button
                                type="submit"
                                className="px-1.5 xs:px-3 bg-primary-600 rounded-full text-white text-[8px] xs:text-[9.5px] font-bold hover:bg-primary-700 active:scale-90 transition-all p-1 flex items-center justify-center shrink-0 border border-primary-700/50 shadow-sm"
                            >
                                <Send size={10} className="xs:w-[11px] xs:h-[11px] w-2.5 h-2.5" />
                            </button>
                        </form>
                    )}

                    {/* Show Replies Button */}
                    {children.length > 0 && !showReplies && (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="mt-1.5 xs:mt-2 py-1 xs:py-1.5 px-2 xs:px-3 bg-white/5 border border-white/10 rounded-full text-[7px] xs:text-[8px] sm:text-[9px] font-black text-zinc-500 hover:text-zinc-800 transition-all active:scale-95 flex items-center gap-1.5 w-fit uppercase tracking-widest shadow-sm"
                        >
                            <div className="w-2.5 h-2.5 xs:w-3 xs:h-3 rounded-full bg-red-600/20 flex items-center justify-center">
                                <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            </div>
                            Ver {children.length} {children.length === 1 ? 'respuesta' : 'respuestas'}
                        </button>
                    )}
                </div>
            </div>

            {/* Nested Replies with Connection Line. MOVED OUTSIDE flex items-start! */}
            {showReplies && children.length > 0 && (
                <div className="relative mt-1 xs:mt-2 space-y-1 xs:space-y-1.5 w-full animate-in fade-in duration-500 z-0">
                    {/* NEW: Connecting vertical line for "tree" feel. Moved to align with parent avatar */}
                    {depth === 0 && <div className="absolute left-[11px] xs:left-[13px] top-[-10px] bottom-6 xs:bottom-8 w-[1.5px] bg-gradient-to-b from-gray-300 via-gray-200 to-transparent rounded-full z-0"></div>}

                    {children.map(child => (
                        <div key={child._id} className="relative z-10 w-full">
                            <CommentItem
                                comment={child}
                                allComments={allComments}
                                onReply={onReply}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                currentUser={currentUser}
                                themeColor={themeColor}
                                isReply={true}
                                depth={depth + 1}
                            />
                        </div>
                    ))}

                    {showReplies && (
                        <button
                            onClick={() => setShowReplies(false)}
                            className={`${depth === 0 ? 'ml-8 xs:ml-10' : 'ml-0'} py-1 xs:py-1.5 px-1.5 xs:px-2 text-[7px] xs:text-[8px] sm:text-[9px] font-black text-zinc-400 hover:text-red-500 transition-colors uppercase tracking-widest mt-1 xs:mt-1.5 flex items-center gap-1 xs:gap-1.5 w-fit relative z-10`}
                        >
                            <div className="w-2 xs:w-3 h-[1px] bg-zinc-400"></div>
                            Ocultar hilos
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
