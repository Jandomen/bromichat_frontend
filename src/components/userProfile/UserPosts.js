import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import defaultProfile from '../../assets/default-profile.png';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import EditPostForm from '../posts/EditPostForm';
import EditCommentForm from '../posts/EditCommentForm';

const UserPosts = ({ posts, userId, scrollToTop }) => {
  const { token, user } = useContext(AuthContext);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingComment, setEditingComment] = useState({ postId: null, commentId: null });
  const [localPosts, setLocalPosts] = useState(posts);

  const getFullImageUrl = (path) => {
    if (!path) return defaultProfile;
    if (path.startsWith('http')) return path;
    return `${process.env.REACT_APP_API_BACKEND}${path}`;
  };

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

  const handleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
     // console.error('Error al dar like:', error);
    }
  };

  const handleDislike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/dislike`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
     // console.error('Error al dar dislike:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      await api.post(`/posts/${postId}/comment`, { comment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
     // console.error('Error al comentar:', error);
    }
  };

  const handleEditPost = (postId) => setEditingPostId(postId);
  const handleCancelEditPost = () => setEditingPostId(null);

  const handleSavePost = async (newContent) => {
    try {
      await api.put(`/posts/${editingPostId}`, { content: newContent }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingPostId(null);
      fetchPosts();
    } catch (error) {
     // console.error('Error al editar post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta publicación?')) return;
    try {
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
     // console.error('Error al eliminar post:', error);
    }
  };

  const handleEditComment = (postId, commentId) => {
    setEditingComment({ postId, commentId });
  };

  const handleCancelEditComment = () => {
    setEditingComment({ postId: null, commentId: null });
  };

  const handleSaveComment = async (newComment) => {
    try {
      await api.put(
        `/posts/${editingComment.postId}/comment/${editingComment.commentId}`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingComment({ postId: null, commentId: null });
      fetchPosts();
    } catch (error) {
     // console.error('Error al editar comentario:', error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) return;
    try {
      await api.delete(`/posts/${postId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (error) {
     // console.error('Error al eliminar comentario:', error);
    }
  };

  const chunkComments = (comments) => {
    const chunkSize = 10;
    const chunks = [];
    for (let i = 0; i < comments.length; i += chunkSize) {
      chunks.push(comments.slice(i, i + chunkSize));
    }
    return chunks;
  };

  if (!Array.isArray(localPosts)) {
   // console.warn('UserPosts: localPosts is not an array:', localPosts);
    return <p>No hay publicaciones.</p>;
  }

  return (
    <div>
      {localPosts.length === 0 ? (
        <p>No hay publicaciones disponibles.</p>
      ) : (
        <>
          {localPosts.map((post) => (
            <div key={post._id} className="border p-4 mb-6 rounded shadow">
              {/* Header con info del autor */}
              <div className="flex items-center gap-3 mb-2">
                <Link
                  to={`/user/${post.user?._id}`}
                  className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded transition"
                >
                  <img
                    src={getFullImageUrl(post.user?.profilePicture) || defaultProfile}
                    alt={post.user?.username || 'Usuario'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                     // console.error('Error loading profile picture:', e.target.src);
                      e.target.src = defaultProfile;
                    }}
                  />
                  <div>
                    <p className="font-semibold">{post.user?.username || 'Usuario'}</p>
                    <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                </Link>

                {post.user?._id === user?._id && (
                  <div className="ml-auto relative group">
                    <button className="text-xl font-bold px-2" aria-label="Opciones">⋮</button>
                    <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                        onClick={() => handleEditPost(post._id)}
                      >
                        Editar
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-red-200 text-red-600"
                        onClick={() => handleDeletePost(post._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Contenido del post */}
              {editingPostId === post._id ? (
                <EditPostForm
                  initialContent={post.content}
                  onSave={handleSavePost}
                  onCancel={handleCancelEditPost}
                />
              ) : (
                <p className="mb-4 text-xl text-gray-900 font-semibold">{post.content}</p>
              )}

              {/* Media */}
              {post.media && post.media.length > 0 && (
                <div className="flex justify-center mb-3">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation
                    pagination={{ clickable: true }}
                    spaceBetween={10}
                    className="w-full max-w-md aspect-[4/5] sm:aspect-video rounded overflow-hidden"
                  >
                    {post.media.map((file, idx) => (
                      <SwiperSlide key={idx}>
                        {file.mediaType === 'image' ? (
                          <img
                            src={getFullImageUrl(file.url)}
                            alt={`media-${idx}`}
                            className="object-contain max-w-full max-h-full rounded"
                          />
                        ) : (
                          <video
                            src={getFullImageUrl(file.url)}
                            controls
                            className="object-contain max-w-full max-h-full rounded"
                          />
                        )}
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              )}

              {/* Reacciones */}
              <div className="flex items-center gap-4 my-2">
                <button onClick={() => handleLike(post._id)} className="text-green-600">
                  ❤️ {post.likes.length}
                </button>
                <button onClick={() => handleDislike(post._id)} className="text-red-600">
                  👎 {post.dislikes.length}
                </button>
              </div>

              {/* Comentarios */}
              <div className="border-t pt-2 mt-2">
                <p className="font-semibold">Comentarios:</p>
                {post.comments.length <= 10 ? (
                  post.comments.map((c) => (
                    <div key={c._id} className="flex items-start gap-2 my-2 text-sm">
                      <Link
                        to={`/user/${c.user?._id}`}
                        className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition"
                      >
                        <img
                          src={getFullImageUrl(c.user?.profilePicture) || defaultProfile}
                          alt={c.user?.username || 'Usuario'}
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                           // console.error('Error loading profile picture:', e.target.src);
                            e.target.src = defaultProfile;
                          }}
                        />
                        <span className="font-bold">{c.user?.username || 'Usuario'}</span>
                      </Link>
                      <div className="flex-1">
                        {editingComment.postId === post._id && editingComment.commentId === c._id ? (
                          <EditCommentForm
                            initialComment={c.comment}
                            onSave={handleSaveComment}
                            onCancel={handleCancelEditComment}
                          />
                        ) : (
                          <>
                            <span>: {c.comment}</span>
                            {c.user?._id === user?._id && (
                              <span className="ml-2 space-x-1">
                                <button
                                  onClick={() => handleEditComment(post._id, c._id)}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteComment(post._id, c._id)}
                                  className="text-red-600 hover:underline text-xs"
                                >
                                  Eliminar
                                </button>
                              </span>
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
                    className="w-full mt-2"
                  >
                    {chunkComments(post.comments).map((chunk, chunkIndex) => (
                      <SwiperSlide key={chunkIndex}>
                        {chunk.map((c) => (
                          <div key={c._id} className="flex items-start gap-2 my-2 text-sm">
                            <Link
                              to={`/user/${c.user?._id}`}
                              className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition"
                            >
                              <img
                                src={getFullImageUrl(c.user?.profilePicture) || defaultProfile}
                                alt={c.user?.username || 'Usuario'}
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                 // console.error('Error loading profile picture:', e.target.src);
                                  e.target.src = defaultProfile;
                                }}
                              />
                              <span className="font-bold">{c.user?.username || 'Usuario'}</span>
                            </Link>
                            <div className="flex-1">
                              {editingComment.postId === post._id && editingComment.commentId === c._id ? (
                                <EditCommentForm
                                  initialComment={c.comment}
                                  onSave={handleSaveComment}
                                  onCancel={handleCancelEditComment}
                                />
                              ) : (
                                <>
                                  <span>: {c.comment}</span>
                                  {c.user?._id === user?._id && (
                                    <span className="ml-2 space-x-1">
                                      <button
                                        onClick={() => handleEditComment(post._id, c._id)}
                                        className="text-blue-600 hover:underline text-xs"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(post._id, c._id)}
                                        className="text-red-600 hover:underline text-xs"
                                      >
                                        Eliminar
                                      </button>
                                    </span>
                                  )}
                                </>
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
                >
                  <input
                    type="text"
                    name="comment"
                    placeholder="Escribe un comentario..."
                    className="w-full mt-2 p-1 border rounded text-sm"
                  />
                </form>
              </div>
            </div>
          ))}
          <div className="mt-4 text-right">
            <button
              onClick={scrollToTop}
              className="px-4 py-2 rounded text-white font-semibold bg-blue-600 hover:bg-blue-700"
            >
              Volver Arriba
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserPosts;