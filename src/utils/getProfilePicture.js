import defaultProfile from '../assets/default-profile.png';

const getFullImageUrl = (path) => {
  const isInvalid = !path ||
    path === '' ||
    path === 'undefined' ||
    path === 'null' ||
    path === '/Uploads/undefined' ||
    (typeof path === 'string' && path.includes('profile_pictures/default.png'));

  if (isInvalid) return defaultProfile;

  if (typeof path === 'string') {
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:') || path.startsWith('/static/media/')) {
      return path;
    }
  }

  const backendUrl = process.env.REACT_APP_API_BACKEND;
  if (!backendUrl) return (typeof path === 'string' && path.startsWith('http')) ? path : defaultProfile;

  return `${backendUrl}${path.startsWith('/') ? '' : '/'}${path}`;
};

export { getFullImageUrl };