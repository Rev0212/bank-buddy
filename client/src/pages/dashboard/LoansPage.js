import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoanList from '../../components/loan/LoanList';

const LoansPage = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch loans from API or use mock data
    // This is mock data - replace with actual API call
    setTimeout(() => {
      const mockLoans = [
        {
          loanId: 'L7823459',
          loanType: 'Personal',
          amount: 250000,
          tenure: 12,
          interestRate: 10.5,
          purpose: 'Home Renovation',
          appliedDate: '2025-02-28T10:30:00',
          status: 'verified'
        },
        {
          loanId: 'L7823460',
          loanType: 'Education',
          amount: 500000,
          tenure: 24,
          interestRate: 8.75,
          purpose: 'Higher Education',
          appliedDate: '2025-03-10T14:15:00',
          status: 'pending'
        },
        {
          loanId: 'L7823461',
          loanType: 'Vehicle',
          amount: 350000,
          tenure: 36,
          interestRate: 9.25,
          purpose: 'Two-wheeler purchase',
          appliedDate: '2025-03-05T09:45:00',
          status: 'rejected'
        }
      ];
      
      setLoans(mockLoans);
      setLoading(false);
    }, 1000);
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Your Loan Applications</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<Add />}
          onClick={() => navigate('/apply-loan')}
        >
          Apply for Loan
        </Button>
      </Box>
      
      <Paper sx={{ p: 3 }}>
        <LoanList loans={loans} loading={loading} error={error} />
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Need Help?
          </Typography>
          <Typography variant="body1">
            Contact our loan specialists for assistance with your loan applications or to discuss your options.
          </Typography>
          <Button variant="outlined" sx={{ mt: 2 }}>
            Contact Support
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoansPage;