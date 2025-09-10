import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import { getFullImageUrl } from '../utils/getProfilePicture';
import defaultProfile from '../assets/default-profile.png';

const MyFriendsList = ({ users = [] }) => {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" textAlign="center">
        No hay amigos para mostrar.
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {users.map((user) => (
          <Grid item xs={6} sm={4} md={3} key={user._id}>
            <Link to={`/user/${user._id}`} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  boxShadow: 1,
                  p: 2,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                <img
                  src={getFullImageUrl(user.profilePicture || defaultProfile)}
                  alt={`${user.username || 'Usuario'}'s profile`}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e0e0e0',
                  }}
                  onError={(e) => {
                   // console.error('Error loading profile picture:', e.target.src);
                    e.target.src = defaultProfile;
                  }}
                />
                <Typography variant="body2" fontWeight="bold" color="text.primary" mt={1}>
                  {user.name || 'Sin nombre'} {user.lastName || ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{user.username || 'Usuario'}
                </Typography>
              </Box>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MyFriendsList;