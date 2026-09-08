import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, LogOut, PlusCircle, LayoutDashboard, Utensils, ClipboardList, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-app-card border-b border-app-main text-app-main sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-xl tracking-tight transition-transform hover:scale-102">
              <HeartHandshake className="h-7 w-7 text-emerald-500" />
              <span className="text-slate-900 dark:text-white">Rescue<span className="text-emerald-500">Meal</span></span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-2.5 py-2 rounded-md text-sm font-medium text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors"
                  title="Dashboard"
                >
                  <LayoutDashboard className="h-4.5 w-4.5 text-emerald-500" />
                  <span className="hidden sm:inline-block">Dashboard</span>
                </Link>

                {/* Donor Actions */}
                {user.role === 'Donor' && (
                  <>
                    <Link
                      to="/post-donation"
                      className="flex items-center space-x-1 px-2.5 py-2 rounded-md text-sm font-medium text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors"
                      title="Post Food"
                    >
                      <PlusCircle className="h-4.5 w-4.5 text-emerald-500" />
                      <span className="hidden sm:inline-block">Post Food</span>
                    </Link>
                  </>
                )}

                {/* NGO & Needy Person common tabs */}
                {(user.role === 'NGO' || user.role === 'Needy Person') && (
                  <Link
                    to="/available"
                    className="flex items-center space-x-1 px-2.5 py-2 rounded-md text-sm font-medium text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors"
                    title="Browse Food"
                  >
                    <Utensils className="h-4.5 w-4.5 text-emerald-500" />
                    <span className="hidden sm:inline-block">Browse Food</span>
                  </Link>
                )}

                {user.role === 'NGO' && (
                  <Link
                    to="/pickups"
                    className="flex items-center space-x-1 px-2.5 py-2 rounded-md text-sm font-medium text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors"
                    title="My Deliveries"
                  >
                    <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
                    <span className="hidden sm:inline-block">My Deliveries</span>
                  </Link>
                )}

                {user.role === 'Needy Person' && (
                  <Link
                    to="/my-requests"
                    className="flex items-center space-x-1 px-2.5 py-2 rounded-md text-sm font-medium text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors"
                    title="My Requests"
                  >
                    <ClipboardList className="h-4.5 w-4.5 text-emerald-500" />
                    <span className="hidden sm:inline-block">My Requests</span>
                  </Link>
                )}

                {/* Theme Toggle & User Info */}
                <div className="flex items-center space-x-1.5 sm:space-x-3 ml-2 border-l border-app-main pl-2 sm:pl-4">
                  {/* Theme Switcher Button */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors"
                    title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                  >
                    {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
                  </button>

                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold text-app-main">{user.name}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{user.role}</span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 rounded-md text-app-muted hover:text-red-500 hover:bg-app-secondary transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Theme Toggle for guests */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-app-muted hover:text-app-main hover:bg-app-secondary transition-colors mr-1 sm:mr-2"
                  title="Toggle Theme"
                >
                  {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5 text-amber-400" />}
                </button>
                
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-app-muted hover:text-app-main transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md transition-all hover:-translate-y-0.5"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
