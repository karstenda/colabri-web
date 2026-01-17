import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useUserProfile } from '../../context/UserOrganizationContext/UserOrganizationProvider';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useTheme } from '@mui/material/styles';

function ProfileMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const userProfile = useUserProfile();
  const theme = useTheme();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditProfile = () => {
    handleClose();
    // TODO: Navigate to edit profile page
    console.log('Edit profile clicked');
  };

  const handleLogout = () => {
    handleClose();
    window.location.href = '/auth/logout';
  };

  if (!userProfile) {
    return <Skeleton variant="circular" width={36} height={36} />;
  } else {
    return (
      <>
        <IconButton
          sx={{
            width: 36,
            height: 36,
            border: `3px solid ${theme.palette.primary.main}`,
            borderRadius: '50%',
          }}
          onClick={handleClick}
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Avatar
            alt={`${userProfile?.firstName} ${userProfile?.lastName}`}
            src={userProfile?.avatarUrl}
            sx={{ width: 28, height: 28 }}
          />
        </IconButton>
        <Menu
          id="profile-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'profile-button',
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEditProfile}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Profile</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </>
    );
  }
}

export default ProfileMenu;
