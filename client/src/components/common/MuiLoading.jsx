import React from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';

export const LoadingFallback = ({ message = 'Loading...', height = '100vh' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        width: '100%',
      }}
    >
      <CircularProgress size={40} thickness={4} />
      {message && (
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export const BackdropFallback = ({ open = true, message = 'Please wait...' }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: open ? 'flex' : 'none',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress color="primary" />
      {message && (
        <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export const NavigationLoader = () => {
  return (
    <Box sx={{ width: '100%', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
      <LinearProgress color="primary" />
    </Box>
  );
};

export const ContentLoader = ({ height = '400px' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: height,
        width: '100%',
        backgroundColor: 'action.hover',
        borderRadius: 1,
      }}
    >
      <CircularProgress size={30} />
    </Box>
  );
};
