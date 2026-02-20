import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import PostItem from './PostItem';
import { SocketContext } from '../../context/SocketContext';
import { NotificationContext } from '../../context/NotificationContext';

const FriendsPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user: currentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { playNotificationSound } = useContext(NotificationContext);

  const fetchFriendsPosts = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/posts/friends?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.posts || []);
    } catch {
      setError('Error al cargar las publicaciones de tus amigos');
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchFriendsPosts();
  }, [token, fetchFriendsPosts]);

  const handleUpdatePost = useCallback((updatedPost, deletedId) => {
    if (deletedId) {
      setPosts(prev => prev.filter(p => p._id !== deletedId));
    } else if (updatedPost) {
      setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    } else {
      fetchFriendsPosts(true);
    }
  }, [fetchFriendsPosts]);

  useEffect(() => {
    if (!socket) return;

    const onNewPost = (post) => {
      setPosts(prev => {
        if (prev.some(p => p._id === post._id)) return prev;
        return [post, ...prev];
      });
    };

    const onPostUpdated = (post) => {
      setPosts(prev => {
        return prev.map(p => p._id === post._id ? post : p);
      });
    };

    const onPostDeleted = (postId) => {
      setPosts(prev => prev.filter(p => p._id !== postId));
    };

    socket.on('newPost', onNewPost);
    socket.on('postUpdated', onPostUpdated);
    socket.on('postDeleted', onPostDeleted);

    return () => {
      socket.off('newPost', onNewPost);
      socket.off('postUpdated', onPostUpdated);
      socket.off('postDeleted', onPostDeleted);
    };
  }, [socket, playNotificationSound, currentUser]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  );

  if (error) return <p className="text-center text-red-500 mt-8 font-medium">{error}</p>;
  if (!posts.length) return <p className="text-center mt-8 text-gray-500">No hay publicaciones recientes. ¡Sigue a más personas!</p>;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Novedades recientes</h2>
        <button
          onClick={() => fetchFriendsPosts(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-primary-600"
          title="Actualizar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostItem
            key={post._id}
            post={post}
            onUpdate={handleUpdatePost}
          />
        ))}
      </div>
    </div>
  );
};

export default FriendsPosts;