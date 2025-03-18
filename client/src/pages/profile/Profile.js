import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const Profile = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Profile content will go here
        </Typography>
      </Paper>
    </Container>
  );
};

export default Profile;