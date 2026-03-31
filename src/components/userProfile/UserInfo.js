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
      <div className="h-32 xs:h-40 sm:h-48 md:h-64 w-full relative group overflow-hidden">
        <img
          src={userData.coverPhoto || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"}
          alt="Cover"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
          onClick={() => setSelectedImage(userData.coverPhoto || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80")}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>

        {userData._id === currentUser._id && (
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-0">
            <input
              type="file"
              id="cover-upload"
              accept="image/*"
              className="hidden"
              onChange={handleCoverPhotoChange}
            />
            <label
              htmlFor="cover-upload"
              className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/40 hover:bg-black/60 text-white rounded-lg sm:rounded-xl backdrop-blur-md border border-white/20 transition-all font-bold text-[8px] sm:text-[10px] uppercase tracking-widest"
            >
              <span className="text-[10px] sm:text-xs">📷</span>
              <span>Cambiar Portada</span>
            </label>
          </div>
        )}
      </div>

      {/* Profile Info Area */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 relative">
        <div className="flex flex-col md:flex-row items-center md:items-end -mt-10 sm:-mt-12 md:-mt-16 mb-4 sm:mb-6 gap-3 sm:gap-6 text-center md:text-left">

          {/* Profile Picture */}
          <div className="relative group shrink-0">
            <div className={`w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-2xl md:rounded-3xl p-1 transition-all duration-500 hover:rotate-2 shadow-xl ${userData?.hasStories
              ? userData.allStoriesViewed
                ? 'bg-gray-300 shadow-gray-200/20 p-[2px]'
                : 'bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/20 p-1.5'
              : 'bg-white shadow-black/10 p-1.5'
              }`}>
              <div
                className="w-full h-full rounded-[0.9rem] md:rounded-2xl overflow-hidden relative block group cursor-pointer"
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

                <div className="absolute bottom-1 right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 border-2 border-white rounded-full shadow-md"></div>

                {userData?.hasStories && !userData.allStoriesViewed && (
                  <div className="absolute top-1 right-1 bg-yellow-500 text-[6px] md:text-[8px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-md animate-pulse">
                    Historia
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="flex-1 md:pb-2 flex flex-col items-center md:items-start w-full">
            <div className="flex flex-col md:flex-row items-center gap-1 sm:gap-2 mb-2 w-full justify-center md:justify-start">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 tracking-tight flex items-center justify-center md:justify-start gap-2 max-w-full">
                <span className="bg-yellow-400/20 px-3 py-0.5 rounded-xl md:rounded-2xl backdrop-blur-sm border border-yellow-400/10 truncate">
                  {userData.name} {userData.lastName}
                </span>

                {userData._id !== currentUser?._id && !userData.isBlocked && (
                  <div className="flex gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => callUser(userData._id, `${userData.name} ${userData.lastName}`, getFullImageUrl(userData.profilePicture), "video")}
                      className="p-1.5 sm:p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md transition-all hover:scale-110 active:scale-95 group relative"
                      title="Llamada de Video"
                    >
                      <VideoIcon size={14} className="sm:w-5 sm:h-5" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
                    </button>
                    <button
                      onClick={() => callUser(userData._id, `${userData.name} ${userData.lastName}`, getFullImageUrl(userData.profilePicture), "audio")}
                      className="p-1.5 sm:p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-md transition-all hover:scale-110 active:scale-95"
                      title="Llamada de Voz"
                    >
                      <Phone size={14} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                )}
              </h1>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-2 mb-2 sm:mb-3">
               <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-primary-50 text-primary-600 rounded-full text-[8.5px] sm:text-[9.5px] md:text-[10px] font-black uppercase tracking-widest text-center">
                 @{userData.username}
               </span>
            </div>

            <div className="flex justify-center md:justify-start items-center gap-3 sm:gap-5 md:gap-6 w-full">
              <Link to={`/user/${userData._id}/friends`} className="flex flex-col items-center group decoration-none">
                <span className="font-black text-gray-900 text-xs sm:text-sm md:text-base tabular-nums transition-colors group-hover:text-primary-600">{userData.friends?.length || 0}</span>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[7px] sm:text-[8px] md:text-[9px]">Compas</span>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <Link to={`/user/${userData._id}/followers`} className="flex flex-col items-center group decoration-none">
                <span className="font-black text-gray-900 text-xs sm:text-sm md:text-base tabular-nums transition-colors group-hover:text-primary-600">{userData.followers?.length || 0}</span>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[7px] sm:text-[8px] md:text-[9px]">Seguidores</span>
              </Link>
              <div className="w-px h-6 bg-gray-200" />
              <Link to={`/user/${userData._id}/following`} className="flex flex-col items-center group decoration-none">
                <span className="font-black text-gray-900 text-xs sm:text-sm md:text-base tabular-nums transition-colors group-hover:text-primary-600">{userData.following?.length || 0}</span>
                <span className="font-bold text-gray-400 uppercase tracking-widest text-[7px] sm:text-[8px] md:text-[9px]">Siguiendo</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full md:w-auto mt-3 md:mt-0 justify-center md:justify-end md:pb-2">
            {userData._id !== currentUser._id && (
              <>
                {!userData.isBlocked && (
                  <>
                    {userData.isFriend ? (
                      <button
                        onClick={() => handleRemoveFriend(userData._id)}
                        disabled={loading}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all group"
                      >
                        <PersonRemoveIcon className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" /> Eliminar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddFriend(userData._id)}
                        disabled={loading}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all shadow-md group"
                      >
                        <PersonAddIcon className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:scale-125" /> Añadir
                      </button>
                    )}

                    <button
                      onClick={() => userData.isFollowing ? handleUnfollow(userData._id) : handleFollow(userData._id)}
                      disabled={loading}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all ${userData.isFollowing
                        ? 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                        }`}
                    >
                      {userData.isFollowing ? <VisibilityOffIcon className="w-3 h-3 sm:w-4 sm:h-4" /> : <VisibilityIcon className="w-3 h-3 sm:w-4 sm:h-4" />}
                      {userData.isFollowing ? 'Dejar' : 'Seguir'}
                    </button>

                    <div className="scale-75 sm:scale-90 md:scale-100 origin-center transition-all">
                       <SendMessageButton recipientId={userData._id} variant="pill" />
                    </div>
                  </>
                )}

                <button
                  onClick={() => userData.isBlocked ? handleUnblockUser(userData._id) : handleBlockUser(userData._id)}
                  disabled={loading}
                  className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all ${userData.isBlocked ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  title={userData.isBlocked ? "Desbloquear" : "Bloquear"}
                >
                  {userData.isBlocked ? <LockOpenIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <BlockIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </>
            )}

            {userData._id === currentUser?._id && (
              <div className="flex flex-wrap gap-2 md:gap-3 w-full justify-center md:justify-end">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md group"
                >
                  <span className="text-xs sm:text-sm">✏️</span> Editar Mi Perfil
                </button>

                {currentUser?.sosSettings?.isEnabled && (
                  <button
                    onClick={() => setIsSosModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md animate-pulse"
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