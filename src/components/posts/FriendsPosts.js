import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import defaultProfile from '../../assets/default-profile.png';
import EditPostForm from './EditPostForm';
import EditCommentForm from './EditCommentForm';

const FriendsPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useContext(AuthContext);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingComment, setEditingComment] = useState({ postId: null, commentId: null });

  const getFullImageUrl = (path) => {
    if (!path) return defaultProfile;
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_BACKEND}${path}`;
  };

  const fetchFriendsPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/posts/friends?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.posts || []);
    } catch {
      setError('Error al cargar las publicaciones de tus amigos');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchFriendsPosts();
  }, [token, fetchFriendsPosts]);

  const handleLike = async (postId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendsPosts();
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleDislike = async (postId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendsPosts();
    } catch (error) {
      console.error('Error al dar dislike:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/comment`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFriendsPosts();
    } catch (error) {
      console.error('Error al comentar:', error);
    }
  };

  const chunkComments = (comments) => {
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < comments.length; i += chunkSize) chunks.push(comments.slice(i, i + chunkSize));
    return chunks;
  };

  if (loading) return <p className="text-center mt-8">Cargando publicaciones...</p>;
  if (error) return <p className="text-center text-red-500 mt-8">{error}</p>;
  if (!posts.length) return <p className="text-center mt-8">No hay publicaciones recientes de tus amigos.</p>;

  return (
    <main className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Publicaciones de Amigos</h2>
      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border p-4 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <Link
                to={`/user/${post.user?._id}`}
                className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded transition"
              >
                <img
                  src={getFullImageUrl(post.user?.profilePicture)}
                  alt={post.user?.username || 'Usuario'}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  onError={(e) => (e.target.src = defaultProfile)}
                />
                <div>
                  <p className="font-semibold">{post.user?.username || 'Usuario'}</p>
                  <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </Link>
              {post.user?._id === user?._id && (
                <div className="ml-auto relative group">
                  <button className="text-xl font-bold px-2" aria-label="Opciones">
                    ⋮
                  </button>
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                      onClick={() => setEditingPostId(post._id)}
                    >
                      Editar
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-red-200 text-red-600"
                      onClick={async () => {
                        if (window.confirm('¿Seguro que quieres eliminar esta publicación?')) {
                          await axios.delete(`${process.env.REACT_APP_API_BACKEND}/posts/${post._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          fetchFriendsPosts();
                        }
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {editingPostId === post._id ? (
              <EditPostForm
                initialContent={post.content}
                onSave={async (newContent) => {
                  await axios.put(
                    `${process.env.REACT_APP_API_BACKEND}/posts/${editingPostId}`,
                    { content: newContent },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setEditingPostId(null);
                  fetchFriendsPosts();
                }}
                onCancel={() => setEditingPostId(null)}
              />
            ) : (
              <p className="mb-4 text-xl">{post.content}</p>
            )}

            {post.media?.length > 0 && (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                spaceBetween={10}
                className="w-full max-w-md aspect-[4/5] sm:aspect-video rounded overflow-hidden mb-4"
              >
                {post.media.map((file, idx) => (
                  <SwiperSlide key={idx} className="flex items-center justify-center">
                    {file.mediaType === 'image' ? (
                      <img
                        src={getFullImageUrl(file.url)}
                        alt={`media-${idx}`}
                        className="max-h-full max-w-full object-contain rounded"
                        onError={(e) => (e.target.src = defaultProfile)}
                      />
                    ) : file.mediaType === 'video' ? (
                      <video
                        src={getFullImageUrl(file.url)}
                        controls
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    ) : (
                      <a
                        href={getFullImageUrl(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 underline break-words"
                      >
                        Descargar PDF: {file.url.split('/').pop()}
                      </a>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <div className="flex items-center gap-4 my-4">
              <button
                onClick={() => handleLike(post._id)}
                className="text-green-600 flex items-center gap-1"
              >
                ❤️ {post.likes?.length || 0}
              </button>
              <button
                onClick={() => handleDislike(post._id)}
                className="text-red-600 flex items-center gap-1"
              >
                👎 {post.dislikes?.length || 0}
              </button>
            </div>

            <div className="border-t pt-3 mt-3">
              <p className="font-semibold mb-2">Comentarios:</p>
              {(post.comments?.length || 0) <= 10 ? (
                post.comments.map((c) => (
                  <div key={c._id} className="flex items-start gap-2 my-2 text-sm">
                    <Link
                      to={`/user/${c.user?._id}`}
                      className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition"
                    >
                      <img
                        src={getFullImageUrl(c.user?.profilePicture)}
                        alt={c.user?.username || 'Usuario'}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        onError={(e) => (e.target.src = defaultProfile)}
                      />
                      <span className="font-bold">{c.user?.username || 'Usuario'}</span>
                    </Link>
                    <div className="flex-1">
                      {editingComment.postId === post._id && editingComment.commentId === c._id ? (
                        <EditCommentForm
                          initialComment={c.comment}
                          onSave={async (newComment) => {
                            await axios.put(
                              `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                              { comment: newComment },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setEditingComment({ postId: null, commentId: null });
                            fetchFriendsPosts();
                          }}
                          onCancel={() => setEditingComment({ postId: null, commentId: null })}
                        />
                      ) : (
                        <>
                          <span>: {c.comment}</span>
                          {c.user?._id === user?._id && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => setEditingComment({ postId: post._id, commentId: c._id })}
                                className="text-blue-600 text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm('¿Seguro que quieres eliminar este comentario?')) {
                                    await axios.delete(
                                      `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                                      { headers: { Authorization: `Bearer ${token}` } }
                                    );
                                    fetchFriendsPosts();
                                  }
                                }}
                                className="text-red-600 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <Swiper
                  modules={[Navigation, Pagination]}
                  navigation
                  pagination={{ clickable: true }}
                  spaceBetween={10}
                  slidesPerView={1}
                >
                  {chunkComments(post.comments).map((chunk, idx) => (
                    <SwiperSlide key={idx}>
                      {chunk.map((c) => (
                        <div key={c._id} className="flex items-start gap-2 my-2 text-sm">
                          <Link
                            to={`/user/${c.user?._id}`}
                            className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition"
                          >
                            <img
                              src={getFullImageUrl(c.user?.profilePicture)}
                              alt={c.user?.username || 'Usuario'}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              onError={(e) => (e.target.src = defaultProfile)}
                            />
                            <span className="font-bold">{c.user?.username || 'Usuario'}</span>
                          </Link>
                          <div className="flex-1">
                            <span>: {c.comment}</span>
                            {c.user?._id === user?._id && (
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => setEditingComment({ postId: post._id, commentId: c._id })}
                                  className="text-blue-600 text-xs"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={async () => {
                                    if (window.confirm('¿Seguro que quieres eliminar este comentario?')) {
                                      await axios.delete(
                                        `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                                        { headers: { Authorization: `Bearer ${token}` } }
                                      );
                                      fetchFriendsPosts();
                                    }
                                  }}
                                  className="text-red-600 text-xs"
                                >
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const comment = e.target.comment.value;
                  if (comment.trim()) {
                    handleComment(post._id, comment);
                    e.target.reset();
                  }
                }}
                className="mt-3"
              >
                <input
                  type="text"
                  name="comment"
                  placeholder="Escribe un comentario..."
                  className="w-full p-2 border rounded text-sm"
                />
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default FriendsPosts;