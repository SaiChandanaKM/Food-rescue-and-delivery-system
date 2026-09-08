import React from 'react';
import { ShieldCheck, Clock, MapPin, Package, Thermometer, User, CheckCircle } from 'lucide-react';

const DonationCard = ({ donation, onAction, actionText, actionLoading }) => {
  const {
    _id,
    foodName,
    quantity,
    cookedTime,
    storageMethod,
    image,
    location,
    description,
    classifiedCategory,
    predictionConfidence,
    safeUntilTime,
    currentRemainingHours, // dynamic virtual field
    currentRiskLevel,      // dynamic virtual field
    status,
    donor,
    claimedBy,
  } = donation;

  // Calculate shelf life percentage for progress bar
  const calculateSafetyPercentage = () => {
    if (!safeUntilTime || !cookedTime) return 0;
    const totalSafeMs = new Date(safeUntilTime).getTime() - new Date(cookedTime).getTime();
    const now = new Date();
    const remainingMs = new Date(safeUntilTime).getTime() - now.getTime();
    
    if (remainingMs <= 0) return 0;
    return Math.min(100, Math.round((remainingMs / totalSafeMs) * 100));
  };

  const safetyPercent = calculateSafetyPercentage();

  // Helper to format cooked time ago
  const formatTimeAgo = (dateStr) => {
    const cooked = new Date(dateStr);
    const now = new Date();
    const diffMs = now - cooked;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${Math.max(0, diffMins)} mins ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Helper for expiry date
  const formatExpiry = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    });
  };

  // Risk Level styling (use currentRiskLevel virtual)
  const riskStyles = {
    Low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    Medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    High: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 animate-pulse',
  };

  const statusStyles = {
    Available: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
    Accepted: 'bg-purple-500/10 text-purple-650 dark:text-purple-400 border border-purple-500/20',
    Delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  };

  // Progress Bar styling based on remaining hours
  const getProgressBarColor = () => {
    if (safetyPercent > 60) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
    if (safetyPercent > 25) return 'bg-gradient-to-r from-amber-500 to-amber-400';
    return 'bg-gradient-to-r from-red-600 to-red-400';
  };

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5002/api').replace(/\/api\/?$/, '');
  const imageUrl = image
    ? image.startsWith('http')
      ? image
      : `${API_URL}${image}`
    : null;

  return (
    <div className="bg-app-card border border-app-main rounded-xl overflow-hidden shadow-lg hover:border-slate-400 dark:hover:border-slate-700 transition-all duration-300 flex flex-col group relative">
      {/* Food Image or Fallback Gradient */}
      <div className="relative h-48 w-full bg-gradient-to-tr from-slate-950 to-emerald-950/60 overflow-hidden flex items-center justify-center border-b border-app-main">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={foodName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-slate-950 flex flex-col items-center justify-center p-4">
            <Package className="h-12 w-12 text-emerald-500 mb-2 opacity-70" />
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">RescueMeal Freshness</span>
          </div>
        )}

        {/* Dynamic Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${riskStyles[currentRiskLevel || 'Low']}`}>
            Risk: {currentRiskLevel || 'Low'}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${statusStyles[status]}`}>
            {status}
          </span>
        </div>

        {/* Placement Showpiece: AI Prediction Label overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center space-x-1.5 text-[10px] text-emerald-400 backdrop-blur-sm">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>AI Predicted: <strong>{classifiedCategory} ({predictionConfidence}%)</strong></span>
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-app-main mb-2 truncate group-hover:text-emerald-500 transition-colors">
          {foodName}
        </h3>

        {description && (
          <p className="text-app-muted text-sm mb-4 line-clamp-2 italic h-10">
            "{description}"
          </p>
        )}

        {/* Dynamic Safety Progress Meter */}
        <div className="mb-5">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-app-muted font-medium flex items-center">
              <Clock className="h-3.5 w-3.5 text-emerald-500 mr-1" />
              <span>Safe Window Status</span>
            </span>
            <span className={`font-bold ${
              currentRemainingHours <= 0 ? 'text-red-500' :
              currentRemainingHours <= 2 ? 'text-red-650 dark:text-red-400 animate-pulse' :
              currentRemainingHours <= 8 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {currentRemainingHours <= 0 ? 'Expired / Unsafe' : `${currentRemainingHours} hrs left`}
            </span>
          </div>
          <div className="w-full bg-app-secondary h-2.5 rounded-full overflow-hidden border border-app-main">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${safetyPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Meta details list */}
        <div className="space-y-2.5 text-xs text-app-muted mb-6 flex-1">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span>Quantity: <strong className="text-app-main font-semibold">{quantity}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span>Cooked: <strong className="text-app-main font-semibold">{formatTimeAgo(cookedTime)}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <Thermometer className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span>Storage: <strong className="text-app-main font-semibold">{storageMethod}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span>AI Safe Until: <strong className="text-app-main font-semibold">{formatExpiry(safeUntilTime)}</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span className="truncate" title={location}>Location: <strong className="text-app-main font-semibold">{location}</strong></span>
          </div>
          {donor && (
            <div className="flex items-center space-x-2 pt-2 border-t border-app-main text-app-muted">
              <User className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="truncate">Donor: {donor.name || 'Anonymous'}</span>
            </div>
          )}
        </div>

        {/* Action Button Section */}
        {onAction && status === 'Available' && (
          <button
            onClick={() => onAction(_id)}
            disabled={actionLoading || currentRemainingHours <= 0}
            className="w-full mt-auto py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-950/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
          >
            {currentRemainingHours <= 0 ? 'Food Expired' : actionLoading ? 'Processing...' : actionText}
          </button>
        )}

        {/* Status messages when claimed */}
        {status === 'Accepted' && claimedBy && (
          <div className="mt-auto bg-app-secondary border border-app-main p-3 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div className="text-xs">
              <p className="text-app-main font-bold">Claimed by {claimedBy.name}</p>
              <p className="text-app-muted font-bold">({claimedBy.role})</p>
            </div>
          </div>
        )}

        {status === 'Delivered' && (
          <div className="mt-auto bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center space-x-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">Food Successfully Delivered</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationCard;
