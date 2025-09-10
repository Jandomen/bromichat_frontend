import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import { AuthContext } from '../../context/AuthContext';
import GroupChat from './GroupChat';
import api from '../../services/api';
import Header from '../Header';
import Footer from '../Footer';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user, token } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let isMounted = true; 

    const fetchGroupDetails = async () => {
      try {
        const res = await api.get(`/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;

        const uniqueMembers = Array.from(
          new Map(res.data.group.members.map((m) => [m._id, m])).values()
        );

        setGroup({ ...res.data.group, members: uniqueMembers });
      } catch (err) {
       // console.error('Error fetching group details:', err);

        if (!isMounted) return;

        if (err.response?.status === 404) {
          setNotification({ type: 'error', message: 'Grupo no encontrado' });
          setTimeout(() => navigate('/groups'), 2000);
        } else if (err.response?.status === 403) {
          setNotification({ type: 'error', message: 'No eres miembro del grupo' });
          setTimeout(() => navigate('/groups'), 2000);
        } else {
          setNotification({ type: 'error', message: 'Error al cargar detalles del grupo' });
        }
      }
    };

    fetchGroupDetails();

    if (socket) {
      socket.emit('join_group', { groupId });

      const handleMemberLeft = ({ groupId: leftGroupId, userId, message }) => {
        if (leftGroupId === groupId) {
          setNotification({ type: 'info', message });
          setGroup((prev) => ({
            ...prev,
            members: prev.members.filter((m) => m._id !== userId),
          }));
        }
      };

      const handleGroupUpdated = (updatedGroup) => {
        if (updatedGroup._id === groupId) {
          const uniqueMembers = Array.from(
            new Map(updatedGroup.members.map((m) => [m._id, m])).values()
          );
          setGroup({ ...updatedGroup, members: uniqueMembers });
        }
      };

      socket.on('groupMemberLeft', handleMemberLeft);
      socket.on('groupUpdated', handleGroupUpdated);

      return () => {
        isMounted = false;
        socket.off('groupMemberLeft', handleMemberLeft);
        socket.off('groupUpdated', handleGroupUpdated);
        socket.emit('leave_group', { groupId });
      };
    }

    return () => {
      isMounted = false;
    };
  }, [groupId, socket, navigate, token]);

  if (!group) {
    return <div>Cargando...</div>;
  }

  const backendURL = process.env.REACT_APP_API_BACKEND;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 pt-16 pb-8">
        <div className="p-6 max-w-4xl mx-auto">
          {notification && (
            <div
              className={`p-2 mb-4 rounded ${
                notification.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : notification.type === 'error'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {notification.message}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-4">{group.name}</h1>
          <p className="text-sm text-gray-600">
            Creado el{' '}
            {new Date(group.createdAt).toLocaleDateString()}
          </p>

          <p className="text-sm font-medium mt-2">Miembros:</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {group.members.map((member) => (
              <div key={member._id} className="flex items-center space-x-2">
                <img
                  src={
                    member.profilePicture
                      ? `${backendURL}${member.profilePicture}`
                      : '/default-profile.png'
                  }
                  alt={member.username}
                  className="w-8 h-8 rounded-full"
                />
                <span>{member.username}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {group.createdBy?._id === user._id && (
              <button
                onClick={() => navigate(`/groups/${groupId}/edit`)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
              >
                Editar miembros
              </button>
            )}
            {group.createdBy?._id !== user._id && (
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/group/group/${groupId}/leave`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setNotification({ type: 'success', message: 'Has salido del grupo' });
                    setTimeout(() => navigate('/groups'), 2000);
                  } catch (err) {
                   // console.error('Error leaving group:', err);
                    setNotification({ type: 'error', message: 'Error al salir del grupo' });
                  }
                }}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Salir del grupo
              </button>
            )}
          </div>

          <div className="mt-6">
            <GroupChat groupId={groupId} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GroupDetails;
