import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import { CircularProgress, Typography, Box } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import SendMessageButton from '../../buttons/SendMessageButton';
import { CallContext } from '../../context/CallContext';
import { Phone, Video as VideoIcon } from 'lucide-react';
import SosModal from '../UI/SosModal';
import StoryViewer from '../stories/StoryViewer';

const UserInfo = ({ user }) => {
  const { token, user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { callUser } = useContext(CallContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || !token || !currentUser) {
        console.error('ID de usuario, token o usuario actual no disponible');
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userDataFromApi = res.data;
        setUserData({
          ...userDataFromApi,
          isFriend: userDataFromApi.isFriend || false,
          isFollowing: userDataFromApi.isFollowing || false,
          isBlocked: userDataFromApi.isBlocked || false,
          friends: userDataFromApi.friends || [],
          followers: userDataFromApi.followers || [],
          following: userDataFromApi.following || [],
          profilePicture: userDataFromApi.profilePicture || null,
        });
        setLoading(false);
      } catch (err) {
        console.error(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al cargar el usuario'
        );
        setLoading(false);
      }
    };

    if (!user && id) {
      fetchUserData();
    } else if (user) {
      setUserData({
        ...user,
        isFriend: user.isFriend ?? (currentUser?.friends?.some(f => f._id?.toString() === user._id?.toString()) || false),
        isFollowing: user.isFollowing ?? (currentUser?.following?.some(f => f._id?.toString() === user._id?.toString()) || false),
        isBlocked: user.isBlocked ?? (currentUser?.blockedUsers?.some(b => b._id?.toString() === user._id?.toString()) || false),
        friends: user.friends || [],
        followers: user.followers || [],
        following: user.following || [],
        profilePicture: user.profilePicture || null,
      });
    }
  }, [id, token, user, currentUser]);

  useEffect(() => {
    if (!socket || !userData || !currentUser) return;

    const handlers = {
      friendAdded: ({ friendId, friends, isFriend }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, friends }));
          setCurrentUser((prev) => ({ ...prev, friends }));
        } else if (userData._id === friendId) {
          setUserData((prev) => ({
            ...prev,
            friends: friends || prev.friends,
            isFriend: isFriend ?? true,
          }));
        }
      },
      friendRemoved: ({ friendId, friends, isFriend }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, friends }));
          setCurrentUser((prev) => ({ ...prev, friends }));
        } else if (userData._id === friendId) {
          setUserData((prev) => ({
            ...prev,
            friends: friends || prev.friends,
            isFriend: isFriend ?? false,
          }));
        }
      },
      followed: ({ targetId, following, isFollowing }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, following }));
          setCurrentUser((prev) => ({ ...prev, following }));
        } else if (userData._id === targetId) {
          setUserData((prev) => ({
            ...prev,
            followers: prev.followers ? [...prev.followers, currentUser] : [currentUser],
            isFollowing: isFollowing ?? true,
          }));
        }
      },
      newFollower: ({ followerId, followers }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, followers }));
          setCurrentUser((prev) => ({ ...prev, followers }));
        } else if (userData._id === followerId) {
          setUserData((prev) => ({
            ...prev,
            followers: followers || prev.friends,
          }));
        }
      },
      unfollowed: ({ targetId, following, isFollowing }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, following }));
          setCurrentUser((prev) => ({ ...prev, following }));
        } else if (userData._id === targetId) {
          setUserData((prev) => ({
            ...prev,
            followers: prev.followers ? prev.followers.filter(f => f._id.toString() !== currentUser._id.toString()) : [],
            isFollowing: isFollowing ?? false,
          }));
        }
      },
      followerRemoved: ({ followerId, followers }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, followers }));
          setCurrentUser((prev) => ({ ...prev, followers }));
        } else if (userData._id === followerId) {
          setUserData((prev) => ({
            ...prev,
            followers: followers || prev.followers,
          }));
        }
      },
      userBlocked: ({ targetId, blockedUsers, friends, following, isBlocked, isFriend, isFollowing }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, blockedUsers, friends, following }));
          setCurrentUser((prev) => ({ ...prev, blockedUsers, friends, following }));
        } else if (userData._id === targetId) {
          setUserData((prev) => ({
            ...prev,
            isBlocked: isBlocked ?? true,
            isFriend: isFriend ?? false,
            isFollowing: isFollowing ?? false,
          }));
        }
      },
      blockedByUser: ({ blockerId, friends, followers }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, friends, followers }));
          setCurrentUser((prev) => ({ ...prev, friends, followers }));
        } else if (userData._id === blockerId) {
          setUserData((prev) => ({
            ...prev,
            friends: friends || prev.friends,
            followers: followers || prev.followers,
            isFriend: false,
            isFollowing: false,
          }));
        }
      },
      userUnblocked: ({ targetId, blockedUsers, isBlocked }) => {
        if (userData._id === currentUser._id) {
          setUserData((prev) => ({ ...prev, blockedUsers }));
          setCurrentUser((prev) => ({ ...prev, blockedUsers }));
        } else if (userData._id === targetId) {
          setUserData((prev) => ({
            ...prev,
            isBlocked: isBlocked ?? false,
          }));
        }
      },
      unblockedByUser: ({ blockerId }) => {
        if (userData._id === blockerId) {
          setUserData((prev) => ({ ...prev }));
        }
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event));
    };
  }, [socket, userData, currentUser, setCurrentUser]);


  const handleAddFriend = async (friendId) => {
    const previousUserData = { ...userData };
    const previousCurrentUser = { ...currentUser };

    setUserData(prev => ({ ...prev, isFriend: true }));
    setCurrentUser(prev => ({
      ...prev,
      friends: [...(prev.friends || []), { _id: friendId }]
    }));

    try {
      const res = await api.put(
        `/friend/add/${friendId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData((prev) => ({
        ...prev,
        friends: res.data.user?.friends || prev.friends,
        isFriend: res.data.user?.isFriend ?? true,
      }));
      setCurrentUser((prev) => ({
        ...prev,
        friends: res.data.user?.friends || prev.friends,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo agregar amigo';

      if (err.response?.status === 400 && errorMessage === 'Ya son amigos') {
        setUserData((prev) => ({ ...prev, isFriend: true }));
      } else {
        console.error(errorMessage);
        setUserData(previousUserData);
        setCurrentUser(previousCurrentUser);
      }
    }
  };

  const handleRemoveFriend = async (friendId) => {
    const previousUserData = { ...userData };
    const previousCurrentUser = { ...currentUser };

    setUserData(prev => ({ ...prev, isFriend: false }));
    setCurrentUser(prev => ({
      ...prev,
      friends: (prev.friends || []).filter(f => (f._id || f) !== friendId)
    }));

    try {
      const res = await api.delete(`/friend/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData((prev) => ({
        ...prev,
        friends: res.data.user?.friends || prev.friends,
        isFriend: res.data.user?.isFriend ?? false,
      }));
      setCurrentUser((prev) => ({
        ...prev,
        friends: res.data.user?.friends || prev.friends,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo eliminar amigo';
      console.error(errorMessage);
      setUserData(previousUserData);
      setCurrentUser(previousCurrentUser);
    }
  };

  const handleFollow = async (userId) => {
    const previousUserData = { ...userData };
    const previousCurrentUser = { ...currentUser };

    setUserData(prev => ({ ...prev, isFollowing: true }));
    setCurrentUser(prev => ({
      ...prev,
      following: [...(prev.following || []), { _id: userId }]
    }));

    try {
      const res = await api.put(
        `/friend/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData((prev) => ({
        ...prev,
        followers: res.data.targetUser?.followers || prev.followers,
        isFollowing: res.data.user?.isFollowing ?? true,
      }));
      setCurrentUser((prev) => ({
        ...prev,
        following: res.data.user?.following || prev.following,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo seguir al usuario';

      if (err.response?.status === 400 && errorMessage === 'Ya sigues a este usuario') {
        setUserData((prev) => ({ ...prev, isFollowing: true }));
      } else {
        console.error(errorMessage);
        setUserData(previousUserData);
        setCurrentUser(previousCurrentUser);
      }
    }
  };

  const handleUnfollow = async (userId) => {
    const previousUserData = { ...userData };
    const previousCurrentUser = { ...currentUser };

    setUserData(prev => ({ ...prev, isFollowing: false }));
    setCurrentUser(prev => ({
      ...prev,
      following: (prev.following || []).filter(f => (f._id || f) !== userId)
    }));

    try {
      const res = await api.delete(`/friend/unfollow/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData((prev) => ({
        ...prev,
        followers: res.data.targetUser?.followers || prev.followers,
        isFollowing: res.data.user?.isFollowing ?? false,
      }));
      setCurrentUser((prev) => ({
        ...prev,
        following: res.data.user?.following || prev.following,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo dejar de seguir al usuario';
      console.error(errorMessage);
      setUserData(previousUserData);
      setCurrentUser(previousCurrentUser);
    }
  };

  const handleBlockUser = async (userId) => {
    const previousUserData = { ...userData };
    const previousCurrentUser = { ...currentUser };

    setUserData(prev => ({
      ...prev,
      isBlocked: true,
      isFriend: false,
      isFollowing: false
    }));
    setCurrentUser(prev => ({
      ...prev,
      blockedUsers: [...(prev.blockedUsers || []), { _id: userId }]
    }));

    try {
      const res = await api.put(
        `/friend/block/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData((prev) => ({
        ...prev,
        blockedUsers: res.data.user?.blockedUsers || prev.blockedUsers,
        friends: res.data.user?.friends || prev.friends,
        following: res.data.user?.following || prev.following,
        isBlocked: res.data.user?.isBlocked ?? true,
        isFriend: res.data.user?.isFriend ?? false,
        isFollowing: res.data.user?.isFollowing ?? false,
      }));
      setCurrentUser((prev) => ({
        ...prev,
        blockedUsers: res.data.user?.blockedUsers || prev.blockedUsers,
        friends: res.data.user?.friends || prev.friends,
        following: res.data.user?.following || prev.following,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo bloquear al usuario';
      console.error(errorMessage);
      setUserData(previousUserData);
      setCurrentUser(previousCurrentUser);
    }
  };

  const handleUnblockUser = async (userId) => {
    const previousUserData = { ...userData };
    const previousCurrentUser = { ...currentUser };

    setUserData(prev => ({ ...prev, isBlocked: false }));
    setCurrentUser(prev => ({
      ...prev,
      blockedUsers: (prev.blockedUsers || []).filter(b => (b._id || b) !== userId)
    }));

    try {
      const res = await api.delete(`/friend/unblock/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData((prev) => ({
        ...prev,
        blockedUsers: res.data.user?.blockedUsers || prev.blockedUsers,
        isBlocked: res.data.user?.isBlocked ?? false,
      }));
      setCurrentUser((prev) => ({
        ...prev,
        blockedUsers: res.data.user?.blockedUsers || prev.blockedUsers,
      }));
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo desbloquear al usuario';
      console.error(errorMessage);
      setUserData(previousUserData);
      setCurrentUser(previousCurrentUser);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
        <Typography variant="body1" ml={2}>Cargando usuario...</Typography>
      </Box>
    );
  }

  if (!userData || !currentUser) {
    return (
      <Typography variant="body1" color="error" textAlign="center">
        Usuario no encontrado.
      </Typography>
    );
  }

  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      const res = await api.put("/user/cover-picture", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUserData((prev) => ({
        ...prev,
        coverPhoto: res.data.user.coverPhoto,
      }));

      if (currentUser._id === userData._id) {
        setCurrentUser(prev => ({ ...prev, coverPhoto: res.data.user.coverPhoto }));
      }

    } catch (err) {
      console.error("Error upgrading cover photo:", err);
      // Removed setError, just logging
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="h-64 md:h-80 w-full relative group overflow-hidden">
        <img
          src={userData.coverPhoto || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt="Cover"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
          onClick={() => setSelectedImage(userData.coverPhoto || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

        {userData._id === currentUser._id && (
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoChange}
            />
            <label
              htmlFor="cover-upload"
              className="cursor-pointer flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md border border-white/30 transition-all font-bold text-xs uppercase tracking-widest"
            >
              <span>📷</span>
              <span>Cambiar Portada</span>
            </label>
          </div>
        )}
      </div>

      {/* Profile Info Area */}
      <div className="px-8 pb-8 relative">
        <div className="flex flex-col md:flex-row-reverse items-center md:items-end -mt-20 md:-mt-24 mb-6 gap-8 text-center md:text-left">

          {/* Profile Picture */}
          <div className="relative group">
            <div className={`w-40 h-40 md:w-48 md:h-48 rounded-3xl p-1.5 transition-all duration-500 hover:rotate-2 shadow-2xl ${userData?.hasStories
              ? userData.allStoriesViewed
                ? 'bg-gray-300 shadow-gray-200/20 p-[3px]'
                : 'bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/20 p-2'
              : 'bg-white shadow-black/10 p-2'
              }`}>
              <div
                className="w-full h-full rounded-2xl overflow-hidden relative block group cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  if (userData?.hasStories) {
                    setShowStoryViewer(true);
                  } else {
                    setSelectedImage(getFullImageUrl(userData.profilePicture));
                  }
                }}
              >
                <img
                  src={getFullImageUrl(userData.profilePicture)}
                  alt={userData.username}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => e.target.src = defaultProfile}
                />

                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-lg"></div>

                {userData?.hasStories && !userData.allStoriesViewed && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                    Historia
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="flex-1 md:pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                <span className="bg-yellow-400/20 px-4 py-1 rounded-2xl backdrop-blur-sm border border-yellow-400/10 inline-block">
                  {userData.name} {userData.lastName}
                </span>

                {userData._id !== currentUser?._id && !userData.isBlocked && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => callUser(userData._id, `${userData.name} ${userData.lastName}`, getFullImageUrl(userData.profilePicture), "video")}
                      className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:scale-110 active:scale-95 group relative"
                      title="Llamada de Video"
                    >
                      <VideoIcon size={20} />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                    <button
                      onClick={() => callUser(userData._id, `${userData.name} ${userData.lastName}`, getFullImageUrl(userData.profilePicture), "audio")}
                      className="p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-110 active:scale-95"
                      title="Llamada de Voz"
                    >
                      <Phone size={20} />
                    </button>
                  </div>
                )}
              </h1>
              <span className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-xs font-black uppercase tracking-widest self-center md:self-auto">
                @{userData.username}
              </span>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-sm">
              <Link to={`/user/${userData._id}/friends`} className="flex items-center gap-2 group decoration-none">
                <span className="font-black text-gray-900 text-lg tabular-nums transition-colors group-hover:text-primary-600">{userData.friends?.length || 0}</span>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Compas</span>
              </Link>
              <Link to={`/user/${userData._id}/followers`} className="flex items-center gap-2 group decoration-none">
                <span className="font-black text-gray-900 text-lg tabular-nums transition-colors group-hover:text-primary-600">{userData.followers?.length || 0}</span>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Seguidores</span>
              </Link>
              <Link to={`/user/${userData._id}/following`} className="flex items-center gap-2 group decoration-none">
                <span className="font-black text-gray-900 text-lg tabular-nums transition-colors group-hover:text-primary-600">{userData.following?.length || 0}</span>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Siguiendo</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center md:justify-start md:pb-6">
            {userData._id !== currentUser._id && (
              <>
                {!userData.isBlocked && (
                  <>
                    {userData.isFriend ? (
                      <button
                        onClick={() => handleRemoveFriend(userData._id)}
                        disabled={loading}
                        className="px-6 py-3 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all group"
                      >
                        <PersonRemoveIcon className="w-4 h-4 transition-transform group-hover:scale-110" /> Eliminar Compa
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(userData._id)}
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-primary-500/30 group"
                      >
                        <PersonAddIcon className="w-4 h-4 transition-transform group-hover:scale-125" /> Añadir Compa
                      </button>
                    )}

                    <button
                      onClick={() => userData.isFollowing ? handleUnfollow(userData._id) : handleFollow(userData._id)}
                      disabled={loading}
                      className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all ${userData.isFollowing
                        ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`}
                    >
                      {userData.isFollowing ? <VisibilityOffIcon className="w-4 h-4" /> : <VisibilityIcon className="w-4 h-4" />}
                      {userData.isFollowing ? 'Dejar de seguir' : 'Seguir'}
                    </button>

                    <SendMessageButton recipientId={userData._id} variant="pill" />
                  </>
                )}

                <button
                  onClick={() => userData.isBlocked ? handleUnblockUser(userData._id) : handleBlockUser(userData._id)}
                  disabled={loading}
                  className={`p-3 rounded-2xl transition-all ${userData.isBlocked ? 'bg-red-600 text-white shadow-lg shadow-red-500/30' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  title={userData.isBlocked ? "Desbloquear" : "Bloquear"}
                >
                  {userData.isBlocked ? <LockOpenIcon className="w-5 h-5" /> : <BlockIcon className="w-5 h-5" />}
                </button>
              </>
            )}

            {userData._id === currentUser?._id && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/settings')}
                  className="px-8 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-black/10"
                >
                  ✏️ Editar Mi Perfil
                </button>

                {currentUser?.sosSettings?.isEnabled && (
                  <button
                    onClick={() => setIsSosModalOpen(true)}
                    className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-red-500/40 animate-pulse"
                  >
                    🆘 SOS
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all z-[110]"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <SosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
        onConfirm={() => {/* Actual API call for SOS */ }}
        contacts={currentUser?.sosSettings?.emergencyContacts}
        message={currentUser?.sosSettings?.message}
      />

      {showStoryViewer && userData?.stories && (
        <StoryViewer
          storyGroups={[{
            user: {
              _id: userData._id,
              username: userData.username,
              profilePicture: userData.profilePicture
            },
            stories: userData.stories
          }]}
          initialGroupIndex={0}
          onClose={() => setShowStoryViewer(false)}
          currentUserId={currentUser?._id}
        />
      )}
    </div>
  );
};

export default UserInfo;