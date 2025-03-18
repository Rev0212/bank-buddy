import axios from 'axios';
import { store } from '../store';
import { loginSuccess } from '../store/slices/authSlice';

// Mock delay to simulate network request
const MOCK_DELAY = 1000;

// Mock user data
const mockUsers = [
  {
    id: '1',
    name: 'Demo User',
    email: 'user@example.com',
    mobile: '9876543210',
    role: 'user',
    preferredLanguage: 'English',
    profileImage: null
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    mobile: '9876543211',
    role: 'admin',
    preferredLanguage: 'English',
    profileImage: null
  }
];

// Mock loan data
const mockLoans = [
  {
    _id: '1001',
    amount: 500000,
    loanType: 'Personal Loan',
    tenure: 36,
    purpose: 'Home renovation',
    status: 'Processing',
    applicationDate: '2025-03-01T10:30:00Z',
    documentVerificationStatus: 'Completed',
    videoVerificationStatus: 'Not Started',
    interestRate: 10.5,
    emi: 16193
  },
  {
    _id: '1002',
    amount: 2500000,
    loanType: 'Home Loan',
    tenure: 180,
    purpose: 'Purchase new home',
    status: 'Document Verification',
    applicationDate: '2025-03-10T14:45:00Z',
    documentVerificationStatus: 'In Progress',
    videoVerificationStatus: 'Not Started',
    interestRate: 8.75,
    emi: 24792
  }
];

// Setup axios mock interceptor
const setupMockApi = () => {
  // Mock OTP for verification
  let sentOtp = null;
  let currentUser = null;

  // Setup axios interceptor for API calls
  axios.interceptors.request.use(config => {
    // Add auth header if token exists
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response interceptor to simulate API
  axios.interceptors.response.use(undefined, async error => {
    // Extract request details
    const { url, method, data: requestData } = error.config;
    
    console.log(`🔄 Simulating API call: ${method.toUpperCase()} ${url}`);

    // Converting string data to object if needed
    let requestBody = {};
    if (requestData && typeof requestData === 'string') {
      try {
        requestBody = JSON.parse(requestData);
      } catch (e) {
        console.error('Failed to parse request data:', e);
      }
    } else if (requestData) {
      requestBody = requestData;
    }

    // Create mock response
    return new Promise(resolve => {
      setTimeout(() => {
        // AUTH ENDPOINTS
        if (url.includes('/api/auth/send-otp')) {
          const { mobile } = requestBody;
          // Generate 6-digit OTP
          sentOtp = Math.floor(100000 + Math.random() * 900000).toString();
          console.log(`📱 Mock OTP sent to ${mobile}: ${sentOtp}`);
          
          resolve({
            data: { 
              success: true, 
              message: `OTP sent to ${mobile}` 
            }
          });
        }
        
        else if (url.includes('/api/auth/verify-otp')) {
          const { mobile, otp } = requestBody;
          
          // For demo, any 6-digit OTP is accepted when real OTP is not set
          const validOtp = sentOtp || '123456';
          
          if (otp === validOtp || otp === '123456') {
            // Find user by mobile or create test user
            currentUser = mockUsers.find(u => u.mobile === mobile) || mockUsers[0];
            
            // Generate mock token
            const token = 'mock-jwt-token-' + Date.now();
            localStorage.setItem('token', token);
            
            // Add this line to update Redux state
            store.dispatch(loginSuccess({ user: currentUser, token }));
            
            resolve({
              data: {
                success: true,
                token,
                user: currentUser
              }
            });
          } else {
            // Invalid OTP
            resolve({
              status: 400,
              data: { 
                success: false, 
                message: 'Invalid OTP' 
              }
            });
          }
        }
        
        else if (url.includes('/api/auth/register')) {
          const { name, email, mobile } = requestBody;
          
          // Check if user already exists
          if (mockUsers.some(u => u.mobile === mobile || u.email === email)) {
            resolve({
              status: 400,
              data: {
                success: false,
                message: 'User with this email or mobile already exists'
              }
            });
            return;
          }
          
          // Create new user
          const newUser = {
            id: `${mockUsers.length + 1}`,
            name,
            email,
            mobile,
            role: 'user',
            preferredLanguage: 'English'
          };
          
          mockUsers.push(newUser);
          
          // Generate and send OTP
          sentOtp = Math.floor(100000 + Math.random() * 900000).toString();
          console.log(`📱 Mock registration OTP sent to ${mobile}: ${sentOtp}`);
          
          resolve({
            data: {
              success: true,
              message: 'OTP sent for registration verification'
            }
          });
        }
        
        else if (url.includes('/api/auth/me')) {
          // Get current user
          resolve({
            data: {
              success: true,
              data: currentUser || mockUsers[0]
            }
          });
        }
        
        // LOAN ENDPOINTS
        else if (url.includes('/api/loan') && method.toLowerCase() === 'get' && !url.includes('/api/loan/')) {
          resolve({
            data: {
              success: true,
              data: mockLoans
            }
          });
        }
        
        else if (url.match(/\/api\/loan\/[^\/]+$/)) {
          // Get single loan
          const loanId = url.split('/').pop();
          const loan = mockLoans.find(l => l._id === loanId);
          
          if (loan) {
            resolve({
              data: {
                success: true,
                data: loan
              }
            });
          } else {
            resolve({
              status: 404,
              data: {
                success: false,
                message: 'Loan not found'
              }
            });
          }
        }
        
        else if (url.includes('/api/loan') && method.toLowerCase() === 'post') {
          // Create new loan
          const { amount, loanType, tenure, purpose } = requestBody;
          
          const newLoan = {
            _id: `${1000 + mockLoans.length + 1}`,
            amount: Number(amount),
            loanType,
            tenure: Number(tenure),
            purpose,
            status: 'Applied',
            applicationDate: new Date().toISOString(),
            documentVerificationStatus: 'Not Started',
            videoVerificationStatus: 'Not Started',
            interestRate: loanType === 'Home Loan' ? 8.5 : 10.5,
            emi: calculateEMI(Number(amount), loanType === 'Home Loan' ? 8.5 : 10.5, Number(tenure))
          };
          
          mockLoans.push(newLoan);
          
          resolve({
            data: {
              success: true,
              data: newLoan
            }
          });
        }
        
        // VIDEO INTERACTION ENDPOINTS
        else if (url.includes('/api/video-interaction') && method.toLowerCase() === 'post') {
          // Create video interaction session
          const sessionId = `session-${Date.now()}`;
          
          resolve({
            data: {
              success: true,
              data: {
                sessionId,
                questions: [
                  {
                    questionId: 'q1',
                    questionText: 'Please state your full name and date of birth',
                    videoPromptUrl: '/videos/prompts/identity_verification.mp4',
                    isAnswered: false
                  },
                  {
                    questionId: 'q2',
                    questionText: 'What is the purpose of your loan application?',
                    videoPromptUrl: '/videos/prompts/loan_purpose.mp4',
                    isAnswered: false
                  },
                  {
                    questionId: 'q3',
                    questionText: 'What is your current monthly income?',
                    videoPromptUrl: '/videos/prompts/income_verification.mp4',
                    isAnswered: false
                  }
                ]
              }
            }
          });
        }
        
        // Default fallback
        else {
          console.log(`🤖 No mock handler for ${url}`);
          resolve({
            status: 200,
            data: {
              success: true,
              message: 'Mock API response',
              data: {}
            }
          });
        }
      }, MOCK_DELAY);
    });
  });
};

// Helper function to calculate EMI
function calculateEMI(principal, ratePerAnnum, tenureInMonths) {
  const ratePerMonth = (ratePerAnnum / 12) / 100;
  return Math.round(
    (principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenureInMonths)) / 
    (Math.pow(1 + ratePerMonth, tenureInMonths) - 1)
  );
}

export default setupMockApi;