import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import GroupChat from "./GroupChat";
import api from "../../services/api";
import Header from "../Header";
import Footer from "../Footer";
import defaultProfile from "../../assets/default-profile.png";
import { getFullImageUrl } from "../../utils/getProfilePicture";

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  const { user, token } = useContext(AuthContext);
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
      setGroup((prev) => ({ ...prev, groupImage: res.data.groupImage }));
      setNotification({ type: "success", message: "Imagen de grupo actualizada" });
      if (socket) {
        socket.emit("groupUpdated", { ...group, groupImage: res.data.groupImage });
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
              className={`p-2 mb-4 rounded ${
                notification.type === "success"
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
                className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
                onClick={() => {
                  if (isCreator) {
                   // console.log("Image clicked to change group image");
                    fileInputRef.current?.click();
                  } else {
                   // console.log("Not creator, image click ignored");
                  }
                }}
              />
              {isCreator && (
                <>
                  <button
                    onClick={() => {
                     // console.log("Change image button clicked");
                      fileInputRef.current?.click();
                    }}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition"
                    title="Cambiar foto del grupo"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                     // console.log("Explicit change image button clicked");
                      fileInputRef.current?.click();
                    }}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                  >
                    Cambiar foto del grupo
                  </button>
                </>
              )}
              {!isCreator && (
                <p className="text-sm text-gray-500 mt-4">Solo el creador puede cambiar la foto</p>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => handleChangeGroupImage(e.target.files[0])}
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
              <p className="text-sm text-gray-600">
                Creado el {new Date(group.createdAt).toLocaleDateString()}
              </p>
              {isCreator && <p className="text-sm text-blue-600">Tú eres el creador</p>}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-700 mt-2">Miembros:</p>
          <div className="flex flex-wrap gap-3 mt-2">
            {group.members.map((member) => (
              <div key={member._id} className="flex items-center space-x-2 cursor-pointer">
                <img
                  src={member.profilePicture ? getFullImageUrl(member.profilePicture) : defaultProfile}
                  alt={member.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-gray-700">{member.username}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            {isCreator && (
              <button
                onClick={() => navigate(`/groups/${groupId}/edit`)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Editar grupo
              </button>
            )}
            {!isCreator && (
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/group/${groupId}/leave`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    setNotification({ type: "success", message: "Has salido del grupo" });
                    setTimeout(() => navigate("/groups"), 2000);
                  } catch (err) {
                   // console.error("Error leaving group:", err);
                    setNotification({ type: "error", message: "Error al salir del grupo" });
                  }
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Salir del grupo
              </button>
            )}
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