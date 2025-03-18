import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, TextField, Button, Box, Paper, 
  Stepper, Step, StepLabel, CircularProgress, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../components/common/Logo';

const Login = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(30);
  
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For the demo, this API call is intercepted by our mock service
      await axios.post('/api/auth/send-otp', { mobile: mobileNumber });
      setOtpSent(true);
      setActiveStep(1);
      
      // Start countdown for OTP resend
      let timeLeft = 30;
      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        setCountdown(timeLeft);
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          setOtpSent(false);
        }
      }, 1000);
      
      // In a real app, show a message about OTP being sent
      console.log('✅ For demo, any 6-digit OTP or 123456 will work');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For demo, this API call is simulated
      // Tip: For demo, any 6-digit OTP or "123456" will work
      const response = await axios.post('/api/auth/verify-otp', { 
        mobile: mobileNumber, 
        otp 
      });
      
      // Save auth token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success message and redirect
      console.log('✅ Login successful!', response.data);
      
      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        console.log('🔀 Attempting to navigate to dashboard');
        navigate('/dashboard').catch(err => {
          console.error('Navigation error:', err);
        });
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - shows demo credentials in console
  useEffect(() => {
    console.log('🚀 Demo Credentials:');
    console.log('📱 User Mobile: 9876543210');
    console.log('📱 Admin Mobile: 9876543211');
    console.log('🔑 Demo OTP: 123456');
  }, []);

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Logo />
          <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
            AI-Bank Buddy
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Secure banking through AI verification
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          <Step>
            <StepLabel>Mobile Number</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify OTP</StepLabel>
          </Step>
        </Stepper>
        
        {error && <Alert severity="error" sx={{ mb: 3, width: '100%' }}>{error}</Alert>}
        
        {activeStep === 0 ? (
          <Box sx={{ width: '100%' }}>
            <TextField
              label="Mobile Number"
              fullWidth
              variant="outlined"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your 10-digit mobile number"
              inputProps={{ maxLength: 10 }}
              sx={{ mb: 3 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={handleSendOTP}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Send OTP'}
            </Button>
            
            {/* Demo helper text */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              For demo: Use any 10-digit number
            </Typography>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <TextField
              label="OTP Code"
              fullWidth
              variant="outlined"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              inputProps={{ maxLength: 6 }}
              sx={{ mb: 3 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              size="large"
              onClick={handleVerifyOTP}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify & Login'}
            </Button>
            
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="text" 
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                Change Number
              </Button>
              
              <Button 
                variant="text" 
                onClick={handleSendOTP}
                disabled={otpSent || loading}
              >
                {otpSent ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
              </Button>
            </Box>
            
            {/* Demo helper text */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              For demo: Use "123456" as OTP
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/register')}
          >
            New user? Register here
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;