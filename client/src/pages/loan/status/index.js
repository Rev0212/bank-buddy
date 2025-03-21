export { default as PendingStatusPage } from './PendingStatusPage';
export { default as RejectedStatusPage } from './RejectedStatusPage';
export { default as SuccessStatusPage } from './SuccessStatusPage';

// To navigate to pending status
navigate(`/loan/${loanId}/status/pending`);

// To navigate to rejected status
navigate(`/loan/${loanId}/status/rejected`);

// To navigate to success status
navigate(`/loan/${loanId}/status/success`);

// Add these routes to your App.js or routing configuration
