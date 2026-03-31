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
    <div className="bg-white shadow-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 w-full border border-gray-100">
      <div className="flex flex-col gap-2 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-sm sm:text-xl font-black text-gray-900 uppercase tracking-widest">Comunidades</h2>

        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar comunidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 sm:pl-9 sm:pr-4 sm:py-2 bg-gray-50 border border-gray-100 rounded-lg sm:rounded-xl text-[10px] sm:text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-bold"
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
        <ul className="space-y-1.5 sm:space-y-3">
          {filteredGroups.map((group) => (
            <li
              key={group._id}
              onClick={() => handleGroupClick(group._id)}
              className="p-2 sm:p-3 rounded-lg sm:rounded-xl cursor-pointer hover:bg-red-50/50 border border-transparent hover:border-red-100 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center min-w-0">
                <div className="relative flex-shrink-0">
                  <img
                    src={getFullImageUrl(group.groupImage)}
                    alt={group.name}
                    className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl object-cover ring-2 ring-transparent group-hover:ring-red-100 transition-all"
                    onError={(e) => { e.target.src = defaultGroup; }}
                  />
                  {group.lastMessage && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-2 sm:ml-3 overflow-hidden">
                  <span className="font-black text-xs sm:text-sm text-gray-800 block truncate group-hover:text-red-600 transition-colors uppercase">{group.name}</span>
                  <p className="text-[9px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">
                    {group.members?.length || 0} compas
                  </p>
                </div>
              </div>
              {group.lastMessage && (
                <div className="hidden sm:block ml-4 flex-shrink-0 text-right">
                  <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold truncate max-w-[100px] uppercase">
                    {group.lastMessage.content || "Envió archivo"}
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