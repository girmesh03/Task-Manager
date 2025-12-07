import React from 'react';
import { useRouteError, useNavigate } from 'react-router';
import { Box, Typography, Button } from '@mui/material';

const RouteError = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error(error);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
        {error.status || 500}
      </Typography>
      <Typography variant="h4" gutterBottom>
        {error.statusText || 'Unexpected Error'}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        {error.data?.message || error.message || 'Something went wrong while loading this page.'}
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
};

export default RouteError;
