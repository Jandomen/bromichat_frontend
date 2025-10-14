import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import Header from "../Header";
import Footer from "../Footer";
import UserInfo from "../userProfile/UserInfo";
import UserPosts from "../userProfile/UserPosts";
import UserGallery from "../userProfile/UserGallery";
import UserVideos from "../userProfile/UserVideos";
import { ArrowUpIcon } from "@heroicons/react/24/outline";
import axios from "axios";

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

  const userInfoRef = useRef(null);
  const postsRef = useRef(null);
  const photosRef = useRef(null);
  const videosRef = useRef(null);
  const footerRef = useRef(null);

  // Fetch all user data
  const fetchUserData = async () => {
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
  };

  useEffect(() => {
    setLoading(true);
    setPosts([]);
    fetchUserData();
  }, [userId, token]);

  // Socket events for friends/followers/blocked
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

  const scrollToSection = (ref) => ref.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToTop = () => scrollToSection(userInfoRef);

  if (loading)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">Cargando perfil...</p>
        </main>
        <Footer />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        <section ref={userInfoRef} className="bg-white p-4 rounded shadow">
          <UserInfo user={user} />
        </section>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => scrollToSection(postsRef)}
            disabled={posts.length === 0}
            className={`px-4 py-2 rounded text-white font-semibold ${
              posts.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Ver Publicaciones
          </button>
          <button
            onClick={() => scrollToSection(photosRef)}
            disabled={photos.length === 0}
            className={`px-4 py-2 rounded text-white font-semibold ${
              photos.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Ver Fotos
          </button>
          <button
            onClick={() => scrollToSection(videosRef)}
            disabled={videos.length === 0}
            className={`px-4 py-2 rounded text-white font-semibold ${
              videos.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Ver Videos
          </button>
        </div>

        <section ref={postsRef} className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Publicaciones</h2>
          {posts.length === 0 ? <p>No hay publicaciones disponibles.</p> : <UserPosts posts={posts} userId={userId} scrollToTop={scrollToTop} />}
        </section>

        <section ref={photosRef} className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Fotos</h2>
          {photos.length === 0 ? <p>No hay fotos disponibles.</p> : <UserGallery photos={photos} scrollToTop={scrollToTop} />}
        </section>

        <section ref={videosRef} className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Videos</h2>
          {videos.length === 0 ? <p>No hay videos disponibles.</p> : <UserVideos videos={videos} authUser={authUser} onDelete={fetchUserData} scrollToTop={scrollToTop} />}
        </section>
      </main>

      <Footer ref={footerRef} />

      <div className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50">
        <button
          onClick={scrollToTop}
          className="px-4 py-2 rounded-full text-white font-semibold bg-blue-600 hover:bg-blue-700 flex items-center shadow-lg"
          title="Volver Arriba"
        >
          <ArrowUpIcon className="w-5 h-5 mr-2" />
          Arriba
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
