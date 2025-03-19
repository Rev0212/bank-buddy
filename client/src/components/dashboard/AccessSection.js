import React from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Box 
} from '@mui/material';
import { 
  AccountBalance,
  Payment,
  Timeline,
  Insights
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AccessSection = () => {
  const navigate = useNavigate();

  const accessItems = [
    {
      title: 'Account Overview',
      icon: <AccountBalance fontSize="large" color="primary" />,
      path: '/account',
      description: 'View your account details and balance'
    },
    {
      title: 'Make Payment',
      icon: <Payment fontSize="large" color="primary" />,
      path: '/payments',
      description: 'Transfer funds and make payments'
    },
    {
      title: 'Transaction History',
      icon: <Timeline fontSize="large" color="primary" />,
      path: '/transactions',
      description: 'View your transaction history'
    },
    {
      title: 'Financial Insights',
      icon: <Insights fontSize="large" color="primary" />,
      path: '/insights',
      description: 'Get AI-powered financial insights'
    }
  ];

  return (
    <Grid container spacing={3}>
      {accessItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              '&:hover': { boxShadow: 6 }
            }}
          >
            <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
              <Box sx={{ mb: 2 }}>
                {item.icon}
              </Box>
              <Typography gutterBottom variant="h6" component="h2">
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
              <Button 
                fullWidth 
                variant="contained" 
                onClick={() => navigate(item.path)}
              >
                Access
              </Button>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default AccessSection;