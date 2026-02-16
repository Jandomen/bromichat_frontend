import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Headers from '../Header';
import Footer from '../Footer';
import { FaChevronLeft } from 'react-icons/fa';
import PostItem from './PostItem';
import { SocketContext } from '../../context/SocketContext';
import { NotificationContext } from '../../context/NotificationContext';

const PostDetail = () => {
  const { postId } = useParams();
  const { token, user: currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { playNotificationSound } = useContext(NotificationContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
    } catch (err) {
      setError('Error al cargar la publicación');
    } finally {
      setLoading(false);
    }
  }, [postId, token]);

  useEffect(() => {
    if (token) fetchPost();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (window.history.length > 1) navigate(-1);
        else navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fetchPost, token, navigate]);

  useEffect(() => {
    if (!socket || !postId) return;

    const onPostUpdated = (updatedPost) => {
      if (updatedPost._id === postId) {
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
      if (deletedId === postId) {
        navigate('/dashboard');
      }
    };

    socket.on('postUpdated', onPostUpdated);
    socket.on('postDeleted', onPostDeleted);

    return () => {
      socket.off('postUpdated', onPostUpdated);
      socket.off('postDeleted', onPostDeleted);
    };
  }, [socket, postId, navigate, playNotificationSound, currentUser]);

  const handleUpdate = (updatedPost, deletedId) => {
    if (deletedId) {
      navigate('/dashboard');
    } else if (updatedPost) {
      setPost(updatedPost);
    } else {
      fetchPost();
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Headers />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <Footer />
    </div>
  );

  if (error || !post) return (
    <div className="min-h-screen flex flex-col">
      <Headers />
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-red-500 font-bold mb-4">{error || 'Publicación no encontrada'}</p>
        <button onClick={() => navigate('/dashboard')} className="text-blue-600 hover:underline flex items-center gap-2 font-bold transition-all hover:scale-105">
          <FaChevronLeft /> Volver al Dashboard
        </button>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Headers />
      <main className="flex-grow container mx-auto px-4 py-8 max-w-3xl">
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate('/dashboard');
          }}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-6 font-bold transition-colors group"
        >
          <FaChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Volver al Feed
        </button>

        {post && (
          <PostItem
            post={post}
            onUpdate={handleUpdate}
            isDetail={true}
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PostDetail;