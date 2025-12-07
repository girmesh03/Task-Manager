import React from 'react';
import { Outlet } from 'react-router';
import { Box } from '@mui/material';

const PublicLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </Box>
  );
};

export default PublicLayout;
