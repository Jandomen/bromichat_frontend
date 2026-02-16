import React, { useState, useContext, useEffect } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import PostItem from '../posts/PostItem';

const UserPosts = ({ posts, userId, scrollToTop }) => {
  const { token } = useContext(AuthContext);
  const [localPosts, setLocalPosts] = useState(posts);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocalPosts(res.data || []);
    } catch (error) {
      // console.error('Error fetching posts:', error);
    }
  };

  const handleUpdatePost = (updatedPost, deletedId) => {
    if (deletedId) {
      setLocalPosts(prev => prev.filter(p => p._id !== deletedId));
    } else if (updatedPost) {
      setLocalPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
    } else {
      fetchPosts();
    }
  };

  if (!Array.isArray(localPosts)) {
    return <p className="text-center text-gray-500 py-10">No hay publicaciones.</p>;
  }

  return (
    <div className="space-y-6">
      {localPosts.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center text-gray-500 border border-gray-100 italic">
          No hay publicaciones aún.
        </div>
      ) : (
        <>
          <div className="space-y-8">
            {localPosts.map((post) => (
              <PostItem
                key={post._id}
                post={post}
                onUpdate={handleUpdatePost}
              />
            ))}
          </div>
          {localPosts.length > 5 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={scrollToTop}
                className="px-6 py-2.5 rounded-full text-white font-bold bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <span>Volver Arriba</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserPosts;