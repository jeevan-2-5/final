import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../components/auth/AuthProvider';
import { Loader2, Lock } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      }
      // Note: we don't immediately redirect here because we need AuthProvider 
      // to fetch the admin_users table and set isAdmin. AuthProvider's onAuthStateChange
      // will handle state updates. The user might need to wait for that or we can
      // just redirect to /admin, which has a ProtectedRoute that checks isAdmin.
      else {
         navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-turf-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-turf-800 border border-turf-700 mb-6 shadow-[0_0_30px_rgba(0,255,135,0.1)]">
            <Lock className="w-8 h-8 text-turf-green" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Sign in to manage your turf facility.</p>
        </div>

        <div className="bg-turf-800 rounded-3xl p-8 border border-turf-700 shadow-2xl relative overflow-hidden">
          {/* Decorative subtle glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-turf-green to-transparent opacity-50"></div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-turf-green focus:ring-1 focus:ring-turf-green transition-all"
                placeholder="admin@turf.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-turf-green focus:ring-1 focus:ring-turf-green transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-turf-green hover:bg-turf-green-hover text-turf-900 font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,255,135,0.2)] hover:shadow-[0_0_30px_rgba(0,255,135,0.4)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
