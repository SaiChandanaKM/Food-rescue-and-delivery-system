const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getDonationRequests,
  updateRequestStatus,
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('NGO', 'Needy Person'), createRequest);
router.get('/my-requests', protect, authorize('NGO', 'Needy Person'), getMyRequests);
router.get('/donation/:donationId', protect, authorize('Donor'), getDonationRequests);
router.put('/:id/status', protect, authorize('Donor'), updateRequestStatus);

module.exports = router;
