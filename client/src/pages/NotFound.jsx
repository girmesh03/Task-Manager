import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router';
// import NotFoundImage from '../assets/notFound_404.svg'; // Placeholder

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      {/* <img src={NotFoundImage} alt="404 Not Found" style={{ maxWidth: '100%', height: 'auto', marginBottom: '2rem' }} /> */}
      <Typography variant="h1" color="primary" sx={{ fontWeight: 'bold', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button variant="contained" component={Link} to="/">
        Go Home
      </Button>
    </Box>
  );
};

export default NotFound;
