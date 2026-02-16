import React, { useEffect, useState, useContext, useRef } from "react";
import { useUI } from "../../context/UIContext";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import GroupChat from "./GroupChat";
import api from "../../services/api";
import Header from "../Header";
import Footer from "../Footer";
import defaultProfile from "../../assets/default-profile.png";
import { getFullImageUrl } from "../../utils/getProfilePicture";
import { CallContext } from "../../context/CallContext";
import { Video } from "lucide-react";

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user, token } = useContext(AuthContext);
  const { showConfirm, showToast } = useUI();
  const { ongoingCalls, callGroup, isWaitingAdmission, requestAdmission } = useContext(CallContext);
  const [group, setGroup] = useState(null);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGroupDetails = async () => {
      try {
        const res = await api.get(`/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!isMounted) return;

        // console.log("Group fetched:", JSON.stringify(res.data.group, null, 2));
        const uniqueMembers = Array.from(
          new Map(res.data.group.members.map((m) => [m._id, m])).values()
        );

        setGroup({ ...res.data.group, members: uniqueMembers });
      } catch (err) {
        if (!isMounted) return;
        // console.error("Error fetching group:", err);
        const message =
          err.response?.status === 404
            ? "Grupo no encontrado"
            : err.response?.status === 403
              ? "No eres miembro del grupo"
              : "Error al cargar detalles del grupo";
        setNotification({ type: "error", message });
        setTimeout(() => navigate("/groups"), 2000);
      }
    };

    fetchGroupDetails();

    if (socket) {
      socket.emit("join_group", { groupId });

      const handleMemberLeft = ({ groupId: leftGroupId, userId, message }) => {
        if (leftGroupId === groupId) {
          setNotification({ type: "info", message });
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

      socket.on("groupMemberLeft", handleMemberLeft);
      socket.on("groupUpdated", handleGroupUpdated);

      return () => {
        socket.off("groupMemberLeft", handleMemberLeft);
        socket.off("groupUpdated", handleGroupUpdated);
        socket.emit("leave_group", { groupId });
      };
    }

    return () => {
      isMounted = false;
    };
  }, [groupId, socket, navigate, token]);

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Cargando grupo...</p>
      </div>
    );
  }

  const isCreator = group.createdBy?._id?.toString() === user._id?.toString();
  console.log("Is creator?", {
    isCreator,
    userId: user._id,
    creatorId: group.createdBy?._id,
    groupData: group,
  });

  const handleChangeGroupImage = async (file) => {
    if (!file) {
      // console.warn("No file selected for group image");
      setNotification({ type: "error", message: "Selecciona una imagen" });
      return;
    }
    const formData = new FormData();
    formData.append("groupImage", file);
    try {
      // console.log("Uploading group image for group:", groupId);
      const res = await api.put(`/group/${groupId}/update-image`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      // console.log("Group image updated:", res.data.groupImage);
      setGroup((prev) => ({ ...prev, groupImage: res.data.group.groupImage }));
      setNotification({ type: "success", message: "Imagen de grupo actualizada" });
      if (socket) {
        socket.emit("groupUpdated", { ...group, groupImage: res.data.group.groupImage });
      }
    } catch (err) {
      // console.error("Error updating group image:", err);
      setNotification({ type: "error", message: "Error al actualizar la imagen del grupo" });
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 pt-16 pb-8">
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
          {notification && (
            <div
              className={`p-2 mb-4 rounded ${notification.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {notification.message}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={group.groupImage ? getFullImageUrl(group.groupImage) : defaultProfile}
                alt={group.name}
                className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition relative z-10"
                onClick={() => fileInputRef.current?.click()}
                title="Click para cambiar imagen"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-white/80 p-1.5 rounded-full shadow-md hover:bg-white transition z-20"
                title="Cambiar foto del grupo"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleChangeGroupImage(e.target.files[0])}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                {group.name}
                <button
                  onClick={() => navigate(`/groups/${groupId}/edit`)}
                  className="text-gray-400 hover:text-indigo-600 transition"
                  title="Editar nombre"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </h1>
              <p className="text-sm text-gray-600">
                Created {new Date(group.createdAt).toLocaleDateString()}
              </p>
              {isCreator && <p className="text-xs text-indigo-500 font-medium">Group Admin</p>}
            </div>

            <div className="ml-auto flex items-center gap-3">
              {ongoingCalls[groupId] ? (
                <button
                  onClick={() => isWaitingAdmission ? null : requestAdmission(groupId, group.name, group.groupImage)}
                  className={`flex items-center gap-2 px-6 py-2.5 ${isWaitingAdmission ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 ${isWaitingAdmission ? '' : 'animate-pulse'}`}
                  disabled={isWaitingAdmission}
                >
                  <Video size={18} />
                  <span>{isWaitingAdmission ? 'Esperando...' : 'Unirse en vivo'}</span>
                </button>
              ) : (
                <button
                  onClick={() => callGroup(groupId, group.name, group.groupImage, group.members)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                >
                  <Video size={18} />
                  <span>Iniciar Llamada</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-700 mt-2">Members ({group.members.length}):</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {group.members.map((member) => (
              <div key={member._id} className="flex flex-col items-center gap-1 w-16" title={member.username}>
                <img
                  src={member.profilePicture ? getFullImageUrl(member.profilePicture) : defaultProfile}
                  alt={member.username}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <span className="text-xs text-gray-600 truncate w-full text-center">{member.username}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t flex justify-end">
            <button
              onClick={() => {
                showConfirm(
                  "Salir del grupo",
                  "¿Seguro que quieres salir del grupo?",
                  async () => {
                    try {
                      await api.delete(`/group/${groupId}/leave`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      showToast("Has salido del grupo", "success");
                      setTimeout(() => navigate("/groups"), 2000);
                    } catch (err) {
                      showToast("Error al salir del grupo", "error");
                    }
                  }
                );
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Leave Group
            </button>
          </div>

          {user && socket && (
            <div className="mt-8">
              <GroupChat groupId={groupId} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GroupDetails;