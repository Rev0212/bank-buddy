import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { CheckCircle, Pending, Cancel, Help } from '@mui/icons-material';

const LoanStatusBadge = ({ status }) => {
  // Normalize status to handle case variations
  const normalizedStatus = status?.toLowerCase() || 'unknown';
  
  // Define configs for each status
  const statusConfig = {
    verified: {
      color: '#4caf50',
      bgcolor: 'rgba(76, 175, 80, 0.1)',
      icon: <CheckCircle fontSize="small" />,
      label: 'Verified',
      tooltip: 'This loan has been verified and approved'
    },
    pending: {
      color: '#ff9800',
      bgcolor: 'rgba(255, 152, 0, 0.1)',
      icon: <Pending fontSize="small" />,
      label: 'Pending',
      tooltip: 'This loan is awaiting verification'
    },
    rejected: {
      color: '#f44336',
      bgcolor: 'rgba(244, 67, 54, 0.1)',
      icon: <Cancel fontSize="small" />,
      label: 'Rejected',
      tooltip: 'This loan application was rejected'
    },
    unknown: {
      color: '#9e9e9e',
      bgcolor: 'rgba(158, 158, 158, 0.1)',
      icon: <Help fontSize="small" />,
      label: 'Unknown',
      tooltip: 'Status unknown'
    }
  };
  
  // Get the appropriate config or default to unknown
  const config = statusConfig[normalizedStatus] || statusConfig.unknown;
  
  return (
    <Tooltip title={config.tooltip}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 1,
          px: 1,
          py: 0.5,
          bgcolor: config.bgcolor,
          color: config.color,
          border: `1px solid ${config.color}`
        }}
      >
        {config.icon}
        <Typography variant="body2" sx={{ ml: 0.5, fontWeight: 'medium' }}>
          {config.label}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default LoanStatusBadge;