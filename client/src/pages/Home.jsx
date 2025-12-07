import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router';

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to Task Manager
        </Typography>
        <Typography variant="h5" component="h2" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          A powerful multi-tenant SaaS solution for managing your tasks efficiently.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" size="large" component={Link} to="/login">
            Login
          </Button>
          <Button variant="outlined" size="large" component={Link} to="/register">
            Register
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
