import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { BusinessHours } from '../../types';
import { Loader2, Save } from 'lucide-react';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function BusinessHoursManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hours, setHours] = useState<BusinessHours[]>([]);

  useEffect(() => {
    async function fetchHours() {
      const { data } = await supabase.from('business_hours').select('*').order('weekday', { ascending: true });
      if (data) setHours(data);
      setLoading(false);
    }
    fetchHours();
  }, []);

  const handleChange = (id: string, field: keyof BusinessHours, value: any) => {
    setHours(hours.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSave = async () => {
    setSaving(true);
    for (const h of hours) {
      await supabase.from('business_hours').update({
        is_open: h.is_open,
        start_time: h.start_time,
        end_time: h.end_time
      }).eq('id', h.id);
    }
    setSaving(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Business Hours</h1>
          <p className="text-slate-400 mt-1">Set your turf's weekly operating schedule.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="bg-turf-800 rounded-3xl border border-turf-700 overflow-hidden">
        <div className="divide-y divide-turf-700">
          {hours.map((h) => (
            <div key={h.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-turf-700/20 transition-colors">
              <div className="w-40">
                <span className="text-white font-medium">{WEEKDAYS[h.weekday]}</span>
              </div>
              
              <div className="flex items-center gap-3 w-32">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={h.is_open} onChange={(e) => handleChange(h.id, 'is_open', e.target.checked)} />
                  <div className="w-11 h-6 bg-turf-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-turf-green border border-turf-700"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">{h.is_open ? 'Open' : 'Closed'}</span>
                </label>
              </div>

              {h.is_open ? (
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="time"
                      value={h.start_time.substring(0, 5)}
                      onChange={(e) => handleChange(h.id, 'start_time', e.target.value + ':00')}
                      className="bg-turf-900 border border-turf-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-turf-green w-full max-w-[150px]"
                    />
                    <span className="text-slate-500">to</span>
                    <input
                      type="time"
                      value={h.end_time.substring(0, 5)}
                      onChange={(e) => handleChange(h.id, 'end_time', e.target.value + ':00')}
                      className="bg-turf-900 border border-turf-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-turf-green w-full max-w-[150px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-slate-500 text-sm">
                  Facility is closed on this day
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
