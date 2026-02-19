import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { useUI } from '../../context/UIContext';
import { Menu } from '@headlessui/react';
import { X, Search, Smile, Lightbulb, Users, Trash2, Edit3, MoreVertical, ChevronLeft, ChevronRight, Lock, Globe, Send } from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';
import CommentItem from '../UI/CommentItem';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import ReactionPicker, { REACTION_TYPES } from '../UI/ReactionPicker';
import ShareModal from '../posts/ShareModal';

const PhotoList = ({ photos, setPhotos, token, initialPhotoId, type = 'grid' }) => {
  const { user: currentUser } = useContext(AuthContext);
  const { showConfirm, showToast } = useUI();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [currentPhotoDetails, setCurrentPhotoDetails] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editForm, setEditForm] = useState({ description: '', isPrivate: false, allowFeed: true, category: 'Mundo' });
  const [showUI, setShowUI] = useState(true);
  const uiTimeoutRef = useRef(null);

  const resetUITimeout = () => {
    setShowUI(true);
    if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    uiTimeoutRef.current = setTimeout(() => setShowUI(false), 3000);
  };

  useEffect(() => {
    if (initialPhotoId && photos.length > 0) {
      const index = photos.findIndex(p => p._id === initialPhotoId);
      if (index !== -1) {
        setLightboxIndex(index);
      }
    }
  }, [initialPhotoId, photos]);

  const handleNext = useCallback(() => {
    if (!photos || photos.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  }, [photos]);

  const handlePrev = useCallback(() => {
    if (!photos || photos.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos]);

  const handlers = useSwipe(
    () => handleNext(),
    () => handlePrev(),
    null,
    null
  );

  useEffect(() => {
    if (lightboxIndex === null) {
      setCurrentPhotoDetails(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        const photo = photos[lightboxIndex];
        const res = await axios.get(`${process.env.REACT_APP_API_BACKEND}/gallery/${photo._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCurrentPhotoDetails(res.data);
      } catch (err) {
        console.error("Error fetching photo details", err);
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

    const handleInteraction = () => resetUITimeout();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    resetUITimeout();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      if (uiTimeoutRef.current) clearTimeout(uiTimeoutRef.current);
    };
  }, [lightboxIndex, photos, handleNext, handlePrev, token]);

  const handleDelete = async (photoId) => {
    showConfirm('Eliminar foto', '¿Seguro que quieres eliminar esta foto?', async () => {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BACKEND}/gallery/${photoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPhotos((prev) => prev.filter((p) => p._id !== photoId));
        showToast('Foto eliminada', 'success');
      } catch (err) {
        showToast('Error al eliminar la foto', 'error');
      }
    });
  };

  const handleEditClick = (photo) => {
    setEditingPhoto(photo);
    setEditForm({
      description: photo.description || '',
      isPrivate: photo.isPrivate || false,
      allowFeed: photo.allowFeed !== undefined ? photo.allowFeed : true,
      category: photo.category || 'Mundo'
    });
  };

  const handleUpdatePhoto = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/gallery/${editingPhoto._id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPhotos(prev => prev.map(p => p._id === editingPhoto._id ? { ...p, ...res.data } : p));
      showToast('Foto actualizada', 'success');
      setEditingPhoto(null);
    } catch (err) {
      showToast('Error al actualizar foto', 'error');
    }
  };

  const handleReact = async (type) => {
    if (!currentPhotoDetails) return;
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/gallery/${currentPhotoDetails._id}/react`, { type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPhotoDetails(prev => ({ ...prev, reactions: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleComment = async (e, commentId = null, textOverride = null) => {
    if (e) e.preventDefault();
    const text = textOverride || commentText;
    if (!text.trim() || !currentPhotoDetails) return;
    try {
      let res;
      if (commentId) {
        res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/gallery/${currentPhotoDetails._id}/comment/${commentId}/reply`, { comment: text }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        res = await axios.post(`${process.env.REACT_APP_API_BACKEND}/gallery/${currentPhotoDetails._id}/comment`, { comment: text }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCommentText('');
      }
      setCurrentPhotoDetails(prev => ({ ...prev, comments: res.data }));
    } catch (err) { console.error(err); }
  };

  const handleEditComment = async (text, commentId) => {
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_BACKEND}/gallery/${currentPhotoDetails._id}/comment/${commentId}`, { comment: text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPhotoDetails(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario actualizado', 'success');
    } catch (err) { console.error(err); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await axios.delete(`${process.env.REACT_APP_API_BACKEND}/gallery/${currentPhotoDetails._id}/comment/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPhotoDetails(prev => ({ ...prev, comments: res.data }));
      showToast('Comentario eliminado', 'success');
    } catch (err) { console.error(err); }
  };

  const handleShare = async (shareContent) => {
    if (!currentPhotoDetails || !shareContent) return;
    try {
      await axios.post(`${process.env.REACT_APP_API_BACKEND}/gallery/${currentPhotoDetails._id}/share`, { content: shareContent }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('¡Foto viralizada en tu muro!', 'success');
      setIsShareModalOpen(false);
    } catch (err) { showToast('Error al viralizar', 'error'); }
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
        <Globe className="mb-4 opacity-10" size={64} />
        <p className="font-bold uppercase tracking-[0.2em] text-xs text-zinc-500">No hay momentos cautivadores aún</p>
      </div>
    );
  }

  const userReaction = currentPhotoDetails?.reactions?.find(r => (r.user?._id || r.user) === currentUser?._id);
  const currentReactionData = REACTION_TYPES.find(r => r.type === userReaction?.type);

  // Layout selection
  const gridClasses = type === 'pinterest'
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6";

  const cardClasses = type === 'pinterest'
    ? "bg-white overflow-hidden transition-all duration-500 group cursor-pointer"
    : "group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 cursor-pointer";

  const imageAspect = type === 'pinterest' ? "aspect-[4/3] rounded-[2.5rem]" : "w-full h-full";

  return (
    <div>
      <div className={gridClasses}>
        {photos.map((photo, index) => (
          <div
            key={photo._id}
            className={cardClasses}
            onClick={() => setLightboxIndex(index)}
          >
            <div className={`${imageAspect} overflow-hidden bg-zinc-100 relative shadow-sm group-hover:shadow-2xl group-hover:shadow-indigo-200 transition-all duration-500`}>
              <img src={photo.imageUrl} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" />

              {/* Overlays */}
              <div className="absolute top-4 left-4 flex gap-2 z-10 scale-0 group-hover:scale-100 transition-transform origin-left">
                {photo.isPrivate ? (
                  <div className="bg-black/60 p-2 rounded-xl backdrop-blur-md border border-white/10">
                    <Lock size={12} className="text-red-500" />
                  </div>
                ) : (
                  <div className="bg-black/60 p-2 rounded-xl backdrop-blur-md border border-white/10">
                    <Globe size={12} className="text-blue-400" />
                  </div>
                )}
                {photo.category && (
                  <div className="bg-indigo-600/60 px-2 py-1 rounded-lg backdrop-blur-md border border-indigo-400/20 text-[8px] font-black text-white uppercase tracking-tighter">
                    {photo.category}
                  </div>
                )}
              </div>

              {type !== 'pinterest' ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <p className="text-white text-[10px] font-black truncate uppercase tracking-widest">{photo.description || 'Momentos'}</p>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 bg-white/10 backdrop-blur-[2px]">
                  <div className="p-4 bg-white rounded-full text-indigo-600 shadow-xl transform scale-150 group-hover:scale-100 transition-all duration-500">
                    <Search size={24} />
                  </div>
                </div>
              )}

              {/* Grid Reaction Badge */}
              {photo.reactions?.length > 0 && type !== 'pinterest' && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl px-2.5 py-1 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl transform -translate-x-2 group-hover:translate-x-0">
                  <span className="text-xs">{REACTION_TYPES.find(r => r.type === photo.reactions[0].type)?.emoji}</span>
                  <span className="text-[10px] font-black text-white">{photo.reactions.length}</span>
                </div>
              )}
            </div>

            {/* Pinterest Style Info */}
            {type === 'pinterest' && (
              <div className="mt-5 px-1 flex gap-4">
                <img
                  src={getFullImageUrl(photo.user?.profilePicture)}
                  className="w-12 h-12 rounded-[1.5rem] object-cover border-2 border-white shadow-sm flex-shrink-0 mt-1 transition-transform group-hover:scale-110"
                  alt=""
                  onError={e => e.target.src = defaultProfile}
                />
                <div className="flex-1 min-w-0 pr-6 relative">
                  <h3 className="font-bold text-zinc-900 text-lg leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                    {photo.description || 'Capturando el momento'}
                  </h3>
                  <div className="flex flex-col mt-2">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">@{photo.user?.username}</span>
                    <span className="text-[10px] font-bold text-zinc-300 mt-1">{new Date(photo.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Options in Pinterest Mode */}
                  {((typeof photo.user === 'object' ? photo.user._id : photo.user) === currentUser?._id) && (
                    <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <Menu as="div" className="relative">
                        <Menu.Button className="p-2 text-zinc-300 hover:text-indigo-600 transition-colors"><MoreVertical size={14} /></Menu.Button>
                        <Menu.Items className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 z-[100] animate-in zoom-in-95 duration-200">
                          <Menu.Item>
                            {({ active }) => (
                              <button className={`${active ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-600'} w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3`} onClick={() => handleEditClick(photo)}>
                                <Edit3 size={12} /> Editar
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button className={`${active ? 'bg-red-50 text-red-600' : 'text-zinc-600'} w-full text-left px-5 py-3 text-xs font-black uppercase tracking-widest flex items-center gap-3`} onClick={() => handleDelete(photo._id)}>
                                <Trash2 size={12} /> Eliminar
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grid Options Menu */}
            {type !== 'pinterest' && ((typeof photo.user === 'object' ? photo.user._id : photo.user) === currentUser?._id) && (
              <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <Menu as="div" className="relative">
                  <Menu.Button className="p-1.5 bg-black/50 text-white rounded-full backdrop-blur-md"><MoreVertical size={10} /></Menu.Button>
                  <Menu.Items className="absolute right-0 mt-1 w-36 bg-zinc-800 rounded-xl shadow-2xl overflow-hidden border border-white/10 z-[100]">
                    <Menu.Item>
                      {({ active }) => (
                        <button className={`${active ? 'bg-indigo-600' : ''} w-full text-left px-4 py-2 text-[10px] font-bold text-white flex items-center gap-2`} onClick={() => handleEditClick(photo)}>
                          <Edit3 size={10} /> Editar
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button className={`${active ? 'bg-red-600' : ''} w-full text-left px-4 py-2 text-[10px] font-bold text-white flex items-center gap-2`} onClick={() => handleDelete(photo._id)}>
                          <Trash2 size={10} /> Eliminar
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
        <div {...handlers} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[200] flex items-center justify-center animate-in fade-in duration-300" onClick={() => setLightboxIndex(null)}>
          <div className="relative w-screen h-screen bg-black flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
            {/* Close button - high visibility */}
            <button
              onClick={() => setLightboxIndex(null)}
              className={`absolute top-6 right-6 z-[220] p-4 bg-white/10 hover:bg-red-600 text-white rounded-full backdrop-blur-xl border border-white/20 transition-all duration-500 shadow-2xl active:scale-90 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-grow relative bg-black flex items-center justify-center group/img">
              <button className="absolute left-4 z-10 text-white/20 hover:text-white p-4 transition-all opacity-0 group-hover/img:opacity-100" onClick={handlePrev}><ChevronLeft size={32} /></button>
              <button className="absolute right-4 z-10 text-white/20 hover:text-white p-4 transition-all opacity-0 group-hover/img:opacity-100" onClick={handleNext}><ChevronRight size={32} /></button>
              <img src={photos[lightboxIndex].imageUrl} alt="" className="max-h-full max-w-full object-contain" />
            </div>

            <div className="w-full md:w-96 bg-zinc-900 flex flex-col border-l border-white/5">
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <img src={getFullImageUrl(currentPhotoDetails?.user?.profilePicture)} className="w-10 h-10 rounded-full object-cover border border-white/10" alt="" onError={e => e.target.src = defaultProfile} />
                  <div>
                    <h2 className="text-white font-black text-sm uppercase truncate">@{currentPhotoDetails?.user?.username || 'Cargando...'}</h2>
                    <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{new Date(photos[lightboxIndex].createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">{photos[lightboxIndex].description || 'Sin descripción'}</p>

                <div className="flex items-center justify-around py-4 border-t border-b border-white/5">
                  <div className="relative group/react">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Si ya hay reacción, la quitamos mandando el mismo tipo
                        if (currentReactionData) {
                          handleReact(currentReactionData.type);
                        } else {
                          handleReact('like');
                        }
                      }}
                      className="flex flex-col items-center gap-1 group/btn"
                    >
                      <div className={`p-3 rounded-full transition-all ${currentReactionData ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200' : 'hover:bg-white/5 text-zinc-400'}`}>
                        {currentReactionData ? <span className="text-xl drop-shadow-md">{currentReactionData.emoji}</span> : <Smile size={20} />}
                      </div>
                      <span className="text-[10px] font-black text-zinc-500">{currentPhotoDetails?.reactions?.length || 0}</span>
                    </button>

                    <div className="opacity-0 invisible group-hover/react:opacity-100 group-hover/react:visible transition-all duration-500 delay-150 transform translate-y-1 group-hover/react:translate-y-0 z-40">
                      <ReactionPicker
                        onSelect={(type) => handleReact(type)}
                        currentReaction={currentPhotoDetails?.reactions?.find(r => (r.user?._id || r.user) === currentUser?._id)?.type}
                      />
                    </div>
                  </div>
                  <button className="flex flex-col items-center gap-1 text-zinc-400 hover:text-indigo-500 transition-colors">
                    <Lightbulb size={20} />
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Opinar</span>
                  </button>
                  <button onClick={() => setIsShareModalOpen(true)} className="flex flex-col items-center gap-1 text-zinc-400 hover:text-green-500 transition-colors">
                    <Users size={20} />
                    <span className="text-[10px] font-black text-zinc-500 uppercase">Viralizar</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 max-h-[50vh] md:max-h-full custom-scrollbar">
                {currentPhotoDetails?.comments?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 opacity-20">
                    <Lightbulb size={40} className="mb-4 text-white" />
                    <p className="text-[10px] font-black uppercase text-white tracking-widest">No hay comentarios aún</p>
                  </div>
                ) : (
                  currentPhotoDetails?.comments?.filter(c => !c.parentId).map(c => (
                    <CommentItem
                      key={c._id}
                      comment={c}
                      allComments={currentPhotoDetails.comments}
                      onReply={(text, pId) => handleComment(null, pId, text)}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      currentUser={currentUser}
                      themeColor="indigo-600"
                    />
                  ))
                )}
              </div>

              <form onSubmit={handleComment} className="p-4 bg-black/40 border-t border-white/5 flex gap-2">
                <input type="text" value={commentText} onChange={e => setCommentText(e.target.value)} placeholder="Añade un comentario..." className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-600/50" />
                <button type="submit" className="p-2.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-colors flex items-center justify-center">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {currentPhotoDetails && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShare}
          item={currentPhotoDetails}
          type="photo"
        />
      )}

      {/* Edit Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <Edit3 className="text-indigo-500" /> Editar Foto
              </h3>
              <button onClick={() => setEditingPhoto(null)} className="text-zinc-500 hover:text-white transition-colors">&times;</button>
            </div>
            <form onSubmit={handleUpdatePhoto} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors h-24 resize-none"
                  placeholder="Añade una descripción..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Privacidad</label>
                  <div className="flex bg-black rounded-xl p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, isPrivate: false }))}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${!editForm.isPrivate ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Público
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, isPrivate: true }))}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${editForm.isPrivate ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Privado
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">En Feed</label>
                  <div className="flex bg-black rounded-xl p-1 border border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, allowFeed: true }))}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${editForm.allowFeed ? 'bg-green-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, allowFeed: false }))}
                      className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${!editForm.allowFeed ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Categoría</label>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors"
                >
                  {['Mundo', 'Arte', 'Naturaleza', 'Retratos', 'Viajes', 'Comida', 'Moda', 'Arquitectura'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
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

export default PhotoList;
