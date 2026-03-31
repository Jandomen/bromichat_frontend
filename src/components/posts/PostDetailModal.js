import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import PostItem from './PostItem';
import { FaTimes } from 'react-icons/fa';
import { SocketContext } from '../../context/SocketContext';
import { NotificationContext } from '../../context/NotificationContext';

const PostDetailModal = () => {
    const { selectedPostId, setSelectedPostId } = useUI();
    const { token, user: currentUser } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const { playNotificationSound } = useContext(NotificationContext);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPost = useCallback(async (id) => {
        try {
            setLoading(true);
            const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/posts/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPost(res.data);
        } catch (err) {
            // console.error('Error fetching post detail:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (selectedPostId && token) {
            fetchPost(selectedPostId);
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            setPost(null);
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [selectedPostId, token, fetchPost]);

    const handleClose = useCallback(() => {
        setSelectedPostId(null);
    }, [setSelectedPostId]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedPostId) return;
            if (e.key === 'Escape') {
                handleClose();
            }
            // Future: ArrowLeft/Right for navigating posts if we pass a list
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedPostId, handleClose]);

    const location = useLocation();
    useEffect(() => {
        if (selectedPostId) {
            handleClose();
        }
    }, [location.pathname, handleClose, selectedPostId]);

    useEffect(() => {
        if (!socket || !selectedPostId) return;

        const onPostUpdated = (updatedPost) => {
            if (updatedPost._id === selectedPostId) {
                setPost(prev => {
                    if (prev && updatedPost.comments?.length > prev.comments?.length) {
                        const latestComment = updatedPost.comments[updatedPost.comments.length - 1];
                        const commenterId = latestComment?.user?._id || latestComment?.user;
                        const myId = currentUser?._id || currentUser;

                        if (commenterId !== myId) {
                            playNotificationSound();
                        }
                    }
                    return updatedPost;
                });
            }
        };

        const onPostDeleted = (deletedId) => {
            if (deletedId === selectedPostId) {
                handleClose();
            }
        };

        socket.on('postUpdated', onPostUpdated);
        socket.on('postDeleted', onPostDeleted);

        return () => {
            socket.off('postUpdated', onPostUpdated);
            socket.off('postDeleted', onPostDeleted);
        };
    }, [socket, selectedPostId, handleClose, playNotificationSound, currentUser]);

    if (!selectedPostId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-fade-in pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl transition-opacity pointer-events-auto"
                onClick={handleClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-transparent pointer-events-auto animate-zoom-in scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <button
                    onClick={handleClose}
                    className="fixed top-10 right-10 z-[120] bg-white/5 hover:bg-white/10 text-white/50 hover:text-white p-5 rounded-full transition-all border border-white/10 backdrop-blur-3xl group"
                >
                    <FaTimes size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>

                <div className="min-h-full flex items-center justify-center">
                    {loading ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-8">
                            <div className="relative w-20 h-20">
                                <div className="absolute inset-0 border-8 border-primary-100 rounded-full"></div>
                                <div className="absolute inset-0 border-8 border-primary-600 rounded-full border-t-transparent animate-spin"></div>
                            </div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] animate-pulse">Sincronizando Energía</span>
                        </div>
                    ) : post ? (
                        <div className="w-full">
                            <PostItem post={post} onUpdate={(updated) => updated ? setPost(updated) : handleClose()} isDetail={true} />
                        </div>
                    ) : (
                        <div className="py-40 text-center bg-white/5 rounded-[4rem] border-2 border-dashed border-white/10 w-full p-20">
                            <span className="text-6xl mb-8 block opacity-50">🛸</span>
                            <div className="text-[10px] text-white/40 font-black uppercase tracking-[0.5em]">La señal se ha perdido</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;
