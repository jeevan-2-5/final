import { Outlet, Link, useLocation } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook, Menu, X, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { TurfSettings } from '../../types';

export default function PublicLayout() {
  const [settings, setSettings] = useState<TurfSettings | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('turf_settings').select('*').single();
      if (data) setSettings(data);
    }
    fetchSettings();
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-turf-900 flex flex-col font-sans text-slate-200 selection:bg-turf-green selection:text-turf-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-turf-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-turf-green flex items-center justify-center text-turf-900 shadow-[0_0_20px_rgba(0,255,135,0.3)] group-hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] transition-all">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-turf-green transition-colors">
              {settings?.turf_name || 'Premium Turf'}
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
            <Link to="/" className={`transition-colors hover:text-white ${location.pathname === '/' ? 'text-white' : 'text-slate-400'}`}>Home</Link>
            <a href="/#services" className="text-slate-400 hover:text-white transition-colors">Pitches & Services</a>
            <a href="/#about" className="text-slate-400 hover:text-white transition-colors">About Us</a>
            <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">Admin</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              to="/book"
              className="hidden sm:inline-flex bg-turf-green hover:bg-turf-green-hover text-turf-900 font-semibold px-6 py-2.5 rounded-full transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] hover:shadow-[0_0_25px_rgba(0,255,135,0.4)] text-sm"
            >
              Book Now
            </Link>
            <button 
              className="md:hidden p-2 text-slate-300 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-turf-900 border-b border-white/5 py-4 px-6 flex flex-col gap-4 shadow-xl">
            <Link to="/" className={`font-medium ${location.pathname === '/' ? 'text-white' : 'text-slate-400'}`}>Home</Link>
            <a href="/#services" className="font-medium text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>Pitches & Services</a>
            <a href="/#about" className="font-medium text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>About Us</a>
            <Link to="/admin" className="font-medium text-slate-400 hover:text-white">Admin</Link>
            <Link
              to="/book"
              className="bg-turf-green text-turf-900 font-semibold px-6 py-3 rounded-xl text-center mt-2"
            >
              Book Now
            </Link>
          </div>
        )}
      </header>

      {!isSupabaseConfigured && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 py-3.5 px-6 text-center text-sm text-amber-200 backdrop-blur-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Supabase Setup Required:</strong> Please configure <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">VITE_SUPABASE_URL</code> and <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> in Vercel to activate bookings and other database features.
          </span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>

      {/* Footer */}
      <footer className="bg-turf-950 border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-turf-green flex items-center justify-center text-turf-900">
                <MapPin className="w-4 h-4" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                {settings?.turf_name || 'Premium Turf'}
              </span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
              Experience the best sports facility in town. High-quality pitches, professional lighting, and an unmatched playing environment.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-turf-800 flex items-center justify-center text-slate-400 hover:text-turf-green hover:bg-turf-700 transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-turf-800 flex items-center justify-center text-slate-400 hover:text-turf-green hover:bg-turf-700 transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-turf-800 flex items-center justify-center text-slate-400 hover:text-turf-green hover:bg-turf-700 transition-all"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-white mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/" className="hover:text-turf-green transition-colors">Home</Link></li>
              <li><Link to="/book" className="hover:text-turf-green transition-colors">Book a Pitch</Link></li>
              <li><Link to="/admin/login" className="hover:text-turf-green transition-colors">Admin Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-semibold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-sm text-slate-400">
              {settings?.turf_address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-turf-green shrink-0 mt-0.5" />
                  <span>{settings.turf_address}</span>
                </li>
              )}
              {settings?.turf_phone && (
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-turf-green shrink-0" />
                  <span>{settings.turf_phone}</span>
                </li>
              )}
              {settings?.turf_email && (
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-turf-green shrink-0" />
                  <span>{settings.turf_email}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} {settings?.turf_name || 'Premium Turf'}. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
