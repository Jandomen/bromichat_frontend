import React, { useState, useContext, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import PostItem from '../posts/PostItem';
import { CircularProgress, Box, Typography } from '@mui/material';

const SavedPosts = () => {
  const { token } = useContext(AuthContext);
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedPosts = useCallback(async () => {
    try {
      const res = await api.get('/user/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedPosts((res.data || []).filter(post => post !== null));
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSavedPosts();
  }, [fetchSavedPosts]);

  const handleUpdatePost = (updatedPost, deletedId) => {
    if (deletedId) {
      setSavedPosts(prev => prev.filter(p => p._id !== deletedId));
    } else if (updatedPost) {
      setSavedPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    } else {
      fetchSavedPosts();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" ml={2}>Cargando guardados...</Typography>
      </Box>
    );
  }

  return (
    <div className="space-y-6">
      {savedPosts.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500 border border-gray-100 flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-3xl mb-4">🔖</div>
          <h4 className="text-lg font-bold text-gray-800 mb-2">Sin Publicaciones Guardadas</h4>
          <p className="text-gray-500 text-sm">Las publicaciones que guardes aparecerán en esta colección privada.</p>
        </div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {savedPosts.map((post) => (
            <PostItem
              key={post._id}
              post={post}
              onUpdate={handleUpdatePost}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
