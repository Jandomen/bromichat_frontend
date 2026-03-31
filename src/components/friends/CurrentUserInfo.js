import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import defaultProfile from '../../assets/default-profile.png';
import { getFullImageUrl } from '../../utils/getProfilePicture';
import StoryViewer from '../stories/StoryViewer';

const CurrentUserInfo = () => {
    const { token, user: authUser } = useContext(AuthContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showStoryViewer, setShowStoryViewer] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token || !authUser?._id) return;

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

    if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
    if (!user) return <p className="text-center p-4 text-gray-400">No se pudo cargar la información del usuario.</p>;



    return (
        <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-white/50 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                <div className="relative group">
                    <div className={`p-1 rounded-2xl transition-all duration-500 shadow-lg ${user?.hasStories
                        ? user.allStoriesViewed
                            ? 'bg-gray-300 shadow-gray-200/20 p-[2px]'
                            : 'bg-gradient-to-tr from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/20 p-1.5'
                        : 'bg-gray-100'}`}>
                        <div
                            className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden cursor-pointer relative"
                            onClick={(e) => {
                                if (user?.hasStories) {
                                    e.preventDefault();
                                    setShowStoryViewer(true);
                                }
                            }}
                        >
                            <img
                                src={getFullImageUrl(user.profilePicture)}
                                alt="Perfil"
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                onError={(e) => e.target.src = defaultProfile}
                            />
                            {user?.hasStories && (
                                <>
                                    <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none"></div>
                                    {!user.allStoriesViewed && (
                                        <div className="absolute top-1 right-1 bg-yellow-500 text-[6px] font-black text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
                                            Historia
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <Link
                    to={`/user/${user._id}`}
                    className="flex-1 flex flex-col justify-center hover:translate-x-1 transition-transform"
                >
                    <h2 className="font-black text-xs xs:text-sm sm:text-lg text-gray-900 leading-tight">
                        {user.name} {user.lastName}
                    </h2>
                    <p className="text-[9px] xs:text-[10px] sm:text-xs font-bold text-primary-600 uppercase tracking-widest">@{user.username}</p>
                </Link>
            </div>

            {showStoryViewer && user?.stories && (
                <StoryViewer
                    storyGroups={[{
                        user: {
                            _id: user._id,
                            username: user.username,
                            profilePicture: user.profilePicture
                        },
                        stories: user.stories
                    }]}
                    initialGroupIndex={0}
                    onClose={() => setShowStoryViewer(false)}
                    currentUserId={authUser?._id}
                />
            )}
        </div>
    );
};

export default CurrentUserInfo;