import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const DocumentUpload = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Document Upload
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Document upload interface will go here
        </Typography>
      </Paper>
    </Container>
  );
};

export default DocumentUpload;