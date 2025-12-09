import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Box,
  Tooltip,
} from '@mui/material';
import { Edit, Delete, Restore, Email } from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';

const UserCard = ({ user, onEdit, onDelete, onRestore }) => {
  const { isAdmin, isManager, user: currentUser } = useAuth();

  // Determine if current user can edit/delete this user
  const canEdit =
    isAdmin ||
    (isManager && user.department?._id === currentUser.department?._id) ||
    currentUser._id === user._id;

  const canDelete =
    (isAdmin ||
      (isManager && user.department?._id === currentUser.department?._id)) &&
    currentUser._id !== user._id; // Cannot delete self

  const isDeleted = user.isDeleted;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        opacity: isDeleted ? 0.7 : 1,
        position: 'relative',
      }}
    >
      {isDeleted && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Chip label="Deactivated" color="error" variant="filled" />
        </Box>
      )}
      <CardHeader
        avatar={
          <Avatar
            src={user.profilePicture?.url}
            alt={`${user.firstName} ${user.lastName}`}
            sx={{ bgcolor: 'secondary.main' }}
          >
            {user.firstName[0]}
            {user.lastName[0]}
          </Avatar>
        }
        title={`${user.firstName} ${user.lastName}`}
        subheader={user.position || 'No Position'}
        action={
          <Chip
            label={user.role}
            size="small"
            color={user.role === 'SuperAdmin' ? 'error' : 'primary'}
            variant="outlined"
          />
        }
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Email fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          <strong>Department:</strong> {user.department?.name || 'N/A'}
        </Typography>
        {user.skills && user.skills.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {user.skills.slice(0, 3).map((skill, index) => (
              <Chip key={index} label={skill.name} size="small" />
            ))}
            {user.skills.length > 3 && (
              <Chip label={`+${user.skills.length - 3}`} size="small" />
            )}
          </Box>
        )}
      </CardContent>
      <CardActions disableSpacing sx={{ zIndex: 2 }}>
        {canEdit && !isDeleted && (
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => onEdit(user)}>
              <Edit />
            </IconButton>
          </Tooltip>
        )}
        {canDelete && !isDeleted && (
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => onDelete(user)}>
              <Delete />
            </IconButton>
          </Tooltip>
        )}
        {isDeleted && canDelete && ( // Only admins/managers can restore
          <Tooltip title="Restore">
            <IconButton size="small" color="success" onClick={() => onRestore(user)}>
              <Restore />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};

export default UserCard;
