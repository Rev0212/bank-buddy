import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Button,
  Alert, Divider, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ErrorOutline, DescriptionOutlined, 
  ArrowBack, Cancel, Info
} from '@mui/icons-material';

const RejectedStatusPage = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();
  const [rejectionReasons, setRejectionReasons] = useState([]);
  
  // Mock data - in a real app, fetch this from your API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRejectionReasons([
        "Insufficient income documentation",
        "Credit score below required threshold",
        "Incomplete application details"
      ]);
    }, 500);
  }, [loanId]);

  const viewLoanDetails = () => {
    navigate(`/loan/${loanId}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <ErrorOutline color="error" sx={{ fontSize: 60 }} />
          
          <Typography variant="h4" sx={{ mt: 2, color: 'error.main' }}>
            Loan Application Not Approved
          </Typography>
          
          <Typography variant="body1" sx={{ mt: 2 }}>
            We regret to inform you that your loan application has been rejected.
          </Typography>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reasons for rejection:
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Understanding why can help with future applications
        </Alert>
        
        <List>
          {rejectionReasons.map((reason, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Cancel color="error" />
              </ListItemIcon>
              <ListItemText primary={reason} />
            </ListItem>
          ))}
        </List>
        
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
            View Application Details
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default RejectedStatusPage;