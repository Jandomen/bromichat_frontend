import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { FaPlus, FaUsers, FaSearch } from 'react-icons/fa';
import Layout from '../../components/Layout/Layout';
import { AuthContext } from '../../context/AuthContext';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import { useUI } from '../../context/UIContext';

const Groups = () => {
    const { token, user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: '', description: '', privacy: 'public', coverImage: null });
    const [coverPreview, setCoverPreview] = useState(null);
    const { showToast } = useUI();
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');

    const [searchTerm, setSearchTerm] = useState('');

    const fetchGroups = useCallback(async () => {
        try {
            const res = await api.get('/communities');
            setGroups(res.data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    }, []);

    const fetchFriends = useCallback(async () => {
        try {
            const res = await api.get(`/friend/friends/${user._id}`);
            setFriends(res.data.friends || []);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    }, [user._id]);

    useEffect(() => {
        if (token && user?._id) {
            fetchGroups();
            fetchFriends();
        }
    }, [token, user, fetchGroups, fetchFriends]);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newGroup.name);
        formData.append('description', newGroup.description);
        formData.append('privacy', newGroup.privacy);
        formData.append('initialMembers', JSON.stringify(selectedMembers));
        if (newGroup.coverImage) {
            formData.append('coverImage', newGroup.coverImage);
        }

        try {
            await api.post('/communities', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowCreateModal(false);
            setNewGroup({ name: '', description: '', privacy: 'public', coverImage: null });
            setCoverPreview(null);
            setSelectedMembers([]);
            fetchGroups();
            showToast('¡Grupo creado con éxito!', 'success');
        } catch (error) {
            console.error('Error creating group:', error);
            showToast('No se pudo crear el grupo', 'error');
        }
    };

    const toggleMemberSelection = (friendId) => {
        setSelectedMembers(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50/50 pb-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                <span className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                    <FaUsers size={28} />
                                </span>
                                Grupos
                            </h1>
                            <p className="text-gray-500 mt-1 ml-14">Conecta y comparte con personas de tus mismos intereses</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all font-bold active:scale-95"
                        >
                            <FaPlus /> Crear Grupo
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar grupos por nombre o descripción..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg"
                        />
                    </div>

                    {/* Groups Grid */}
                    {filteredGroups.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                            {filteredGroups.map((group) => (
                                <Link
                                    to={`/groups/${group._id}`}
                                    key={group._id}
                                    className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                                >
                                    <div className="h-40 relative">
                                        {group.coverImage ? (
                                            <img
                                                src={getFullImageUrl(group.coverImage)}
                                                alt={group.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white/20">
                                                <FaUsers size={64} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${group.privacy === 'public' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {group.privacy === 'public' ? '🌍 Público' : '🔒 Privado'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-extrabold text-xl text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                                            {group.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex -space-x-2">
                                                {group.members?.slice(0, 3).map((member, i) => (
                                                    <div key={member._id || i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex items-center justify-center">
                                                        {member.profilePicture ? (
                                                            <img
                                                                src={getFullImageUrl(member.profilePicture)}
                                                                alt={member.username}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = '/default-profile.png'; }}
                                                            />
                                                        ) : (
                                                            <span className="text-[10px] font-bold text-gray-400 capitalize">
                                                                {member.username?.charAt(0) || '?'}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                                {group.members?.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500">
                                                        +{group.members.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-gray-500 text-sm font-medium">
                                                {group.members?.length || 0} miembros
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed h-10 mb-4 italic">
                                            {group.description || 'Sin descripción disponible.'}
                                        </p>
                                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-blue-600 font-bold text-sm">
                                            Ver grupo
                                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaSearch className="text-gray-300" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">No se encontraron grupos</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Intenta con otros términos de búsqueda o crea uno nuevo.</p>
                        </div>
                    )}
                </div>


                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                        <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                            <h2 className="text-2xl font-bold mb-6 text-gray-900">Crear Nuevo Grupo</h2>
                            <form onSubmit={handleCreateGroup} className="space-y-5">
                                <div className="grid grid-cols-1 gap-5">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nombre del Grupo</label>
                                        <input
                                            type="text"
                                            value={newGroup.name}
                                            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            required
                                            placeholder="Ej: Amigos del Barrio"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Descripción</label>
                                        <textarea
                                            value={newGroup.description}
                                            onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                            className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            rows="2"
                                            placeholder="¿De qué trata este grupo?"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Privacidad</label>
                                            <select
                                                value={newGroup.privacy}
                                                onChange={(e) => setNewGroup({ ...newGroup, privacy: e.target.value })}
                                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            >
                                                <option value="public">🌍 Público</option>
                                                <option value="private">🔒 Privado</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Imagen de Portada</label>
                                            <div
                                                onClick={() => document.getElementById('create-cover').click()}
                                                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all bg-gray-50/50"
                                            >
                                                {coverPreview ? (
                                                    <img src={coverPreview} className="w-24 h-24 object-cover rounded-lg shadow-md" alt="Preview" />
                                                ) : (
                                                    <>
                                                        <FaPlus className="text-gray-400 mb-2" />
                                                        <span className="text-xs font-bold text-gray-500 uppercase">Subir Foto</span>
                                                    </>
                                                )}
                                            </div>
                                            <input
                                                id="create-cover"
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setNewGroup({ ...newGroup, coverImage: file });
                                                        setCoverPreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Añadir Miembros</label>
                                        <div className="relative mb-3">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaSearch className="text-gray-400 text-xs" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Buscar amigos..."
                                                value={memberSearch}
                                                onChange={(e) => setMemberSearch(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1 bg-gray-50/50">
                                            {friends.filter(f => f.username.toLowerCase().includes(memberSearch.toLowerCase())).length === 0 ? (
                                                <p className="text-gray-400 text-sm italic p-4 text-center">No se encontraron amigos.</p>
                                            ) : (
                                                friends
                                                    .filter(f => f.username.toLowerCase().includes(memberSearch.toLowerCase()))
                                                    .map(friend => (
                                                        <div
                                                            key={friend._id}
                                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${selectedMembers.includes(friend._id) ? 'bg-blue-50 border-blue-100 border' : 'hover:bg-white border-transparent border'
                                                                }`}
                                                            onClick={() => toggleMemberSelection(friend._id)}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                                                    {friend.profilePicture && (
                                                                        <img src={friend.profilePicture} alt="" className="w-full h-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <span className="text-sm font-medium">{friend.username}</span>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${selectedMembers.includes(friend._id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'
                                                                }`}>
                                                                {selectedMembers.includes(friend._id) && <span>✓</span>}
                                                            </div>
                                                        </div>
                                                    ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-gray-600 hover:text-gray-900 px-6 py-2.5 font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-8 py-2.5 rounded-xl hover:bg-blue-700 font-bold shadow-md hover:shadow-lg transition-all"
                                    >
                                        Crear Grupo
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Groups;
