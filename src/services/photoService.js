import api from './api';
import axios from 'axios';

const photoService = {
  getUserPhotos: async (userId, token) => {
    let cancelTokenSource = axios.CancelToken.source();
    try {
      const res = await api.get(`/gallery/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cancelToken: cancelTokenSource.token,
      });
     // console.log('Raw API response in getUserPhotos:', res.data); 
      cancelTokenSource = null;
      if (Array.isArray(res.data)) {
        return res.data;
      } else if (res.data && Array.isArray(res.data.photos)) {
        return res.data.photos;
      }
      return [];
    } catch (err) {
      if (axios.isCancel(err)) {
       // console.log('Request canceled:', err.message);
      } else {
       // console.error('[photoService] Error al obtener fotos:', err);
      }
      cancelTokenSource = null;
      return [];
    }
  },

  uploadPhoto: async (formData, token) => {
    try {
      const res = await api.post('/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
     // console.log('Uploaded photo response:', res.data); 
      return res.data;
    } catch (err) {
     // console.error('[photoService] Error al subir foto:', err);
      throw err;
    }
  },

  deletePhoto: async (photoId, token) => {
    try {
      const res = await api.delete(`/gallery/${photoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     // console.log('Delete photo response:', res.data); 
      return res.data;
    } catch (err) {
     // console.error('[photoService] Error al eliminar foto:', err);
      throw err;
    }
  },

  updatePhoto: async (photoId, updateData, token) => {
    try {
      const res = await api.put(`/gallery/${photoId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
     // console.log('Update photo response:', res.data); 
      return res.data;
    } catch (err) {
     // console.error('[photoService] Error al actualizar foto:', err);
      throw err;
    }
  },
};

export default photoService;