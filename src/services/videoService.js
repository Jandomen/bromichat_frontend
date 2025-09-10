import axios from 'axios';

const API = `${process.env.REACT_APP_API_BACKEND}/videos`; 

export const uploadVideo = (formData, token) =>
  axios.post(`${API}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });

export const searchVideosByTitle = (title) =>
  axios.get(`${API}/search?title=${encodeURIComponent(title)}`);

export const deleteVideo = (videoId, token) =>
 axios.delete(`${process.env.REACT_APP_API_BACKEND}/videos/delete`, {
  headers: { Authorization: `Bearer ${token}` },
  data: { videoId },
});

  

export const getVideoById = (videoId, token = null) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return axios.get(`${API}/${videoId}`, { headers });
};
