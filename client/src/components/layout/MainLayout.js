import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  AppBar, Box, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemIcon, ListItemText,
  Avatar, Menu, MenuItem, Divider, Container, CssBaseline
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Person,
  ExitToApp,
  Receipt,
  AccountBalance,
  Description,
  VideoCall
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import DashboardHeader from '../dashboard/DashboardHeader';

const MainLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Apply for Loan', icon: <AccountBalance />, path: '/loan/apply' },
    { text: 'My Loans', icon: <Receipt />, path: '/loan/history' },
    { text: 'My Documents', icon: <Description />, path: '/documents' },
    { text: 'Video Verification', icon: <VideoCall />, path: '/verification' }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <DashboardHeader user={user} />
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout;