import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Trash2, Eye, Download } from 'lucide-react';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';
import { Link } from 'react-router-dom';
import defaultProfile from '../../assets/default-profile.png';

const ST_DURATION = 5000; // 5 seconds per story

const StoryViewer = ({ storyGroups, initialGroupIndex, onClose, currentUserId }) => {
    const { showConfirm, showToast } = useUI();
    const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showViewers, setShowViewers] = useState(false);

    const touchStart = useRef(null);
    const touchEnd = useRef(null);
    const touchStartY = useRef(null);

    // Safety: derive but don't return early yet
    const currentGroup = storyGroups[currentGroupIndex];
    const currentStory = currentGroup ? currentGroup.stories[currentStoryIndex] : null;

    const handleNext = React.useCallback(() => {
        if (!currentGroup) return;
        if (currentStoryIndex < currentGroup.stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (currentGroupIndex < storyGroups.length - 1) {
            setCurrentGroupIndex(prev => prev + 1);
            setCurrentStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentStoryIndex, currentGroupIndex, storyGroups, currentGroup, onClose]);

    const handlePrev = React.useCallback(() => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(storyGroups[currentGroupIndex - 1].stories.length - 1);
            setProgress(0);
        }
    }, [currentStoryIndex, currentGroupIndex, storyGroups]);

    const handleDelete = React.useCallback(async () => {
        if (!currentStory) return;
        showConfirm(
            'Eliminar historia',
            '¿Eliminar esta historia?',
            async () => {
                setIsPaused(true);
                try {
                    await api.delete(`/stories/${currentStory._id}`);
                    showToast('Historia eliminada', 'success');
                    onClose();
                } catch (error) {
                    console.error("Error deleting story", error);
                    showToast('Error al eliminar historia', 'error');
                    setIsPaused(false);
                }
            }
        );
    }, [currentStory, showConfirm, showToast, onClose]);

    const handleVideoEnded = React.useCallback(() => {
        handleNext();
    }, [handleNext]);

    // Handle close if invalid
    useEffect(() => {
        if (!currentGroup || !currentStory) {
            setTimeout(() => onClose(), 0);
        }
    }, [currentGroup, currentStory, onClose]);

    // Mark as viewed useEffect
    useEffect(() => {
        if (currentGroup && currentStory && currentGroup.user._id !== currentUserId) {
            api.post(`/stories/${currentStory._id}/view`)
                .catch(err => console.error("Error logging view", err));
        }
    }, [currentGroup, currentStory, currentUserId]);

    // Timer effect
    useEffect(() => {
        if (!currentGroup || !currentStory) return;

        setProgress(0);
        let interval;

        if (isPaused) return;

        // For Text and Image, use timer.
        if (currentStory.type !== 'video' || !currentStory.mediaUrl) {
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + (100 / (ST_DURATION / 100));
                    return next > 100 ? 100 : next;
                });
            }, 100);
        }

        return () => clearInterval(interval);
    }, [currentStoryIndex, currentGroupIndex, isPaused, currentStory?.type, currentGroup, currentStory]);

    // Separate effect to handle auto-navigation when progress reaches 100
    useEffect(() => {
        if (progress >= 100) {
            handleNext();
        }
    }, [progress, handleNext]);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);



    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        touchEnd.current = null;
        touchStart.current = e.targetTouches[0].clientX;
        setIsPaused(true);
    };

    const onTouchMove = (e) => {
        touchEnd.current = e.targetTouches[0].clientX;
    };

    const onTouchEnd = () => {
        setIsPaused(false);
        if (!touchStart.current || !touchEnd.current) return;
        const distance = touchStart.current - touchEnd.current;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            handleNext();
        } else if (isRightSwipe) {
            handlePrev();
        }
    };

    // Close on swipe down (separate touch tracker for Y)

    const onTouchStartY = (e) => {
        touchStartY.current = e.targetTouches[0].clientY;
        setIsPaused(true);
    };

    const onTouchEndY = (e) => {
        setIsPaused(false);
        const distY = e.changedTouches[0].clientY - touchStartY.current;
        if (distY > 100) onClose(); // Swipe down to close
    };

    // If invalid, return null now (all hooks have been called unconditionally)
    if (!currentGroup || !currentStory) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden">
            {/* Background Backdrop for Close */}
            <div className="absolute inset-0 bg-black/90 cursor-default" onClick={onClose} />

            {/* Close Button - Optimized for touch */}
            <button
                onClick={onClose}
                className="absolute top-6 right-4 text-white z-[210] p-3 hover:bg-white/10 rounded-full bg-black/20 backdrop-blur-sm"
                aria-label="Cerrar"
            >
                <X size={28} />
            </button>

            {/* Main Content Area */}
            <div
                className="relative w-full max-w-md h-full md:h-[90vh] md:rounded-xl overflow-hidden bg-black border border-gray-800 flex flex-col pt-16 md:pt-0 shadow-2xl z-[205]"
                onMouseDown={() => setIsPaused(true)}
                onMouseUp={() => setIsPaused(false)}
                onTouchStart={(e) => { onTouchStart(e); onTouchStartY(e); }}
                onTouchMove={onTouchMove}
                onTouchEnd={(e) => { onTouchEnd(); onTouchEndY(e); }}
            >

                {/* Top Shadow Gradient for Visibility */}
                <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />

                {/* Progress Bars */}
                <div className="absolute top-4 md:top-3 left-0 right-0 z-20 flex gap-1.5 p-3">
                    {currentGroup.stories.map((s, idx) => (
                        <div key={s._id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden shadow-sm">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                                style={{
                                    width: idx === currentStoryIndex ? `${progress}%` :
                                        idx < currentStoryIndex ? '100%' : '0%'
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header User Info */}
                <div className="absolute top-12 md:top-8 left-0 right-0 z-20 px-4 flex items-center justify-between">
                    <Link to={`/user/${currentGroup.user._id}`} className="flex items-center gap-3.5 hover:opacity-90 transition-all active:scale-95 group">
                        <div className="relative">
                            <img
                                src={getFullImageUrl(currentGroup.user.profilePicture)}
                                alt="user"
                                className="w-11 h-11 rounded-full border-2 border-white/80 object-cover shadow-lg group-hover:border-white"
                                onError={(e) => (e.target.src = defaultProfile)}
                            />
                            <div className="absolute inset-0 rounded-full shadow-inner pointer-events-none" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-[15px] leading-none drop-shadow-lg tracking-tight">
                                {currentGroup.user.username}
                            </span>
                            <span className="text-white/80 text-[11px] font-medium mt-1 drop-shadow-md flex items-center gap-1.5">
                                <span className="w-1 h-1 bg-white/50 rounded-full" />
                                {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </Link>

                    {/* Controls (Owner) */}
                    {currentGroup.user._id === currentUserId && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPaused(true);
                                    setShowViewers(true);
                                }}
                                className="text-white px-5 py-2.5 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 transition-all border border-white/30 rounded-2xl flex items-center gap-2.5 backdrop-blur-xl active:scale-95 shadow-lg shadow-indigo-900/20 group"
                            >
                                <Eye size={18} className="drop-shadow-sm group-hover:scale-110 transition-transform" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Vistas</span>
                                    <span className="text-sm font-black drop-shadow-sm mt-0.5">{currentStory.views?.length || 0}</span>
                                </div>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = getFullImageUrl(currentStory.mediaUrl);
                                    link.download = `story-${currentStory._id}.jpg`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    showToast('Iniciando descarga...', 'success');
                                }}
                                className="text-white/90 hover:text-white hover:bg-white/20 transition-all p-2.5 bg-white/10 rounded-full backdrop-blur-md border border-white/20 active:scale-95"
                                title="Descargar contenido"
                            >
                                <Download size={20} />
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                className="text-white/90 hover:text-red-500 hover:bg-red-500/10 transition-all p-2.5 bg-white/10 rounded-full backdrop-blur-md border border-white/20 active:scale-95"
                                title="Eliminar historia"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    )}

                    {/* Download button for non-owners too (optional, but requested to know "what to do with them") */}
                    {currentGroup.user._id !== currentUserId && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = getFullImageUrl(currentStory.mediaUrl);
                                link.download = `story-${currentStory._id}.jpg`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                showToast('Iniciando descarga...', 'success');
                            }}
                            className="text-white/90 hover:text-white hover:bg-white/20 transition-all p-2.5 bg-white/10 rounded-full backdrop-blur-md border border-white/20 active:scale-95"
                            title="Descargar contenido"
                        >
                            <Download size={20} />
                        </button>
                    )}
                </div>

                {/* Viewers List Modal */}
                {showViewers && (
                    <div className="absolute inset-0 z-[60] bg-gray-950 flex flex-col animate-slideUp">
                        <div className="p-5 pt-14 md:pt-5 flex items-center justify-between border-b border-white/5 sticky top-0 bg-gray-950/90 backdrop-blur-xl z-10">
                            <div>
                                <h3 className="text-white font-black text-xl uppercase tracking-tight">Espectadores</h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">{currentStory.views?.length || 0} personas han visto esto</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowViewers(false); setIsPaused(false); }}
                                className="text-white/50 hover:text-white p-3 bg-white/5 rounded-2xl transition-all active:scale-90 border border-white/5"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 custom-scrollbar">
                            {(!currentStory.views || currentStory.views.filter(v => v.user).length === 0) ? (
                                <p className="text-gray-500 text-center py-8 font-medium">Nadie ha visto esto aún.</p>
                            ) : (
                                currentStory.views.filter(v => v.user).map((view, idx) => (
                                    <Link
                                        key={idx}
                                        to={`/user/${view.user?._id}`}
                                        className="flex items-center gap-3 hover:bg-white/5 p-2 rounded-xl transition-colors group"
                                        onClick={onClose}
                                    >
                                        <div className="relative group/view-avatar">
                                            <div className="p-0.5 bg-gradient-to-tr from-blue-500/50 to-purple-500/50 rounded-full">
                                                <img
                                                    src={getFullImageUrl(view.user?.profilePicture)}
                                                    alt={view.user?.username || 'User'}
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-900 group-hover/view-avatar:border-white transition-all shadow-md"
                                                    onError={(e) => (e.target.src = defaultProfile)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold group-hover:text-blue-400 transition-colors">
                                                {view.user?.username || 'Usuario desconocido'}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-0.5">
                                                {new Date(view.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="text-gray-600">
                                            < ChevronRight size={16} />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Media */}
                <div className="w-full h-full flex items-center justify-center bg-black">
                    {currentStory.type === 'text' ? (
                        <div
                            className="w-full h-full flex items-center justify-center p-8 text-center"
                            style={{ backgroundColor: currentStory.backgroundColor || '#000' }}
                        >
                            <p className="text-white font-bold text-3xl md:text-4xl drop-shadow-lg break-words whitespace-pre-wrap">
                                {currentStory.content}
                            </p>
                        </div>
                    ) : currentStory.type === 'video' ? (
                        <video
                            src={getFullImageUrl(currentStory.mediaUrl)}
                            className="max-h-full max-w-full object-contain"
                            autoPlay
                            playsInline
                            onEnded={handleVideoEnded}
                            onTimeUpdate={(e) => {
                                if (e.target.duration) {
                                    setProgress((e.target.currentTime / e.target.duration) * 100);
                                }
                            }}
                        />
                    ) : (
                        <img
                            src={getFullImageUrl(currentStory.mediaUrl)}
                            alt="story"
                            className="max-h-full max-w-full object-contain"
                        />
                    )}
                </div>

                {/* Navigation Hotspots */}
                <div className="absolute inset-0 z-[15] flex mt-20">
                    <div className="w-1/3 h-full" onClick={(e) => { e.stopPropagation(); handlePrev(); }}></div>
                    <div className="w-2/3 h-full" onClick={(e) => { e.stopPropagation(); handleNext(); }}></div>
                </div>

                {/* Arrow Helpers (Desktop) */}
                <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-50 hidden md:block"
                >
                    <ChevronLeft size={40} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white z-50 hidden md:block"
                >
                    <ChevronRight size={40} />
                </button>

            </div>
        </div>
    );
};

export default StoryViewer;
