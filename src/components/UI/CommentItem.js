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

    const isOwner = currentUser?._id === (comment.user?._id || comment.user);

    return (
        <div
            ref={commentRef}
            className={`group/comment w-full flex flex-col transition-all duration-300 ${highlightedCommentId === comment._id ? 'bg-primary-50 px-2 py-1 rounded-lg' : ''} ${isReply ? 'ml-10 mt-2' : 'mb-3'}`}
        >
            <div className="flex gap-2 w-full items-start">
                {/* Avatar */}
                <div className="relative shrink-0 mt-1">
                    <img
                        src={getFullImageUrl(comment.user?.profilePicture)}
                        className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} rounded-full object-cover border border-gray-100`}
                        alt=""
                        onError={e => e.target.src = defaultProfile}
                    />
                </div>

                {/* Content Bubble Area */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-col items-start max-w-full">
                        <div className={`relative px-3 py-2 rounded-2xl ${isReply ? 'bg-gray-100/50' : 'bg-gray-100'} text-gray-800`}>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px] font-bold text-gray-900 leading-none">
                                    {comment.user?.username}
                                </span>
                                {comment.isEdited && <span className="text-[10px] text-gray-400 italic">(editado)</span>}
                            </div>

                            {isEditing ? (
                                <div className="space-y-2 mt-2 min-w-[200px]">
                                    <textarea
                                        autoFocus
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-primary-500/30 transition-all resize-none shadow-sm"
                                        rows="2"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-[11px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">Cancelar</button>
                                        <button onClick={handleUpdate} className="px-4 py-1 bg-primary-600 text-white rounded-md text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all">Guardar</button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[14px] leading-tight text-gray-800 break-words">{comment.comment}</p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4 mt-1 ml-2">
                            <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                                {new Date(comment.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </span>

                            <button
                                onClick={() => {
                                    setIsReplying(!isReplying);
                                    if (!isReplying) setReplyText(`@${comment.user?.username} `);
                                }}
                                className={`text-[12px] font-bold transition-all ${isReplying ? 'text-primary-600' : 'text-gray-500 hover:underline'}`}
                            >
                                Responder
                            </button>

                            {isOwner && !isEditing && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-[12px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(comment._id)}
                                        className="text-[12px] font-bold text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        Borrar
                                    </button>
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
                                className="px-4 bg-primary-600 rounded-full text-white text-xs font-bold hover:bg-primary-700 active:scale-90 transition-all p-1.5"
                            >
                                <FaPaperPlane size={10} />
                            </button>
                        </form>
                    )}

                    {/* Show Replies Button */}
                    {children.length > 0 && !showReplies && (
                        <button
                            onClick={() => setShowReplies(true)}
                            className="mt-2 text-[13px] font-bold text-gray-500 hover:underline flex items-center gap-2"
                        >
                            <div className="w-6 h-[1px] bg-gray-300"></div>
                            Ver {children.length} {children.length === 1 ? 'respuesta' : 'respuestas'}
                        </button>
                    )}

                    {/* Nested Replies */}
                    {showReplies && children.length > 0 && (
                        <div className="space-y-1 w-full animate-in fade-in duration-300">
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
                                    className="text-[12px] font-bold text-gray-500 hover:underline mt-1"
                                >
                                    Ocultar respuestas
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
