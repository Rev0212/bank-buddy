import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import store from './store';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OtpVerification from './pages/auth/OtpVerification';

// User Pages
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import LoanApplication from './pages/loan/LoanApplication';
import LoanDetails from './pages/loan/LoanDetails';
import VideoVerificationStep from './pages/verification/VideoVerificationStep';
import DocumentUpload from './pages/verification/DocumentUpload';
import AdminDashboard from './pages/admin/AdminDashboard';
import NotFound from './pages/NotFound';

// Route Protection
import ProtectedRoute from './components/routing/ProtectedRoute';
import AdminRoute from './components/routing/AdminRoute';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OtpVerification />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected routes for authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/loan/apply" element={<LoanApplication />} />
              <Route path="/loan/:id" element={<LoanDetails />} />
              <Route path="/loan/:id/video-verification" element={<VideoVerificationStep />} />
              <Route path="/loan/:id/documents" element={<DocumentUpload />} />
              
            </Route>
            
            {/* Protected routes for admin users */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/loans" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
