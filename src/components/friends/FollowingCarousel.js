import React, { useEffect, useState } from 'react';
import useAuthAxios from '../../hooks/useAuthAxios';

const FollowingCarousel = () => {
  const [following, setFollowing] = useState([]);
  const authAxios = useAuthAxios();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await authAxios.get('/friend/following/me');
        setFollowing(res.data.following);
      } catch (err) {
       // console.error('Error al obtener usuarios que sigues:', err);
      }
    };

    fetchFollowing();
  }, [authAxios]);

  if (!following.length) return <p>No sigues a ningún usuario.</p>;

  return (
    <div className="flex overflow-x-auto space-x-4 p-4">
      {following.map(user => (
        <div
          key={user._id}
          className="flex flex-col items-center border p-2 rounded-lg shadow-sm"
        >
          <img
            src={user.profilePicture || '/default-avatar.png'}
            alt={user.username}
            className="w-16 h-16 rounded-full"
          />
          <span className="text-sm mt-2">{user.username}</span>
        </div>
      ))}
    </div>
  );
};

export default FollowingCarousel;
