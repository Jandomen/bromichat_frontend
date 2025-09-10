import defaultProfile from '../assets/default-profile.png';

const getFullImageUrl = (path) => {
  if (!path || path === '') return defaultProfile;
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.REACT_APP_API_BACKEND || '').replace(/\/+$/, '');
  const rel = path.startsWith('/') ? path : `/${path}`;
  return `${base}${rel}`;
};

export default getFullImageUrl;
export { getFullImageUrl };