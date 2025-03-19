import React from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  Grid, 
  Divider, 
  Avatar,
  Card,
  CardContent
} from '@mui/material';
import { AccountCircle, AccountBalance } from '@mui/icons-material';
import { useSelector } from 'react-redux';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Hardcoded profile data
  const profileData = {
    name: user?.name || 'Rishi Anand',
    email: user?.email || 'rishianand0212@gmail.com',
    mobile: '+91 8778850830',
    gender: 'Male',
    bankName: 'City Union Bank',
    ifscCode: 'CUB0000023',
    branchLocation: 'Nungapakam,Chennai, Tamil Nadu'
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Profile Header */}
        <Box sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          p: 3,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Avatar 
            sx={{ width: 80, height: 80, bgcolor: 'white', color: 'primary.main', mr: 3 }}
          >
            <AccountCircle sx={{ width: 60, height: 60 }} />
          </Avatar>
          <Typography variant="h4" component="h1">
            Profile Information
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Personal Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountCircle sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6" component="h2">
                  Personal Information
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                    {profileData.name}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                    {profileData.email}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mobile Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                    {profileData.mobile}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Gender
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                    {profileData.gender}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Bank Information */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccountBalance sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6" component="h2">
                  Bank Details
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bank Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                    {profileData.bankName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    IFSC Code
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium', mb: 2 }}>
                    {profileData.ifscCode}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Branch Location
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {profileData.branchLocation}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;