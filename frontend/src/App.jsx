import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PostDonation from './pages/PostDonation';
import AvailableFood from './pages/AvailableFood';
import Pickups from './pages/Pickups';
import MyRequests from './pages/MyRequests';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-app-main text-app-main flex flex-col font-sans transition-colors duration-300">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes (All authenticated users) */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              {/* Donor Only Routes */}
              <Route
                path="/post-donation"
                element={
                  <PrivateRoute allowedRoles={['Donor']}>
                    <PostDonation />
                  </PrivateRoute>
                }
              />

              {/* NGO & Needy Person Routes */}
              <Route
                path="/available"
                element={
                  <PrivateRoute allowedRoles={['NGO', 'Needy Person']}>
                    <AvailableFood />
                  </PrivateRoute>
                }
              />

              {/* NGO Only Routes */}
              <Route
                path="/pickups"
                element={
                  <PrivateRoute allowedRoles={['NGO']}>
                    <Pickups />
                  </PrivateRoute>
                }
              />

              {/* Needy Person Only Routes */}
              <Route
                path="/my-requests"
                element={
                  <PrivateRoute allowedRoles={['Needy Person']}>
                    <MyRequests />
                  </PrivateRoute>
                }
              />

              {/* Fallback redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
