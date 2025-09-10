import React, { useEffect, useState } from 'react';
import useAuthAxios from '../../hooks/useAuthAxios';

const FollowingPhotos = ({ limit = 10, page = 1 }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authAxios = useAuthAxios();

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await authAxios.get('/gallery/following/photos', {
          params: { limit, page },
        });

        setPhotos(res.data.photos || []);
      } catch (err) {
       // console.error('Error al obtener fotos recientes:', err);
        setError('No se pudieron cargar las fotos.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [limit, page, authAxios]);

  if (loading) return <p>Cargando fotos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!photos.length) return <p>No hay fotos recientes.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {photos.map((photo) => (
        <div key={photo._id} className="rounded-lg overflow-hidden shadow-sm">
          <img
            src={photo.imageUrl}
            alt={photo.description || 'Foto'}
            className="w-full h-48 object-cover"
          />
          {photo.description && (
            <p className="text-sm p-2">{photo.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default FollowingPhotos;
