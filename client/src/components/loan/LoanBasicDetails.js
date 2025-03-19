import React from 'react';
import {
  Box, TextField, MenuItem, FormControl, InputLabel,
  Select, Grid, Typography, InputAdornment, Slider,
  FormHelperText
} from '@mui/material';

const loanTypes = [
  { value: 'Personal Loan', label: 'Personal Loan' },
  { value: 'Home Loan', label: 'Home Loan' },
  { value: 'Car Loan', label: 'Car Loan' },
  { value: 'Education Loan', label: 'Education Loan' },
  { value: 'Business Loan', label: 'Business Loan' },
];

const loanPurposes = {
  'Personal Loan': [
    'Debt Consolidation',
    'Home Improvement',
    'Medical Expenses',
    'Wedding Expenses',
    'Travel',
    'Other Personal Expenses'
  ],
  'Home Loan': [
    'Purchase New Home',
    'Home Construction',
    'Home Renovation',
    'Land Purchase',
    'Balance Transfer'
  ],
  'Car Loan': [
    'New Car Purchase',
    'Used Car Purchase',
    'Refinancing'
  ],
  'Education Loan': [
    'Undergraduate Studies',
    'Postgraduate Studies',
    'Vocational Training',
    'Study Abroad'
  ],
  'Business Loan': [
    'Working Capital',
    'Business Expansion',
    'Equipment Purchase',
    'Inventory Financing',
    'Debt Refinancing'
  ]
};

const LoanBasicDetails = ({ loanData, setLoanData }) => {
  // Calculate EMI (simplified formula)
  const calculateEMI = () => {
    const p = parseFloat(loanData.amount) || 0;
    const r = 10 / 1200; // Assuming 10% interest rate converted to monthly
    const n = parseInt(loanData.tenure) || 1;
    
    if (!p) return 0;
    
    const emi = p * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoanData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle loan type change (to update purpose options)
  const handleLoanTypeChange = (e) => {
    setLoanData(prev => ({
      ...prev,
      loanType: e.target.value,
      purpose: '' // Reset purpose when loan type changes
    }));
  };
  
  // Handle slider change
  const handleSliderChange = (name, value) => {
    setLoanData(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Enter Loan Details
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Loan Amount"
            name="amount"
            value={loanData.amount}
            onChange={handleChange}
            fullWidth
            required
            type="number"
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
            helperText="Enter the amount you wish to borrow"
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <FormControl fullWidth required>
            <InputLabel>Loan Type</InputLabel>
            <Select
              name="loanType"
              value={loanData.loanType}
              onChange={handleLoanTypeChange}
              label="Loan Type"
            >
              {loanTypes.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Tenure (in months): {loanData.tenure}
            </Typography>
            <Slider
              value={loanData.tenure}
              onChange={(_, value) => handleSliderChange('tenure', value)}
              valueLabelDisplay="auto"
              step={6}
              marks
              min={6}
              max={60}
            />
          </Box>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Loan Purpose</InputLabel>
            <Select
              name="purpose"
              value={loanData.purpose}
              onChange={handleChange}
              label="Loan Purpose"
            >
              {(loanPurposes[loanData.loanType] || []).map(purpose => (
                <MenuItem key={purpose} value={purpose}>
                  {purpose}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estimated Monthly EMI:
            </Typography>
            <Typography variant="h4">
              ₹{calculateEMI().toLocaleString()}
            </Typography>
            <Typography variant="caption">
              This is an estimate based on 10% interest rate. Actual EMI may vary.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoanBasicDetails;