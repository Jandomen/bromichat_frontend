import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import Header from "../Header";
import Footer from "../Footer";
import UserInfo from "../userProfile/UserInfo";
import UserPosts from "../userProfile/UserPosts";
import UserGallery from "../userProfile/UserGallery";
import MyFriendsList from '../friends/FriendsList';
import UserVideos from "../userProfile/UserVideos";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import defaultProfile from '../../assets/default-profile.png';
import { getFullImageUrl } from "../../utils/getProfilePicture";
import SavedPosts from "./SavedPosts";

const UserProfile = () => {
  const { userId } = useParams();
  const { token, user: authUser } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const footerRef = useRef(null);

  const fetchUserData = useCallback(async () => {
    const cancelTokenSource = axios.CancelToken.source();
    try {
      const [userRes, postsRes, videosRes, photosRes] = await Promise.all([
        api.get(`/user/profile/${userId}`, { cancelToken: cancelTokenSource.token }),
        api.get(`/posts/user/${userId}`, { cancelToken: cancelTokenSource.token }),
        api.get(`/videos/user/${userId}`, { cancelToken: cancelTokenSource.token }),
        api.get(`/gallery/user/${userId}`, { cancelToken: cancelTokenSource.token }),
      ]);

      setUser({
        ...userRes.data,
        friends: userRes.data.friends || [],
        followers: userRes.data.followers || [],
        following: userRes.data.following || [],
      });

      setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      setVideos(
        Array.isArray(videosRes.data?.videos || videosRes.data)
          ? (videosRes.data.videos || videosRes.data).filter((video) => video && video.videoUrl)
          : []
      );
      setPhotos(
        Array.isArray(photosRes.data?.photos || photosRes.data)
          ? (photosRes.data.photos || photosRes.data).filter((photo) => photo && photo.imageUrl)
          : []
      );
    } catch (err) {
      if (!axios.isCancel(err)) setError("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }

    return () => cancelTokenSource.cancel("Unmounted");
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    const promise = fetchUserData();
    return () => {
      promise.then(cleanup => typeof cleanup === 'function' && cleanup());
    };
  }, [userId, token, fetchUserData]);

  useEffect(() => {
    if (!socket || !user || !authUser) return;

    const handlers = {
      friendAdded: ({ friendId, friends, isFriend }) => {
        if (user._id === authUser._id || user._id === friendId) {
          setUser((prev) => ({ ...prev, friends: friends || prev.friends }));
        }
      },
      friendRemoved: ({ friendId, friends, isFriend }) => {
        if (user._id === authUser._id || user._id === friendId) {
          setUser((prev) => ({ ...prev, friends: friends || prev.friends }));
        }
      },
      followed: ({ targetId, following, isFollowing }) => {
        if (user._id === authUser._id) setUser((prev) => ({ ...prev, following }));
      },
      unfollowed: ({ targetId, following, isFollowing }) => {
        if (user._id === authUser._id) setUser((prev) => ({ ...prev, following }));
      },
      userBlocked: ({ targetId, blockedUsers, isBlocked }) => {
        if (user._id === authUser._id || user._id === targetId) {
          setUser((prev) => ({ ...prev, isBlocked: isBlocked ?? prev.isBlocked }));
        }
      },
      userUnblocked: ({ targetId, blockedUsers, isBlocked }) => {
        if (user._id === authUser._id || user._id === targetId) {
          setUser((prev) => ({ ...prev, isBlocked: isBlocked ?? prev.isBlocked }));
        }
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));

    return () => {
      Object.keys(handlers).forEach((event) => socket.off(event));
    };
  }, [socket, user, authUser]);

  const INITIAL_TABS = [
    { id: 'posts', label: 'Publicaciones' },
    { id: 'about', label: 'Info' },
    { id: 'friends', label: 'Compas' },
    { id: 'photos', label: 'Fotos' },
    { id: 'videos', label: 'Videos' },
  ];

  const TABS = user && authUser && user._id === authUser._id 
    ? [...INITIAL_TABS, { id: 'saved', label: 'Guardados' }]
    : INITIAL_TABS;

  const [activeTab, setActiveTab] = useState('posts');

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </main>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-500 bg-white p-4 rounded shadow">{error}</p>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc] selection:bg-primary-100">
      <Header />

      <main className="flex-grow container mx-auto px-2 sm:px-4 pb-20 max-w-6xl animate-fade-in pt-3 sm:pt-6">
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 border border-gray-100 bg-white">
          <UserInfo user={user} />

          <div className="px-2 py-3 sm:px-6 sm:py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center">
            <div className="flex bg-white p-1sm:p-1.5 rounded-xl sm:rounded-2xl shadow-inner border border-gray-100 overflow-x-auto scrollbar-hide max-w-full">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 sm:px-6 sm:py-2.5 rounded-lg sm:rounded-xl text-[9.5px] sm:text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-md sm:shadow-lg shadow-primary-500/30'
                    : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {user.isSuspended ? (
          <div className="mt-10 bg-white p-20 rounded-[3rem] shadow-2xl shadow-red-200/40 border border-red-50 flex flex-col items-center justify-center text-center animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-8 text-5xl">🛑</div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Cuenta Suspendida</h2>
            <p className="text-xl text-gray-500 max-w-xl leading-relaxed mb-8">
              Esta terminal ha sido restringida temporalmente por la administración de BROMICHAT debido a infracciones en los protocolos de conducta.
            </p>
            {user.suspensionReason && (
              <div className="p-6 bg-red-50 rounded-2xl border border-red-100 max-w-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Motivo de la infracción:</p>
                <p className="text-sm text-red-900 font-bold italic">"{user.suspensionReason}"</p>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 sm:mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-10">
            <div className="hidden lg:block lg:col-span-4 space-y-4 sm:space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-md sm:shadow-xl shadow-gray-200/40 border border-gray-50 animate-slide-up">
                <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-4 sm:mb-6">Sobre mí</h3>
                <div className="space-y-4 sm:space-y-6">
                  {user.bio && (
                    <div className="relative">
                      <span className="absolute -left-3 -top-2 text-2xl sm:text-4xl text-primary-100 font-serif">"</span>
                      <p className="text-gray-700 italic leading-relaxed relative z-10 text-[11px] sm:text-base">{user.bio}</p>
                    </div>
                  )}
                  <div className="space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 text-[10px] sm:text-base">📍</span>
                      <span>Se unió en {new Date(user.createdAt).getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {photos.length > 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-md sm:shadow-xl shadow-gray-200/40 border border-gray-50 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h3 className="font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">Galería</h3>
                    <button onClick={() => setActiveTab('photos')} className="text-[10px] sm:text-xs font-bold text-primary-600 hover:underline">Ver Todo</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {photos.slice(0, 9).map((photo, idx) => (
                      <div key={idx} className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setActiveTab('photos')}>
                        <img
                          src={getFullImageUrl(photo.imageUrl)}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                          alt="preview"
                          onError={(e) => e.target.src = defaultProfile}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-8">
              <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                {activeTab === 'posts' && (
                  <div className="space-y-8">
                    {posts.length === 0 ? (
                      <div className="bg-white p-20 rounded-[2rem] shadow-xl shadow-gray-200/40 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">📭+</div>
                        <h4 className="text-xl font-bold text-gray-800 mb-2">Aún no hay publicaciones</h4>
                        <p className="text-gray-500">Mantente atento a futuras actualizaciones de este usuario.</p>
                      </div>
                    ) : (
                      <UserPosts posts={posts} userId={userId} scrollToTop={() => { }} />
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100 space-y-4 sm:space-y-6">
                    <h2 className="text-sm sm:text-base font-black text-gray-800 border-b border-gray-100 pb-2 sm:pb-3 uppercase tracking-widest">Info Detallada</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-widest">Detalles de Contacto</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                            <span className="text-base sm:text-lg">📧</span>
                            <div>
                              <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase">Correo Electrónico</p>
                              <p className="font-semibold text-gray-700 text-[10px] sm:text-xs">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                            <span className="text-base sm:text-lg">📞</span>
                            <div>
                              <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase">Número de Teléfono</p>
                              <p className="font-semibold text-gray-700 text-[10px] sm:text-xs">{user.phone || 'No proporcionado'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[9px] sm:text-[10px] font-black text-primary-500 uppercase tracking-widest">Información General</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                            <span className="text-base sm:text-lg">🎂</span>
                            <div>
                              <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase">Cumpleaños</p>
                              <p className="font-semibold text-gray-700 text-[10px] sm:text-xs">{user.birthdate ? new Date(user.birthdate).toLocaleDateString() : 'No especificado'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-gray-50 hover:bg-primary-50 transition-colors">
                            <span className="text-base sm:text-lg">🗓️</span>
                            <div>
                              <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase">Miembro desde</p>
                              <p className="font-semibold text-gray-700 text-[10px] sm:text-xs">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'friends' && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-sm sm:text-base font-black text-gray-800 mb-3 sm:mb-4 text-center sm:text-left uppercase tracking-widest">Compas <span className="text-primary-600">({user.friends?.length || 0})</span></h2>
                    <MyFriendsList users={user.friends || []} minimal={true} />
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-sm sm:text-base font-black text-gray-800 mb-3 sm:mb-4 text-center sm:text-left uppercase tracking-widest">Galería de Fotos</h2>
                    <UserGallery photos={photos} scrollToTop={() => { }} />
                  </div>
                )}

                {activeTab === 'videos' && (
                  <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm border border-gray-100">
                    <h2 className="text-sm sm:text-base font-black text-gray-800 mb-3 sm:mb-4 text-center sm:text-left uppercase tracking-widest">Contenido de Video</h2>
                    <UserVideos videos={videos} authUser={authUser} onDelete={fetchUserData} scrollToTop={() => { }} />
                  </div>
                )}

                {activeTab === 'saved' && user._id === authUser._id && (
                  <div className="bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[2rem] shadow-md sm:shadow-xl shadow-gray-200/40">
                    <h2 className="text-lg sm:text-2xl font-black text-gray-800 mb-4 sm:mb-8 text-center sm:text-left">Guardados Privados</h2>
                    <SavedPosts />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer ref={footerRef} />

      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 flex flex-col space-y-4 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 sm:p-4 rounded-full bg-white/20 backdrop-blur-xl border border-white/40 text-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/40 hover:scale-110 active:scale-95 transition-all outline-none"
          title="Volver Arriba"
        >
          <ArrowUpIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
