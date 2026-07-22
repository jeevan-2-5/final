import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BlockedDate } from '../../types';
import { Loader2, Plus, Trash2, CalendarOff } from 'lucide-react';
import { format } from 'date-fns';

export default function BlockedDatesManager() {
  const [loading, setLoading] = useState(true);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');

  const fetchDates = async () => {
    const { data } = await supabase.from('blocked_dates').select('*').order('blocked_date', { ascending: true });
    if (data) setBlockedDates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDates();
  }, []);

  const handleAdd = async () => {
    if (!newDate) return;
    const { data, error } = await supabase.from('blocked_dates').insert([{
      blocked_date: newDate,
      reason: newReason || null
    }]).select();

    if (!error && data) {
      setBlockedDates([...blockedDates, data[0]].sort((a, b) => a.blocked_date.localeCompare(b.blocked_date)));
      setIsAdding(false);
      setNewDate('');
      setNewReason('');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (!error) {
      setBlockedDates(blockedDates.filter(d => d.id !== id));
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Blocked Dates</h1>
          <p className="text-slate-400 mt-1">Prevent bookings on specific days (e.g. maintenance, holidays).</p>
        </div>
        
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Blocked Date
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-turf-800 rounded-3xl p-6 border border-turf-green/30 mb-8 shadow-[0_0_30px_rgba(0,255,135,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-turf-green to-emerald-400"></div>
          <h2 className="text-xl font-display font-bold text-white mb-6">Add Blocked Date</h2>
          
          <div className="flex flex-col md:flex-row gap-5 mb-6">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green"
              />
            </div>
            
            <div className="space-y-2 flex-[2]">
              <label className="text-sm font-medium text-slate-300 ml-1">Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Pitch Maintenance"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAdding(false)} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:bg-turf-700 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleAdd} 
              disabled={!newDate}
              className="bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              Add Date
            </button>
          </div>
        </div>
      )}

      <div className="bg-turf-800 rounded-3xl border border-turf-700 overflow-hidden">
        {blockedDates.length > 0 ? (
          <div className="divide-y divide-turf-700">
            {blockedDates.map((date) => (
              <div key={date.id} className="p-5 flex items-center justify-between hover:bg-turf-700/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                    <CalendarOff className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{format(new Date(date.blocked_date + 'T00:00:00'), 'MMMM d, yyyy')}</p>
                    <p className="text-sm text-slate-400">{date.reason || 'No reason provided'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(date.id)}
                  className="p-2 rounded-lg bg-turf-900 border border-turf-700 text-red-400 hover:bg-red-400/10 hover:border-red-400/30 transition-all"
                  title="Remove Blocked Date"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-turf-900 border border-turf-700 flex items-center justify-center text-slate-500 mx-auto mb-4">
              <CalendarOff className="w-8 h-8" />
            </div>
            <p className="text-slate-300 font-medium mb-1">No blocked dates</p>
            <p className="text-sm text-slate-500">Your turf is open according to business hours.</p>
          </div>
        )}
      </div>
    </div>
  );
}
