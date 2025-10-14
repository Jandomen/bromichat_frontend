import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function GroupList({ onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/group/groups/with-last-message");
       // console.log("Groups fetched:", res.data.groups);
        setGroups(res.data.groups || []);
      } catch (err) {
     //   console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
  //  console.log("Group clicked, navigating to:", `/groups/${groupId}`);
    if (onSelectGroup) {
   //   console.log("Calling onSelectGroup with groupId:", groupId);
      onSelectGroup(groupId);
    }
    navigate(`/groups/${groupId}`);
  };

  if (loading) return <p className="text-gray-600 text-center">Cargando grupos...</p>;
  if (!groups.length) return <p className="text-gray-600 text-center">No tienes conversaciones en grupo.</p>;

  return (
    <div className="bg-white shadow rounded p-4 w-full">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Mis Conversaciones de Grupo</h2>
      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group._id}
            onClick={() => handleGroupClick(group._id)}
            className="p-3 border rounded cursor-pointer hover:bg-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center">
              <img
                src={group.groupImage || "https://cdn-icons-png.flaticon.com/512/747/747310.png"}
                alt={group.name}
                className="w-10 h-10 rounded-full mr-3 object-cover"
                onError={(e) => (e.target.src = "https://cdn-icons-png.flaticon.com/512/747/747310.png")}
              />
              <div>
                <span className="font-medium text-gray-800">{group.name}</span>
                <p className="text-xs text-gray-500">
                  {group.members?.length || 0} miembro{group.members?.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {group.lastMessage && (
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {group.lastMessage.content || "No hay mensajes"}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}