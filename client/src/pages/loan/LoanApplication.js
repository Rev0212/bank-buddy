import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const LoanApplication = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Apply for a Loan
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Loan application form will go here
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoanApplication;