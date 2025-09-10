import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/group/groups/with-last-message"); 
        setGroups(res.data.groups || []);
      } catch (err) {
        //console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <p>Cargando grupos...</p>;
  if (!groups.length) return <p>No tienes conversaciones en grupo.</p>;

  return (
    <div className="bg-white shadow rounded p-4 w-full">
      <h2 className="text-lg font-semibold mb-3">Mis Conversaciones de Grupo</h2>
      <ul className="space-y-2">
        {groups.map((group) => (
          <li
            key={group._id}
            onClick={() => navigate(`/groups/${group._id}`)}
            className="p-3 border rounded cursor-pointer hover:bg-gray-100 flex items-center justify-between"
          >
            <span className="font-medium">{group.name}</span>
            <span className="text-xs text-gray-500">
              {group.members?.length || 0} miembros
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
