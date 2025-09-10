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
      const res = await axios.get(
        `${process.env.REACT_APP_API_BACKEND}/posts/friends?limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
     // console.log('Fetched friends posts:', res.data);
      setPosts(res.data.posts || []);
    } catch (error) {
     // console.error('Error fetching friends posts:', error);
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchFriendsPosts();
    } catch (error) {
     // console.error('Error al dar like:', error);
    }
  };

  const handleDislike = async (postId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/dislike`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchFriendsPosts();
    } catch (error) {
     // console.error('Error al dar dislike:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/comment`,
        { comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchFriendsPosts();
    } catch (error) {
     // console.error('Error al comentar:', error);
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
     
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Publicaciones de Amigos</h2>
        {loading && <p className="text-center text-gray-500">Cargando publicaciones...</p>}
        {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-6 text-center">{error}</p>}
        {!loading && posts.length === 0 ? (
          <p className="text-center text-gray-500 bg-white p-4 rounded-lg shadow-sm">
            No hay publicaciones recientes de tus amigos.
          </p>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="border p-4 mb-6 rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <Link
                    to={`/user/${post.user?._id}`}
                    className="flex items-center gap-3 hover:bg-gray-100 p-1 rounded transition"
                  >
                    <img
                      src={getFullImageUrl(post.user?.profilePicture) || defaultProfile}
                      alt={post.user?.username || 'Usuario'}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                      //  console.error('Error loading profile picture:', post.user?.profilePicture);
                        e.target.src = defaultProfile;
                      }}
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{post.user?.username || 'Usuario'}</p>
                      <p className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleString()}</p>
                    </div>
                  </Link>
                </div>

                {editingPostId === post._id ? (
                  <EditPostForm
                    initialContent={post.content}
                    onSave={(newContent) => {
                      axios
                        .put(
                          `${process.env.REACT_APP_API_BACKEND}/posts/${editingPostId}`,
                          { content: newContent },
                          { headers: { Authorization: `Bearer ${token}` } }
                        )
                        .then(() => {
                          setEditingPostId(null);
                          fetchFriendsPosts();
                        })
                        .catch((error) => console.error('Error editing post:', error));
                    }}
                    onCancel={() => setEditingPostId(null)}
                  />
                ) : (
                  <p className="mb-4 text-xl text-gray-900 font-semibold">{post.content}</p>
                )}

                {post.media && post.media.length > 0 && (
                  <div className="flex justify-center mb-4">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation
                      pagination={{ clickable: true }}
                      spaceBetween={10}
                      className="w-full max-w-md aspect-[4/5] sm:aspect-video rounded overflow-hidden"
                    >
                      {post.media.map((file, idx) => (
                        <SwiperSlide key={idx} className="flex items-center justify-center bg-transparent">
                          {file.mediaType === 'image' ? (
                            <img
                              src={getFullImageUrl(file.url)}
                              alt={`media-${idx}`}
                              className="max-h-full max-w-full object-contain rounded"
                              onError={(e) => {
                               // console.error('Error loading media:', file.url);
                                e.target.src = defaultProfile;
                              }}
                            />
                          ) : file.mediaType === 'video' ? (
                            <video
                              src={getFullImageUrl(file.url)}
                              controls
                              className="max-h-full max-w-full object-contain rounded"
                              onError={(e) => console.error('Error loading video:', file.url)}
                            />
                          ) : (
                            <a
                              href={getFullImageUrl(file.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 underline break-words"
                            >
                              {file.url.split('/').pop()}
                            </a>
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                <div className="flex items-center gap-4 my-4">
                  <button
                    onClick={() => handleLike(post._id)}
                    className="text-green-600 hover:text-green-700 flex items-center gap-1"
                  >
                    ❤️ {post.likes?.length || 0}
                  </button>
                  <button
                    onClick={() => handleDislike(post._id)}
                    className="text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    👎 {post.dislikes?.length || 0}
                  </button>
                  {post.user?._id === user?._id && (
                    <button
                      onClick={() => setEditingPostId(post._id)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Editar
                    </button>
                  )}
                </div>

                <div className="border-t pt-3 mt-3">
                  <p className="font-semibold text-gray-900 mb-2">Comentarios:</p>
                  {post.comments?.length <= 10 ? (
                    post.comments.map((c) => (
                      <div key={c._id} className="flex items-start gap-2 my-2 text-sm">
                        <Link
                          to={`/user/${c.user?._id}`}
                          className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition"
                        >
                          <img
                            src={getFullImageUrl(c.user?.profilePicture) || defaultProfile}
                            alt={c.user?.username || 'Usuario'}
                            className="w-8 h-8 rounded-full object-cover border border-gray-200"
                            onError={(e) => {
                             // console.error('Error loading comment profile picture:', c.user?.profilePicture);
                              e.target.src = defaultProfile;
                            }}
                          />
                          <span className="font-bold text-gray-900">{c.user?.username || 'Usuario'}</span>
                        </Link>
                        <div className="flex-1">
                          <span>: {c.comment}</span>
                          {c.user?._id === user?._id && (
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={() => setEditingComment({ postId: post._id, commentId: c._id })}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => {
                                  axios
                                    .delete(
                                      `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                                      { headers: { Authorization: `Bearer ${token}` } }
                                    )
                                    .then(() => fetchFriendsPosts())
                                    .catch((error) => console.error('Error deleting comment:', error));
                                }}
                                className="text-red-600 hover:text-red-700 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          )}
                        </div>
                        {editingComment.postId === post._id && editingComment.commentId === c._id && (
                          <EditCommentForm
                            initialComment={c.comment}
                            onSave={(newComment) => {
                              axios
                                .put(
                                  `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                                  { comment: newComment },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                )
                                .then(() => {
                                  setEditingComment({ postId: null, commentId: null });
                                  fetchFriendsPosts();
                                })
                                .catch((error) => console.error('Error editing comment:', error));
                            }}
                            onCancel={() => setEditingComment({ postId: null, commentId: null })}
                          />
                        )}
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
                      {chunkComments(post.comments).map((chunk, idx) => (
                        <SwiperSlide key={idx}>
                          {chunk.map((c) => (
                            <div key={c._id} className="flex items-start gap-2 my-2 text-sm">
                              <Link
                                to={`/user/${c.user?._id}`}
                                className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded transition"
                              >
                                <img
                                  src={getFullImageUrl(c.user?.profilePicture) || defaultProfile}
                                  alt={c.user?.username || 'Usuario'}
                                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                  onError={(e) => {
                                  //  console.error('Error loading comment profile picture:', c.user?.profilePicture);
                                    e.target.src = defaultProfile;
                                  }}
                                />
                                <span className="font-bold text-gray-900">{c.user?.username || 'Usuario'}</span>
                              </Link>
                              <div className="flex-1">
                                <span>: {c.comment}</span>
                                {c.user?._id === user?._id && (
                                  <div className="flex gap-2 mt-1">
                                    <button
                                      onClick={() => setEditingComment({ postId: post._id, commentId: c._id })}
                                      className="text-blue-600 hover:text-blue-700 text-xs"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        axios
                                          .delete(
                                            `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                                            { headers: { Authorization: `Bearer ${token}` } }
                                          )
                                          .then(() => fetchFriendsPosts())
                                          .catch((error) => console.error('Error deleting comment:', error));
                                      }}
                                      className="text-red-600 hover:text-red-700 text-xs"
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>
                              {editingComment.postId === post._id && editingComment.commentId === c._id && (
                                <EditCommentForm
                                  initialComment={c.comment}
                                  onSave={(newComment) => {
                                    axios
                                      .put(
                                        `${process.env.REACT_APP_API_BACKEND}/posts/${post._id}/comment/${c._id}`,
                                        { comment: newComment },
                                        { headers: { Authorization: `Bearer ${token}` } }
                                      )
                                      .then(() => {
                                        setEditingComment({ postId: null, commentId: null });
                                        fetchFriendsPosts();
                                      })
                                      .catch((error) => console.error('Error editing comment:', error));
                                  }}
                                  onCancel={() => setEditingComment({ postId: null, commentId: null })}
                                />
                              )}
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
                      className="w-full p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
   
    </div>
  );
};

export default FriendsPosts;