/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import Home from './pages/Home';
import Booking from './pages/Booking';
import AdminLayout from './pages/admin/AdminLayout';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ServicesManager from './pages/admin/ServicesManager';
import BookingsManager from './pages/admin/BookingsManager';
import BusinessHoursManager from './pages/admin/BusinessHoursManager';
import BlockedDatesManager from './pages/admin/BlockedDatesManager';
import TurfSettingsManager from './pages/admin/TurfSettingsManager';
import AuthProvider, { useAuth } from './components/auth/AuthProvider';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-screen bg-turf-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turf-green"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-turf-900 flex items-center justify-center p-4">
        <div className="bg-turf-800 p-8 rounded-2xl border border-turf-700 max-w-md w-full text-center">
          <h2 className="text-xl font-display font-semibold text-white mb-2">Admin Setup Required</h2>
          <p className="text-slate-400 mb-6">
            You are signed in as <strong className="text-white">{user.email}</strong>, but your account hasn't been granted admin privileges yet.
          </p>
          
          <div className="bg-turf-900 p-4 rounded-xl text-left text-sm text-slate-300 font-mono mb-6 overflow-x-auto border border-white/5">
            <p className="text-turf-green mb-2 text-xs uppercase font-sans font-bold tracking-wider">Run this in Supabase SQL Editor:</p>
            <code className="text-xs break-all">
              INSERT INTO admin_users (user_id) VALUES ('{user.id}');
            </code>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = '/';
            }}
            className="px-6 py-2 bg-turf-900 text-white rounded-lg border border-turf-700 hover:bg-turf-700 transition-colors w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}

export default function App() {
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.metaKey && e.shiftKey && e.key === 'C') ||
        (e.metaKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="book" element={<Booking />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingsManager />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="hours" element={<BusinessHoursManager />} />
            <Route path="blocked-dates" element={<BlockedDatesManager />} />
            <Route path="settings" element={<TurfSettingsManager />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
