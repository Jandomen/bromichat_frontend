import React, { useMemo, useState, useEffect, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';
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
            const current = allComments.find(c => (c._id?.toString() || c._id) === currentTargetId.toString());
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

    const isOwner = currentUser?._id === (comment.user?._id || comment.user);

    return (
        <div
            ref={commentRef}
            className={`group/comment w-full flex flex-col transition-all duration-700 ${highlightedCommentId === comment._id ? 'bg-primary-50/50 rounded-[2.5rem] p-4 ring-2 ring-primary-500/20 shadow-2xl' : ''} ${isReply ? 'ml-4 sm:ml-16 mt-6 border-l-2 border-slate-100 pl-4 sm:pl-10' : 'mb-8'}`}
        >
            <div className="flex gap-4 sm:gap-6 w-full items-start">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="p-0.5 bg-white rounded-[1.25rem] shadow-sm transform transition-transform group-hover/comment:scale-110 duration-500">
                        <img
                            src={getFullImageUrl(comment.user?.profilePicture)}
                            className={`${isReply ? 'w-10 h-10' : 'w-12 h-12'} rounded-[1rem] object-cover border-2 border-white`}
                            alt=""
                            onError={e => e.target.src = defaultProfile}
                        />
                    </div>
                </div>

                {/* Content Bubble Area */}
                <div className="flex-1 min-w-0 w-full">
                    <div className={`relative group/bubble transition-all duration-500 ${isReply ? 'bg-slate-50/50' : 'bg-white shadow-sm'} rounded-[2rem] rounded-tl-none border border-slate-100 hover:border-primary-100 hover:bg-white p-4 sm:p-6`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-black text-slate-900 tracking-tighter uppercase">@{comment.user?.username}</span>
                                {comment.isEdited && <span className="text-[9px] font-bold text-slate-300 italic lowercase">(editado)</span>}
                            </div>
                            <span className="text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] tabular-nums">
                                {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 mt-2">
                                <textarea
                                    autoFocus
                                    value={editText}
                                    onChange={e => setEditText(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm text-slate-800 focus:outline-none focus:border-primary-500/30 focus:bg-white transition-all resize-none font-medium shadow-inner"
                                    rows="2"
                                />
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                                    <button onClick={handleUpdate} className="px-8 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Guardar</button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm leading-relaxed text-slate-700 font-semibold break-words tracking-tight">{comment.comment}</p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-6 mt-4 px-2">
                        <button
                            onClick={() => {
                                setIsReplying(!isReplying);
                                if (!isReplying) setReplyText(`@${comment.user?.username} `);
                            }}
                            className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 px-4 py-2 rounded-full ${isReplying ? 'text-white bg-slate-900 shadow-xl' : 'text-slate-400 hover:text-primary-600 bg-slate-50 hover:bg-white'}`}
                        >
                            {isReplying ? (
                                <>✕ Cancelar</>
                            ) : (
                                <>Responder</>
                            )}
                        </button>

                        {children.length > 0 && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all text-primary-600/70 hover:text-primary-600 bg-primary-50/30 hover:bg-primary-50 px-4 py-2 rounded-full border border-primary-100/30"
                            >
                                {showReplies ? (
                                    <>Ocultar <span className="opacity-50">▲</span></>
                                ) : (
                                    <>Ver respuestas ({children.length}) <span className="opacity-50">▼</span></>
                                )}
                            </button>
                        )}

                        {isOwner && !isEditing && (
                            <div className="flex items-center gap-5 opacity-0 group-hover/comment:opacity-100 transition-opacity ml-auto">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => onDelete(comment._id)}
                                    className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-red-500 transition-colors"
                                >
                                    Borrar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Reply Input Form */}
                    {isReplying && (
                        <form
                            onSubmit={handleSubmitReply}
                            className="mt-6 flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500 w-full"
                        >
                            <input
                                autoFocus
                                type="text"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                className="flex-1 bg-white border-2 border-slate-100 rounded-[1.75rem] px-6 py-4 text-xs font-bold text-slate-900 focus:outline-none focus:border-primary-500/30 focus:ring-[12px] focus:ring-primary-50/50 transition-all placeholder:text-slate-200"
                                placeholder={`Responde a @${comment.user?.username}...`}
                            />
                            <button
                                type="submit"
                                className="p-5 bg-slate-900 rounded-[1.5rem] text-white hover:bg-primary-600 active:scale-90 transition-all shadow-xl shadow-slate-900/10"
                            >
                                <FaPaperPlane size={14} />
                            </button>
                        </form>
                    )}

                    {/* Nested Replies */}
                    {showReplies && children.length > 0 && (
                        <div className="space-y-2 w-full animate-in fade-in duration-700">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
