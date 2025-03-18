import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Paper, Typography, Button, Box, 
  Card, CardContent, CardActions, Chip, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, Divider,
  Avatar, LinearProgress
} from '@mui/material';
import { 
  VideoCall, ArrowForward,
  AttachMoney, Warning, CheckCircle,
  Pending, Person, Description, Upload, Assignment
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardHeader from '../../components/dashboard/DashboardHeader';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [activeLoan, setActiveLoan] = useState(null);
  const [pendingActions, setPendingActions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('📊 Fetching dashboard data');
        
        // For demo, check if user exists in localStorage
        const userJson = localStorage.getItem('user');
        const storedUser = userJson ? JSON.parse(userJson) : null;
        
        if (storedUser) {
          setUser(storedUser);
          console.log('👤 User found in localStorage:', storedUser);
        } else {
          // Mock user for demo if none exists
          console.log('👤 No user in localStorage, using mock user');
          setUser({
            name: 'Demo User',
            email: 'user@example.com',
            mobile: '9876543210'
          });
        }
        
        // In a hackathon, you can use mocked data or actual API calls
        const userResponse = await axios.get('/api/auth/me');
        const loansResponse = await axios.get('/api/loan');
        
        setUser(userResponse.data.data);
        setLoans(loansResponse.data.data);
        
        // Set active loan (most recent non-closed loan)
        const activeLoans = loansResponse.data.data.filter(
          loan => loan.status !== 'Closed' && loan.status !== 'Rejected'
        );
        
        if (activeLoans.length > 0) {
          setActiveLoan(activeLoans.sort((a, b) => 
            new Date(b.applicationDate) - new Date(a.applicationDate)
          )[0]);
          
          // Set pending actions based on active loan
          const actions = [];
          if (activeLoans[0].documentVerificationStatus === 'Not Started') {
            actions.push({ 
              id: 'upload_docs',
              title: 'Upload Required Documents', 
              priority: 'high',
              path: `/loan/${activeLoans[0]._id}/documents`,
              icon: <Upload />
            });
          }
          
          if (activeLoans[0].videoVerificationStatus === 'Not Started') {
            actions.push({ 
              id: 'video_verify',
              title: 'Complete Video Verification', 
              priority: 'high',
              path: `/loan/${activeLoans[0]._id}/video-verification`,
              icon: <VideoCall />
            });
          }
          
          if (activeLoans[0].status === 'Applied' && 
              activeLoans[0].documentVerificationStatus === 'Completed' &&
              activeLoans[0].videoVerificationStatus === 'Completed') {
            actions.push({
              id: 'wait_approval',
              title: 'Waiting for Approval',
              priority: 'medium',
              path: `/loan/${activeLoans[0]._id}`,
              icon: <Pending />
            });
          }
          
          setPendingActions(actions);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handler for applying for a new loan
  const handleApplyLoan = () => {
    navigate('/loan/apply');
  };

  // Handler for viewing loan details
  const handleViewLoan = (loanId) => {
    navigate(`/loan/${loanId}`);
  };

  // Handler for starting video verification
  const handleStartVideoVerification = () => {
    if (activeLoan) {
      navigate(`/loan/${activeLoan._id}/video-verification`);
    }
  };

  // Handler for uploading documents
  const handleUploadDocuments = () => {
    if (activeLoan) {
      navigate(`/loan/${activeLoan._id}/documents`);
    }
  };

  // Handler for viewing profile
  const handleViewProfile = () => {
    navigate('/profile');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <DashboardHeader user={user} />
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{ width: 56, height: 56, bgcolor: 'primary.dark', mr: 2 }}
                >
                  {user?.name?.charAt(0) || 'U'}
                </Avatar>
                <Box>
                  <Typography variant="h5" component="div">
                    Welcome back, {user?.name || 'User'}!
                  </Typography>
                  <Typography variant="body1">
                    Let's manage your loan applications
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ ml: { xs: 0, sm: 'auto' }, mt: { xs: 2, sm: 0 } }}>
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={handleApplyLoan}
                  startIcon={<AttachMoney />}
                  sx={{ fontWeight: 'bold' }}
                >
                  Apply for Loan
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Active Loan Status */}
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
              elevation={3}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Active Loan Application
              </Typography>
              {activeLoan ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {activeLoan.loanType} - ₹{activeLoan.amount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Applied on: {new Date(activeLoan.applicationDate).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Chip 
                        label={activeLoan.status} 
                        color={
                          activeLoan.status === 'Approved' ? 'success' : 
                          activeLoan.status === 'Rejected' ? 'error' : 'primary'
                        }
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {activeLoan.status === 'Processing' && 'Your application is being reviewed'}
                        {activeLoan.status === 'Document Verification' && 'We are verifying your documents'}
                        {activeLoan.status === 'Credit Check' && 'Credit assessment in progress'}
                        {activeLoan.status === 'Approved' && 'Congratulations! Your loan is approved'}
                        {activeLoan.status === 'Rejected' && activeLoan.rejectionReason}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>Application Progress</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={
                        activeLoan.status === 'Applied' ? 20 :
                        activeLoan.status === 'Document Verification' ? 40 :
                        activeLoan.status === 'Credit Check' ? 60 :
                        activeLoan.status === 'Processing' ? 80 :
                        activeLoan.status === 'Approved' ? 100 : 0
                      } 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      color="primary"
                      endIcon={<ArrowForward />}
                      onClick={() => handleViewLoan(activeLoan._id)}
                    >
                      View Details
                    </Button>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body1" align="center" gutterBottom>
                    You don't have any active loan applications
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AttachMoney />}
                    onClick={handleApplyLoan}
                    sx={{ mt: 2 }}
                  >
                    Apply Now
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Pending Actions */}
          <Grid item xs={12} md={5}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
                overflow: 'auto',
              }}
              elevation={3}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Pending Actions
              </Typography>
              {pendingActions.length > 0 ? (
                <List sx={{ width: '100%' }}>
                  {pendingActions.map((action) => (
                    <React.Fragment key={action.id}>
                      <ListItem
                        button
                        onClick={() => navigate(action.path)}
                        sx={{
                          border: '1px solid',
                          borderColor: 
                            action.priority === 'high' ? 'error.light' : 
                            action.priority === 'medium' ? 'warning.light' : 'info.light',
                          borderRadius: 1,
                          mb: 1,
                        }}
                      >
                        <ListItemIcon>
                          {action.icon || <Assignment />}
                        </ListItemIcon>
                        <ListItemText
                          primary={action.title}
                          secondary={
                            action.priority === 'high' ? 'High Priority' : 
                            action.priority === 'medium' ? 'Medium Priority' : 'Normal Priority'
                          }
                        />
                        <ArrowForward fontSize="small" />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography variant="body1" align="center">
                    {activeLoan ? 'No pending actions at the moment!' : 'Apply for a loan to get started'}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
          
          {/* Quick Access */}
          <Grid item xs={12}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Quick Access
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card elevation={2} sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <VideoCall fontSize="large" color="primary" />
                    <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                      Video Verification
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                      size="small" 
                      onClick={handleStartVideoVerification}
                      disabled={!activeLoan || activeLoan.videoVerificationStatus === 'Completed'}
                    >
                      Start Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card elevation={2} sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Upload fontSize="large" color="primary" />
                    <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                      Upload Documents
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                      size="small" 
                      onClick={handleUploadDocuments}
                      disabled={!activeLoan}
                    >
                      Upload
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card elevation={2} sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Person fontSize="large" color="primary" />
                    <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                      My Profile
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button size="small" onClick={handleViewProfile}>
                      View
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
              
              <Grid item xs={6} sm={3}>
                <Card elevation={2} sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    <Description fontSize="large" color="primary" />
                    <Typography variant="h6" component="div" sx={{ mt: 1 }}>
                      Loan History
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                    <Button 
                      size="small" 
                      onClick={() => navigate('/loan/history')}
                    >
                      View All
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Recent Loan Applications */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }} elevation={3}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Recent Loan Applications
              </Typography>
              {loans.length > 0 ? (
                <Box sx={{ overflow: 'auto', maxHeight: 300 }}>
                  <List>
                    {loans.slice(0, 5).map((loan) => (
                      <React.Fragment key={loan._id}>
                        <ListItem button onClick={() => handleViewLoan(loan._id)}>
                          <ListItemIcon>
                            {loan.status === 'Approved' && <CheckCircle color="success" />}
                            {loan.status === 'Rejected' && <Warning color="error" />}
                            {loan.status !== 'Approved' && loan.status !== 'Rejected' && <Pending color="primary" />}
                          </ListItemIcon>
                          <ListItemText
                            primary={`${loan.loanType} - ₹${loan.amount.toLocaleString()}`}
                            secondary={`Applied on: ${new Date(loan.applicationDate).toLocaleDateString()} • Status: ${loan.status}`}
                          />
                          <ArrowForward fontSize="small" />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ py: 2 }}>
                  No loan applications found. Start by applying for a loan.
                </Typography>
              )}
              {loans.length > 5 && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button 
                    onClick={() => navigate('/loan/history')} 
                    endIcon={<ArrowForward />}
                  >
                    View All
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;