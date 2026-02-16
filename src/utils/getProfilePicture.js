import defaultProfile from '../assets/default-profile.png';

const getFullImageUrl = (path) => {
  if (!path || path === '') return defaultProfile;
  if (typeof path === 'string' && (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('/static/media/'))) return path;

  return `${process.env.REACT_APP_API_BACKEND}${path.startsWith('/') ? '' : '/'}${path}`;
};


export { getFullImageUrl };