const Request = require('../models/Request');
const Donation = require('../models/Donation');

// @desc    Create a request for a donation
// @route   POST /api/requests
// @access  Private (NGO or Needy Person)
const createRequest = async (req, res) => {
  try {
    const { donationId } = req.body;

    if (!donationId) {
      return res.status(400).json({ success: false, message: 'Please provide a donation ID' });
    }

    // Check if donation exists
    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    if (donation.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'This donation is no longer available' });
    }

    // Check if user has already requested this donation
    const alreadyRequested = await Request.findOne({
      donation: donationId,
      requester: req.user.id,
    });

    if (alreadyRequested) {
      return res.status(400).json({ success: false, message: 'You have already requested this donation' });
    }

    const request = await Request.create({
      donation: donationId,
      requester: req.user.id,
      requesterType: req.user.role,
    });

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get requests made by the logged-in user
// @route   GET /api/requests/my-requests
// @access  Private (NGO or Needy Person)
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user.id })
      .populate({
        path: 'donation',
        populate: {
          path: 'donor',
          select: 'name email',
        },
      })
      .sort('-createdAt');

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests for a specific donation
// @route   GET /api/requests/donation/:donationId
// @access  Private (Donor only)
const getDonationRequests = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Verify req.user is the owner of the donation
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view requests for this donation',
      });
    }

    const requests = await Request.find({ donation: req.params.donationId })
      .populate('requester', 'name email role')
      .sort('-createdAt');

    return res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or reject a request
// @route   PUT /api/requests/:id/status
// @access  Private (Donor only)
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status (Approved or Rejected)' });
    }

    const request = await Request.findById(req.params.id).populate('donation');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Verify current user is the donor of this donation
    const donation = await Donation.findById(request.donation._id);
    if (donation.donor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to manage requests for this donation',
      });
    }

    if (donation.status !== 'Available' && status === 'Approved') {
      return res.status(400).json({ success: false, message: 'This donation is already claimed or accepted' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This request has already been processed' });
    }

    request.status = status;
    await request.save();

    if (status === 'Approved') {
      // 1. Mark the donation as Accepted, claimedBy the requester
      donation.status = 'Accepted';
      donation.claimedBy = request.requester;
      await donation.save();

      // 2. Reject all other pending requests for the same donation
      await Request.updateMany(
        {
          donation: donation._id,
          _id: { $ne: request._id },
          status: 'Pending',
        },
        { $set: { status: 'Rejected' } }
      );
    }

    return res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getDonationRequests,
  updateRequestStatus,
};
