import React, { useState, useEffect, useContext, useCallback } from 'react';
import api from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout/Layout';
import { FaUsers, FaGlobe, FaLock, FaPlus, FaEdit, FaTrash, FaCamera } from 'react-icons/fa';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import { AuthContext } from '../../context/AuthContext';
import SendMessageButton from '../../buttons/SendMessageButton';
import PostItem from '../../components/posts/PostItem';
import CreatePost from '../../components/posts/CreatePost';
import { useUI } from '../../context/UIContext';

const GroupProfile = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [group, setGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isMember, setIsMember] = useState(false);

    const [loading, setLoading] = useState(true);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [friends, setFriends] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', privacy: '', coverImage: null });
    const [editPreview, setEditPreview] = useState(null);
    const { showToast, showConfirm } = useUI();

    const fetchGroupDetails = useCallback(async () => {
        try {
            const res = await api.get(`/communities/${groupId}`);
            setGroup(res.data);

            if (currentUser) {
                const isMem = res.data.members.some(member => (member._id || member) === currentUser._id);
                setIsMember(isMem);
            }
            setEditForm({
                name: res.data.name,
                description: res.data.description,
                privacy: res.data.privacy,
                coverImage: null
            });
            setEditPreview(getFullImageUrl(res.data.coverImage));

            setLoading(false);
        } catch (error) {
            console.error('Error fetching group details:', error);
            setLoading(false);
        }
    }, [groupId, currentUser]);

    const fetchFriends = useCallback(async () => {
        try {
            const res = await api.get(`/friend/friends/${currentUser._id}`);
            // Fix: res.data is likely { friends: [...] }
            setFriends(res.data.friends || res.data || []);
        } catch (error) {
            console.error('Error fetching friends:', error);
            setFriends([]);
        }
    }, [currentUser]);

    const fetchGroupPosts = useCallback(async () => {
        try {
            const res = await api.get(`/communities/${groupId}/posts`);
            setPosts(res.data);
        } catch (error) {
            console.error('Error fetching group posts:', error);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroupDetails();
        fetchGroupPosts();
        if (currentUser) fetchFriends();
    }, [fetchGroupDetails, fetchGroupPosts, fetchFriends, currentUser]);

    const handleJoinLeave = async () => {
        // Optimistic Update
        const previousIsMember = isMember;
        setIsMember(!isMember);

        try {
            if (previousIsMember) {
                await api.post(`/communities/${groupId}/leave`);
                showToast('Has abandonado la comunidad', 'success');
            } else {
                await api.post(`/communities/${groupId}/join`);
                showToast('¡Bienvenido a la comunidad!', 'success');
            }
            fetchGroupDetails();
        } catch (error) {
            console.error('Error joining/leaving group:', error);
            showToast('Error al procesar la solicitud', 'error');
            setIsMember(previousIsMember);
        }
    };

    const handleInviteMembers = async () => {
        try {
            await Promise.all(selectedMembers.map(userIdToAdd =>
                api.post(`/communities/${groupId}/members/add`, { userIdToAdd })
            ));
            setShowInviteModal(false);
            setSelectedMembers([]);
            fetchGroupDetails();
            showToast('Invitaciones enviadas con éxito', 'success');
        } catch (error) {
            console.error('Error inviting members:', error);
            showToast('Error al enviar las invitaciones', 'error');
        }
    };

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('description', editForm.description);
        formData.append('privacy', editForm.privacy);
        if (editForm.coverImage) {
            formData.append('coverImage', editForm.coverImage);
        }

        try {
            await api.put(`/communities/${groupId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowEditModal(false);
            fetchGroupDetails();
            showToast('Comunidad actualizada correctamente', 'success');
        } catch (error) {
            console.error('Error updating group:', error);
            showToast('No se pudo actualizar la comunidad', 'error');
        }
    };

    const handleDeleteGroup = () => {
        showConfirm(
            'Eliminar Comunidad',
            '¿Estás seguro de que quieres eliminar esta comunidad permanentemente? Esta acción borrará todos los mensajes y archivos compartidos.',
            async () => {
                try {
                    await api.delete(`/communities/${groupId}`);
                    showToast('Comunidad eliminada con éxito', 'success');
                    navigate('/groups');
                } catch (error) {
                    console.error('Error deleting group:', error);
                    showToast('No se pudo eliminar la comunidad', 'error');
                }
            }
        );
    };



    if (loading) return <Layout><div className="flex items-center justify-center min-h-screen">Cargando...</div></Layout>;
    if (!group) return <Layout><div className="flex items-center justify-center min-h-screen">Grupo no encontrado</div></Layout>;



    return (
        <Layout>
            <div className="max-w-5xl mx-auto pb-12 bg-gray-50/30">
                {/* Cover Image & Profile Pic */}
                <div className="relative group/cover">
                    <div className="h-56 sm:h-80 bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 w-full relative overflow-hidden shadow-2xl">
                        {group.coverImage ? (
                            <img
                                src={getFullImageUrl(group.coverImage)}
                                alt={group.name}
                                className="w-full h-full object-cover opacity-85 group-hover/cover:scale-105 transition-transform duration-[2000ms] ease-out"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <FaUsers size={240} className="text-white" />
                            </div>
                        )}
                        {/* Decorative Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    </div>

                    <div className="absolute -bottom-14 left-6 sm:left-12 flex items-end gap-6 z-20">
                        <div className="h-36 w-36 sm:h-48 sm:w-48 bg-white/10 backdrop-blur-xl rounded-[2.5rem] p-0.5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-white/20 relative">
                            <div className="h-full w-full bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] flex items-center justify-center text-white text-6xl sm:text-8xl font-bold uppercase shadow-inner overflow-hidden border-2 border-white">
                                {group.coverImage ? (
                                    <img
                                        src={getFullImageUrl(group.coverImage)}
                                        alt=""
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerText = group.name.charAt(0);
                                        }}
                                    />
                                ) : (
                                    group.name.charAt(0)
                                )}
                            </div>
                            {isMember && (
                                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg transform rotate-12" title="Miembro activo">
                                    <span className="text-white text-xl font-black">✓</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Group Info Section */}
                <div className="pt-20 sm:pt-24 px-6 sm:px-10 pb-10 bg-white shadow-xl border-b border-gray-100 mb-8 rounded-b-[3rem] relative z-0">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                        {/* Title and Stats */}
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-loose uppercase">
                                    {group.name}
                                </h1>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest ${group.privacy === 'public' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {group.privacy === 'public' ? <FaGlobe size={10} /> : <FaLock size={10} />}
                                        {group.privacy === 'public' ? 'Público' : 'Privado'}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest">
                                        <FaUsers size={10} />
                                        {group.members.length} miembros
                                    </div>
                                </div>
                            </div>

                            <div className="max-w-2xl">
                                <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-blue-500 rounded-full"></div>
                                    Acerca de esta comunidad
                                </h2>
                                <p className="text-slate-900 leading-relaxed text-base font-semibold whitespace-pre-line">
                                    {group.description || 'Esta comunidad aún no tiene una descripción. ¡Sé el primero en definirla!'}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 w-full lg:w-72">
                            {/* Primary Actions (Member Only) */}
                            {isMember && (
                                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                                    <SendMessageButton
                                        groupId={groupId}
                                        variant="full"
                                        className="w-full !rounded-[1rem] sm:!rounded-2xl !py-3 sm:!py-3.5 !font-black !shadow-md !shadow-emerald-100 !bg-emerald-600 hover:!bg-emerald-700 !text-white !transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest text-[9px] sm:text-[10px]"
                                    />
                                    <div className={`grid ${group.creator?._id === currentUser?._id ? 'grid-cols-2' : 'grid-cols-1'} gap-2 sm:gap-3`}>
                                        {group.creator?._id === currentUser?._id && (
                                            <button
                                                onClick={() => setShowEditModal(true)}
                                                className="flex items-center justify-center gap-1.5 sm:gap-2 bg-amber-50 text-amber-600 p-3 sm:p-3.5 rounded-[1rem] sm:rounded-2xl font-black hover:bg-amber-100 transition-all border border-amber-100 shadow-sm active:scale-95 text-[9px] sm:text-[10px] uppercase tracking-widest"
                                            >
                                                <FaEdit size={12} /> Editar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowInviteModal(true)}
                                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-50 text-blue-600 p-3 sm:p-3.5 rounded-[1rem] sm:rounded-2xl font-black hover:bg-blue-100 transition-all border border-blue-100 shadow-sm active:scale-95 text-[9px] sm:text-[10px] uppercase tracking-widest"
                                        >
                                            <FaPlus size={12} /> Invitar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Secondary Actions (Public/Admin) */}
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleJoinLeave}
                                    className={`w-full py-3 sm:py-3.5 rounded-[1rem] sm:rounded-2xl font-black transition-all active:scale-95 uppercase tracking-widest text-[9px] sm:text-[10px] shadow-sm ${isMember
                                        ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200 shadow-gray-100'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                                        }`}
                                >
                                    {isMember ? 'Abandonar Comunidad' : 'Unirse a la Comunidad'}
                                </button>

                                {group.creator?._id === currentUser?._id && (
                                    <button
                                        onClick={handleDeleteGroup}
                                        className="w-full py-3 sm:py-3.5 rounded-[1rem] sm:rounded-2xl font-black bg-red-50 text-red-600 hover:bg-red-100 transition-all border border-red-100 shadow-sm shadow-red-50 active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 uppercase tracking-widest text-[9px] sm:text-[10px]"
                                    >
                                        <FaTrash size={12} /> Eliminar Grupo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed & Sidebar Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 sm:px-6">
                    {/* Main Feed (Order 2 on mobile, Order 1 on desktop) */}
                    <div className="lg:col-span-8 order-2 lg:order-1 space-y-6">
                        {/* Create Post */}
                        {isMember ? (
                            <CreatePost
                                groupId={groupId}
                                onPostCreated={() => {
                                    fetchGroupPosts();
                                }}
                            />
                        ) : (
                            <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 text-center">
                                <FaLock className="mx-auto text-blue-300 mb-4" size={32} />
                                <h3 className="text-blue-900 font-bold mb-2">Grupo Cerrado</h3>
                                <p className="text-blue-700/70 font-bold max-w-xs mx-auto">Únete al grupo para poder ver las publicaciones y participar en la comunidad.</p>
                            </div>
                        )}

                        {/* Posts List */}
                        {posts.map(post => (
                            <PostItem
                                key={post._id}
                                post={post}
                                onUpdate={(updatedPost, deletedId) => {
                                    if (deletedId) {
                                        setPosts(prev => prev.filter(p => p._id !== deletedId));
                                    } else if (updatedPost) {
                                        setPosts(prev => prev.map(p => p._id === updatedPost._id ? updatedPost : p));
                                    } else {
                                        fetchGroupPosts();
                                    }
                                }}
                            />
                        ))}

                        {posts.length === 0 && isMember && (
                            <div className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-gray-200 shadow-sm">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FaUsers className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-slate-950 font-bold text-xl mb-2">Silencio total...</h3>
                                <p className="text-slate-400 font-semibold">¡Sé el primero en romper el hielo y publica algo!</p>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar (Order 1 on mobile, Order 2 on desktop) */}
                    <div className="lg:col-span-4 order-1 lg:order-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 sticky top-24 ring-1 ring-black/5 overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 z-0"></div>

                            <h3 className="font-bold text-slate-950 mb-8 flex items-center justify-between text-lg relative z-10">
                                <span className="flex items-center gap-2">
                                    <FaUsers className="text-blue-500" />
                                    Fundadores y Miembros
                                </span>
                                <span className="bg-blue-100 text-blue-600 text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest font-bold ring-1 ring-blue-200">
                                    {group.members.length}
                                </span>
                            </h3>

                            <div className="grid grid-cols-4 gap-4 relative z-10">
                                {group.members.slice(0, 16).map(member => (
                                    <div key={member._id} className="relative group cursor-pointer" title={member.username}>
                                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm ring-2 ring-transparent group-hover:ring-blue-500 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 ease-out">
                                            {member.profilePicture ? (
                                                <img
                                                    src={getFullImageUrl(member.profilePicture)}
                                                    alt={member.username}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = '/default-profile.png'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-400 bg-slate-50 uppercase">
                                                    {member.username?.charAt(0) || '?'}
                                                </div>
                                            )}
                                        </div>
                                        {group.creator?._id === member._id && (
                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-400 border-2 border-white rounded-lg flex items-center justify-center text-[10px] shadow-md animate-pulse" title="Fundador">
                                                ⭐
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {group.members.length > 16 && (
                                <button className="w-full mt-8 py-4 rounded-2xl bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-100 hover:text-blue-600 transition-all border border-gray-100">
                                    Explorar Comunidad
                                </button>
                            )}

                            <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col gap-4">
                                <div className="flex items-center gap-4 group/creator">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-inner group-hover/creator:bg-indigo-500 group-hover/creator:text-white transition-colors duration-500">
                                        <span className="text-lg font-bold">{group.creator?.username?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fundado por</p>
                                        <p className="font-bold text-slate-950 group-hover/creator:text-blue-600 transition-colors">{group.creator?.username}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 w-full max-w-md shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Invitar Amigos</h2>
                                    <p className="text-gray-400 text-sm font-bold mt-1">Haz crecer tu comunidad</p>
                                </div>
                                <button onClick={() => setShowInviteModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">✕</button>
                            </div>

                            <div className="space-y-3 max-h-[45vh] overflow-y-auto mb-8 pr-2 custom-scrollbar">
                                {friends.filter(f => !group.members.some(m => m._id === f._id)).length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 grayscale opacity-50">👥</div>
                                        <p className="text-gray-400 font-bold italic">No hay más amigos para invitar.</p>
                                    </div>
                                ) : (
                                    friends.filter(f => !group.members.some(m => m._id === f._id)).map(friend => (
                                        <div
                                            key={friend._id}
                                            onClick={() => setSelectedMembers(prev => prev.includes(friend._id) ? prev.filter(id => id !== friend._id) : [...prev, friend._id])}
                                            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedMembers.includes(friend._id) ? 'bg-blue-50 border-blue-200 shadow-sm translate-x-1' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 overflow-hidden shadow-sm ring-2 ring-white">
                                                    {friend.profilePicture ? (
                                                        <img src={friend.profilePicture} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-sm font-black text-gray-300">{friend.username.charAt(0)}</div>
                                                    )}
                                                </div>
                                                <span className="font-black text-gray-800">{friend.username}</span>
                                            </div>
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${selectedMembers.includes(friend._id) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-gray-200 bg-white'}`}>
                                                {selectedMembers.includes(friend._id) && <span className="text-sm font-black text-white">✓</span>}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-4 py-4 font-black text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleInviteMembers}
                                    disabled={selectedMembers.length === 0}
                                    className="flex-1 px-4 py-4 font-black text-white bg-blue-600 rounded-2xl hover:bg-blue-700 disabled:opacity-40 shadow-lg shadow-blue-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
                                >
                                    Enviar Invitación
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
                        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Editar Grupo</h2>
                                    <p className="text-gray-400 text-sm font-bold mt-1">Actualiza la información de tu comunidad</p>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">✕</button>
                            </div>

                            <form onSubmit={handleUpdateGroup} className="space-y-6">
                                <div className="flex justify-center mb-6">
                                    <div className="relative group/photo cursor-pointer" onClick={() => document.getElementById('edit-cover').click()}>
                                        <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-amber-50 shadow-lg">
                                            {editPreview ? (
                                                <img src={editPreview} className="w-full h-full object-cover" alt="Preview" />
                                            ) : (
                                                <div className="w-full h-full bg-amber-100 flex items-center justify-center text-amber-500">
                                                    <FaUsers size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                                            <FaCamera className="text-white text-2xl" />
                                        </div>
                                        <input
                                            id="edit-cover"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    setEditForm({ ...editForm, coverImage: file });
                                                    setEditPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Nombre del Grupo</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-gray-800"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Descripción</label>
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-gray-800 min-h-[100px]"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Privacidad</label>
                                    <select
                                        value={editForm.privacy}
                                        onChange={(e) => setEditForm({ ...editForm, privacy: e.target.value })}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl px-5 py-4 outline-none transition-all font-bold text-gray-800 appearance-none cursor-pointer"
                                    >
                                        <option value="public">🌍 Grupo Público</option>
                                        <option value="private">🔒 Grupo Privado</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-4 font-black text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-4 font-black text-white bg-amber-500 rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all active:scale-95 uppercase tracking-widest text-xs"
                                    >
                                        Guardar Cambios
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

export default GroupProfile;
