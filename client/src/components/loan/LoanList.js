import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  CircularProgress,
  Alert
} from '@mui/material';
import LoanCard from './LoanCard';

const LoanList = ({ loans, loading, error }) => {
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Filter loans based on selected status
  const filteredLoans = statusFilter === 'all' 
    ? loans 
    : loans.filter(loan => loan.status.toLowerCase() === statusFilter);
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }
  
  if (!loans || loans.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No loans found. Apply for a loan to see it here.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Your Loans</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Loans</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {filteredLoans.length === 0 ? (
        <Alert severity="info">
          No loans match the selected filter.
        </Alert>
      ) : (
        filteredLoans.map((loan) => (
          <LoanCard key={loan.loanId} loan={loan} />
        ))
      )}
    </Box>
  );
};

export default LoanList;