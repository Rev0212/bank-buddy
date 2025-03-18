import React from 'react';
import { Box, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';

const LoanStatusCard = ({ loan }) => {
  // Calculate progress percentage based on loan status
  const getProgress = () => {
    switch (loan.status) {
      case 'Draft': return 10;
      case 'Applied': return 20;
      case 'Document Verification': return 40;
      case 'Processing': return 60;
      case 'Credit Check': return 80;
      case 'Approved': return 100;
      case 'Rejected': return 100;
      case 'Disbursed': return 100;
      default: return 0;
    }
  };

  // Get color based on loan status
  const getStatusColor = () => {
    switch (loan.status) {
      case 'Approved':
      case 'Disbursed':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Processing':
      case 'Credit Check':
      case 'Document Verification':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle1" component="div">
            {loan.loanType}
          </Typography>
          <Chip 
            label={loan.status} 
            size="small"
            color={getStatusColor()}
          />
        </Box>
        
        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
          ₹{loan.amount.toLocaleString()}
        </Typography>
        
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          Applied on {new Date(loan.applicationDate).toLocaleDateString()}
        </Typography>
        
        <Box sx={{ width: '100%', mb: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={getProgress()} 
            color={getStatusColor()}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanStatusCard;