import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Grid,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { useCreateUserMutation, useUpdateUserMutation } from '../../services/userApi';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ROLES = ['SuperAdmin', 'Admin', 'Manager', 'User'];

const UserForm = ({ user, onSuccess, onCancel }) => {
  const isEditMode = !!user;
  const { user: currentUser, isAdmin, isManager } = useAuth();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'User',
      position: '',
      phone: '',
      departmentId: currentUser?.department?._id || '', // Default to current user's dept
      skills: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  const [createUser, { isLoading: isCreating, error: createError }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating, error: updateError }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('email', user.email);
      setValue('role', user.role);
      setValue('position', user.position || '');
      setValue('phone', user.phone || '');
      setValue('departmentId', user.department?._id || user.department || '');
      setValue('skills', user.skills || []);
    }
  }, [user, setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        const { password, ...updateData } = data; // Don't send password on update unless handled specifically
        await updateUser({ userId: user._id, ...updateData }).unwrap();
        toast.success('User updated successfully');
      } else {
        await createUser(data).unwrap();
        toast.success('User created successfully');
      }
      onSuccess();
    } catch (err) {
      console.error('Form submission failed:', err);
    }
  };

  const isLoading = isCreating || isUpdating;
  const error = createError || updateError;
  const errorMessage = error?.data?.message || 'Operation failed. Please check your input.';

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="First Name"
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            {...register('firstName', {
              required: 'First name is required',
              maxLength: { value: 20, message: 'Max 20 characters' },
            })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            required
            fullWidth
            label="Last Name"
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            {...register('lastName', {
              required: 'Last name is required',
              maxLength: { value: 20, message: 'Max 20 characters' },
            })}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Email Address"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
          />
        </Grid>
        {!isEditMode && (
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Password"
              type="password"
              error={!!errors.password}
              helperText={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Min 8 characters' },
              })}
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <TextField
            select
            required
            fullWidth
            label="Role"
            defaultValue="User"
            error={!!errors.role}
            helperText={errors.role?.message}
            {...register('role', { required: 'Role is required' })}
            disabled={!isAdmin && !isManager} // Only Admins/Managers can set role?
          >
            {ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Position"
            {...register('position')}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone"
            {...register('phone', {
              pattern: {
                value: /^\+[1-9]\d{1,14}$/,
                message: 'Invalid E.164 phone number',
              },
            })}
          />
        </Grid>

        {/* Department ID Field (Temporary until Phase 3) */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Department ID"
            {...register('departmentId', { required: 'Department is required' })}
            disabled={!isAdmin} // Managers can only create in own dept (defaulted)
            helperText="Enter Department ID (Phase 3 will add selection)"
          />
        </Grid>

        {/* Skills Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle1" gutterBottom>
            Skills
          </Typography>
          {fields.map((field, index) => (
            <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <TextField
                size="small"
                label="Skill Name"
                {...register(`skills.${index}.name`, { required: true })}
                sx={{ flexGrow: 1 }}
              />
              <TextField
                size="small"
                label="Proficiency (0-100)"
                type="number"
                {...register(`skills.${index}.proficiency`, {
                  min: 0,
                  max: 100,
                  valueAsNumber: true
                })}
                sx={{ width: 100 }}
              />
              <IconButton onClick={() => remove(index)} color="error">
                <Delete />
              </IconButton>
            </Box>
          ))}
          <Button
            startIcon={<Add />}
            onClick={() => append({ name: '', proficiency: 50 })}
            size="small"
          >
            Add Skill
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Update' : 'Create')}
        </Button>
      </Box>
    </Box>
  );
};

export default UserForm;
