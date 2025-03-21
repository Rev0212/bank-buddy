import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Divider,
  Grid,
  Chip
} from '@mui/material';
import { 
  AccountBalance, 
  CalendarToday, 
  AttachMoney,
  Timer
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoanStatusBadge from './LoanStatusBadge';

const LoanCard = ({ loan }) => {
  const navigate = useNavigate();
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };
  
  return (
    <Paper 
      sx={{ 
        p: 3, 
        mb: 2,
        position: 'relative',
        borderLeft: '4px solid',
        borderColor: loan.status === 'verified' ? '#4caf50' : 
                    loan.status === 'pending' ? '#ff9800' : '#f44336'
      }}
      elevation={1}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={9}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccountBalance color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" component="h2">
              {loan.loanType || 'Personal'} Loan - {loan.loanId}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AttachMoney fontSize="small" color="action" />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                {formatCurrency(loan.amount)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Timer fontSize="small" color="action" />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                {loan.tenure} {loan.tenure === 1 ? 'Month' : 'Months'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="body1" sx={{ ml: 0.5 }}>
                Applied on {formatDate(loan.appliedDate)}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 1.5 }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {loan.purpose && (
              <Chip 
                label={`Purpose: ${loan.purpose}`} 
                size="small" 
                variant="outlined" 
              />
            )}
            {loan.interestRate && (
              <Chip 
                label={`Interest: ${loan.interestRate}%`} 
                size="small" 
                variant="outlined" 
              />
            )}
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, justifyContent: 'space-between' }}>
          <LoanStatusBadge status={loan.status} />
          
          <Button 
            variant="outlined"
            size="small"
            onClick={() => navigate(`/loans/${loan.loanId}`)}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            View Details
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoanCard;

<Route path="/loan/history" element={<LoanHistory />} />