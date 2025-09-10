import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import api from '../../services/api';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import defaultProfile from '../../assets/default-profile.png';
import MyFriendsList from '../friends/FriendsList';
import MyFollowersList from '../friends/FollowersList';
import MyFollowingList from '../friends/FollowingList';
import { Button, CircularProgress, Typography, Box, Tabs, Tab } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ChatIcon from '@mui/icons-material/Chat';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';

const UserInfo = ({ user }) => {
  const { token, user: currentUser, setUser: setCurrentUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
   // console.log('Depuración - Current User:', currentUser);
   // console.log('Depuración - User prop:', user);
    const fetchUserData = async () => {
      if (!id || !token || !currentUser) {
        setError('ID de usuario, token o usuario actual no disponible');
       // console.log('Depuración - Error en fetchUserData: Falta id, token o currentUser', { id, token, currentUser });
        return;
      }
      setLoading(true);
      try {
        const res = await api.get(`/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userDataFromApi = res.data;
       // console.log('Depuración - Datos del usuario desde API:', userDataFromApi);
        setUserData({
          ...userDataFromApi,
          isFriend: userDataFromApi.isFriend || false,
          isFollowing: userDataFromApi.isFollowing || false,
          isBlocked: userDataFromApi.isBlocked || false,
          friends: userDataFromApi.friends || [],
          followers: userDataFromApi.followers || [],
          following: userDataFromApi.following || [],
        });
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Error al cargar el usuario'
        );
       // console.error('Depuración - Error en fetchUserData:', err);
        setLoading(false);
      }
    };

    if (!user && id) {
      fetchUserData();
    } else if (user) {
      setUserData({
        ...user,
        isFriend: user.isFriend ?? (currentUser?.friends?.some(f => f._id.toString() === user._id.toString()) || false),
        isFollowing: user.isFollowing ?? (currentUser?.following?.some(f => f._id.toString() === user._id.toString()) || false),
        isBlocked: user.isBlocked ?? (currentUser?.blockedUsers?.some(b => b._id.toString() === user._id.toString()) || false),
        friends: user.friends || [],
        followers: user.followers || [],
        following: user.following || [],
      });
     // console.log('Depuración - userData inicializado desde prop user:', user);
    }
  }, [id, token, user, currentUser]);

  useEffect(() => {
    if (!socket || !userData || !currentUser) return;

    socket.on('friendAdded', ({ friendId, friends, isFriend }) => {
     // console.log('Depuración - Evento friendAdded:', { friendId, friends, isFriend });
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
    });

    socket.on('friendRemoved', ({ friendId, friends, isFriend }) => {
     // console.log('Depuración - Evento friendRemoved:', { friendId, friends, isFriend });
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
    });

    socket.on('followed', ({ targetId, following, isFollowing }) => {
     // console.log('Depuración - Evento followed:', { targetId, following, isFollowing });
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
    });

    socket.on('newFollower', ({ followerId, followers }) => {
     // console.log('Depuración - Evento newFollower:', { followerId, followers });
      if (userData._id === currentUser._id) {
        setUserData((prev) => ({ ...prev, followers }));
        setCurrentUser((prev) => ({ ...prev, followers }));
      } else if (userData._id === followerId) {
        setUserData((prev) => ({
          ...prev,
          followers: followers || prev.followers,
        }));
      }
    });

    socket.on('unfollowed', ({ targetId, following, isFollowing }) => {
     // console.log('Depuración - Evento unfollowed:', { targetId, following, isFollowing });
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
    });

    socket.on('followerRemoved', ({ followerId, followers }) => {
     // console.log('Depuración - Evento followerRemoved:', { followerId, followers });
      if (userData._id === currentUser._id) {
        setUserData((prev) => ({ ...prev, followers }));
        setCurrentUser((prev) => ({ ...prev, followers }));
      } else if (userData._id === followerId) {
        setUserData((prev) => ({
          ...prev,
          followers: followers || prev.followers,
        }));
      }
    });

    socket.on('userBlocked', ({ targetId, blockedUsers, friends, following, isBlocked, isFriend, isFollowing }) => {
     // console.log('Depuración - Evento userBlocked:', { targetId, blockedUsers, friends, following, isBlocked, isFriend, isFollowing });
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
    });

    socket.on('blockedByUser', ({ blockerId, friends, followers }) => {
     // console.log('Depuración - Evento blockedByUser:', { blockerId, friends, followers });
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
    });

    socket.on('userUnblocked', ({ targetId, blockedUsers, isBlocked }) => {
     // console.log('Depuración - Evento userUnblocked:', { targetId, blockedUsers, isBlocked });
      if (userData._id === currentUser._id) {
        setUserData((prev) => ({ ...prev, blockedUsers }));
        setCurrentUser((prev) => ({ ...prev, blockedUsers }));
      } else if (userData._id === targetId) {
        setUserData((prev) => ({
          ...prev,
          isBlocked: isBlocked ?? false,
        }));
      }
    });

    socket.on('unblockedByUser', ({ blockerId }) => {
     // console.log('Depuración - Evento unblockedByUser:', { blockerId });
      if (userData._id === currentUser._id) {
        // No se necesita actualizar el estado
      } else if (userData._id === blockerId) {
        setUserData((prev) => ({ ...prev }));
      }
    });

    return () => {
      socket.off('friendAdded');
      socket.off('friendRemoved');
      socket.off('followed');
      socket.off('newFollower');
      socket.off('unfollowed');
      socket.off('followerRemoved');
      socket.off('userBlocked');
      socket.off('blockedByUser');
      socket.off('userUnblocked');
      socket.off('unblockedByUser');
    };
  }, [socket, userData, currentUser, setCurrentUser]);

  const handleStartChat = async (otherUserId) => {
    if (!token) {
      setError('Debes iniciar sesión para enviar mensajes.');
      return;
    }
    if (otherUserId === currentUser?._id) {
      setError('No puedes iniciar un chat contigo mismo.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resConversations = await api.get('/conversation', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const existingConversation = resConversations.data.find((conv) => {
        if (conv.isGroup) return false;
        const participants = conv.participants.map((p) => p._id);
        return (
          participants.includes(currentUser._id) &&
          participants.includes(otherUserId)
        );
      });

      if (existingConversation) {
        navigate(`/chat/${existingConversation._id}`);
        return;
      }

      const payload = {
        participantIds: [currentUser._id, otherUserId].sort(),
        isGroup: false,
      };
      const res = await api.post('/conversation/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const convoId = res.data?._id;
      if (!convoId) {
        throw new Error('No se pudo obtener el ID de la conversación');
      }

      navigate(`/chat/${convoId}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo iniciar la conversación';
      setError(errorMessage);
     // console.error('Error al iniciar chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId) => {
    setLoading(true);
    setError(null);
   // console.log('Depuración - Intentando agregar amigo:', friendId);
    try {
      const res = await api.put(
        `/friend/add/${friendId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
     // console.log('Depuración - Respuesta de /friend/add:', res.data);
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
     // console.error('Depuración - Error en handleAddFriend:', err.response?.data);
      if (err.response?.status === 400 && errorMessage === 'Ya son amigos') {
       // console.log('Depuración - Corrigiendo isFriend a true por error 400');
        setUserData((prev) => ({ ...prev, isFriend: true }));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    setLoading(true);
    setError(null);
   // console.log('Depuración - Intentando eliminar amigo:', friendId);
    try {
      const res = await api.delete(`/friend/remove/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
     // console.log('Depuración - Respuesta de /friend/remove:', res.data);
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
      setError(errorMessage);
     // console.error('Depuración - Error en handleRemoveFriend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId) => {
    setLoading(true);
    setError(null);
   // console.log('Depuración - Intentando seguir usuario:', userId);
    try {
      const res = await api.put(
        `/friend/follow/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
     // console.log('Depuración - Respuesta de /friend/follow:', res.data);
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
     // console.error('Depuración - Error en handleFollow:', err.response?.data);
      if (err.response?.status === 400 && errorMessage === 'Ya sigues a este usuario') {
       // console.log('Depuración - Corrigiendo isFollowing a true por error 400');
        setUserData((prev) => ({ ...prev, isFollowing: true }));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId) => {
    setLoading(true);
    setError(null);
   // console.log('Depuración - Intentando dejar de seguir:', userId);
    try {
      const res = await api.delete(`/friend/unfollow/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
     // console.log('Depuración - Respuesta de /friend/unfollow:', res.data);
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
      setError(errorMessage);
     // console.error('Depuración - Error en handleUnfollow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    setLoading(true);
    setError(null);
   // console.log('Depuración - Intentando bloquear usuario:', userId);
    try {
      const res = await api.put(
        `/friend/block/${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
     // console.log('Depuración - Respuesta de /friend/block:', res.data);
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
      setError(errorMessage);
     // console.error('Depuración - Error en handleBlockUser:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    setLoading(true);
    setError(null);
   // console.log('Depuración - Intentando desbloquear usuario:', userId);
    try {
      const res = await api.delete(`/friend/unblock/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
     // console.log('Depuración - Respuesta de /friend/unblock:', res.data);
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
      setError(errorMessage);
     // console.error('Depuración - Error en handleUnblockUser:', err);
    } finally {
      setLoading(false);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, p: 3, bgcolor: 'white', borderRadius: 2, boxShadow: 1, maxWidth: '1000px', mx: 'auto' }}>
      <img
        src={getFullImageUrl(userData.profilePicture || defaultProfile)}
        alt={`${userData.username || 'Usuario'}'s profile`}
        style={{ width: 128, height: 128, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
        onError={(e) => {
         // console.error('Error loading profile picture:', e.target.src);
          e.target.src = defaultProfile;
        }}
      />
      <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
        {error && (
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          {userData.name || 'Sin nombre'} {userData.lastName || ''}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          @{userData.username || 'Usuario'}
        </Typography>
        <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>
          {userData.bio || <i>Sin biografía disponible</i>}
        </Typography>
        <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Email:</strong> {userData.email || 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Teléfono:</strong> {userData.phone || 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Fecha de nacimiento:</strong>{' '}
            {userData.birthdate ? new Date(userData.birthdate).toLocaleDateString() : 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Miembro desde:</strong>{' '}
            {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Amigos:</strong>{' '}
            {Array.isArray(userData.friends) ? userData.friends.length : 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Seguidores:</strong>{' '}
            {Array.isArray(userData.followers) ? userData.followers.length : 'No disponible'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Siguiendo:</strong>{' '}
            {Array.isArray(userData.following) ? userData.following.length : 'No disponible'}
          </Typography>
        </Box>
        {userData._id !== currentUser._id && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, mt: 2 }}>
            {!userData.isBlocked && (
              <>
                {userData.isFriend ? (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<PersonRemoveIcon />}
                    onClick={() => handleRemoveFriend(userData._id)}
                    disabled={loading}
                    aria-label={`Eliminar amigo ${userData.username || 'Usuario'}`}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Eliminar amigo'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleAddFriend(userData._id)}
                    disabled={loading}
                    aria-label={`Agregar amigo ${userData.username || 'Usuario'}`}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Agregar amigo'}
                  </Button>
                )}
                {userData.isFollowing ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<VisibilityOffIcon />}
                    onClick={() => handleUnfollow(userData._id)}
                    disabled={loading}
                    aria-label={`Dejar de seguir a ${userData.username || 'Usuario'}`}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Dejar de seguir'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<VisibilityIcon />}
                    onClick={() => handleFollow(userData._id)}
                    disabled={loading}
                    aria-label={`Seguir a ${userData.username || 'Usuario'}`}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Seguir'}
                  </Button>
                )}
                <Button
                  variant="contained"
                  color="info"
                  startIcon={<ChatIcon />}
                  onClick={() => handleStartChat(userData._id)}
                  disabled={loading}
                  aria-label={`Enviar mensaje a ${userData.username || 'Usuario'}`}
                >
                  {loading ? <CircularProgress size={24} /> : 'Mensaje'}
                </Button>
              </>
            )}
            <Button
              variant="contained"
              color={userData.isBlocked ? 'secondary' : 'error'}
              startIcon={userData.isBlocked ? <LockOpenIcon /> : <BlockIcon />}
              onClick={() =>
                userData.isBlocked ? handleUnblockUser(userData._id) : handleBlockUser(userData._id)
              }
              disabled={loading}
              aria-label={
                userData.isBlocked
                  ? `Desbloquear a ${userData.username || 'Usuario'}`
                  : `Bloquear a ${userData.username || 'Usuario'}`
              }
            >
              {loading ? <CircularProgress size={24} /> : userData.isBlocked ? 'Desbloquear' : 'Bloquear'}
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label={userData._id === currentUser._id ? 'Mis Amigos' : 'Amigos'}
              value="friends"
            />
            <Tab
              label={userData._id === currentUser._id ? 'Mis Seguidores' : 'Seguidores'}
              value="followers"
            />
            <Tab
              label={userData._id === currentUser._id ? 'Mis Seguidos' : 'Siguiendo'}
              value="following"
            />
          </Tabs>
          <Box sx={{ mt: 2 }}>
            {activeTab === 'friends' && <MyFriendsList users={userData.friends || []} />}
            {activeTab === 'followers' && <MyFollowersList users={userData.followers || []} />}
            {activeTab === 'following' && <MyFollowingList users={userData.following || []} />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserInfo;