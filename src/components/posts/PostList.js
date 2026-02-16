import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import PostItem from './PostItem';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const { token, user } = useContext(AuthContext);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchPosts();
  }, [token, fetchPosts]);

  const handleUpdatePost = (updatedPost, deletedId) => {
    if (deletedId) {
      setPosts(prev => prev.filter(p => p._id !== deletedId));
    } else if (updatedPost) {
      setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    } else {
      fetchPosts();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {posts.length === 0 ? (
        <div className="text-center bg-white p-12 rounded-2xl border border-dashed border-gray-200 shadow-sm">
          <p className="text-gray-400 font-medium italic">Aún no hay publicaciones disponibles.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts
            .filter((post) => post.user?._id === user?._id)
            .map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onUpdate={handleUpdatePost}
              />
            ))
          }
        </div>
      )}
    </div>
  );
};

export default PostList;