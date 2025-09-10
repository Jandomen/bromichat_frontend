import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import EditPostForm from './EditPostForm';
import EditCommentForm from './EditCommentForm';
import Headers from '../Header';
import Footer from '../Footer';

const PostDetail = () => {
  const { postId } = useParams();
  const { token, user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingComment, setEditingComment] = useState({ postId: null, commentId: null });

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
    } catch (err) {
      setError('Error al cargar la publicación');
     // console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPost();
  }, [postId, token]);

  const handleLike = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPost();
    } catch (error) {
     // console.error('Error al dar like', error);
    }
  };

  const handleDislike = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/dislike`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPost();
    } catch (error) {
     // console.error('Error al dar dislike', error);
    }
  };

  const handleComment = async (comment) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/comment`,
        { comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPost();
    } catch (error) {
     // console.error('Error al comentar', error);
    }
  };

  const handleEditPost = () => {
    setEditingPostId(postId);
  };

  const handleSavePost = async (newContent) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingPostId(null);
      fetchPost();
    } catch (error) {
     // console.error('Error al editar post', error);
    }
  };

  const handleCancelEditPost = () => {
    setEditingPostId(null);
  };

  const handleDeletePost = async () => {
    if (!window.confirm('¿Seguro que quieres eliminar esta publicación?')) return;
    try {
      await axios.delete(`${process.env.REACT_APP_API_BACKEND}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = '/'; // Adjust based on your routing
    } catch (error) {
     // console.error('Error al eliminar post', error);
    }
  };

  const handleEditComment = (commentId) => {
    setEditingComment({ postId, commentId });
  };

  const handleSaveComment = async (newComment) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/comment/${editingComment.commentId}`,
        { comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingComment({ postId: null, commentId: null });
      fetchPost();
    } catch (error) {
     // console.error('Error al editar comentario', error);
    }
  };

  const handleCancelEditComment = () => {
    setEditingComment({ postId: null, commentId: null });
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('¿Seguro que quieres eliminar este comentario?')) return;
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_BACKEND}/posts/${postId}/comment/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPost();
    } catch (error) {
     // console.error('Error al eliminar comentario', error);
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

  if (loading) return <p className="min-h-screen flex items-center justify-center">Cargando...</p>;
  if (error) return <p className="min-h-screen flex items-center justify-center text-red-500">{error}</p>;
  if (!post) return <p className="min-h-screen flex items-center justify-center">No se encontró la publicación</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <Headers />
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="border p-4 rounded shadow">
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
                <button className="text-xl font-bold px-2" aria-label="Opciones">
                  ⋮
                </button>
                <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-gray-200"
                    onClick={handleEditPost}
                  >
                    Editar
                  </button>
                  <button
                    className="block w-full text-left px-4 py-2 hover:bg-red-200 text-red-600"
                    onClick={handleDeletePost}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
          {editingPostId === postId ? (
            <EditPostForm
              initialContent={post.content}
              onSave={handleSavePost}
              onCancel={handleCancelEditPost}
            />
          ) : (
            <p className="mb-4 text-xl text-gray-900 font-semibold">{post.content}</p>
          )}
          {post.media && post.media.length > 0 && (
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
                    />
                  ) : (
                    <video
                      src={getFullImageUrl(file.url)}
                      controls
                      className="max-h-full max-w-full object-contain rounded"
                    />
                  )}
                </SwiperSlide>
              ))}
            </Swiper>
          )}
          <div className="flex items-center gap-4 my-2">
            <button onClick={handleLike} className="text-green-600">
              ❤️ {post.likes.length}
            </button>
            <button onClick={handleDislike} className="text-red-600">
              👎 {post.dislikes.length}
            </button>
          </div>
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
                    {editingComment.postId === postId && editingComment.commentId === c._id ? (
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
                              onClick={() => handleEditComment(c._id)}
                              className="text-blue-600 hover:underline text-xs"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c._id)}
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
                {chunkComments(post.comments).map((commentChunk, chunkIndex) => (
                  <SwiperSlide key={chunkIndex}>
                    {commentChunk.map((c) => (
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
                          {editingComment.postId === postId && editingComment.commentId === c._id ? (
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
                                    onClick={() => handleEditComment(c._id)}
                                    className="text-blue-600 hover:underline text-xs"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(c._id)}
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
                  handleComment(comment);
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
      </main>
      <Footer />
    </div>
  );
};

export default PostDetail;