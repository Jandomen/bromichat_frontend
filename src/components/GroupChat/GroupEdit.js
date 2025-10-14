import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import Header from "../Header";
import Footer from "../Footer";
import defaultProfile from "../../assets/default-profile.png";
import { getFullImageUrl } from "../../utils/getProfilePicture";

const GroupEdit = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [name, setName] = useState("");
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const res = await api.get(`/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
       // console.log("Group fetched for edit:", JSON.stringify(res.data.group, null, 2));
        setGroup(res.data.group);
        setName(res.data.group.name);
      } catch (err) {
       // console.error("Error fetching group for edit:", err);
        setNotification({ type: "error", message: "Error al cargar detalles del grupo" });
        setTimeout(() => navigate("/groups"), 2000);
      }
    };

    fetchGroupDetails();
  }, [groupId, token, navigate]);

  const isCreator = group?.createdBy?._id?.toString() === user._id?.toString();
  console.log("Is creator in GroupEdit?", {
    isCreator,
    userId: user._id,
    creatorId: group?.createdBy?._id,
  });

  const handleUpdateGroup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(
        `/group/${groupId}`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
     // console.log("Group updated:", res.data);
      setNotification({ type: "success", message: "Grupo actualizado con éxito" });
      setTimeout(() => navigate(`/groups/${groupId}`), 2000);
    } catch (err) {
     // console.error("Error updating group:", err);
      setNotification({ type: "error", message: "Error al actualizar el grupo" });
    }
  };

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
    } catch (err) {
     // console.error("Error updating group image:", err);
      setNotification({ type: "error", message: "Error al actualizar la imagen del grupo" });
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-gray-600">Cargando grupo...</p>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-lg text-red-600">Solo el creador puede editar este grupo</p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-100 pt-16 pb-8">
        <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Editar grupo: {group.name}</h1>

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
                 // console.log("Image clicked to change group image");
                  fileInputRef.current?.click();
                }}
              />
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
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleChangeGroupImage(e.target.files[0])}
              />
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Creado el {new Date(group.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-blue-600">Tú eres el creador</p>
            </div>
          </div>

          <form onSubmit={handleUpdateGroup} className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nombre del grupo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Guardar cambios
            </button>
            <button
              type="button"
              onClick={() => navigate(`/groups/${groupId}`)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GroupEdit;