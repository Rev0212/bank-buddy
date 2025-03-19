import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Grid, Paper, CircularProgress,
  Alert, List, ListItem, ListItemIcon, ListItemText,
  ListItemSecondaryAction, IconButton, Chip
} from '@mui/material';
import {
  FileUpload, CheckCircle, Delete, DocumentScanner,
  Error as ErrorIcon, ArrowForward
} from '@mui/icons-material';

const DocumentUploadStep = ({ loanId, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState({
    aadhaar_card: { file: null, status: 'pending', data: null },
    pan_card: { file: null, status: 'pending', data: null },
    bank_statement: { file: null, status: 'pending', data: null },
    photo_id: { file: null, status: 'pending', data: null }
  });
  
  const documentTypes = [
    { id: 'aadhaar_card', label: 'Aadhaar Card', required: true },
    { id: 'pan_card', label: 'PAN Card', required: true },
    { id: 'bank_statement', label: 'Bank Statement', required: true },
    { id: 'photo_id', label: 'Photo ID (Voter/License)', required: false }
  ];
  
  // Check if all required documents are uploaded
  const checkCompletion = () => {
    const requiredDocTypes = documentTypes.filter(doc => doc.required).map(doc => doc.id);
    const allRequiredUploaded = requiredDocTypes.every(docType => 
      documents[docType].status === 'uploaded' || documents[docType].status === 'verified'
    );
    
    onComplete(allRequiredUploaded);
    return allRequiredUploaded;
  };
  
  // Handle file selection
  const handleFileChange = (docType, event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Update document state
    setDocuments(prev => ({
      ...prev,
      [docType]: {
        ...prev[docType],
        file,
        status: 'selected'
      }
    }));
  };
  
  // Handle file upload
  const handleUpload = async (docType) => {
    const doc = documents[docType];
    if (!doc.file) return;
    
    setLoading(true);
    
    try {
      // Update status to simulate upload
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'uploading'
        }
      }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful upload with mock data
      const mockData = {
        aadhaar_card: {
          name: 'John Doe',
          number: '1234 5678 9012',
          address: '123 Main St, Bangalore, Karnataka',
          dob: '1990-01-01'
        },
        pan_card: {
          name: 'John Doe',
          number: 'ABCDE1234F'
        },
        bank_statement: {
          accountNumber: '1234567890',
          bankName: 'HDFC Bank',
          period: 'Jan 2025 - Mar 2025',
          averageBalance: '85000'
        },
        photo_id: {
          name: 'John Doe',
          idType: 'Voter ID',
          idNumber: 'ABC1234567',
          issueDate: '01-01-2020'
        }
      };
      
      // Update document status
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'uploaded',
          data: mockData[docType]
        }
      }));
      
      // Check if all required documents are now uploaded
      setTimeout(() => {
        checkCompletion();
      }, 500);
      
    } catch (err) {
      console.error("Error uploading document:", err);
      setError(`Failed to upload ${documentTypes.find(d => d.id === docType)?.label}. Please try again.`);
      
      // Update status back to selected
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          ...prev[docType],
          status: 'selected'
        }
      }));
    } finally {
      setLoading(false);
    }
  };
  
  // Handle document removal
  const handleRemoveDocument = (docType) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: {
        file: null,
        status: 'pending',
        data: null
      }
    }));
    
    // Re-check completion
    checkCompletion();
  };
  
  useEffect(() => {
    // Check if any documents are already there
    checkCompletion();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Upload Required Documents
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      <List>
        {documentTypes.map((docType) => (
          <Paper key={docType.id} sx={{ mb: 2 }}>
            <ListItem 
              sx={{ 
                borderLeft: docType.required ? '4px solid #f50057' : '4px solid #9e9e9e',
              }}
            >
              <ListItemIcon>
                <DocumentScanner color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={docType.label} 
                secondary={docType.required ? 'Required' : 'Optional'}
              />
              
              <ListItemSecondaryAction>
                {documents[docType.id].status === 'pending' && (
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FileUpload />}
                  >
                    Select File
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(e) => handleFileChange(docType.id, e)}
                    />
                  </Button>
                )}
                
                {documents[docType.id].status === 'selected' && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {documents[docType.id].file?.name}
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUpload(docType.id)}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Upload'}
                    </Button>
                  </Box>
                )}
                
                {documents[docType.id].status === 'uploading' && (
                  <CircularProgress size={24} />
                )}
                
                {(documents[docType.id].status === 'uploaded' || documents[docType.id].status === 'verified') && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      icon={<CheckCircle />}
                      label={documents[docType.id].status === 'verified' ? 'Verified' : 'Uploaded'}
                      color={documents[docType.id].status === 'verified' ? 'success' : 'primary'}
                      sx={{ mr: 1 }}
                    />
                    <IconButton
                      edge="end"
                      onClick={() => handleRemoveDocument(docType.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </ListItemSecondaryAction>
            </ListItem>
            
            {/* Show extracted data if available */}
            {documents[docType.id].data && (
              <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Extracted Information:
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(documents[docType.id].data).map(([key, value]) => (
                    <Grid item xs={6} key={key}>
                      <Typography variant="caption" component="div" color="textSecondary">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                      </Typography>
                      <Typography variant="body2">
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        ))}
      </List>
      
      {/* Completion Status */}
      {checkCompletion() ? (
        <Alert severity="success" sx={{ mt: 3 }}>
          All required documents uploaded! You can proceed to the next step.
        </Alert>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          Please upload all required documents to continue.
        </Alert>
      )}
    </Box>
  );
};

export default DocumentUploadStep;