import React, { useState } from 'react';
import { 
  Box, Container, Typography, TextField, Button, 
  Paper, CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const OtpVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { mobile } = location.state || { mobile: '' };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // API call would go here
      // For hackathon purposes we'll just simulate success
      setTimeout(() => {
        localStorage.setItem('token', 'dummy-token');
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h5">
            OTP Verification
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
            We have sent a verification code to {mobile || 'your mobile number'}
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              name="otp"
              autoFocus
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              error={!!error}
              helperText={error}
              inputProps={{ maxLength: 6 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
            </Button>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <Button 
                variant="text" 
                size="small"
                onClick={() => navigate('/login')}
              >
                Back to login
              </Button>
              
              <Button variant="text" size="small" disabled={loading}>
                Resend OTP
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default OtpVerification;