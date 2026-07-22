import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Service } from '../../types';
import { Loader2, Plus, Edit2, Check, X } from 'lucide-react';

export default function ServicesManager() {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    duration_minutes: 60,
    price: 0,
    is_active: true
  });

  const fetchServices = async () => {
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (data) setServices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service: Service) => {
    setIsEditing(service.id);
    setFormData(service);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      name: '',
      description: '',
      duration_minutes: 60,
      price: 0,
      is_active: true
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (isAdding) {
      const { data, error } = await supabase.from('services').insert([formData]).select();
      if (!error && data) {
        setServices([data[0], ...services]);
        setIsAdding(false);
      }
    } else if (isEditing) {
      const { data, error } = await supabase.from('services').update(formData).eq('id', isEditing).select();
      if (!error && data) {
        setServices(services.map(s => s.id === isEditing ? data[0] : s));
        setIsEditing(null);
      }
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('services').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) {
      setServices(services.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Services</h1>
          <p className="text-slate-400 mt-1">Manage pitch types, pricing, and durations.</p>
        </div>
        
        {!isAdding && !isEditing && (
          <button
            onClick={handleAddNew}
            className="bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Service
          </button>
        )}
      </div>

      {(isAdding || isEditing) && (
        <div className="bg-turf-800 rounded-3xl p-6 border border-turf-green/30 mb-8 shadow-[0_0_30px_rgba(0,255,135,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-turf-green to-emerald-400"></div>
          <h2 className="text-xl font-display font-bold text-white mb-6">
            {isAdding ? 'Add New Service' : 'Edit Service'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Service Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Price ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Duration (Minutes)</label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData({...formData, duration_minutes: Number(e.target.value)})}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green appearance-none"
              >
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes (1 Hour)</option>
                <option value={90}>90 Minutes (1.5 Hours)</option>
                <option value={120}>120 Minutes (2 Hours)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Status</label>
              <div className="flex items-center gap-3 h-10">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  <div className="w-11 h-6 bg-turf-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-turf-green"></div>
                  <span className="ml-3 text-sm font-medium text-slate-300">{formData.is_active ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Description</label>
              <textarea
                rows={2}
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-turf-900 border border-turf-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-green resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button onClick={handleCancel} className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:bg-turf-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2">
              <Check className="w-4 h-4" /> Save Service
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className={`bg-turf-800 rounded-2xl border transition-all ${!service.is_active ? 'border-turf-700/50 opacity-60' : 'border-turf-700 hover:border-turf-green/30'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white pr-4">{service.name}</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${service.is_active ? 'bg-turf-green/10 text-turf-green border-turf-green/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                  ${service.price}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">{service.description}</p>
              
              <div className="flex items-center justify-between border-t border-turf-700 pt-4">
                <span className="text-xs font-medium text-slate-500">{service.duration_minutes} mins</span>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleStatus(service.id, service.is_active)}
                    className="p-2 rounded-lg bg-turf-900 hover:bg-turf-700 text-slate-400 transition-colors"
                    title={service.is_active ? "Deactivate" : "Activate"}
                  >
                    {service.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-2 rounded-lg bg-turf-green/10 text-turf-green hover:bg-turf-green hover:text-turf-900 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-turf-700 rounded-3xl">
            <p className="text-slate-400 mb-2">No services found.</p>
            <button onClick={handleAddNew} className="text-turf-green font-medium hover:underline">Add your first service</button>
          </div>
        )}
      </div>
    </div>
  );
}
