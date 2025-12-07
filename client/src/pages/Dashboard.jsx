import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const Dashboard = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Total Tasks
            </Typography>
            <Typography variant="h3" component="div">
              0
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Pending Tasks
            </Typography>
            <Typography variant="h3" component="div">
              0
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 200 }}>
            <Typography variant="h6" gutterBottom>
              Completed Tasks
            </Typography>
            <Typography variant="h3" component="div">
              0
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
