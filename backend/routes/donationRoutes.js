const express = require('express');
const router = express.Router();
const {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  claimDonation,
  deliverDonation,
} = require('../controllers/donationController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { upload, handleImageUpload } = require('../middleware/uploadMiddleware');

router
  .route('/')
  .post(protect, authorize('Donor'), upload.single('image'), handleImageUpload, createDonation)
  .get(protect, getDonations);

router.get('/my-donations', protect, authorize('Donor'), getMyDonations);

router.get('/:id', protect, getDonationById);
router.put('/:id/claim', protect, authorize('NGO'), claimDonation);
router.put('/:id/deliver', protect, authorize('Donor', 'NGO'), deliverDonation);

module.exports = router;
