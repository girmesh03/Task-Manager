import { Grid, Typography, Box, CircularProgress } from '@mui/material';
import UserCard from './UserCard';

const UsersList = ({ users, isLoading, onEdit, onDelete, onRestore }) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No users found.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {users.map((user) => (
        <Grid item key={user._id} xs={12} sm={6} md={4} lg={3}>
          <UserCard
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default UsersList;
