import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import { REACTION_TYPES } from '../UI/ReactionPicker';

const ReactionsModal = ({ isOpen, onClose, reactions }) => {
    const [activeTab, setActiveTab] = useState('all');

    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    // Contar reacciones por tipo
    const counts = reactions.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
    }, {});

    // Filtrar usuarios según la pestaña activa
    const filteredReactions = activeTab === 'all'
        ? reactions
        : reactions.filter(r => r.type === activeTab);

    // Obtener los tipos únicos de reacciones presentes en este post para las pestañas
    const uniqueReactionTypes = [...new Set(reactions.map(r => r.type))];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay con blur */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden animate-slide-up border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">Vibras</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all"
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-50 overflow-x-auto hide-scrollbar flex gap-2">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0
                            ${activeTab === 'all'
                                ? 'bg-primary-600 text-white shadow-lg shadow-primary-200'
                                : 'text-gray-500 hover:bg-white hover:text-gray-900 shadow-sm border border-gray-100'}`}
                    >
                        Todos ({reactions.length})
                    </button>
                    {uniqueReactionTypes.map(type => {
                        const reactionData = REACTION_TYPES.find(rt => rt.type === type);
                        return (
                            <button
                                key={type}
                                onClick={() => setActiveTab(type)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 flex items-center gap-2
                                    ${activeTab === type
                                        ? 'bg-white text-gray-900 shadow-md border border-gray-100 ring-2 ring-primary-50'
                                        : 'text-gray-500 hover:bg-white hover:text-gray-900 shadow-sm border border-gray-100'}`}
                            >
                                <span className="text-sm">{reactionData?.emoji || '👍'}</span>
                                <span>{counts[type]}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Users List */}
                <div className="max-h-[400px] overflow-y-auto px-4 py-4 space-y-2">
                    {filteredReactions.length > 0 ? (
                        filteredReactions.map((r, idx) => {
                            // Robust support for both populated and unpopulated user data
                            const isPopulated = typeof r.user === 'object' && r.user !== null;
                            const userId = isPopulated ? r.user._id : r.user;
                            const username = isPopulated ? r.user.username : 'Usuario';
                            const profilePic = isPopulated ? r.user.profilePicture : null;

                            return (
                                <div key={idx} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <Link
                                        to={`/user/${userId}`}
                                        className="flex items-center gap-4 flex-1"
                                        onClick={onClose}
                                    >
                                        <div className="relative">
                                            <img
                                                src={getFullImageUrl(profilePic)}
                                                alt={username}
                                                className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-sm"
                                                onError={(e) => (e.target.src = defaultProfile)}
                                            />
                                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-md border border-gray-50 text-[10px]">
                                                {REACTION_TYPES.find(rt => rt.type === r.type)?.emoji}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
                                                {username}
                                            </p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                                                Vibrando {REACTION_TYPES.find(rt => rt.type === r.type)?.label || 'Positivo'}
                                            </p>
                                        </div>
                                    </Link>
                                    <Link
                                        to={`/user/${userId}`}
                                        className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-primary-600 hover:text-white transition-all transform hover:scale-110"
                                        onClick={onClose}
                                    >
                                        <User size={16} />
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center">
                            <span className="text-4xl block mb-4">💨</span>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay vibras aquí</p>
                        </div>
                    )}
                </div>

                {/* Footer simple para cerrar */}
                <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-gray-900 hover:shadow-md transition-all active:scale-95"
                    >
                        Cerrar panel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReactionsModal;
