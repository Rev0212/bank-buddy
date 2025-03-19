import React from 'react';
import { 
  Container, Grid, Paper, Typography,
  Card, CardContent, CardActions,
  Button, Box, Chip
} from '@mui/material';
import {
  AttachMoney, CheckCircle,
  Pending, Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Loan Status
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Pending />
              <Typography>Active Applications: 2</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Balance
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoney />
              <Typography>$25,000</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Profile Status
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Person />
              <Chip label="Verified" color="success" icon={<CheckCircle />} />
            </Box>
          </Paper>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              {/* Add your transactions list here */}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/transactions')}>
                View All Transactions
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Loan Applications */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Loan Applications
              </Typography>
              {/* Add your loan applications list here */}
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/loans')}>
                View All Applications
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;