import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BACKEND,
});

api.interceptors.request.use(
  (config) => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const sendPrivateMessage = (data) =>
  api.post('/messages/send', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const sendGroupMessage = (data) =>
  api.post('/messages/group', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getConversationMessages = (conversationId, page = 1, limit = 20) =>
  api.get(`/messages/conversation/${conversationId}?page=${page}&limit=${limit}`);

export const getGroupMessages = (groupId, page = 1, limit = 20) =>
  api.get(`/messages/group/${groupId}?page=${page}&limit=${limit}`);

export const getConversation = (conversationId) => api.get(`/conversation/${conversationId}`);

export const getUserProfile = (userId) => api.get(`/user/profile/${userId}`);

export const editMessage = (messageId, data) => api.put(`/messages/edit/${messageId}`, data);

export const deleteMessage = (messageId) => api.delete(`/messages/delete/${messageId}`);

export const getUserGroups = () => api.get('/group/groups');

export default api;