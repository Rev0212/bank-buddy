const express = require('express');
const {
  createLoan,
  getLoans,
  getLoan,
  updateLoan,
  deleteLoan,
  checkEligibility,
  updateLoanStatus
} = require('../controllers/loanController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/check-eligibility', checkEligibility);
router.route('/')
  .get(getLoans)
  .post(createLoan);

router.route('/:id')
  .get(getLoan)
  .put(updateLoan)
  .delete(deleteLoan);

router.put('/:id/status', authorize('admin'), updateLoanStatus);

module.exports = router;