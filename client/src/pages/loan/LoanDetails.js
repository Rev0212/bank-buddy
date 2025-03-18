import React from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';

const LoanDetails = () => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Loan Details
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          Loan details will go here
        </Typography>
      </Paper>
    </Container>
  );
};

export default LoanDetails;