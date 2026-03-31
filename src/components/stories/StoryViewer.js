import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Trash2, Eye, MoreHorizontal } from 'lucide-react';
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
    const [isUIVisible, setIsUIVisible] = useState(true); // Toggle for UI "calm" mode

    const videoRef = useRef(null);
    const touchStart = useRef(null);
    const longPressTimer = useRef(null);

    // Safety: derive but don't return early yet
    const currentGroup = storyGroups[currentGroupIndex];
    const currentStory = currentGroup ? currentGroup.stories[currentStoryIndex] : null;

    const handleNext = useCallback(() => {
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

    const handlePrev = useCallback(() => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (currentGroupIndex > 0) {
            setCurrentGroupIndex(prev => prev - 1);
            setCurrentStoryIndex(storyGroups[currentGroupIndex - 1].stories.length - 1);
            setProgress(0);
        }
    }, [currentStoryIndex, currentGroupIndex, storyGroups]);

    const handleDelete = useCallback(async () => {
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

    const handleVideoEnded = useCallback(() => {
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
            if (e.key === ' ') { // Space to toggle UI/Pause
                setIsPaused(prev => !prev);
                setIsUIVisible(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, onClose]);


    // --- Gesture & Interaction Logic ---

    const handleTouchStart = (e) => {
        touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };

        // Long press detection
        longPressTimer.current = setTimeout(() => {
            setIsPaused(true);
            setIsUIVisible(false); // Hide UI on long press
        }, 300);
    };

    const handleTouchEnd = (e) => {
        clearTimeout(longPressTimer.current);
        const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        const diffX = touchStart.current ? touchEnd.x - touchStart.current.x : 0;
        const diffY = touchStart.current ? touchEnd.y - touchStart.current.y : 0;

        // Resume if we were paused by long press
        setIsPaused(false);

        // If it was a swipe down, close
        if (diffY > 100 && Math.abs(diffX) < 50) {
            onClose();
            return;
        }

        // Tap detection (minimal movement)
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
            const width = window.innerWidth;
            const x = touchEnd.x;

            if (x < width * 0.3) {
                // Left 30%: Previous
                handlePrev();
            } else if (x > width * 0.7) {
                // Right 30%: Next
                handleNext();
            } else {
                // Center 40%: Toggle UI
                setIsUIVisible(prev => !prev);
            }
        }
    };

    if (!currentGroup || !currentStory) {
        return null;
    }

    const isOwner = currentGroup.user._id?.toString() === currentUserId?.toString();

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">

            {/* Media Layer */}
            <div
                className="absolute inset-0 z-0 flex items-center justify-center bg-black"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseDown={(e) => handleTouchStart({ touches: [{ clientX: e.clientX, clientY: e.clientY }] })}
                onMouseUp={(e) => handleTouchEnd({ changedTouches: [{ clientX: e.clientX, clientY: e.clientY }] })}
            >
                {currentStory.type === 'text' ? (
                    <div
                        className="w-full h-full flex items-center justify-center p-8 text-center"
                        style={{ backgroundColor: currentStory.backgroundColor || '#000' }}
                    >
                        <p className="text-white font-bold text-3xl md:text-5xl drop-shadow-lg break-words whitespace-pre-wrap select-none">
                            {currentStory.content}
                        </p>
                    </div>
                ) : currentStory.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={getFullImageUrl(currentStory.mediaUrl)}
                        className="w-full h-full object-contain"
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
                        className="w-full h-full object-contain select-none"
                    />
                )}
            </div>

            {/* UI Overlay Layer (Header & Footer) */}
            <div className={`absolute inset-0 z-50 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ${isUIVisible ? 'opacity-100' : 'opacity-0'}`}>

                {/* --- HEADER --- */}
                <div className="pt-2 px-2 bg-gradient-to-b from-black/60 to-transparent pb-8 pointer-events-auto">
                    {/* Progress Bars */}
                    <div className="flex gap-1 mb-2">
                        {currentGroup.stories.map((s, idx) => (
                            <div key={s._id} className="h-[1.5px] xs:h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                    style={{
                                        width: idx === currentStoryIndex ? `${progress}%` :
                                            idx < currentStoryIndex ? '100%' : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* User Info & Controls */}
                    <div className="flex items-center justify-between">
                        <Link to={`/user/${currentGroup.user._id}`} className="flex items-center gap-2 group">
                            <img
                                src={getFullImageUrl(currentGroup.user.profilePicture)}
                                alt={currentGroup.user.username}
                                className="w-6 h-6 xs:w-8 xs:h-8 md:w-10 md:h-10 rounded-full border border-white/20 object-cover shadow-md"
                                onError={(e) => (e.target.src = defaultProfile)}
                            />
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5 xs:gap-2">
                                    <span className="text-white font-black text-[10px] xs:text-xs md:text-sm tracking-tighter sm:tracking-tight drop-shadow-md lowercase">
                                        {currentGroup.user.username}
                                    </span>
                                    <span className="text-white/60 text-[10px] md:text-xs font-medium">
                                        {new Date(currentStory.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 xs:gap-4">
                            {/* Options Menu (Placeholder for now, acts as close or more) */}
                            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-white p-1">
                                <X size={18} className="xs:w-[24px] xs:h-[24px] md:w-[26px] md:h-[26px] drop-shadow-md" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- FOOTER --- */}
                <div className="pb-4 pt-10 px-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-auto">
                    {isOwner ? (
                        /* Owner Controls */
                        <div className="flex items-center justify-between">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowViewers(true); setIsPaused(true); }}
                                className="flex items-center gap-1.5 text-white font-black text-[10px] xs:text-sm bg-white/10 px-3 py-1.5 xs:px-4 xs:py-2.5 rounded-full backdrop-blur-md active:scale-95 transition-transform uppercase tracking-tighter"
                            >
                                <Eye size={14} className="xs:w-[18px]" />
                                <span>{currentStory.views?.length || 0} vistas</span>
                            </button>

                            <div className="flex items-center gap-2 xs:gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                                    className="p-2 xs:p-3 bg-red-600/80 rounded-full text-white backdrop-blur-md active:scale-95 transition-transform"
                                >
                                    <Trash2 size={16} className="xs:w-[20px]" />
                                </button>
                                <button className="p-2 xs:p-3 bg-white/10 rounded-full text-white backdrop-blur-md active:scale-95 transition-transform">
                                    <MoreHorizontal size={16} className="xs:w-[20px]" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Viewer Controls (Simplified - User Info) */
                        <div className="flex items-center gap-2">
                            <Link to={`/user/${currentGroup.user._id}`} className="flex items-center gap-2 xs:gap-3 group">
                                <img
                                    src={getFullImageUrl(currentGroup.user.profilePicture)}
                                    alt={currentGroup.user.username}
                                    className="w-8 h-8 xs:w-11 xs:h-11 md:w-12 md:h-12 rounded-full border border-white/20 object-cover shadow-md"
                                    onError={(e) => (e.target.src = defaultProfile)}
                                />
                                <div className="flex flex-col">
                                    <span className="text-white font-black text-xs xs:text-base md:text-lg tracking-tighter sm:tracking-tight drop-shadow-md lowercase">
                                        {currentGroup.user.username}
                                    </span>
                                    <span className="text-white/60 text-[8px] xs:text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                        Ver perfil
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Viewers Sheet (Owner Only) */}
            {showViewers && (
                <div className="absolute inset-x-0 bottom-0 top-[30%] z-[60] bg-zinc-900 rounded-t-3xl flex flex-col animate-slideUp border-t border-white/10">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg">Espectadores</h3>
                        <button onClick={() => setShowViewers(false)} className="p-2 bg-white/10 rounded-full text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {(!currentStory.views || currentStory.views.filter(v => v.user).length === 0) ? (
                            <p className="text-gray-500 text-center py-8 font-medium">Nadie ha visto esto aún.</p>
                        ) : (
                            currentStory.views.filter(v => v.user).map((view, idx) => (
                                <Link
                                    key={idx}
                                    to={`/user/${view.user?._id}`}
                                    className="flex items-center gap-3 hover:bg-white/5 p-3 rounded-xl transition-colors mb-2"
                                >
                                    <img
                                        src={getFullImageUrl(view.user?.profilePicture)}
                                        alt={view.user?.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                        onError={(e) => (e.target.src = defaultProfile)}
                                    />
                                    <div className="flex-1">
                                        <p className="text-white font-semibold text-sm">{view.user?.username}</p>
                                        <p className="text-gray-500 text-xs">{new Date(view.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryViewer;
