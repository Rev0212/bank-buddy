import React from 'react';
import { 
  Box, Typography, Paper, Divider, 
  Stack, Chip, Grid, List, ListItem, 
  ListItemIcon, ListItemText
} from '@mui/material';
import {
  CheckCircle, Cancel, AttachMoney, CalendarMonth,
  Description, Videocam, Home, BusinessCenter, Category
} from '@mui/icons-material';

const LoanReviewStep = ({ loanData, documentsCompleted, videoCompleted }) => {
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculate EMI (simple calculation for demo)
  const calculateEMI = () => {
    const principal = parseFloat(loanData.amount);
    const ratePerAnnum = loanData.loanType === 'Home Loan' ? 8.5 : 10.5;
    const ratePerMonth = (ratePerAnnum / 12) / 100;
    const tenureInMonths = parseInt(loanData.tenure);
    
    const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenureInMonths)) / 
      (Math.pow(1 + ratePerMonth, tenureInMonths) - 1);
    
    return Math.round(emi);
  };
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Review Your Application
      </Typography>
      <Typography variant="body1" paragraph>
        Please review all the details of your loan application before submission.
      </Typography>
      
      {/* Verification Status */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Verification Status
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Chip
            icon={documentsCompleted ? <CheckCircle /> : <Cancel />}
            label="Document Verification"
            color={documentsCompleted ? "success" : "error"}
            variant="outlined"
          />
          <Chip
            icon={videoCompleted ? <CheckCircle /> : <Cancel />}
            label="Video Verification"
            color={videoCompleted ? "success" : "error"}
            variant="outlined"
          />
        </Stack>
      </Paper>
      
      {/* Loan Basic Details */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Loan Details
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon>
                  <Category fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Loan Type" 
                  secondary={loanData.loanType || 'Personal Loan'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Loan Amount" 
                  secondary={formatCurrency(loanData.amount || 0)} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CalendarMonth fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Tenure" 
                  secondary={`${loanData.tenure || 0} months`} 
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List dense disablePadding>
              <ListItem>
                <ListItemIcon>
                  <BusinessCenter fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Purpose" 
                  secondary={loanData.purpose || 'Not specified'} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Interest Rate" 
                  secondary={`${loanData.loanType === 'Home Loan' ? 8.5 : 10.5}% p.a.`} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <AttachMoney fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary="Estimated Monthly EMI" 
                  secondary={formatCurrency(calculateEMI())} 
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Documents Submitted */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Documents Submitted
        </Typography>
        {documentsCompleted ? (
          <List dense disablePadding>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Aadhaar Card" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="PAN Card" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Bank Statement" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <CheckCircle fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText primary="Photo ID" />
            </ListItem>
          </List>
        ) : (
          <Typography variant="body2" color="error">
            Document verification is incomplete. Please complete the document upload step before submission.
          </Typography>
        )}
      </Paper>
      
      {/* Video Verification */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Video Verification
        </Typography>
        {videoCompleted ? (
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">Identity verification completed</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">Address verification completed</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle color="success" sx={{ mr: 1 }} fontSize="small" />
              <Typography variant="body2">Document authenticity verified</Typography>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="error">
            Video verification is incomplete. Please complete the video verification step before submission.
          </Typography>
        )}
      </Paper>
      
      {/* Terms & Conditions */}
      <Paper elevation={0} variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Terms & Conditions
        </Typography>
        <Typography variant="body2" paragraph>
          By submitting this application, you confirm that all the information provided is accurate and complete. The bank reserves the right to reject applications with incomplete or incorrect information.
        </Typography>
        <Typography variant="body2">
          Processing time is typically 2-3 business days once all verifications are complete. Interest rates are subject to change based on the bank's policies and your credit score.
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoanReviewStep;
