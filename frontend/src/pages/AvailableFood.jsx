import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import DonationCard from '../components/DonationCard';
import { Utensils, RefreshCw } from 'lucide-react';

const AvailableFood = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAvailable = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations?status=Available');
      setDonations(res.data.data);
    } catch (err) {
      console.error('Error fetching available food:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleAction = async (donationId) => {
    setActionLoadingId(donationId);
    try {
      if (user.role === 'NGO') {
        // Direct claim
        await api.put(`/donations/${donationId}/claim`);
        alert('Food item claimed successfully! View in "My Deliveries".');
      } else if (user.role === 'Needy Person') {
        // Request food
        await api.post('/requests', { donationId });
        alert('Request submitted! View status in "My Requests".');
      }
      // Remove from list
      setDonations(donations.filter((d) => d._id !== donationId));
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoadingId(null);
    }
  };

  const actionText = user.role === 'NGO' ? 'Accept & Claim Food' : 'Request Food Aid';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-main text-app-main p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-2 text-slate-900 dark:text-white">
              <Utensils className="h-8 w-8 text-emerald-500" />
              <span>Browse Available Food</span>
            </h1>
            <p className="text-app-muted mt-1">Directly claim or request surplus food listed by local donors</p>
          </div>
          <button
            onClick={fetchAvailable}
            className="p-2.5 rounded-lg bg-app-card border border-app-main hover:bg-app-secondary text-app-muted"
            title="Refresh Listings"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-app-muted text-sm">Searching for available donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="bg-app-card border border-app-main rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
            <Utensils className="h-12 w-12 text-app-muted mb-3" />
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-350">No food listed at the moment</h3>
            <p className="text-app-muted text-sm mt-1 max-w-sm">Check back soon! Local donors list surplus food regularly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donations.map((donation) => (
              <DonationCard
                key={donation._id}
                donation={donation}
                onAction={handleAction}
                actionText={actionText}
                actionLoading={actionLoadingId === donation._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableFood;
