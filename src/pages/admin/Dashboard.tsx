import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Booking, Service } from '../../types';
import { CalendarDays, DollarSign, Activity, CheckCircle, Loader2 } from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    async function fetchData() {
      const today = new Date();
      
      const [bookingsRes, servicesRes] = await Promise.all([
        supabase.from('bookings').select('*').order('booking_date', { ascending: false }).limit(100),
        supabase.from('services').select('*')
      ]);

      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>;
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysBookings = bookings.filter(b => b.booking_date === todayStr);
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const totalRevenue = bookings.filter(b => b.status === 'completed' || b.status === 'confirmed').reduce((sum, b) => {
    const srv = services.find(s => s.id === b.service_id);
    return sum + (srv?.price || 0);
  }, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white">Dashboard Overview</h1>
        <p className="text-slate-400 mt-1">Welcome back. Here's what's happening today.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-turf-800 rounded-2xl p-6 border border-turf-700">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-turf-green/10 flex items-center justify-center text-turf-green">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Today's Bookings</p>
          <p className="text-3xl font-display font-bold text-white">{todaysBookings.length}</p>
        </div>
        
        <div className="bg-turf-800 rounded-2xl p-6 border border-turf-700">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Pending Requests</p>
          <p className="text-3xl font-display font-bold text-white">{pendingBookings.length}</p>
        </div>
        
        <div className="bg-turf-800 rounded-2xl p-6 border border-turf-700">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-display font-bold text-white">${totalRevenue}</p>
        </div>
        
        <div className="bg-turf-800 rounded-2xl p-6 border border-turf-700">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Active Services</p>
          <p className="text-3xl font-display font-bold text-white">{services.filter(s => s.is_active).length}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-turf-800 rounded-3xl border border-turf-700 overflow-hidden">
        <div className="p-6 border-b border-turf-700">
          <h2 className="text-xl font-display font-bold text-white">Recent Bookings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-turf-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Player</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-turf-700">
              {bookings.slice(0, 5).map((booking) => {
                const srv = services.find(s => s.id === booking.service_id);
                return (
                  <tr key={booking.id} className="hover:bg-turf-700/20 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{booking.full_name}</p>
                      <p className="text-xs text-slate-500">{booking.phone}</p>
                    </td>
                    <td className="p-4 text-slate-300">{srv?.name || 'Unknown'}</td>
                    <td className="p-4">
                      <p className="text-slate-300">{format(new Date(booking.booking_date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-slate-500">{booking.start_time.substring(0,5)} - {booking.end_time.substring(0,5)}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        booking.status === 'confirmed' ? 'bg-turf-green/10 text-turf-green border-turf-green/20' :
                        booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        booking.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No bookings yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
