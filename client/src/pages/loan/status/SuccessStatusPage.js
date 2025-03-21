import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Button,
  Chip, Divider, Grid, CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, DescriptionOutlined, 
  ArrowBack, LocalAtm, AccessTime, Event
} from '@mui/icons-material';

const SuccessStatusPage = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mock data - in a real app, fetch this from your API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoanDetails({
        amount: 250000,
        interestRate: 8.5,
        tenure: 36,
        emi: 7860,
        disbursalDate: '2025-03-25',
        accountNumber: 'XXXXXXX4587'
      });
      setLoading(false);
    }, 800);
  }, [loanId]);

  const viewLoanDetails = () => {
    navigate(`/loan/${loanId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center', py: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading loan details...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 60 }} />
          
          <Typography variant="h4" sx={{ mt: 2, color: 'success.main' }}>
            Loan Approved!
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 2 }}>
            Congratulations! Your loan application has been approved and is ready for disbursal.
          </Typography>
          
          <Chip 
            label="APPROVED" 
            color="success" 
            variant="outlined" 
            sx={{ mt: 2, fontSize: '1rem', px: 1 }} 
          />
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" sx={{ mb: 3 }}>
          Loan Summary:
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <LocalAtm color="primary" sx={{ mb: 1, fontSize: 30 }} />
              <Typography variant="body2" color="text.secondary">Loan Amount</Typography>
              <Typography variant="h6">₹{loanDetails.amount.toLocaleString()}</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <AccessTime color="primary" sx={{ mb: 1, fontSize: 30 }} />
              <Typography variant="body2" color="text.secondary">Tenure</Typography>
              <Typography variant="h6">{loanDetails.tenure} months</Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Event color="primary" sx={{ mb: 1, fontSize: 30 }} />
              <Typography variant="body2" color="text.secondary">Disbursal Date</Typography>
              <Typography variant="h6">{loanDetails.disbursalDate}</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          The approved loan amount will be disbursed to your account {loanDetails.accountNumber} within the next 24 hours.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          
          <Button 
            variant="contained"
            startIcon={<DescriptionOutlined />}
            onClick={viewLoanDetails}
          >
            View Complete Details
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SuccessStatusPage;