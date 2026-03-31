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
      <main className="flex-grow p-4 sm:p-6 max-w-4xl mx-auto">
        {notification && (
          <div
            className={`p-2 sm:p-3 mb-4 sm:mb-6 rounded-lg shadow-sm text-center text-xs sm:text-sm font-bold ${
              notification.type === "success"
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-red-100 text-red-700 border border-red-300"
            }`}
          >
            {notification.message}
          </div>
        )}

        <h1 className="text-xl sm:text-3xl font-black mb-4 sm:mb-6 text-gray-800 uppercase tracking-widest text-center sm:text-left">Comunidades</h1>

        <section className="mb-6 sm:mb-10">
          {groups.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-md border px-4">
              <p className="text-gray-600 text-sm sm:text-lg font-black uppercase">
                Aún no tienes comunidades
              </p>
              <p className="text-[10px] sm:text-sm text-gray-400 mt-2 font-bold tracking-widest uppercase">
                Crea una comunidad con compas y chatea
              </p>
            </div>
          ) : (
            <ul className="space-y-3 sm:space-y-4">
              {groups.map((group) => (
                <li
                  key={group._id}
                  className="border bg-white p-3 sm:p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer group"
                  onClick={() => navigate(`/groups/${group._id}`)}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center space-x-3 w-full">
                      <img
                        src={
                          group.groupImage ||
                          "https://cdn-icons-png.flaticon.com/512/747/747310.png"
                        }
                        alt="group"
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-transparent group-hover:border-primary-100 transition-all"
                      />
                      <div className="flex-1">
                        <h2 className="font-black text-sm sm:text-base text-gray-800 uppercase tracking-widest truncate">
                          {group.name}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                          {Array.isArray(group.participants)
                            ? group.participants.length
                            : 0}{" "}
                          compas
                        </p>
                      </div>
                      
                      <div className="shrink-0 flex gap-2">
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
                            className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors border border-gray-200"
                          >
                            Editar
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLeaveGroup(group._id);
                            }}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors border border-red-100"
                          >
                            Salir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] sm:text-xs text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <strong className="text-gray-700 uppercase tracking-widest mr-1 text-[9px] sm:text-[10px]">Miembros:</strong>{" "}
                    <span className="font-medium inline-block text-[11px] leading-relaxed">
                      {Array.isArray(group.participants) && group.participants.length > 0
                        ? group.participants.map((m) => m.username).join(", ")
                        : "Sin miembros"}
                    </span>
                  </div>

                  {editingGroupId === group._id && (
                    <div className="mt-3 border-t pt-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                      <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Vuelve a seleccionar tus compas:</p>
                      {friends.length === 0 ? (
                        <p className="text-[10px] font-bold text-gray-400 bg-gray-50 p-2 rounded-lg text-center uppercase">
                          No tienes compas para agregar.
                        </p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar p-1">
                          {friends.map((friend) => (
                            <label
                              key={friend._id}
                              className="flex items-center space-x-2 bg-white border border-gray-100 p-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
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
                                className="rounded text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-[10px] sm:text-xs font-bold text-gray-700 truncate">{friend.username}</span>
                            </label>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleSaveMembers(group._id)}
                          className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingGroupId(null);
                            setEditedMembers([]);
                          }}
                          className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 text-[10px] font-black uppercase tracking-widest transition-colors"
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
          className="border border-gray-100 bg-white p-4 sm:p-6 rounded-2xl shadow-sm space-y-4"
        >
          <h2 className="text-sm sm:text-lg font-black text-gray-800 uppercase tracking-widest mb-2 border-b border-gray-50 pb-2">
            Crear nueva comunidad
          </h2>

          <input
            type="text"
            placeholder="Nombre de la comunidad"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 sm:py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none transition-all font-bold placeholder-gray-400"
          />

          <div>
            <label className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">
              Foto del grupo (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setGroupImage(e.target.files[0])}
              className="w-full text-[10px] sm:text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer bg-gray-50 p-2 rounded-xl border border-gray-100"
            />
          </div>

          <div>
            <p className="block text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500 mb-1.5 ml-1">Selecciona tus compas:</p>
            {friends.length === 0 ? (
              <p className="text-[10px] text-gray-400 font-bold bg-gray-50 p-3 rounded-xl text-center uppercase tracking-widest">No tienes compas para añadir.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                {friends.map((friend) => (
                  <label
                    key={friend._id}
                    className="flex items-center space-x-2 bg-white border border-gray-100 p-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors"
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
                      className="rounded text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-700 truncate">{friend.username}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 sm:py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary-500/30 disabled:opacity-50 disabled:shadow-none mt-4"
          >
            {loading ? "Creando..." : "Crear Comunidad"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default GroupManager;
