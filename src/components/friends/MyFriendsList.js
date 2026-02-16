import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import { getFullImageUrl } from '../utils/getProfilePicture';
import defaultProfile from '../assets/default-profile.png';

const MyFriendsList = ({ users = [], onlineUsers = new Set() }) => {
  if (!Array.isArray(users) || users.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" textAlign="center">
        No hay amigos para mostrar.
      </Typography>
    );
  }

  // Ensure onlineUsers is always treated as a Set for performance
  const onlineSet = onlineUsers instanceof Set ? onlineUsers : new Set(onlineUsers);

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {users.map((user) => {
          const isOnline = onlineSet.has(user._id?.toString() || user._id);

          return (
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
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    },
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={getFullImageUrl(user.profilePicture)}
                      alt={`${user.username || 'Usuario'}'s profile`}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: isOnline ? '3px solid #4CAF50' : '2px solid #e0e0e0',
                        transition: 'border 0.3s ease'
                      }}
                      onError={(e) => {
                        e.target.src = defaultProfile;
                      }}
                    />
                    {isOnline && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 5,
                          right: 5,
                          width: 16,
                          height: 16,
                          bgcolor: '#4CAF50',
                          borderRadius: '50%',
                          border: '2px solid white',
                          boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                          animation: 'pulse 2s infinite'
                        }}
                      />
                    )}
                  </div>
                  <Typography variant="body2" fontWeight="bold" color="text.primary" mt={1}>
                    {user.name || 'Sin nombre'} {user.lastName || ''}
                  </Typography>
                  <Typography variant="caption" color={isOnline ? 'success.main' : 'text.secondary'} fontWeight={isOnline ? 'bold' : 'normal'}>
                    {isOnline ? 'En línea' : `@${user.username || 'Usuario'}`}
                  </Typography>
                </Box>
              </Link>
            </Grid>
          );
        })}
      </Grid>
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
          100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
        }
      `}</style>
    </Box>
  );
};

export default MyFriendsList;