import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Grid, Paper, Button, Box, Stepper, Step, 
  StepLabel, Chip, CircularProgress, Alert, FormControl, InputLabel, 
  Select, MenuItem, TextField
} from '@mui/material';
import {
  Upload as UploadIcon, 
  Description, 
  CheckCircleOutline,
  ErrorOutline,
  Refresh
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const DocumentUpload = () => {
  const { id: loanId } = useParams();
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [documents, setDocuments] = useState({
    'Aadhaar Card': { file: null, status: 'pending', number: '' },
    'PAN Card': { file: null, status: 'pending', number: '' },
    'Bank Statement': { file: null, status: 'pending', number: '' },
    'Photo ID': { file: null, status: 'pending', number: '' }
  });
  const [currentDocument, setCurrentDocument] = useState('Aadhaar Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingStatus, setProcessingStatus] = useState({});
  
  const documentTypes = ['Aadhaar Card', 'PAN Card', 'Bank Statement', 'Photo ID'];
  
  useEffect(() => {
    // Fetch previously uploaded documents if any
    const fetchDocuments = async () => {
      try {
        const response = await axios.get(`/api/document?loan=${loanId}`);
        
        // Update local state with existing documents
        const existingDocs = response.data.data || [];
        const updatedDocuments = { ...documents };
        
        existingDocs.forEach(doc => {
          if (updatedDocuments[doc.documentType]) {
            updatedDocuments[doc.documentType] = {
              ...updatedDocuments[doc.documentType],
              status: doc.verificationStatus.toLowerCase(),
              number: doc.documentNumber,
              fileUrl: doc.filePath,
              id: doc._id
            };
          }
        });
        
        setDocuments(updatedDocuments);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    
    if (loanId) {
      fetchDocuments();
    }
  }, [loanId]);
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments({
        ...documents,
        [currentDocument]: { 
          ...documents[currentDocument],
          file,
          status: 'ready'
        }
      });
      
      // Reset messages
      setError('');
      setSuccess('');
    }
  };
  
  const handleNumberChange = (e) => {
    const { value } = e.target;
    setDocuments({
      ...documents,
      [currentDocument]: {
        ...documents[currentDocument],
        number: value
      }
    });
  };
  
  const handleDocumentSelect = (event) => {
    setCurrentDocument(event.target.value);
    // Reset messages
    setError('');
    setSuccess('');
  };
  
  const handleUpload = async () => {
    const docInfo = documents[currentDocument];
    
    if (!docInfo.file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!docInfo.number) {
      setError(`Please enter the ${currentDocument} number`);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setProcessingStatus({ status: 'uploading' });
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', docInfo.file);
      formData.append('documentType', currentDocument);
      formData.append('documentNumber', docInfo.number);
      if (loanId) formData.append('loan', loanId);
      
      // Upload to your server
      const uploadResponse = await axios.post('/api/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setProcessingStatus({ status: 'processing' });
      
      // Now send to Python service for OCR processing
      const formDataForPython = new FormData();
      formDataForPython.append('document', docInfo.file);
      formDataForPython.append('doc_type', currentDocument.toLowerCase().replace(' ', '_'));
      
      const ocrResponse = await axios.post('http://localhost:8000/api/verify-document', formDataForPython, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Check verification result
      const verified = ocrResponse.data.verified;
      const extractedData = ocrResponse.data.extracted_data;
      
      // Update status based on verification
      const newStatus = verified ? 'verified' : 'rejected';
      setDocuments({
        ...documents,
        [currentDocument]: {
          ...documents[currentDocument],
          status: newStatus,
          fileUrl: uploadResponse.data.filePath,
          extractedData
        }
      });
      
      setProcessingStatus({ 
        status: 'completed', 
        success: verified,
        data: extractedData
      });
      
      if (verified) {
        setSuccess(`${currentDocument} has been verified successfully!`);
        
        // Check if all required documents are uploaded
        const allUploaded = documentTypes.every(
          docType => documents[docType].status === 'verified' || 
                     documents[docType].status === 'processing'
        );
        
        if (allUploaded) {
          // Optional: Move to next step
          setTimeout(() => {
            setActiveStep(prevStep => prevStep + 1);
          }, 2000);
        }
      } else {
        setError(`Verification failed for ${currentDocument}. Please try again.`);
      }
      
    } catch (error) {
      console.error('Document upload error:', error);
      setError('Failed to upload document. Please try again.');
      setProcessingStatus({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real app, this would trigger a comprehensive verification
      // For demo, we'll just simulate success after delay
      setTimeout(() => {
        setActiveStep(2);
        setSuccess('All documents have been successfully verified!');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error verifying all documents:', error);
      setError('Failed to complete verification. Please try again.');
      setLoading(false);
    }
  };
  
  const handleProceedToVideo = () => {
    navigate(`/loan/${loanId}/video-verification`);
  };
  
  const renderDocumentStatus = (docType) => {
    const doc = documents[docType];
    
    if (doc.status === 'verified') {
      return (
        <Chip 
          icon={<CheckCircleOutline />} 
          label="Verified" 
          color="success" 
          size="small" 
        />
      );
    } else if (doc.status === 'rejected') {
      return (
        <Chip 
          icon={<ErrorOutline />} 
          label="Rejected" 
          color="error" 
          size="small" 
        />
      );
    } else if (doc.status === 'processing') {
      return (
        <Chip 
          label="Processing" 
          color="warning" 
          size="small" 
        />
      );
    } else if (doc.file) {
      return (
        <Chip 
          label="Ready to upload" 
          color="primary" 
          size="small" 
        />
      );
    } else {
      return (
        <Chip 
          label="Pending" 
          color="default" 
          size="small" 
          variant="outlined"
        />
      );
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Document Verification
        </Typography>
        <Typography variant="body1" paragraph>
          Please upload the required documents for verification. 
          We use secure AI technology to process and verify your documents in real-time.
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          <Step>
            <StepLabel>Upload Documents</StepLabel>
          </Step>
          <Step>
            <StepLabel>Verify Information</StepLabel>
          </Step>
          <Step>
            <StepLabel>Complete</StepLabel>
          </Step>
        </Stepper>
        
        {activeStep === 0 && (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Required Documents
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {documentTypes.map((docType) => (
                      <Box 
                        key={docType}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1,
                          borderBottom: '1px solid #eee'
                        }}
                      >
                        <Typography variant="body2">{docType}</Typography>
                        {renderDocumentStatus(docType)}
                      </Box>
                    ))}
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth
                    disabled={
                      !documentTypes.every(type => 
                        documents[type].status === 'verified' || 
                        documents[type].file !== null
                      )
                    }
                    onClick={() => setActiveStep(1)}
                  >
                    Proceed to Verification
                  </Button>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Upload Document
                  </Typography>
                  
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                  )}
                  
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
                  )}
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="document-type-label">Document Type</InputLabel>
                    <Select
                      labelId="document-type-label"
                      value={currentDocument}
                      onChange={handleDocumentSelect}
                      label="Document Type"
                    >
                      {documentTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <TextField
                    fullWidth
                    label={`${currentDocument} Number`}
                    value={documents[currentDocument].number}
                    onChange={handleNumberChange}
                    margin="normal"
                    variant="outlined"
                    sx={{ mb: 3 }}
                  />
                  
                  <Box 
                    sx={{ 
                      border: '2px dashed #ccc',
                      borderRadius: 1,
                      p: 3,
                      textAlign: 'center',
                      mb: 3,
                      backgroundColor: '#f9f9f9'
                    }}
                  >
                    {documents[currentDocument].file ? (
                      <Box>
                        <Typography variant="body1" gutterBottom>
                          {documents[currentDocument].file.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {(documents[currentDocument].file.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                        <Button 
                          variant="outlined"
                          color="primary"
                          startIcon={<Refresh />}
                          onClick={() => document.getElementById('document-upload').click()}
                          size="small"
                          sx={{ mt: 1 }}
                        >
                          Change File
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <UploadIcon sx={{ fontSize: 48, color: '#aaa', mb: 1 }} />
                        <Typography variant="body1" gutterBottom>
                          Drag & drop your file here or click to browse
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Supported formats: PDF, JPG, PNG (max 10MB)
                        </Typography>
                        <Button 
                          variant="outlined"
                          sx={{ mt: 2 }}
                          onClick={() => document.getElementById('document-upload').click()}
                        >
                          Select File
                        </Button>
                      </Box>
                    )}
                    <input
                      type="file"
                      id="document-upload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<Description />}
                    disabled={!documents[currentDocument].file || !documents[currentDocument].number || loading}
                    onClick={handleUpload}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Upload & Verify Document'}
                  </Button>
                  
                  {processingStatus.status === 'processing' && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <CircularProgress size={30} />
                      <Typography variant="body2">
                        Processing your document with OCR...
                      </Typography>
                    </Box>
                  )}
                  
                  {processingStatus.status === 'completed' && processingStatus.success && (
                    <Box sx={{ mt: 2, p: 2, border: '1px solid #c8e6c9', bgcolor: '#f1f8e9', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Extracted Information:
                      </Typography>
                      <Grid container spacing={1}>
                        {processingStatus.data && Object.entries(processingStatus.data).map(([key, value]) => (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2">
                              <strong>{key.replace('_', ' ')}:</strong> {value}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
        
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Verify Document Information
            </Typography>
            <Typography variant="body2" paragraph>
              Please confirm that the information extracted from your documents is accurate.
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            )}
            
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Document Summary:
              </Typography>
              
              <Grid container spacing={2}>
                {documentTypes.map((docType) => (
                  <Grid item xs={12} md={6} key={docType}>
                    <Paper
                      variant="outlined"
                      sx={{ 
                        p: 2,
                        borderColor: documents[docType].status === 'verified' ? 'success.light' : 
                                     documents[docType].status === 'rejected' ? 'error.light' : 'grey.300'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2">{docType}</Typography>
                        {renderDocumentStatus(docType)}
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Number: {documents[docType].number || 'N/A'}
                      </Typography>
                      
                      {documents[docType].extractedData && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            Extracted data:
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {Object.entries(documents[docType].extractedData).map(([key, value]) => (
                              <span key={key}>
                                {key}: {value}<br/>
                              </span>
                            ))}
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button 
                variant="outlined"
                onClick={() => setActiveStep(0)}
              >
                Back to Upload
              </Button>
              
              <Button 
                variant="contained"
                color="primary"
                onClick={handleVerifyAll}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Confirm & Continue'}
              </Button>
            </Box>
          </Box>
        )}
        
        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircleOutline sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            
            <Typography variant="h5" gutterBottom>
              Documents Successfully Verified!
            </Typography>
            
            <Typography variant="body1" paragraph>
              All your documents have been successfully verified. You can now proceed to the video verification step.
            </Typography>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleProceedToVideo}
              sx={{ mt: 2 }}
            >
              Continue to Video Verification
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default DocumentUpload;