import defaultProfile from '../assets/default-profile.png';

const getFullImageUrl = (path) => {
  if (!path || path === '') return defaultProfile;
  return path; 
};


export { getFullImageUrl };