import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import DonationCard from '../components/DonationCard';
import { Package, Truck, HandHeart, CheckCircle, AlertTriangle, Users, ExternalLink, RefreshCw, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-main text-app-main p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      {user.role === 'Donor' && <DonorDashboard user={user} />}
      {user.role === 'NGO' && <NgoDashboard user={user} />}
      {user.role === 'Needy Person' && <NeedyDashboard user={user} />}
    </div>
  );
};

/* ==========================================
   DONOR DASHBOARD
   ========================================== */
const DonorDashboard = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsMap, setRequestsMap] = useState({}); // donationId -> [requests]
  const [expandedDonationId, setExpandedDonationId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchDonorData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations/my-donations');
      setDonations(res.data.data);
    } catch (err) {
      console.error('Error fetching donor donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  const toggleRequests = async (donationId) => {
    if (expandedDonationId === donationId) {
      setExpandedDonationId(null);
      return;
    }

    setExpandedDonationId(donationId);
    if (!requestsMap[donationId]) {
      try {
        const res = await api.get(`/requests/donation/${donationId}`);
        setRequestsMap({
          ...requestsMap,
          [donationId]: res.data.data,
        });
      } catch (err) {
        console.error('Error fetching donation requests:', err);
      }
    }
  };

  const handleRequestStatus = async (requestId, donationId, status) => {
    setActionLoadingId(requestId);
    try {
      await api.put(`/requests/${requestId}/status`, { status });
      // Refresh requests for this donation
      const res = await api.get(`/requests/donation/${donationId}`);
      setRequestsMap({
        ...requestsMap,
        [donationId]: res.data.data,
      });
      // Refresh all donations to update status
      const resDonations = await api.get('/donations/my-donations');
      setDonations(resDonations.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update request');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeliver = async (donationId) => {
    setActionLoadingId(donationId);
    try {
      await api.put(`/donations/${donationId}/deliver`);
      // Refresh donor donations list
      const res = await api.get('/donations/my-donations');
      setDonations(res.data.data);
      alert('Handover confirmed! Status changed to Delivered.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm handover');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Stats
  const totalListed = donations.length;
  const activeCount = donations.filter((d) => d.status === 'Available').length;
  const acceptedCount = donations.filter((d) => d.status === 'Accepted').length;
  const deliveredCount = donations.filter((d) => d.status === 'Delivered').length;

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome, {user.name}</h1>
          <p className="text-app-muted mt-1">Manage your food donations and claims</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchDonorData}
            className="p-2.5 rounded-lg bg-app-card border border-app-main hover:bg-app-secondary text-app-muted"
            title="Refresh Data"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <Link
            to="/post-donation"
            className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md transition-all hover:-translate-y-0.5"
          >
            <span>Post Surplus Food</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-app-card border border-app-main p-5 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-app-muted text-xs font-semibold uppercase tracking-wider">Total Listed</span>
            <Package className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">{totalListed}</div>
        </div>
        <div className="bg-app-card border border-app-main p-5 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-app-muted text-xs font-semibold uppercase tracking-wider">Available</span>
            <HandHeart className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">{activeCount}</div>
        </div>
        <div className="bg-app-card border border-app-main p-5 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-app-muted text-xs font-semibold uppercase tracking-wider">Claimed/Accepted</span>
            <Users className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">{acceptedCount}</div>
        </div>
        <div className="bg-app-card border border-app-main p-5 rounded-2xl shadow-sm transition-colors duration-300">
          <div className="flex justify-between items-center mb-3">
            <span className="text-app-muted text-xs font-semibold uppercase tracking-wider">Delivered</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-500">{deliveredCount}</div>
        </div>
      </div>

      {/* Donations List */}
      <h2 className="text-xl font-bold mb-5 flex items-center space-x-2 text-slate-800 dark:text-white">
        <span>Your Food Listings</span>
        <span className="text-xs font-semibold bg-app-secondary text-app-muted px-2.5 py-0.5 rounded-full">{donations.length}</span>
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-app-muted text-sm">Loading your donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-app-card border border-app-main rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
          <Package className="h-12 w-12 text-app-muted mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No food listed yet</h3>
          <p className="text-app-muted text-sm mt-1 max-w-sm">List your surplus food to connect with NGOs and local communities in need.</p>
          <Link to="/post-donation" className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">
            Post First Donation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div key={donation._id} className="flex flex-col">
              <DonationCard donation={donation} />
              
              {/* Request Queue Section */}
              <div className="mt-3 bg-app-card border border-app-main rounded-xl overflow-hidden shadow-sm transition-colors duration-300">
                {donation.status === 'Accepted' && (
                  <button
                    onClick={() => handleDeliver(donation._id)}
                    disabled={actionLoadingId === donation._id}
                    className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex justify-center items-center space-x-2 border-b border-app-main"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Confirm Handover / Delivery</span>
                  </button>
                )}

                <button
                  onClick={() => toggleRequests(donation._id)}
                  className="w-full flex justify-between items-center px-4 py-3 text-xs font-bold text-app-muted hover:bg-app-secondary hover:text-app-main transition-colors"
                >
                  <span>REQUEST QUEUE</span>
                  <span className="flex items-center space-x-1.5 bg-app-secondary text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {donation.status !== 'Available' ? 'CLAIMED' : 'VIEW CLAIMS'}
                  </span>
                </button>

                {expandedDonationId === donation._id && (
                  <div className="border-t border-app-main p-4 bg-app-secondary/40 max-h-60 overflow-y-auto space-y-3">
                    {!requestsMap[donation._id] ? (
                      <p className="text-app-muted text-xs animate-pulse text-center py-2">Loading requests...</p>
                    ) : requestsMap[donation._id].length === 0 ? (
                      <p className="text-app-muted text-xs text-center py-2 italic">No claims or requests yet</p>
                    ) : (
                      requestsMap[donation._id].map((reqItem) => (
                        <div key={reqItem._id} className="bg-app-card border border-app-main p-3 rounded-lg flex flex-col justify-between gap-3 text-xs">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-app-main font-bold">{reqItem.requester.name}</p>
                              <p className="text-app-muted text-[10px] uppercase font-bold tracking-wider">{reqItem.requesterType}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              reqItem.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                              reqItem.status === 'Rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' : 
                              'bg-app-secondary text-app-muted border border-app-main'
                            }`}>
                              {reqItem.status}
                            </span>
                          </div>

                          {reqItem.status === 'Pending' && donation.status === 'Available' && (
                            <div className="flex gap-2">
                              <button
                                disabled={actionLoadingId === reqItem._id}
                                onClick={() => handleRequestStatus(reqItem._id, donation._id, 'Approved')}
                                className="flex-1 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold text-white transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                disabled={actionLoadingId === reqItem._id}
                                onClick={() => handleRequestStatus(reqItem._id, donation._id, 'Rejected')}
                                className="flex-1 py-1.5 rounded bg-app-secondary hover:bg-slate-200 dark:hover:bg-slate-800 text-[10px] font-bold text-app-muted border border-app-main transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================
   NGO DASHBOARD
   ========================================== */
const NgoDashboard = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimLoadingId, setClaimLoadingId] = useState(null);

  const fetchNgoData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations?status=Available');
      setDonations(res.data.data);
    } catch (err) {
      console.error('Error fetching NGO donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, []);

  const handleClaim = async (donationId) => {
    setClaimLoadingId(donationId);
    try {
      await api.put(`/donations/${donationId}/claim`);
      // Update locally
      setDonations(donations.filter((d) => d._id !== donationId));
      alert('Food claimed successfully! Check "My Deliveries" tab to manage transport.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim donation');
    } finally {
      setClaimLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Available Food Listings</h1>
          <p className="text-app-muted mt-1">Claim surplus food from local donors to distribute</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNgoData}
            className="p-2.5 rounded-lg bg-app-card border border-app-main hover:bg-app-secondary text-app-muted flex items-center space-x-1.5 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <Link
            to="/pickups"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md text-sm text-center flex items-center space-x-2"
          >
            <Truck className="h-4 w-4" />
            <span>My Deliveries</span>
          </Link>
        </div>
      </div>

      {/* Available food listings */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-app-muted text-sm">Searching for food donations...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-app-card border border-app-main rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
          <Package className="h-12 w-12 text-app-muted mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No food available right now</h3>
          <p className="text-app-muted text-sm mt-1 max-w-sm">All posted food donations have been claimed or expired. Check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard
              key={donation._id}
              donation={donation}
              actionText="Accept & Claim Food"
              actionLoading={claimLoadingId === donation._id}
              onAction={handleClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ==========================================
   NEEDY PERSON DASHBOARD
   ========================================== */
const NeedyDashboard = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoadingId, setRequestLoadingId] = useState(null);

  const fetchNeedyData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations?status=Available');
      setDonations(res.data.data);
    } catch (err) {
      console.error('Error fetching needy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeedyData();
  }, []);

  const handleRequest = async (donationId) => {
    setRequestLoadingId(donationId);
    try {
      await api.post('/requests', { donationId });
      alert('Request submitted! Donors will review and approve safety protocols. Check "My Requests" tab.');
      // Update local listing
      setDonations(donations.filter((d) => d._id !== donationId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setRequestLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Food Aid Offerings</h1>
          <p className="text-app-muted mt-1">Browse and request fresh food listings posted in your area</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchNeedyData}
            className="p-2.5 rounded-lg bg-app-card border border-app-main hover:bg-app-secondary text-app-muted flex items-center space-x-1.5 text-sm font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <Link
            to="/my-requests"
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md text-sm text-center flex items-center space-x-2"
          >
            <Package className="h-4 w-4" />
            <span>My Requests</span>
          </Link>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-app-muted text-sm">Searching for available food...</p>
        </div>
      ) : donations.length === 0 ? (
        <div className="bg-app-card border border-app-main rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
          <Package className="h-12 w-12 text-app-muted mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No food available right now</h3>
          <p className="text-app-muted text-sm mt-1 max-w-sm">No food items have been posted today, or all items have been claimed. Refresh to reload.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <DonationCard
              key={donation._id}
              donation={donation}
              actionText="Request Food Aid"
              actionLoading={requestLoadingId === donation._id}
              onAction={handleRequest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
