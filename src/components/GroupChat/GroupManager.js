import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import useAuthAxios from "../../hooks/useAuthAxios";
import { SocketContext } from "../../context/SocketContext";

const GroupManager = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const authAxios = useAuthAxios();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editedMembers, setEditedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [groupImage, setGroupImage] = useState(null);

  // 🔹 Fetch groups and ensure participants is always an array
  const fetchGroups = async () => {
    try {
      const { data } = await authAxios.get("/group/groups");
      const safeGroups = (data.groups || []).map((g) => ({
        ...g,
        participants: g.participants || [],
      }));
      setGroups(safeGroups);
    } catch (err) {
      setNotification({ type: "error", message: "Error al obtener grupos" });
    }
  };

  // 🔹 Fetch friends
  const fetchFriends = async () => {
    try {
      const { data } = await authAxios.get(`/friend/friends/${user._id}`);
      setFriends(Array.isArray(data.friends) ? data.friends : []);
    } catch (err) {
      setNotification({ type: "error", message: "Error al obtener amigos" });
    }
  };

  // 🔹 Handle create group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName || selectedFriends.length === 0) {
      setNotification({
        type: "error",
        message: "Debes ingresar un nombre y seleccionar al menos un amigo",
      });
      return;
    }

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("friendIds", JSON.stringify(selectedFriends));
    if (groupImage) formData.append("groupImage", groupImage);

    setLoading(true);
    try {
      await authAxios.post("/group/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGroupName("");
      setSelectedFriends([]);
      setGroupImage(null);
      await fetchGroups();
      setNotification({ type: "success", message: "Grupo creado con éxito 🎉" });
    } catch (err) {
      setNotification({ type: "error", message: "Error al crear el grupo" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle leave group
  const handleLeaveGroup = async (groupId) => {
    setLoading(true);
    try {
      await authAxios.delete(`/group/group/${groupId}/leave`);
      await fetchGroups();
      setNotification({ type: "success", message: "Has salido del grupo" });
    } catch (err) {
      setNotification({ type: "error", message: "Error al salir del grupo" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle save members
  const handleSaveMembers = async (groupId) => {
    if (!Array.isArray(editedMembers)) return;
    setLoading(true);
    try {
      await authAxios.put(`/group/group/${groupId}/participants`, {
        participantIds: editedMembers,
      });
      setEditingGroupId(null);
      setEditedMembers([]);
      await fetchGroups();
      setNotification({ type: "success", message: "Miembros actualizados" });
    } catch (err) {
      setNotification({
        type: "error",
        message: "Error al actualizar miembros del grupo",
      });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Socket listener
  useEffect(() => {
    if (!socket) return;

    const handleGroupUpdated = (updatedGroup) => {
      if (!updatedGroup) return;
      setGroups((prev) =>
        (prev || []).map((g) =>
          g._id === updatedGroup._id
            ? { ...updatedGroup, participants: updatedGroup.participants || [] }
            : g
        )
      );
    };

    socket.on("groupUpdated", handleGroupUpdated);

    return () => {
      socket.off("groupUpdated", handleGroupUpdated);
    };
  }, [socket]);

  useEffect(() => {
    fetchGroups();
    fetchFriends();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow p-6 max-w-4xl mx-auto">
        {notification && (
          <div
            className={`p-3 mb-6 rounded-lg shadow-sm text-center ${
              notification.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {notification.message}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-gray-800">Mis Grupos</h1>

        <section className="mb-10">
          {groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border">
              <p className="text-gray-600 text-lg font-medium">
                Aún no perteneces a ningún grupo 😔
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Crea un nuevo grupo con tus amigos y empieza a chatear.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {groups.map((group) => (
                <li
                  key={group._id}
                  className="border bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          group.groupImage ||
                          "https://cdn-icons-png.flaticon.com/512/747/747310.png"
                        }
                        alt="group"
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <h2 className="font-semibold text-gray-800">
                          {group.name}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {Array.isArray(group.participants)
                            ? group.participants.length
                            : 0}{" "}
                          miembros
                        </p>
                      </div>
                    </div>

                    {group?.createdBy?._id === user._id ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroupId(group._id);
                          setEditedMembers(
                            Array.isArray(group.participants)
                              ? group.participants.map((m) => m._id)
                              : []
                          );
                        }}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 text-sm"
                      >
                        Editar
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLeaveGroup(group._id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                      >
                        Salir
                      </button>
                    )}
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <strong>Miembros:</strong>{" "}
                    {Array.isArray(group.participants) && group.participants.length > 0
                      ? group.participants.map((m) => m.username).join(", ")
                      : "Sin miembros"}
                  </div>

                  {editingGroupId === group._id && (
                    <div className="mt-4 border-t pt-3">
                      <p className="mb-2 font-medium">Selecciona miembros:</p>
                      {friends.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No tienes amigos para agregar.
                        </p>
                      ) : (
                        friends.map((friend) => (
                          <label
                            key={friend._id}
                            className="flex items-center space-x-2 mb-1"
                          >
                            <input
                              type="checkbox"
                              checked={editedMembers.includes(friend._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setEditedMembers((prev) => [...prev, friend._id]);
                                } else {
                                  setEditedMembers((prev) =>
                                    prev.filter((id) => id !== friend._id)
                                  );
                                }
                              }}
                            />
                            <span>{friend.username}</span>
                          </label>
                        ))
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleSaveMembers(group._id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingGroupId(null);
                            setEditedMembers([]);
                          }}
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
        </section>

        <form
          onSubmit={handleCreateGroup}
          className="border bg-white p-6 rounded-xl shadow-md space-y-4"
        >
          <h2 className="text-xl font-semibold text-gray-800">
            Crear nuevo grupo
          </h2>

          <input
            type="text"
            placeholder="Nombre del grupo"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="border p-2 w-full rounded focus:ring focus:ring-blue-200"
          />

          <div>
            <label className="block font-medium mb-2">
              Foto del grupo (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setGroupImage(e.target.files[0])}
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <p className="font-medium mb-2">Selecciona amigos:</p>
            {friends.length === 0 ? (
              <p>No tienes amigos para añadir.</p>
            ) : (
              <div className="space-y-1">
                {friends.map((friend) => (
                  <label
                    key={friend._id}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFriends((prev) => [...prev, friend._id]);
                        } else {
                          setSelectedFriends((prev) =>
                            prev.filter((id) => id !== friend._id)
                          );
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
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full font-semibold"
          >
            {loading ? "Creando grupo..." : "Crear grupo"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default GroupManager;
