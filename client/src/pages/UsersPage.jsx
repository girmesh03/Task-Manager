import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import UsersList from '../components/users/UsersList';
import UserForm from '../components/users/UserForm'; // Will be created next
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useRestoreUserMutation,
} from '../services/userApi';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [openForm, setOpenForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { isAdmin, isManager } = useAuth();

  const { data, isLoading } = useGetUsersQuery({
    page,
    limit: 12,
    search,
    role: roleFilter,
    includeDeleted,
  });

  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleRoleChange = (event) => {
    setRoleFilter(event.target.value);
    setPage(1);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setOpenForm(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteUser(userToDelete._id).unwrap();
      toast.success('User deleted successfully');
      setOpenDeleteDialog(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete user');
    }
  };

  const handleRestoreClick = async (user) => {
    try {
      await restoreUser(user._id).unwrap();
      toast.success('User restored successfully');
    } catch (err) {
      console.error('Restore failed:', err);
      toast.error('Failed to restore user');
    }
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedUser(null);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        {(isAdmin || isManager) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateUser}
          >
            Add User
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          label="Search Users"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="Filter by Role"
          variant="outlined"
          size="small"
          value={roleFilter}
          onChange={handleRoleChange}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All Roles</MenuItem>
          <MenuItem value="SuperAdmin">Super Admin</MenuItem>
          <MenuItem value="Admin">Admin</MenuItem>
          <MenuItem value="Manager">Manager</MenuItem>
          <MenuItem value="User">User</MenuItem>
        </TextField>
        {(isAdmin || isManager) && (
          <FormControlLabel
            control={
              <Switch
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
              />
            }
            label="Show Deactivated"
          />
        )}
      </Box>

      <UsersList
        users={data?.data?.users}
        isLoading={isLoading}
        onEdit={handleEditUser}
        onDelete={handleDeleteClick}
        onRestore={handleRestoreClick}
      />

      {data?.data?.pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={data.data.pagination.pages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}

      {/* User Form Dialog */}
      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <UserForm
            user={selectedUser}
            onSuccess={handleFormClose}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {userToDelete?.firstName}{' '}
            {userToDelete?.lastName}? This action will deactivate the account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UsersPage;
