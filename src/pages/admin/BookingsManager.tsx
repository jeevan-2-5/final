import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Booking, Service } from '../../types';
import { Loader2, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function BookingsManager() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Record<string, Service>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    const [bookingsRes, servicesRes] = await Promise.all([
      supabase.from('bookings').select('*').order('booking_date', { ascending: false }).order('start_time', { ascending: true }),
      supabase.from('services').select('*')
    ]);

    if (servicesRes.data) {
      const srvMap = servicesRes.data.reduce((acc: any, s) => ({ ...acc, [s.id]: s }), {});
      setServices(srvMap);
    }
    if (bookingsRes.data) setBookings(bookingsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setBookings(bookings.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
    }
    setUpdatingId(null);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>;
  }

  const filteredBookings = filterStatus === 'all' ? bookings : bookings.filter(b => b.status === filterStatus);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Bookings</h1>
          <p className="text-slate-400 mt-1">Manage and track all pitch reservations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-9 pr-8 py-2 bg-turf-800 border border-turf-700 rounded-xl text-white text-sm focus:outline-none focus:border-turf-green appearance-none cursor-pointer"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-turf-800 rounded-3xl border border-turf-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-turf-900/50 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Player Details</th>
                <th className="p-4 font-medium">Service</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Notes</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-turf-700">
              {filteredBookings.map((booking) => {
                const srv = services[booking.service_id];
                return (
                  <tr key={booking.id} className="hover:bg-turf-700/20 transition-colors">
                    <td className="p-4">
                      <p className="text-white font-medium">{booking.full_name}</p>
                      <p className="text-xs text-slate-400">{booking.phone}</p>
                      <p className="text-xs text-slate-500">{booking.email}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300 font-medium">{srv?.name || 'Unknown'}</p>
                      <p className="text-xs text-turf-green font-bold">${srv?.price || 0}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300">{format(new Date(booking.booking_date + 'T00:00:00'), 'MMM d, yyyy')}</p>
                      <p className="text-xs text-slate-400">{booking.start_time.substring(0,5)} - {booking.end_time.substring(0,5)}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate">
                      {booking.notes || '-'}
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
                    <td className="p-4 text-right">
                      {updatingId === booking.id ? (
                        <Loader2 className="w-5 h-5 text-turf-green animate-spin ml-auto" />
                      ) : (
                        <select
                          value={booking.status}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className="bg-turf-900 border border-turf-700 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-turf-green cursor-pointer"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <p className="text-slate-400">No bookings found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
