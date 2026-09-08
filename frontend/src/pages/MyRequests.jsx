import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ClipboardList, Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw, User, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data.data);
    } catch (err) {
      console.error('Error fetching my requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusStyles = {
    Pending: 'bg-app-secondary text-app-muted border border-app-main',
    Approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    Rejected: 'bg-red-500/10 text-red-650 dark:text-red-400 border border-red-500/20',
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-main text-app-main p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your Food Requests</h1>
            <p className="text-app-muted mt-1">Track the status of the food requests you have made</p>
          </div>
          <button
            onClick={fetchRequests}
            className="p-2.5 rounded-lg bg-app-card border border-app-main hover:bg-app-secondary text-app-muted"
            title="Refresh Requests"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Requests display */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-app-muted text-sm">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-app-card border border-app-main rounded-2xl p-10 text-center flex flex-col items-center justify-center shadow-sm">
            <ClipboardList className="h-12 w-12 text-app-muted mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No requests made yet</h3>
            <p className="text-app-muted text-sm mt-1 max-w-sm">Browse the dashboard and request food aid to get started.</p>
            <Link to="/dashboard" className="mt-5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold transition-colors">
              Browse Available Food
            </Link>
          </div>
        ) : (
          <div className="bg-app-card border border-app-main rounded-2xl overflow-hidden shadow-md transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-app-secondary border-b border-app-main text-app-muted font-bold">
                    <th className="px-6 py-4">Food Item</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Donor</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app-main bg-app-card">
                  {requests.map((reqItem) => {
                    const donation = reqItem.donation;
                    if (!donation) return null;

                    return (
                      <tr key={reqItem._id} className="hover:bg-app-secondary/40 transition-colors">
                        <td className="px-6 py-4 font-bold text-app-main">{donation.foodName}</td>
                        <td className="px-6 py-4 font-semibold text-app-main">{donation.quantity}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1.5 text-app-main">
                            <User className="h-4 w-4 text-app-muted" />
                            <span>{donation.donor?.name || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusStyles[reqItem.status]}`}>
                            {reqItem.status === 'Pending' && <Clock className="h-3.5 w-3.5 mr-1" />}
                            {reqItem.status === 'Approved' && <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-600 dark:text-emerald-400" />}
                            {reqItem.status === 'Rejected' && <XCircle className="h-3.5 w-3.5 mr-1 text-red-600 dark:text-red-400" />}
                            {reqItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-app-muted">
                          {reqItem.status === 'Approved' ? (
                            <div className="space-y-1">
                              <p className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                                <span>Pickup: {donation.location}</span>
                              </p>
                              <p className="text-[10px] text-app-muted">Contact donor at: {donation.donor?.email}</p>
                            </div>
                          ) : (
                            <span className="italic">Awaiting donor approval</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;
