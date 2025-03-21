import React from 'react';
import { 
  Container, Box, Typography, Paper, Button,
  CircularProgress
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DescriptionOutlined, ArrowBack } from '@mui/icons-material';

const PendingStatusPage = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();

  const viewLoanDetails = () => {
    navigate(`/loan/${loanId}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ mb: 3 }} />
        
        <Typography variant="h4" sx={{ mt: 2 }}>
          Loan Application Under Review
        </Typography>
        
        <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
          Your loan application is currently being reviewed by our team. 
          This process typically takes 1-2 business days. We'll notify you 
          once there's an update.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button 
            variant="contained"
            startIcon={<DescriptionOutlined />}
            onClick={viewLoanDetails}
            sx={{ mx: 1 }}
          >
            View Loan Details
          </Button>
          
          <Button 
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/dashboard')}
            sx={{ mx: 1 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default PendingStatusPage;