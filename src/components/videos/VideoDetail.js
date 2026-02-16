import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVideoById } from "../../services/videoService";
import { ArrowLeft, MessageCircle, Heart, Share2, Send } from "lucide-react";
import Header from "../Header";
import Footer from "../Footer";
import axios from "axios";
import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import CommentItem from '../UI/CommentItem';
import { AuthContext } from "../../context/AuthContext";
import { getFullImageUrl } from "../../utils/getProfilePicture";
import { useUI } from "../../context/UIContext";
import defaultProfile from "../../assets/default-profile.png";

const getFullVideoUrl = (path) => {
  if (!path) return "";
  return path.startsWith("http") ? path : `${process.env.REACT_APP_API_BACKEND}${path}`;
};

const VideoDetail = () => {
  const { videoId } = useParams();
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const { showToast } = useUI();

  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getVideoById(videoId, token);
        setVideo(res.data);
      } catch (err) {
        setError("No se pudo cargar el video.");
      } finally {
        setLoading(false);
      }
    };

    if (videoId && token) fetchVideo();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') navigate(-1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videoId, token, navigate]);

  const handleReact = async (type) => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${videoId}/react`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideo(prev => ({ ...prev, reactions: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e, commentId = null, textOverride = null) => {
    if (e) e.preventDefault();
    const text = textOverride || commentText;
    if (!text.trim()) return;

    try {
      let res;
      if (commentId) {
        res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${videoId}/comment/${commentId}/reply`, { comment: text }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${videoId}/comment`, { comment: text }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCommentText('');
      }
      setVideo(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario enviado', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al enviar comentario', 'error');
    }
  };

  const handleEditComment = async (text, commentId) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/videos/${videoId}/comment/${commentId}`, { comment: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideo(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario actualizado', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al actualizar comentario', 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_BACKEND}/videos/${videoId}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideo(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario eliminado', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al eliminar comentario', 'error');
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${videoId}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('¡Video compartido en tu muro!', 'success');
    } catch (err) {
      console.error(err);
      showToast('No se pudo compartir el video', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  if (error || !video) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white gap-4">
      <p className="text-xl text-red-500">{error || "Video no encontrado"}</p>
      <button
        onClick={() => navigate('/videos')}
        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition"
      >
        Volver
      </button>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <div className="p-2 bg-white/5 rounded-full group-hover:bg-red-600 group-hover:text-white transition-all">
            <ArrowLeft size={20} />
          </div>
          <span className="font-bold">Volver atrás</span>
        </button>

        <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              src={getFullVideoUrl(video.videoUrl)}
              controls
              autoPlay
              className="w-full h-full max-h-[70vh] object-contain"
            />
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">{video.title || "Sin título"}</h1>
                <div className="flex items-center gap-3 text-zinc-400 mb-4">
                  <div className="flex items-center gap-2">
                    <img
                      src={getFullImageUrl(video.user?.profilePicture)}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover"
                      onError={e => e.target.src = defaultProfile}
                    />
                    <span className="font-bold text-sm text-zinc-300">@{video.user?.username || "Desconocido"}</span>
                  </div>
                  <span>•</span>
                  <span className="text-xs">{new Date(video.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-zinc-300 text-lg leading-relaxed">{video.description}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-6 w-full">
                <div className="relative group/react">
                  <button
                    onClick={() => {
                      const userReaction = video.reactions?.find(r => (r.user?._id || r.user) === user?._id);
                      handleReact(userReaction ? userReaction.type : 'like');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 group"
                  >
                    {(() => {
                      const userReaction = video.reactions?.find(r => (r.user?._id || r.user) === user?._id);
                      const reactionData = REACTION_TYPES.find(rt => rt.type === userReaction?.type);
                      return reactionData ? (
                        <span className="text-xl animate-in zoom-in-50 duration-300">{reactionData.emoji}</span>
                      ) : (
                        <Heart size={20} className="text-zinc-400 group-hover:text-white" />
                      );
                    })()}
                    <span className="font-black text-sm">{video.reactions?.length || 0}</span>
                  </button>

                  <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-500 delay-150 transform translate-y-1 group-hover/react:translate-y-0 z-[150]">
                    <ReactionPicker
                      onSelect={handleReact}
                      currentReaction={video.reactions?.find(r => (r.user?._id || r.user) === user?._id)?.type}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl text-zinc-400 border border-white/5">
                  <MessageCircle size={20} />
                  <span className="font-black text-sm">{video.comments?.length || 0}</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 text-zinc-400 hover:text-white"
                >
                  <Share2 size={20} />
                  <span className="font-black text-sm uppercase tracking-tighter">Compartir</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tight">Comentarios ({video.comments?.length || 0})</h3>

              <form onSubmit={handleComment} className="flex gap-4">
                <img src={getFullImageUrl(user?.profilePicture)} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" onError={e => e.target.src = defaultProfile} />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 transition-all"
                  />
                  <button type="submit" className="p-4 bg-red-600 rounded-2xl text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95">
                    <Send size={18} />
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {video.comments?.filter(c => !c.parentId).map(c => (
                  <CommentItem
                    key={c._id}
                    comment={c}
                    allComments={video.comments}
                    onReply={(text, pId) => handleComment(null, pId, text)}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    currentUser={user}
                    themeColor="red-600"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VideoDetail;
