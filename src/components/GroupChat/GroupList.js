import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getFullImageUrl } from "../../utils/getProfilePicture";
import defaultGroup from "../../assets/default-profile.png"; // Or a specific group default if exists

export default function GroupList({ onSelectGroup }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/group/groups/with-last-message");
        setGroups(res.data.groups || []);
      } catch (err) {
        // console.error("Error fetching groups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const handleGroupClick = (groupId) => {
    if (onSelectGroup) {
      onSelectGroup(groupId);
    }
    navigate(`/groups/${groupId}`);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="bg-white shadow-sm rounded-2xl p-5 w-full border border-gray-100">
      <div className="flex flex-col gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mis Grupos</h2>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>
      </div>

      {!filteredGroups.length ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm italic">
            {searchTerm ? "No se encontraron resultados" : "No tienes conversaciones en grupo."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filteredGroups.map((group) => (
            <li
              key={group._id}
              onClick={() => handleGroupClick(group._id)}
              className="p-3 rounded-xl cursor-pointer hover:bg-blue-50/50 border border-transparent hover:border-blue-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={getFullImageUrl(group.groupImage)}
                    alt={group.name}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-100 transition-all"
                    onError={(e) => { e.target.src = defaultGroup; }}
                  />
                  {group.lastMessage && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3 overflow-hidden">
                  <span className="font-bold text-gray-800 block truncate group-hover:text-blue-600 transition-colors">{group.name}</span>
                  <p className="text-xs text-gray-500 font-medium">
                    {group.members?.length || 0} miembros
                  </p>
                </div>
              </div>
              {group.lastMessage && (
                <div className="hidden sm:block ml-4 flex-shrink-0 text-right">
                  <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[100px]">
                    {group.lastMessage.content || "Envió un archivo"}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}