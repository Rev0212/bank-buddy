import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, IconButton, Avatar, 
  Box, Menu, MenuItem, ListItemIcon, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon, Person, Logout, Settings, Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ user, toggleDrawer }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear local storage or session storage
    localStorage.removeItem('token');
    // Redirect to login page
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        {toggleDrawer && (
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <DashboardIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ flexGrow: 1 }}
        >
          AI-Bank Manager
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="body1" 
            sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}
          >
            {user?.name || 'User'}
          </Typography>
          
          <Tooltip title="Account settings">
            <IconButton onClick={handleMenu} size="small" sx={{ p: 0 }}>
              <Avatar 
                alt={user?.name || 'User'} 
                src={user?.profileImage}
                sx={{ width: 40, height: 40 }}
              >
                {user?.name?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
        
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleProfile}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={handleSettings}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default DashboardHeader;