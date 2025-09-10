import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import useAuthAxios from '../../hooks/useAuthAxios';
const GroupManager = () => {
  const { user } = useContext(AuthContext);
  const authAxios = useAuthAxios();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editedMembers, setEditedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const fetchGroups = async () => {
    try {
      const { data } = await authAxios.get('/group/groups');
      setGroups(data.groups || []);
    } catch (err) {
      //console.error(err);
      setNotification({ type: 'error', message: 'Error al obtener grupos' });
    }
  };
  const fetchFriends = async () => {
    try {
      const { data } = await authAxios.get(`/friend/friends/${user._id}`);
      setFriends(data.friends || []);
    } catch (err) {
     // console.error(err);
      setNotification({ type: 'error', message: 'Error al obtener amigos' });
    }
  };
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || selectedFriends.length === 0) {
      setNotification({ type: 'error', message: 'Nombre del grupo y amigos requeridos' });
      return;
    }
    setLoading(true);
    try {
      await authAxios.post('/group/create', {
        name: groupName,
        friendIds: selectedFriends,
      });
      setGroupName('');
      setSelectedFriends([]);
      fetchGroups();
      setNotification({ type: 'success', message: 'Grupo creado con éxito' });
    } catch (err) {
     // console.error(err);
      setNotification({ type: 'error', message: 'Error al crear grupo' });
    } finally {
      setLoading(false);
    }
  };
  const handleLeaveGroup = async (groupId) => {
    try {
      await authAxios.delete(`/group/group/${groupId}/leave`);
      fetchGroups();
      setNotification({ type: 'success', message: 'Has salido del grupo' });
    } catch (err) {
     // console.error(err);
      setNotification({ type: 'error', message: 'Error al salir del grupo' });
    }
  };
  const handleSaveMembers = async (groupId) => {
    try {
      await authAxios.put(`/group/group/${groupId}/participants`, {
        participantIds: editedMembers,
      });
      setEditingGroupId(null);
      fetchGroups();
      setNotification({ type: 'success', message: 'Miembros actualizados' });
    } catch (err) {
     // console.error(err);
      setNotification({ type: 'error', message: 'Error al actualizar miembros' });
    }
  };
  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow p-6 max-w-4xl mx-auto">
        {notification && (
          <div
            className={`p-2 mb-4 rounded ${
              notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {notification.message}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-4">Mis Grupos</h1>
        <div className="mb-8">
          {groups.length === 0 ? (
            <p>No estás en ningún grupo.</p>
          ) : (
            <ul className="space-y-4">
              {groups.map((group) => (
                <li
                  key={group._id}
                  className="border p-3 rounded shadow cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">{group.name}</h2>
                    {group.createdBy._id === user._id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroupId(group._id);
                          setEditedMembers(group.members.map((m) => m._id));
                        }}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Editar miembros
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(group._id);
                        }}
                        className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                      >
                        Salir
                      </button>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <strong>Miembros:</strong>{' '}
                    {group.members.map((m) => m.username).join(', ')}
                  </div>
                  {editingGroupId === group._id && (
                    <div className="mt-4 border-t pt-2">
                      <p className="mb-2 font-medium">Selecciona miembros:</p>
                      {friends.map((friend) => (
                        <label key={friend._id} className="flex items-center space-x-2 mb-1">
                          <input
                            type="checkbox"
                            checked={editedMembers.includes(friend._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditedMembers((prev) => [...prev, friend._id]);
                              } else {
                                setEditedMembers((prev) => prev.filter((id) => id !== friend._id));
                              }
                            }}
                          />
                          <span>{friend.username}</span>
                        </label>
                      ))}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleSaveMembers(group._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingGroupId(null)}
                          className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <form onSubmit={handleCreateGroup} className="border p-4 rounded space-y-4 shadow">
          <h2 className="text-xl font-semibold">Crear nuevo grupo</h2>
          <input
            type="text"
            placeholder="Nombre del grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <div>
            <p className="font-medium mb-2">Selecciona amigos:</p>
            {friends.length === 0 ? (
              <p>No tienes amigos para añadir.</p>
            ) : (
              <div className="space-y-1">
                {friends.map((friend) => (
                  <label key={friend._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFriends((prev) => [...prev, friend._id]);
                        } else {
                          setSelectedFriends((prev) => prev.filter((id) => id !== friend._id));
                        }
                      }}
                    />
                    <span>{friend.username}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {loading ? 'Creando...' : 'Crear grupo'}
          </button>
        </form>
      </main>
    </div>
  );
};
export default GroupManager;