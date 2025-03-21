import React, { useState, useEffect } from 'react';
import { 
  Container, Box, Typography, Paper, Button, Stepper, 
  Step, StepLabel, CircularProgress, Alert, Divider
} from '@mui/material';
import { 
  NavigateNext, ArrowBack, 
  FileUpload, Videocam, ArticleOutlined, CheckCircle 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import your components
import LoanBasicDetails from '../../components/loan/LoanBasicDetails';
import DocumentUploadStep from '../../components/loan/DocumentUploadStep';
import VideoVerificationStep from '../../pages/verification/VideoVerificationStep';
import LoanReviewStep from '../../components/loan/LoanReviewStep';

const LoanApplication = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loanData, setLoanData] = useState({
    amount: '',
    loanType: 'Personal Loan',
    tenure: 12,
    purpose: '',
    // Add more fields as needed
  });
  const [loanId, setLoanId] = useState(null);
  const [documentsCompleted, setDocumentsCompleted] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  
  const navigate = useNavigate();
  
  // Define steps
  const steps = [
    { label: 'Basic Details', icon: <ArticleOutlined /> },
    { label: 'Document Upload', icon: <FileUpload /> },
    { label: 'Video Verification', icon: <Videocam /> },
    { label: 'Review & Submit', icon: <CheckCircle /> }
  ];
  
  // Handle next button
  const handleNext = async () => {
    if (activeStep === 0) {
      // Submit basic loan details and create loan application
      await saveLoanBasicDetails();
    } else {
      setActiveStep(prevStep => prevStep + 1);
    }
  };
  
  // Handle back button
  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };
  
  // Save basic loan details
  const saveLoanBasicDetails = async () => {
    // Validate form
    if (!loanData.amount || !loanData.purpose) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // For demo, create a mock loan ID
      const mockLoanId = 'LOAN-' + Date.now();
      setLoanId(mockLoanId);
      
      console.log('Creating loan application with data:', loanData);
      
      // For a real app, you'd make an API call here
      // const response = await axios.post('/api/loan', loanData);
      // setLoanId(response.data.data._id);
      
      // Move to next step
      setActiveStep(prevStep => prevStep + 1);
    } catch (err) {
      console.error('Error creating loan application:', err);
      setError('Failed to create loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle document step completion
  const handleDocumentsComplete = (isComplete) => {
    setDocumentsCompleted(isComplete);
    if (isComplete) {
      setActiveStep(2); // Move to video verification step
    }
  };
  
  // Handle video verification completion
  const handleVideoComplete = (isComplete) => {
    setVideoCompleted(isComplete);
    if (isComplete) {
      setActiveStep(3); // Move to review step
    }
  };
  
  // Handle final submission
  const handleSubmitApplication = async () => {
    setLoading(true);
    
    try {
      // For demo, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Loan application submitted successfully!');
      
      // Navigate to loan details page
      navigate(`/loan/${loanId}`);
    } catch (err) {
      setError('Failed to submit application. Please try again.');
      console.error('Error submitting application:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Render step content
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <LoanBasicDetails 
            loanData={loanData} 
            setLoanData={setLoanData} 
          />
        );
      case 1:
        return (
          <DocumentUploadStep 
            loanId={loanId} 
            onComplete={handleDocumentsComplete} 
          />
        );
      case 2:
        return (
          <VideoVerificationStep 
            loanId={loanId} 
            onComplete={handleVideoComplete} 
          />
        );
      case 3:
        return (
          <LoanReviewStep 
            loanData={loanData} 
            documentsCompleted={documentsCompleted}
            videoCompleted={videoCompleted}
          />
        );
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Apply for a Loan
        </Typography>
        <Typography variant="body1" paragraph>
          Complete the following steps to apply for your loan.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel StepIconComponent={() => (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {step.icon}
                </Box>
              )}>
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Step Content */}
        {getStepContent(activeStep)}
        
        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate('/dashboard') : handleBack}
            disabled={loading}
          >
            {activeStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          
          <Button
            variant="contained"
            color={activeStep === 3 ? "success" : "primary"}
            onClick={activeStep === 3 ? handleSubmitApplication : handleNext}
            disabled={loading || (activeStep === 1 && !documentsCompleted) || (activeStep === 2 && !videoCompleted)}
            startIcon={activeStep === 3 ? <CheckCircle /> : <NavigateNext />}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              activeStep === 3 ? 'Submit Application' : 'Continue'
            )}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoanApplication;