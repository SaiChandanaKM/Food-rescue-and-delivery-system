import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Truck, MapPin, CheckCircle, RefreshCw, User, Mail, Calendar } from 'lucide-react';

const Pickups = () => {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchPickups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/donations');
      // Filter donations accepted by this NGO
      const myPickups = res.data.data.filter(
        (donation) =>
          donation.status === 'Accepted' &&
          donation.claimedBy &&
          donation.claimedBy._id === user._id
      );
      setPickups(myPickups);
    } catch (err) {
      console.error('Error fetching pickups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleDeliver = async (donationId) => {
    setActionLoadingId(donationId);
    try {
      await api.put(`/donations/${donationId}/deliver`);
      setPickups(pickups.filter((item) => item._id !== donationId));
      alert('Delivery confirmed! Thank you for reducing food waste.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update delivery');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-main text-app-main p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Active Deliveries</h1>
            <p className="text-app-muted mt-1">Manage food items you've claimed and mark them delivered</p>
          </div>
          <button
            onClick={fetchPickups}
            className="p-2.5 rounded-lg bg-app-card border border-app-main hover:bg-app-secondary text-app-muted"
            title="Refresh Deliveries"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* List of Pickups */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-app-muted text-sm">Loading claimed items...</p>
          </div>
        ) : pickups.length === 0 ? (
          <div className="bg-app-card border border-app-main rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
            <Truck className="h-12 w-12 text-app-muted mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-350">No active deliveries</h3>
            <p className="text-app-muted text-sm mt-1 max-w-sm">You haven't claimed any available food donations yet. Browse available listings to start.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pickups.map((item) => (
              <div key={item._id} className="bg-app-card border border-app-main rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 dark:hover:border-slate-850 transition-colors shadow-md">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-app-main">{item.foodName}</h2>
                    <span className="text-[10px] bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Accepted
                    </span>
                  </div>

                  <p className="text-xs text-app-muted mb-4 font-bold uppercase tracking-wider">
                    Quantity: <span className="text-app-main">{item.quantity}</span>
                  </p>

                  <div className="space-y-3 border-t border-app-main pt-4 text-xs text-app-muted">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                      <span>Donor: <strong className="text-app-main font-semibold">{item.donor?.name}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                      <span>Contact Email: <strong className="text-app-main font-semibold">{item.donor?.email}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
                      <span>Pickup Address: <strong className="text-app-main font-semibold">{item.location}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                      <span>Cooked Time: <strong className="text-app-main font-semibold">{new Date(item.cookedTime).toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeliver(item._id)}
                  disabled={actionLoadingId === item._id}
                  className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center space-x-2 disabled:opacity-50"
                >
                  {actionLoadingId === item._id ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Confirm Delivery Completed</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pickups;
