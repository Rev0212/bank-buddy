import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button,
  Paper,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import { 
  ArrowBack,
  CheckCircle,
  Pending,
  Cancel,
  CalendarToday,
  AttachMoney,
  AccountBalance,
  ReceiptLong,
  Feed,
  AccessTime,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import LoanStatusBadge from '../../components/loan/LoanStatusBadge';

const LoanDetails = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  useEffect(() => {
    // Fetch loan details from API or use mock data
    // This is mock data - replace with actual API call
    setTimeout(() => {
      const mockLoan = {
        loanId: loanId || 'L7823459',
        loanType: 'Personal',
        amount: 250000,
        tenure: 12,
        interestRate: 10.5,
        purpose: 'Home Renovation',
        appliedDate: '2025-02-28T10:30:00',
        status: 'verified', // or 'pending' or 'rejected'
        documents: {
          aadhar: { status: 'verified', uploadedOn: '2025-02-28' },
          pan: { status: 'verified', uploadedOn: '2025-02-28' },
          bankStatement: { status: 'verified', uploadedOn: '2025-03-01' }
        },
        videoVerification: {
          status: 'completed',
          completedOn: '2025-03-02'
        },
        timeline: [
          { date: '2025-02-28T10:30:00', status: 'Applied', message: 'Loan application submitted' },
          { date: '2025-03-01T15:20:00', status: 'Documents Verified', message: 'All documents verified successfully' },
          { date: '2025-03-02T11:45:00', status: 'Video Verification', message: 'Video verification completed' },
          { date: '2025-03-03T09:30:00', status: 'Approved', message: 'Loan approved' }
        ]
      };
      
      setLoan(mockLoan);
      setLoading(false);
    }, 1000);
  }, [loanId]);
  
  // Add this useEffect near your other useEffects to handle the automatic status change
  useEffect(() => {
    // Only run this if we have loan data and it's in pending status or
    // we should force it to pending for demo purposes
    if (loan) {
      // Force loan to pending status initially
      setLoan(prevLoan => ({
        ...prevLoan,
        status: 'pending',
        timeline: [
          ...prevLoan.timeline.filter(item => !item.status.includes('Approved')),
          { 
            date: new Date().toISOString(), 
            status: 'Processing', 
            message: 'Application is under review by our team' 
          }
        ]
      }));
      
      // Set a timer to automatically approve after 5 seconds
      const approvalTimer = setTimeout(() => {
        console.log('Auto-approving loan after 5 seconds...');
        setLoan(prevLoan => ({
          ...prevLoan,
          status: 'verified',
          timeline: [
            ...prevLoan.timeline.filter(item => !item.status.includes('Rejected')),
            { 
              date: new Date().toISOString(), 
              status: 'Approved', 
              message: 'Loan has been approved and is ready for disbursal' 
            }
          ]
        }));
      }, 5000); // 5 seconds instead of 10
      
      // Clean up the timer if component unmounts
      return () => clearTimeout(approvalTimer);
    }
  }, [loan?.loanId]); // Only run this when loanId changes or first loads
  
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
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/dashboard')}
          sx={{ mb: 2 }}
        >
          Back to Loans
        </Button>
        <Typography variant="h4" gutterBottom>
          Loan Details
        </Typography>
      </Box>
      
      {/* Loan Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              {loan.loanType} Loan - {loan.loanId}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Applied on {formatDate(loan.appliedDate)}
            </Typography>
          </Box>
          <LoanStatusBadge status={loan.status} />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Loan Amount
            </Typography>
            <Typography variant="h6">
              {formatCurrency(loan.amount)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Tenure
            </Typography>
            <Typography variant="h6">
              {loan.tenure} {loan.tenure === 1 ? 'Month' : 'Months'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body2" color="text.secondary">
              Interest Rate
            </Typography>
            <Typography variant="h6">
              {loan.interestRate}% p.a.
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Purpose
            </Typography>
            <Typography variant="h6">
              {loan.purpose}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Tabs for Details/Timeline */}
      <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Details" />
          <Tab label="Timeline" />
        </Tabs>
      </Box>
      
      {/* Tab Content */}
      {activeTab === 0 ? (
        /* Details Tab */
        <>
          {/* Verification Status */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification Status
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  {loan.documents.aadhar.status === 'verified' ? 
                    <CheckCircle color="success" /> : 
                    <Pending color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Document Verification" 
                  secondary={loan.documents.aadhar.status === 'verified' ? 
                    `Completed on ${formatDate(loan.documents.aadhar.uploadedOn)}` : 
                    "Pending verification"}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  {loan.videoVerification.status === 'completed' ? 
                    <CheckCircle color="success" /> : 
                    <Pending color="warning" />}
                </ListItemIcon>
                <ListItemText 
                  primary="Video Verification" 
                  secondary={loan.videoVerification.status === 'completed' ? 
                    `Completed on ${formatDate(loan.videoVerification.completedOn)}` : 
                    "Pending verification"}
                />
              </ListItem>
            </List>
          </Paper>
          
          {/* EMI Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              EMI Information
            </Typography>
            
            {/* Calculate EMI (simplified) */}
            {(() => {
              const p = loan.amount;
              const r = loan.interestRate / 1200;
              const n = loan.tenure;
              const emi = Math.round(p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1));
              
              return (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Monthly EMI
                    </Typography>
                    <Typography variant="h5" color="primary.main">
                      {formatCurrency(emi)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Repayment Amount
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(emi * n)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Interest
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency((emi * n) - p)}
                    </Typography>
                  </Grid>
                </Grid>
              );
            })()}
          </Paper>

          {/* Replace the Admin Controls Card with status-specific info cards */}
          {loan.status === 'pending' && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#fff8e1', border: '1px solid #ffe082' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Application Under Review
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                Your loan application is currently being reviewed by our team. This typically takes a few minutes.
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={20} sx={{ mr: 1 }} color="warning" />
                <Typography variant="body2" color="text.secondary">
                  Automatic approval in progress...
                </Typography>
              </Box>
            </Paper>
          )}

          {loan.status === 'verified' && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#e8f5e9', border: '1px solid #a5d6a7' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ThumbUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Loan Approved!
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                Congratulations! Your loan application has been approved.
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Next steps:
                </Typography>
                <Typography variant="body2" component="div">
                  <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                    <li>Funds will be disbursed to your registered account within 24 hours</li>
                    <li>You'll receive a confirmation SMS and email when the transfer is complete</li>
                    <li>Your first EMI payment will be due 30 days after disbursal</li>
                  </ul>
                </Typography>
              </Box>
            </Paper>
          )}

          {loan.status === 'rejected' && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: '#ffebee', border: '1px solid #ef9a9a' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ThumbDown color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Application Not Approved
                </Typography>
              </Box>
              
              <Typography variant="body2" paragraph>
                We're sorry, but your loan application couldn't be approved at this time.
              </Typography>
              
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Reason:
                </Typography>
                <Typography variant="body2">
                  Your application does not meet our current eligibility criteria due to insufficient income proof.
                </Typography>
                
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small" 
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/contact')}
                >
                  Contact Support
                </Button>
              </Box>
            </Paper>
          )}
        </>
      ) : (
        /* Timeline Tab */
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Application Timeline
          </Typography>
          
          <Box sx={{ position: 'relative', ml: 2, mt: 2 }}>
            {/* Vertical line */}
            <Box sx={{ 
              position: 'absolute', 
              left: 10, 
              top: 0, 
              bottom: 0, 
              width: 2, 
              bgcolor: 'grey.300', 
              zIndex: 0 
            }} />
            
            {/* Timeline items */}
            {loan.timeline.map((item, index) => (
              <Box key={index} sx={{ position: 'relative', mb: 4, pl: 5 }}>
                {/* Status icon */}
                <Box sx={{ 
                  position: 'absolute', 
                  left: 0,
                  top: 0,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  p: 0.5,
                  zIndex: 1
                }}>
                  {item.status.includes('Applied') && <Feed color="primary" />}
                  {item.status.includes('Documents') && <ReceiptLong color="primary" />}
                  {item.status.includes('Video') && <Feed color="primary" />}
                  {item.status.includes('Approved') && <CheckCircle color="success" />}
                  {item.status.includes('Rejected') && <Cancel color="error" />}
                </Box>
                
                {/* Content */}
                <Typography variant="subtitle1" fontWeight="medium">
                  {item.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {formatDate(item.date)} at {new Date(item.date).toLocaleTimeString()}
                </Typography>
                <Typography variant="body1">
                  {item.message}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default LoanDetails;