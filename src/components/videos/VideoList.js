import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useUI } from '../../context/UIContext';
import { Menu } from '@headlessui/react';
import { X } from 'lucide-react';
import { FaPlay, FaTrash, FaEdit, FaEllipsisV, FaChevronLeft, FaChevronRight, FaLock, FaGlobe, FaHeart, FaComment, FaShare, FaPaperPlane } from 'react-icons/fa';
import { useSwipe } from '../../hooks/useSwipe';
import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import CommentItem from '../UI/CommentItem';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const getFullVideoUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${process.env.REACT_APP_API_BACKEND}${path}`;
};

const VideoList = ({ videos, setVideos, token, type = 'grid' }) => {
  const { user: currentUser } = useContext(AuthContext);
  const { showConfirm, showToast } = useUI();
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [currentVideoDetails, setCurrentVideoDetails] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', isPrivate: false, allowFeed: true, category: 'Todos' });
  const videoRefs = useRef({});

  const handlers = useSwipe(
    () => handleNext(),
    () => handlePrev(),
    null,
    null
  );

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, videoEl]) => {
      if (!videoEl) return;
      if (lightboxIndex !== null || (activeVideoId && id !== activeVideoId)) {
        videoEl.pause();
        videoEl.currentTime = 0;
      }
    });
  }, [activeVideoId, lightboxIndex]);

  useEffect(() => {
    if (lightboxIndex === null) {
      setCurrentVideoDetails(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        const vid = videos[lightboxIndex];
        const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/videos/${vid._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentVideoDetails(res.data);
      } catch (err) {
        console.error("Error fetching video details", err);
      }
    };
    fetchDetails();

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'Escape') setLightboxIndex(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, videos]);

  const handleDelete = async (videoPublicId) => {
    showConfirm('Eliminar video', '¿Seguro que quieres eliminar este video?', async () => {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BACKEND}/videos/delete`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { publicId: videoPublicId },
        });
        setVideos((prev) => prev.filter((v) => v.publicId !== videoPublicId));
        showToast('Video eliminado', 'success');
      } catch (err) {
        showToast('Error al eliminar video', 'error');
      }
    });
  };

  const handleEditClick = (video) => {
    setEditingVideo(video);
    setEditForm({
      title: video.title || '',
      description: video.description || '',
      isPrivate: video.isPrivate || false,
      allowFeed: video.allowFeed !== undefined ? video.allowFeed : true,
      category: video.category || 'Todos'
    });
  };

  const handleUpdateVideo = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/videos/update/${editingVideo._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVideos(prev => prev.map(v => v._id === editingVideo._id ? { ...v, ...res.data } : v));
      showToast('Video actualizado', 'success');
      setEditingVideo(null);
    } catch (err) {
      showToast('Error al actualizar video', 'error');
    }
  };

  const handleVideoHover = (videoId, isHovering) => {
    const videoEl = videoRefs.current[videoId];
    if (videoEl) {
      if (isHovering && lightboxIndex === null) {
        videoEl.muted = true;
        videoEl.play().catch(() => { });
        setActiveVideoId(videoId);
      } else {
        videoEl.pause();
        videoEl.currentTime = 0;
        setActiveVideoId(null);
      }
    }
  };

  const handleNext = () => {
    if (videos.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % videos.length);
  };

  const handlePrev = () => {
    if (videos.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleReact = async (type) => {
    if (!currentVideoDetails) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${currentVideoDetails._id}/react`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentVideoDetails(prev => ({ ...prev, reactions: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e, commentId = null, textOverride = null) => {
    if (e) e.preventDefault();
    const text = textOverride || commentText;
    if (!text.trim() || !currentVideoDetails) return;

    try {
      let res;
      if (commentId) {
        res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${currentVideoDetails._id}/comment/${commentId}/reply`, { comment: text }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${currentVideoDetails._id}/comment`, { comment: text }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCommentText('');
      }
      setCurrentVideoDetails(prev => ({ ...prev, comments: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleEditComment = async (text, commentId) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/videos/${currentVideoDetails._id}/comment/${commentId}`, { comment: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentVideoDetails(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario actualizado', 'success');
    } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_BACKEND}/videos/${currentVideoDetails._id}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentVideoDetails(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario eliminado', 'success');
    } catch (err) { console.error(err); }
  };

  const handleShare = async () => {
    if (!currentVideoDetails) return;
    const shareContent = prompt('Añade un comentario a tu compartido...');
    if (shareContent === null) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_BACKEND}/videos/${currentVideoDetails._id}/share`, { content: shareContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('¡Video compartido en tu muro!', 'success');
    } catch (err) { showToast('Error al compartir', 'error'); }
  };

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
        <FaPlay className="mb-4 opacity-10" size={64} />
        <p className="font-bold text-gray-500 uppercase tracking-[0.2em] text-sm">No hay videos para mostrar</p>
      </div>
    );
  }

  const userReaction = currentVideoDetails?.reactions?.find(r => r.user === currentUser?._id);
  const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction?.type);

  // Layout selection
  const gridClasses = type === 'youtube'
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    : "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6";

  const cardClasses = type === 'youtube'
    ? "bg-white overflow-hidden transition-all duration-300 group cursor-pointer"
    : "group relative bg-zinc-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-white/5 transform hover:-translate-y-2 cursor-pointer";

  const videoAspect = type === 'youtube' ? "aspect-video rounded-2xl" : "aspect-[9/16]";

  return (
    <div>
      <div className={gridClasses}>
        {videos.map((video, index) => (
          <div
            key={video._id}
            className={cardClasses}
            onMouseEnter={() => handleVideoHover(video._id, true)}
            onMouseLeave={() => handleVideoHover(video._id, false)}
            onClick={() => setLightboxIndex(index)}
          >
            <div className={`${videoAspect} bg-black relative overflow-hidden group-hover:shadow-2xl transition-all duration-500`}>
              <video
                ref={(el) => { if (el) videoRefs.current[video._id] = el; }}
                src={getFullVideoUrl(video.videoUrl)}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                muted playsInline loop
              />

              {/* Overlays */}
              <div className="absolute top-3 left-3 flex gap-2 z-10">
                {video.isPrivate ? (
                  <div className="bg-black/60 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <FaLock size={12} className="text-red-500" />
                  </div>
                ) : (
                  <div className="bg-black/60 p-1.5 rounded-lg backdrop-blur-md border border-white/10">
                    <FaGlobe size={12} className="text-blue-400" />
                  </div>
                )}
                {video.category && (
                  <div className="bg-red-600/60 px-2 py-1 rounded-lg backdrop-blur-md border border-red-400/20 text-[8px] font-black text-white uppercase tracking-tighter">
                    {video.category}
                  </div>
                )}
              </div>

              {type !== 'youtube' && (
                <>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-500" />
                  <div className="absolute bottom-4 left-4 right-4 transform transition-transform group-hover:-translate-y-1">
                    <h3 className="font-black text-white text-sm sm:text-base truncate uppercase tracking-tighter mb-1">{video.title}</h3>
                    <div className="flex items-center gap-2">
                      <img src={getFullImageUrl(video.user?.profilePicture)} className="w-5 h-5 rounded-full object-cover border border-white/20" alt="" />
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">@{video.user?.username}</span>
                    </div>
                  </div>
                </>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-150 group-hover:scale-100">
                <div className="p-4 bg-white rounded-full shadow-2xl shadow-black/50 text-red-600 transform transition-transform hover:scale-110">
                  <FaPlay size={20} />
                </div>
              </div>

              {/* Reaction Counter */}
              {video.reactions?.length > 0 && (
                <div className="absolute top-3 right-12 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1.5 scale-0 group-hover:scale-100 transition-transform origin-right">
                  <span className="text-xs">{REACTION_TYPES.find(r => r.type === video.reactions[0].type)?.emoji}</span>
                  <span className="text-[10px] font-black text-white">{video.reactions.length}</span>
                </div>
              )}
            </div>

            {/* YouTube style info block */}
            {type === 'youtube' && (
              <div className="mt-4 flex gap-3">
                <img
                  src={getFullImageUrl(video.user?.profilePicture)}
                  className="w-10 h-10 rounded-[1.2rem] object-cover mt-1 border-2 border-gray-50 transition-transform group-hover:scale-110 shadow-sm"
                  alt=""
                  onError={e => e.target.src = defaultProfile}
                />
                <div className="flex-1 min-w-0 pr-8 relative">
                  <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 group-hover:text-red-600 transition-colors uppercase tracking-tight">{video.title}</h3>
                  <div className="flex flex-col mt-1 opacity-60">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">@{video.user?.username}</span>
                    <span className="text-[10px] font-bold text-gray-400 mt-0.5">{video.createdAt ? new Date(video.createdAt).toLocaleDateString('es-ES') : ''}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Options Menu */}
            {video.user?._id === currentUser?._id && (
              <div className={`absolute z-10 transition-opacity ${type === 'youtube' ? 'top-2 right-2' : 'top-3 right-3'} opacity-0 group-hover:opacity-100`} onClick={e => e.stopPropagation()}>
                <Menu as="div" className="relative">
                  <Menu.Button className="p-2 bg-black/50 text-white rounded-full"><FaEllipsisV size={12} /></Menu.Button>
                  <Menu.Items className="absolute right-0 mt-2 w-40 bg-zinc-800 rounded-xl shadow-2xl overflow-hidden border border-white/10 z-[100]">
                    <Menu.Item>
                      {({ active }) => (
                        <button className={`${active ? 'bg-indigo-600' : ''} w-full text-left px-4 py-3 text-xs font-bold text-white flex items-center gap-2`} onClick={() => handleEditClick(video)}>
                          <FaEdit size={10} /> Editar
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button className={`${active ? 'bg-red-600' : ''} w-full text-left px-4 py-3 text-xs font-bold text-white flex items-center gap-2`} onClick={() => handleDelete(video.publicId)}>
                          <FaTrash size={10} /> Eliminar
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
            )}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center animate-in fade-in duration-300" onClick={() => setLightboxIndex(null)}>
          <div className="relative w-screen h-screen bg-black flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            {/* Close button - high visibility */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 z-[220] p-4 bg-white/10 hover:bg-red-600 text-white rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-2xl active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-grow relative bg-black flex items-center justify-center group/vid">
              <button className="absolute left-4 z-10 text-white/20 hover:text-white p-4 transition-all opacity-0 group-hover/vid:opacity-100" onClick={handlePrev}><FaChevronLeft size={32} /></button>
              <button className="absolute right-4 z-10 text-white/20 hover:text-white p-4 transition-all opacity-0 group-hover/vid:opacity-100" onClick={handleNext}><FaChevronRight size={32} /></button>
              <video key={videos[lightboxIndex]._id} src={getFullVideoUrl(videos[lightboxIndex].videoUrl)} controls autoPlay className="max-h-full max-w-full" />
            </div>

            <div className="w-full md:w-96 bg-zinc-900 flex flex-col border-l border-white/5">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <img src={getFullImageUrl(currentVideoDetails?.user?.profilePicture)} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" onError={e => e.target.src = defaultProfile} />
                  <div>
                    <h2 className="text-white font-black text-sm uppercase truncate">@{currentVideoDetails?.user?.username || 'Cargando...'}</h2>
                    <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{videos[lightboxIndex].createdAt ? new Date(videos[lightboxIndex].createdAt).toLocaleDateString('es-ES') : ''}</span>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">{videos[lightboxIndex].description || videos[lightboxIndex].title}</p>

                <div className="flex items-center justify-around py-4 border-t border-b border-white/5">
                  <div className="relative group/react">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const userReaction = currentVideoDetails.reactions?.find(r => r.user === currentUser?._id);
                        if (userReaction) {
                          handleReact(userReaction.type);
                        } else {
                          handleReact('like');
                        }
                      }}
                      className="flex flex-col items-center gap-1"
                    >
                      <div className={`p-3 rounded-full transition-all ${currentReactionData ? 'bg-red-600 text-white' : 'hover:bg-white/5 text-zinc-400'}`}>
                        {currentReactionData ? <span className="text-xl drop-shadow-md">{currentReactionData.emoji}</span> : <FaHeart size={18} />}
                      </div>
                      <span className="text-[10px] font-black text-zinc-500">{currentVideoDetails?.reactions?.length || 0}</span>
                    </button>

                    <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-500 delay-150 transform translate-y-1 group-hover/react:translate-y-0 z-[150]">
                      <ReactionPicker
                        onSelect={(type) => handleReact(type)}
                        currentReaction={currentVideoDetails?.reactions?.find(r => r.user === currentUser?._id)?.type}
                      />
                    </div>
                  </div>
                  <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-blue-500 transition-colors">
                    <FaComment size={18} />
                    <span className="text-[10px] font-black text-zinc-500">{currentVideoDetails?.comments?.length || 0}</span>
                  </button>
                  <button onClick={handleShare} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-green-500 transition-colors">
                    <FaShare size={18} />
                    <span className="text-[10px] font-black text-zinc-500">COMPARTIR</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[50vh] md:max-h-full custom-scrollbar">
                {currentVideoDetails?.comments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <FaComment size={40} className="mb-4 text-white" />
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Sin comentarios aún</p>
                  </div>
                ) : (
                  currentVideoDetails?.comments?.filter(c => !c.parentId).map(c => (
                    <CommentItem
                      key={c._id}
                      comment={c}
                      allComments={currentVideoDetails.comments}
                      onReply={(text, pId) => handleComment(null, pId, text)}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      currentUser={currentUser}
                      themeColor="red-600"
                    />
                  ))
                )}
              </div>

              <form onSubmit={handleComment} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Añade un comentario..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-red-600/50" />
                <button type="submit" className="p-2.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"><FaPaperPlane size={14} /></button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white font-black uppercase tracking-widest text-sm flex items-center gap-2">
                <FaEdit className="text-indigo-500" /> Editar Video
              </h3>
              <button onClick={() => setEditingVideo(null)} className="text-zinc-500 hover:text-white transition-colors">&times;</button>
            </div>
            <form onSubmit={handleUpdateVideo} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Título</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors h-24 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Privacidad</label>
                  <select
                    value={editForm.isPrivate ? 'true' : 'false'}
                    onChange={e => setEditForm(prev => ({ ...prev, isPrivate: e.target.value === 'true' }))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors"
                  >
                    <option value="false">Público</option>
                    <option value="true">Privado</option>
                  </select>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">En Feed (TikTok)</label>
                  <select
                    value={editForm.allowFeed ? 'true' : 'false'}
                    onChange={e => setEditForm(prev => ({ ...prev, allowFeed: e.target.value === 'true' }))}
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors"
                  >
                    <option value="true">Sí (Visible)</option>
                    <option value="false">No (Oculto)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Categoría</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  {['Todos', 'Tendencias', 'Música', 'Gaming', 'Educación', 'Deportes', 'Tecnología', 'Cine'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoList;
