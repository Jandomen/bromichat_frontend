import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import { useUI } from '../../context/UIContext';
import defaultProfile from '../../assets/default-profile.png';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import { SocketContext } from '../../context/SocketContext';
import { Plus, X } from 'lucide-react';
import StoryViewer from './StoryViewer';
import VideoTrimmer from './VideoTrimmer';

const StoriesBar = () => {
    const { user: currentUser, token } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const { showToast } = useUI();
    const [stories, setStories] = useState([]);
    const [selectedUserIndex, setSelectedUserIndex] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [trimmingFile, setTrimmingFile] = useState(null);
    const fileInputRef = useRef(null);

    const fetchStories = useCallback(async () => {
        if (!token) return;
        try {
            const res = await api.get('/stories/feed', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const myId = currentUser?._id?.toString();
            const myStoriesIndex = res.data.findIndex(group => group.user?._id?.toString() === myId);
            let sortedGroups = [...res.data];

            if (myId && myStoriesIndex > -1) {
                const [myGroup] = sortedGroups.splice(myStoriesIndex, 1);
                sortedGroups.unshift(myGroup);
            }

            setStories(sortedGroups);
        } catch (error) {
            // console.error("Error fetching stories", error);
        }
    }, [token, currentUser?._id]);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    useEffect(() => {
        if (!socket) return;
        socket.on('newStory', fetchStories);
        return () => socket.off('newStory', fetchStories);
    }, [socket, fetchStories]);

    const [showCreateOptions, setShowCreateOptions] = useState(false);
    const [showTextCreator, setShowTextCreator] = useState(false);
    const [textStory, setTextStory] = useState({ content: '', backgroundColor: '#ec4899' }); // Default pinkish

    // Safety check for video duration
    const checkVideoDuration = (file) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = function () {
                window.URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = function () {
                reject("Invalid video");
            }
            video.src = URL.createObjectURL(file);
        });
    };

    const handleFileUpload = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.type.startsWith('video')) {
            setTrimmingFile(file);
            return;
        }

        performUpload(file);
    }, [token, currentUser]);

    const handleTrimConfirm = useCallback((startOffset) => {
        const file = trimmingFile;
        setTrimmingFile(null);
        performUpload(file, startOffset);
    }, [trimmingFile, token, currentUser]);

    const performUpload = async (file, startOffset = 0) => {
        setUploading(true);
        const formData = new FormData();
        formData.append('media', file);
        if (startOffset > 0) {
            formData.append('startOffset', startOffset);
        }

        try {
            await api.post('/stories/create', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            await fetchStories();
            setShowCreateOptions(false);
            showToast('Historia compartida con éxito', 'success');
        } catch (error) {
            console.error("Error uploading story", error);
            const msg = error.response?.data?.message || "Error al subir historia";
            showToast(msg, "error");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleTextStorySubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!textStory.content.trim()) return;

        setUploading(true);
        try {
            await api.post('/stories/create', {
                type: 'text',
                content: textStory.content,
                backgroundColor: textStory.backgroundColor
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchStories();
            setShowTextCreator(false);
            setShowCreateOptions(false);
            setTextStory({ content: '', backgroundColor: '#ec4899' });
        } catch (error) {
            console.error("Error creating text story", error);
            const msg = error.response?.data?.message || "Error al crear historia";
            showToast(msg, "error");
        } finally {
            setUploading(false);
        }
    }, [textStory, token, currentUser]);

    const handleMyStoryClick = () => {
        setShowCreateOptions(true);
    };

    const handleStoryClick = (index) => {
        setSelectedUserIndex(index);
    };

    const handleCloseViewer = useCallback(() => {
        setSelectedUserIndex(null);
        fetchStories();
    }, [token]);

    // Find my existing stories group
    const myId = currentUser?._id?.toString();
    const myStoriesGroup = stories.find(g => g.user._id?.toString() === myId);
    const hasMyStories = myStoriesGroup && myStoriesGroup.stories.length > 0;

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 relative z-10">

            {/* Horizontal Scroll Area */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">

                {/* My Story Node */}
                <div className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0" onClick={handleMyStoryClick}>
                    <div className={`w-16 h-16 rounded-full p-[2px] ${hasMyStories ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-gray-200'}`}>
                        <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative bg-white">
                            <img
                                src={getFullImageUrl(currentUser?.profilePicture)}
                                alt="Me"
                                className="w-full h-full object-cover opacity-90"
                                onError={(e) => e.target.src = defaultProfile}
                            />
                            {!hasMyStories && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                    <div className="bg-black/60 backdrop-blur-sm rounded-full p-1 text-white border-2 border-white/50">
                                        <Plus size={16} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <span className="text-xs font-medium text-gray-700 max-w-[64px] truncate">
                        Tu historia
                    </span>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                </div>

                {/* Other Users */}
                {stories.filter(g => g.user._id?.toString() !== myId).map((group, i) => {
                    const allViewed = group.stories.every(s => s.viewedByUser);
                    return (
                        <div
                            key={group.user._id}
                            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
                            onClick={() => handleStoryClick(stories.indexOf(group))}
                        >
                            <div className={`w-16 h-16 rounded-full p-[2px] ${allViewed ? 'bg-gray-300' : 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500'}`}>
                                <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                                    <img
                                        src={getFullImageUrl(group.user.profilePicture)}
                                        alt={group.user.username}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = defaultProfile}
                                    />
                                </div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 max-w-[64px] truncate">
                                {group.user.username}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Create Options Modal/Overlay */}
            {showCreateOptions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowCreateOptions(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Gestionar Historia</h3>

                        <div className="space-y-3">
                            {hasMyStories && (
                                <button
                                    onClick={() => {
                                        setShowCreateOptions(false);
                                        // Find index of my story group
                                        const myIdx = stories.findIndex(g => g.user._id === currentUser._id);
                                        if (myIdx > -1) setSelectedUserIndex(myIdx);
                                    }}
                                    className="w-full py-3 bg-blue-50 text-blue-600 font-semibold rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                >
                                    <span>👁️</span> Ver mi historia
                                </button>
                            )}

                            <button
                                onClick={() => { fileInputRef.current?.click(); setShowCreateOptions(false); }}
                                className="w-full py-3 bg-gray-50 text-gray-800 font-semibold rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2"
                            >
                                <span>📷</span> Subir Foto / Video
                            </button>

                            <button
                                onClick={() => { setShowTextCreator(true); setShowCreateOptions(false); }}
                                className="w-full py-3 bg-pink-50 text-pink-600 font-semibold rounded-xl hover:bg-pink-100 transition flex items-center justify-center gap-2"
                            >
                                <span>✍️</span> Crear Texto
                            </button>
                        </div>
                        <button className="mt-4 w-full text-gray-400 text-sm hover:text-gray-600" onClick={() => setShowCreateOptions(false)}>Cancelar</button>
                    </div>
                </div>
            )}

            {/* Text Story Creator Overlay */}
            {showTextCreator && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                    <div className="w-full h-full max-w-md bg-gray-900 rounded-xl overflow-hidden relative flex flex-col items-center justify-center" style={{ backgroundColor: textStory.backgroundColor }}>
                        <button className="absolute top-4 right-4 text-white p-2 bg-black/20 rounded-full" onClick={() => setShowTextCreator(false)}>
                            <X size={24} />
                        </button>

                        <textarea
                            autoFocus
                            placeholder="Escribe algo..."
                            className="w-full max-w-xs bg-transparent text-white text-center text-3xl font-bold placeholder-white/50 focus:outline-none resize-none"
                            rows={4}
                            value={textStory.content}
                            onChange={e => setTextStory({ ...textStory, content: e.target.value })}
                        />

                        <div className="absolute bottom-6 flex flex-col gap-4 w-full px-6">
                            {/* Color Picker */}
                            <div className="flex justify-center gap-3">
                                {['#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#111827'].map(color => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 ${textStory.backgroundColor === color ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setTextStory({ ...textStory, backgroundColor: color })}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleTextStorySubmit}
                                disabled={!textStory.content.trim() || uploading}
                                className="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-white/90 transition disabled:opacity-50"
                            >
                                {uploading ? 'Publicando...' : 'Compartir en Historia'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUserIndex !== null && (
                <StoryViewer
                    storyGroups={stories}
                    initialGroupIndex={selectedUserIndex}
                    onClose={handleCloseViewer}
                    currentUserId={currentUser._id} // Pass for delete capability
                />
            )}

            {trimmingFile && (
                <VideoTrimmer
                    file={trimmingFile}
                    onConfirm={handleTrimConfirm}
                    onCancel={() => setTrimmingFile(null)}
                />
            )}
        </div>
    );
};

export default StoriesBar;
