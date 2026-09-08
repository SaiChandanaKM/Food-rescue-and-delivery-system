const Donation = require('../models/Donation');

// @desc    Create a food donation
// @route   POST /api/donations
// @access  Private (Donor only)
const createDonation = async (req, res) => {
  try {
    const { foodName, quantity, cookedTime, storageMethod, location, description, expiryTime } = req.body;

    if (!foodName || !quantity || !cookedTime || !storageMethod || !location) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const donationData = {
      foodName,
      quantity,
      cookedTime,
      storageMethod,
      location,
      description,
      donor: req.user.id,
    };

    if (expiryTime) {
      donationData.expiryTime = expiryTime;
    }

    if (req.imagePath) {
      donationData.image = req.imagePath;
    }

    const donation = await Donation.create(donationData);

    return res.status(201).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private (All roles)
const getDonations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) {
      filter.status = status;
    }

    const donations = await Donation.find(filter)
      .populate('donor', 'name email')
      .populate('claimedBy', 'name email role')
      .sort('-createdAt');

    return res.json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get donations posted by the logged-in Donor
// @route   GET /api/donations/my-donations
// @access  Private (Donor only)
const getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donor: req.user.id })
      .populate('claimedBy', 'name email role')
      .sort('-createdAt');

    return res.json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single donation by ID
// @route   GET /api/donations/:id
// @access  Private
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('claimedBy', 'name email role');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    return res.json({
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    NGO directly claim / accept a donation
// @route   PUT /api/donations/:id/claim
// @access  Private (NGO only)
const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Donation is no longer available' });
    }

    donation.status = 'Accepted';
    donation.claimedBy = req.user.id;
    await donation.save();

    const updatedDonation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('claimedBy', 'name email');

    return res.json({
      success: true,
      data: updatedDonation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark donation as delivered
// @route   PUT /api/donations/:id/deliver
// @access  Private (NGO or Donor)
const deliverDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'Accepted') {
      return res.status(400).json({ success: false, message: 'Donation must be accepted before being delivered' });
    }

    // Check if the user is authorized (either the donor or the NGO who claimed it)
    if (
      donation.donor.toString() !== req.user.id &&
      (!donation.claimedBy || donation.claimedBy.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to mark this donation as delivered',
      });
    }

    donation.status = 'Delivered';
    await donation.save();

    const updatedDonation = await Donation.findById(req.params.id)
      .populate('donor', 'name email')
      .populate('claimedBy', 'name email');

    return res.json({
      success: true,
      data: updatedDonation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getMyDonations,
  getDonationById,
  claimDonation,
  deliverDonation,
};
