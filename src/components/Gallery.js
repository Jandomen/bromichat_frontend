import React, { useState, useEffect, useContext } from 'react';
import Header from './Header';
import Footer from './Footer';
import PhotoUpload from './photos/PhotoUpload';
import PhotoList from './photos/PhotoList';
import { AuthContext } from '../context/AuthContext';
import photoService from '../services/photoService';

const Gallery = () => {
  const { token, user } = useContext(AuthContext);
  const [photos, setPhotos] = useState([]);

  const fetchPhotos = async () => {
    if (!token || !user?._id) {
      setPhotos([]); // Ensure photos is an array if token or user is missing
      return;
    }
    try {
      const data = await photoService.getUserPhotos(user._id, token);
     // console.log('Fetched photos in Gallery:', data); // Debug log
      setPhotos(Array.isArray(data) ? data : []);
    } catch (err) {
     // console.error('[Gallery.js] Error al cargar fotos del usuario:', err);
      setPhotos([]);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [token, user?._id]);

  const handleDelete = async (photoId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta foto?')) return;
    try {
      await photoService.deletePhoto(photoId, token);
      fetchPhotos();
    } catch (err) {
     // console.error('[Gallery.js] Error al eliminar foto:', err);
    }
  };

  const handleUpdateDescription = async (photoId, description) => {
    try {
      await photoService.updatePhoto(photoId, { description }, token);
      fetchPhotos();
    } catch (err) {
     // console.error('[Gallery.js] Error al actualizar descripción:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl text-gray-600 mb-4">Mi Galería</h1>
        <PhotoUpload token={token} onUpload={fetchPhotos} />
        <PhotoList
          photos={photos}
          authUser={user}
          onDelete={handleDelete}
          onUpdateDescription={handleUpdateDescription}
        />
      </main>
      <Footer />
    </div>
  );
};

export default Gallery;