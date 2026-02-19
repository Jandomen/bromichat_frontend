import React, { useState } from 'react';
import { X, Send, Share2, Users } from 'lucide-react';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';

const ShareModal = ({ isOpen, onClose, onShare, item, type = 'post' }) => {
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onShare(comment);
        setComment('');
        onClose();
    };

    // Determinar qué mostrar en la previsualización
    const previewContent = item.content || item.description || item.title || '';
    const previewImage = type === 'photo' ? item.imageUrl :
        (item.media && item.media[0]?.url) ? item.media[0].url : null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-slide-up border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-50 text-primary-600 rounded-xl">
                            <Users size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Viralizar Historia</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-8 space-y-6">
                        {/* User Input Area */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                ¿Qué piensas sobre esto?
                            </label>
                            <textarea
                                autoFocus
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Escribe un comentario opcional..."
                                className="w-full bg-gray-50 hover:bg-gray-100 border border-transparent focus:border-primary-100 focus:bg-white rounded-2xl px-6 py-4 text-sm font-medium focus:ring-[6px] focus:ring-primary-50 transition-all outline-none resize-none h-28"
                            />
                        </div>

                        {/* Preview Area */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                Vista previa
                            </label>
                            <div className="bg-gray-50 rounded-3xl p-4 border border-gray-100 flex gap-4 items-start">
                                {previewImage && (
                                    <img
                                        src={getFullImageUrl(previewImage)}
                                        className="w-20 h-20 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                                        alt="Preview"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <img
                                            src={getFullImageUrl(item.user?.profilePicture)}
                                            className="w-5 h-5 rounded-full object-cover"
                                            alt=""
                                            onError={(e) => e.target.src = defaultProfile}
                                        />
                                        <span className="text-[11px] font-black text-gray-700 tracking-tight">
                                            @{item.user?.username || 'Usuario'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-3 font-medium leading-relaxed">
                                        {previewContent || 'Sin descripción'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-8 pb-8 pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            Viralizar ahora
                            <Users size={14} strokeWidth={3} />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShareModal;
