import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { TurfSettings } from '../../types';
import { Loader2, Save } from 'lucide-react';

export default function TurfSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<TurfSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('turf_settings').select('*').single();
      if (data) setSettings(data);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    await supabase.from('turf_settings').update(settings).eq('id', settings.id);
    setSaving(false);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Turf Settings</h1>
          <p className="text-slate-400 mt-1">Configure your public profile and booking rules.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-turf-800 rounded-3xl p-8 border border-turf-700">
          <h2 className="text-xl font-display font-bold text-white mb-6">Facility Details</h2>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Turf Name</label>
              <input
                type="text"
                value={settings?.turf_name || ''}
                onChange={(e) => setSettings(settings ? { ...settings, turf_name: e.target.value } : null)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Contact Email</label>
              <input
                type="email"
                value={settings?.turf_email || ''}
                onChange={(e) => setSettings(settings ? { ...settings, turf_email: e.target.value } : null)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Contact Phone</label>
              <input
                type="tel"
                value={settings?.turf_phone || ''}
                onChange={(e) => setSettings(settings ? { ...settings, turf_phone: e.target.value } : null)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Address</label>
              <textarea
                rows={3}
                value={settings?.turf_address || ''}
                onChange={(e) => setSettings(settings ? { ...settings, turf_address: e.target.value } : null)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green transition-all resize-none"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-turf-800 rounded-3xl p-8 border border-turf-700">
          <h2 className="text-xl font-display font-bold text-white mb-6">Booking Rules</h2>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Slot Interval (Minutes)</label>
              <select
                value={settings?.slot_interval_minutes || 30}
                onChange={(e) => setSettings(settings ? { ...settings, slot_interval_minutes: Number(e.target.value) } : null)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green transition-all appearance-none cursor-pointer"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
              <p className="text-xs text-slate-500 ml-1">How often available times appear (e.g. 10:00, 10:30, 11:00).</p>
            </div>
            
            <div className="space-y-2 mt-6">
              <label className="text-sm font-medium text-slate-300 ml-1">Minimum Booking Notice (Hours)</label>
              <input
                type="number"
                min="0"
                value={settings?.booking_notice_hours || 0}
                onChange={(e) => setSettings(settings ? { ...settings, booking_notice_hours: Number(e.target.value) } : null)}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green transition-all"
              />
              <p className="text-xs text-slate-500 ml-1">How far in advance players must book.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
