import React, { useState } from 'react';
import { 
  Container, Typography, TextField, Button, Box, Paper, 
  Stepper, Step, StepLabel, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../components/common/Logo';

const Register = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    preferredLanguage: 'English'
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const validateForm = () => {
    if (!formData.name) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.mobile || formData.mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    return true;
  };
  
  const handleSubmitDetails = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // For demo, this API call is simulated
      await axios.post('/api/auth/register', formData);
      setActiveStep(1);
      
      // Log for demo
      console.log('✅ Registration details submitted');
      console.log('📱 For demo, any 6-digit OTP or 123456 will work');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      const response = await axios.post('/api/auth/verify-otp', { 
        mobile: formData.mobile, 
        otp,
        isRegistration: true
      });
      
      // Save auth token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Show success and redirect
      console.log('✅ Registration successful!');
      console.log('🔀 Attempting to navigate to dashboard');
      navigate('/dashboard').catch(err => {
        console.error('Navigation error:', err);
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Logo />
          <Typography variant="h4" component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
            Create Account
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Join AI-Bank Buddy today
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
          <Step>
            <StepLabel>Your Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify OTP</StepLabel>
          </Step>
        </Stepper>
        
        {error && <Alert severity="error" sx={{ mb: 3, width: '100%' }}>{error}</Alert>}
        
        {activeStep === 0 ? (
          <Box sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              autoFocus
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="mobile"
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              inputProps={{ maxLength: 10 }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="language-label">Preferred Language</InputLabel>
              <Select
                labelId="language-label"
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                label="Preferred Language"
                onChange={handleInputChange}
              >
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="Hindi">Hindi</MenuItem>
                <MenuItem value="Tamil">Tamil</MenuItem>
                <MenuItem value="Telugu">Telugu</MenuItem>
                <MenuItem value="Kannada">Kannada</MenuItem>
                <MenuItem value="Malayalam">Malayalam</MenuItem>
              </Select>
            </FormControl>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              onClick={handleSubmitDetails}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Continue'}
            </Button>
          </Box>
        ) : (
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" gutterBottom>
              We've sent a verification code to {formData.mobile}
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="OTP Code"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              inputProps={{ maxLength: 6 }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              onClick={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Verify & Create Account'}
            </Button>
            
            {/* Demo helper text */}
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              For demo: Use "123456" as OTP
            </Typography>
          </Box>
        )}
        
        <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
          <Button
            variant="text"
            onClick={() => navigate('/login')}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;