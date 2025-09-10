import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; 
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import defaultProfile from '../../assets/default-profile.png';

const CurrentUserInfo = () => {
 const { token, user: authUser } = useContext(AuthContext);
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchUser = async () => {
 if (!token) return;

 try {
 const res = await api.get(`/user/profile/${authUser._id}`, {
 headers: { Authorization: `Bearer ${token}` },
 });
 setUser(res.data);
 } catch (err) {
 // console.error('Error al obtener el usuario actual:', err);
 } finally {
 setLoading(false);
 }
 };

 fetchUser();
 }, [token, authUser]);

 if (loading) return <p>Cargando usuario...</p>;
 if (!user) return <p>No se pudo cargar la información del usuario.</p>;

 const getProfilePicture = (path) => {
 if (!path) return defaultProfile;
 if (path.startsWith('http')) return path;
 return `${process.env.REACT_APP_API_BACKEND}${path}`;
 };

 return (
 <div className="flex items-center space-x-4 p-4 bg-white rounded shadow">
 <Link
 to={`/user/${user._id}`}
 className="flex items-center space-x-4 hover:bg-gray-100 p-1 rounded transition"
 >
 <img
 src={getProfilePicture(user.profilePicture)}
 alt="Perfil"
 className="w-16 h-16 rounded-full object-cover"
 onError={(e) => {
 // console.error('Error loading profile picture:', e.target.src);
 e.target.src = defaultProfile;
 }}
 />
 <div>
 <h2 className="font-bold text-lg">{user.username}</h2>
 <p className="text-sm text-gray-500">{user.email}</p>
 </div>
 </Link>
 </div>
 );
};

export default CurrentUserInfo;