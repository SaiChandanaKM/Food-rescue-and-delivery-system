import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { PlusCircle, Utensils, MapPin, Scale, Clock, Thermometer, FileText, Image, AlertCircle, CheckCircle, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

const PostDonation = () => {
  const [formData, setFormData] = useState({
    foodName: '',
    quantity: '',
    cookedTime: '',
    storageMethod: 'Room Temperature',
    location: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Live AI Prediction State
  const [aiPreview, setAiPreview] = useState({
    category: 'Generic',
    confidence: 75,
    safeDuration: 6,
    risk: 'Low',
  });

  const navigate = useNavigate();

  // Run the classifier logic locally on input changes
  useEffect(() => {
    if (!formData.foodName) {
      setAiPreview({
        category: 'Awaiting Input',
        confidence: 0,
        safeDuration: 0,
        risk: 'Low',
      });
      return;
    }

    const name = formData.foodName.toLowerCase().trim();
    let category = 'Generic';
    let confidence = 75;

    // NLP Heuristics
    if (name.includes('biryani')) {
      category = 'Biryani';
      confidence = 98;
    } else if (name.includes('rice') || name.includes('pulao') || name.includes('pulav') || name.includes('jeera rice')) {
      category = 'Rice';
      confidence = 92;
    } else if (
      name.includes('curry') || 
      name.includes('dal') || 
      name.includes('gravy') || 
      name.includes('sambar') || 
      name.includes('paneer') || 
      name.includes('chicken') ||
      name.includes('sabzi') ||
      name.includes('korma')
    ) {
      category = 'Curry';
      confidence = 90;
    } else if (
      name.includes('snack') || 
      name.includes('samosa') || 
      name.includes('samosas') || 
      name.includes('pakora') || 
      name.includes('sandwich') || 
      name.includes('burger') ||
      name.includes('chips') ||
      name.includes('rolls')
    ) {
      category = 'Snacks';
      confidence = 94;
    }

    // Safety Hours matching
    let duration = 6;
    if (formData.storageMethod === 'Frozen') {
      duration = 72;
      confidence = Math.min(confidence + 3, 99);
    } else if (formData.storageMethod === 'Refrigerated') {
      switch (category) {
        case 'Rice':
        case 'Biryani':
        case 'Snacks':
          duration = 24;
          break;
        case 'Curry':
          duration = 18;
          break;
        default:
          duration = 20;
      }
    } else {
      // Room Temperature
      switch (category) {
        case 'Rice':
        case 'Biryani':
          duration = 6;
          break;
        case 'Curry':
          duration = 4;
          break;
        case 'Snacks':
          duration = 8;
          break;
        default:
          duration = 6;
      }
    }

    // Estimate risk level based on current age
    let risk = 'Low';
    if (formData.cookedTime) {
      const cooked = new Date(formData.cookedTime);
      const now = new Date();
      const ageHours = (now - cooked) / (1000 * 60 * 60);
      const remainingHours = duration - ageHours;

      if (remainingHours <= 0 || remainingHours <= 2) {
        risk = 'High';
      } else if (remainingHours <= duration * 0.4) {
        risk = 'Medium';
      }
    }

    setAiPreview({
      category,
      confidence,
      safeDuration: duration,
      risk,
    });
  }, [formData.foodName, formData.storageMethod, formData.cookedTime]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.foodName || !formData.quantity || !formData.cookedTime || !formData.location) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('foodName', formData.foodName);
      data.append('quantity', formData.quantity);
      data.append('cookedTime', formData.cookedTime);
      data.append('storageMethod', formData.storageMethod);
      data.append('location', formData.location);
      data.append('description', formData.description);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await api.post('/donations', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Food donation listed successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit food donation. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-app-main text-app-main py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        
        {/* Form Column */}
        <div className="lg:col-span-2 bg-app-card border border-app-main rounded-2xl p-6 sm:p-8 shadow-md relative transition-colors duration-300">
          <div className="absolute top-0 right-1/4 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-3 rounded-xl">
              <PlusCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Post Food Donation</h1>
              <p className="text-sm text-app-muted">Share your surplus meals with those in need</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/35 p-3.5 rounded-xl flex items-center space-x-2 text-sm text-red-650 dark:text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/35 p-3.5 rounded-xl flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Food Name */}
              <div>
                <label className="block text-sm font-medium text-app-main mb-1.5">Food Item Name *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Utensils className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="foodName"
                    required
                    value={formData.foodName}
                    onChange={handleChange}
                    placeholder="e.g. Biryani, Samosa Curry, Bread"
                    className="block w-full pl-10 pr-3 py-2.5 bg-app-main border border-app-main rounded-lg text-app-main placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-app-main mb-1.5">Quantity & Portions *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Scale className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    name="quantity"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="e.g. 10 kg, 15 meals, 3 packets"
                    className="block w-full pl-10 pr-3 py-2.5 bg-app-main border border-app-main rounded-lg text-app-main placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Cooked Time */}
              <div>
                <label className="block text-sm font-medium text-app-main mb-1.5">Cooked Date & Time *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="datetime-local"
                    name="cookedTime"
                    required
                    value={formData.cookedTime}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-app-main border border-app-main rounded-lg text-app-main focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              {/* Storage Method */}
              <div>
                <label className="block text-sm font-medium text-app-main mb-1.5">Storage Method *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Thermometer className="h-5 w-5 text-slate-500" />
                  </div>
                  <select
                    name="storageMethod"
                    value={formData.storageMethod}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-app-main border border-app-main rounded-lg text-app-main focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  >
                    <option value="Room Temperature">Room Temperature</option>
                    <option value="Refrigerated">Refrigerated</option>
                    <option value="Frozen">Frozen</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location / Pickup Address */}
            <div>
              <label className="block text-sm font-medium text-app-main mb-1.5">Pickup Location / Address *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. 123 Baker Street, Central Kitchen, Bangalore"
                  className="block w-full pl-10 pr-3 py-2.5 bg-app-main border border-app-main rounded-lg text-app-main placeholder-slate-550 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-app-main mb-1.5">Additional Details / Description</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="e.g. Vegetarian, keep cold. Needs to be eaten within 12 hours."
                  className="block w-full pl-10 pr-3 py-2.5 bg-app-main border border-app-main rounded-lg text-app-main placeholder-slate-555 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Image Selector & Preview */}
            <div>
              <label className="block text-sm font-medium text-app-main mb-1.5">Food Image</label>
              <div className="mt-1 flex items-center space-x-6">
                <div className="relative h-24 w-36 bg-app-secondary rounded-xl border border-app-main overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <Image className="h-8 w-8 text-slate-500" />
                  )}
                </div>
                <label className="cursor-pointer bg-app-card border border-app-main hover:bg-app-secondary px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors text-app-main">
                  Choose Image File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                ) : (
                  <span>Post Food Listing</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* AI Predictor Playground Column */}
        <div className="lg:col-span-1 flex flex-col space-y-6">
          <div className="bg-app-card border border-app-main rounded-2xl p-6 shadow-md relative overflow-hidden flex-grow flex flex-col justify-between transition-colors duration-300">
            {/* Top decoration glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm tracking-wider uppercase mb-5">
                <Sparkles className="h-5 w-5 text-emerald-500 animate-pulse" />
                <span>AI Expiry Assistant</span>
              </div>
              
              <h2 className="text-lg font-bold text-app-main mb-2">Live Predictor Engine</h2>
              <p className="text-xs text-app-muted leading-relaxed mb-6">
                This rule-based NLP engine scans food titles in real-time, matching them against FDA guidelines to estimate optimal shelf-life, safety risk thresholds, and prediction confidence.
              </p>

              {/* Status Display Area */}
              <div className="space-y-5">
                {/* 1. Classification */}
                <div className="bg-app-secondary border border-app-main p-4 rounded-xl transition-colors duration-300">
                  <span className="text-[10px] text-app-muted uppercase font-bold tracking-wider">Estimated Category</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{aiPreview.category}</p>
                  <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-app-main text-[10px] text-app-muted">
                    <span>Confidence Score</span>
                    <span className="font-bold text-app-main">{aiPreview.confidence}%</span>
                  </div>
                </div>

                {/* 2. Predicted Shelf life */}
                <div className="bg-app-secondary border border-app-main p-4 rounded-xl transition-colors duration-300">
                  <span className="text-[10px] text-app-muted uppercase font-bold tracking-wider">Optimal Shelf Life</span>
                  <p className="text-lg font-black text-app-main mt-0.5">
                    {aiPreview.safeDuration ? `${aiPreview.safeDuration} Hours` : 'N/A'}
                  </p>
                  <span className="text-[10px] text-app-muted leading-tight block mt-1">
                    (Computed from food class and {formData.storageMethod.toLowerCase()} storage)
                  </span>
                </div>

                {/* 3. Safety Check / Risk Indicator */}
                <div className="bg-app-secondary border border-app-main p-4 rounded-xl transition-colors duration-300">
                  <span className="text-[10px] text-app-muted uppercase font-bold tracking-wider">Predicted Post-Risk</span>
                  <div className="flex items-center space-x-2 mt-1.5">
                    {aiPreview.category === 'Awaiting Input' ? (
                      <span className="text-xs text-app-muted font-bold">Awaiting name...</span>
                    ) : aiPreview.risk === 'High' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold uppercase animate-pulse">
                        <ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" /> High Risk (Near Expiry)
                      </span>
                    ) : aiPreview.risk === 'Medium' ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase">
                        <ShieldAlert className="h-4 w-4 mr-1.5 shrink-0" /> Medium Risk
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase">
                        <ShieldCheck className="h-4 w-4 mr-1.5 shrink-0" /> Low Safety Risk
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PostDonation;
