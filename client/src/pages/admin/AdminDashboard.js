import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Admin dashboard content will go here
        </Typography>
      </Paper>
    </Container>
  );
};

export default AdminDashboard;