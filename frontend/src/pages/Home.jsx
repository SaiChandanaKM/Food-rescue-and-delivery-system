import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, ShieldCheck, Truck, Users, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-app-main text-app-main min-h-[calc(100vh-4rem)] flex flex-col justify-between transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden flex-grow flex items-center">
        {/* Abstract background blobs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-emerald-600/10 dark:bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-teal-600/10 dark:bg-teal-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tagline Badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-6 uppercase tracking-wider">
              <HeartHandshake className="h-3 w-3 mr-1 text-emerald-500" /> Connecting surplus food with hunger
            </span>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Bridging the Gap Between <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">Food Waste</span> and <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-emerald-600 dark:from-teal-300 dark:to-emerald-400">Need</span>
            </h1>

            <p className="text-lg text-app-muted mb-10 leading-relaxed max-w-2xl mx-auto">
              RescueMeal is a food donation ecosystem where businesses and individuals easily share surplus meals directly with NGOs and needy people in real time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 text-center flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/20 text-center flex items-center justify-center space-x-2 transition-all hover:-translate-y-0.5"
                  >
                    <span>Get Started Today</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-app-card border border-app-main hover:bg-app-secondary font-bold text-center transition-all hover:-translate-y-0.5"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-app-secondary border-y border-app-main py-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold">How It Works</h2>
            <p className="text-app-muted mt-2">Connecting communities to stop food waste in 3 steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Donor */}
            <div className="bg-app-card border border-app-main p-8 rounded-2xl relative hover:shadow-md transition-shadow">
              <div className="absolute top-6 right-8 text-6xl font-black text-slate-200 dark:text-slate-800/60 select-none">1</div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 h-12 w-12 rounded-xl flex items-center justify-center mb-6">
                <HeartHandshake className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Donors List Food</h3>
              <p className="text-app-muted text-sm leading-relaxed">
                Restaurants, supermarkets, or individuals upload images of excess food, note its quantity, storage, and cooking time.
              </p>
            </div>

            {/* Step 2: Request/Claim */}
            <div className="bg-app-card border border-app-main p-8 rounded-2xl relative hover:shadow-md transition-shadow">
              <div className="absolute top-6 right-8 text-6xl font-black text-slate-200 dark:text-slate-800/60 select-none">2</div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 h-12 w-12 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">2. NGOs & Individuals Request</h3>
              <p className="text-app-muted text-sm leading-relaxed">
                Registered NGOs direct-claim food, or individuals submit requests which donors approve based on safety/risk profiles.
              </p>
            </div>

            {/* Step 3: Delivery */}
            <div className="bg-app-card border border-app-main p-8 rounded-2xl relative hover:shadow-md transition-shadow">
              <div className="absolute top-6 right-8 text-6xl font-black text-slate-200 dark:text-slate-800/60 select-none">3</div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 h-12 w-12 rounded-xl flex items-center justify-center mb-6">
                <Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Pick Up & Deliver</h3>
              <p className="text-app-muted text-sm leading-relaxed">
                Claimers pick up the food from the specified location. NGOs log transport, and mark items "Delivered" once distributed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-app-main bg-app-card py-8 text-center text-xs text-app-muted transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} RescueMeal Food Donation System. Built with MERN Stack and Tailwind CSS.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
