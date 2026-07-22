import React, { useState, useEffect } from 'react';
import { useLocation, useOutletContext, Link } from 'react-router-dom';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { TurfSettings, Service } from '../types';
import { supabase } from '../lib/supabase';
import { getAvailableSlots } from '../lib/booking';
import { CheckCircle2, ChevronLeft, Calendar as CalendarIcon, Clock, ChevronRight, MapPin, Loader2 } from 'lucide-react';

export default function Booking() {
  const { settings } = useOutletContext<{ settings: TurfSettings | null }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialServiceId = searchParams.get('service');

  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [availableSlots, setAvailableSlots] = useState<{start: Date, end: Date, label: string, isBooked?: boolean, isPast?: boolean}[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{start: Date, end: Date, label: string} | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const defaultServices = [
      {
        id: '1',
        name: '5-a-side Football Turf',
        description: 'Premium 5-a-side artificial grass turf enclosed with nets.',
        duration_minutes: 60,
        price: 50.00,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: '7-a-side Football Turf',
        description: 'Large 7-a-side artificial grass turf enclosed with nets.',
        duration_minutes: 60,
        price: 80.00,
        is_active: true,
        created_at: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Cricket Net Practice',
        description: 'Professional cricket practice nets with high-quality artificial turf.',
        duration_minutes: 60,
        price: 30.00,
        is_active: true,
        created_at: new Date().toISOString()
      }
    ];

    async function fetchServices() {
      try {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
        
        let finalServices = data || [];
        if (finalServices.length === 0) {
          finalServices = defaultServices;
        }
        
        setServices(finalServices);
        if (initialServiceId) {
          const srv = finalServices.find(s => s.id === initialServiceId);
          if (srv) {
            setSelectedService(srv);
            setStep(2);
          }
        }
      } catch (err) {
        console.error('Error fetching services, falling back to defaults:', err);
        setServices(defaultServices);
        if (initialServiceId) {
          const srv = defaultServices.find(s => s.id === initialServiceId);
          if (srv) {
            setSelectedService(srv);
            setStep(2);
          }
        }
      }
      setLoading(false);
    }
    fetchServices();
  }, [initialServiceId]);

  const [existingBookings, setExistingBookings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchSlots() {
      if (!selectedService) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const { slots, existingBookings } = await getAvailableSlots(selectedDate, selectedService.id, selectedService.duration_minutes, settings);
        setAvailableSlots(slots);
        setExistingBookings(existingBookings);
      } catch (e) {
        console.error("Error fetching slots", e);
      }
      setLoadingSlots(false);
    }
    fetchSlots();
  }, [selectedDate, selectedService, settings]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(startOfDay(date));
  };

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customTimeError, setCustomTimeError] = useState<string | null>(null);

  const applyCustomTime = (startStr: string, endStr: string) => {
    setCustomTimeError(null);
    if (!startStr || !endStr || !selectedService) return;

    const [sHours, sMinutes] = startStr.split(':').map(Number);
    const [eHours, eMinutes] = endStr.split(':').map(Number);

    const start = new Date(selectedDate);
    start.setHours(sHours, sMinutes, 0, 0);

    const end = new Date(selectedDate);
    end.setHours(eHours, eMinutes, 0, 0);

    if (end <= start) {
      setCustomTimeError('End time must be after start time');
      return;
    }

    // Check for overlap with existing bookings
    const hasOverlap = existingBookings.some(booking => {
      const [bStartH, bStartM] = booking.start_time.split(':').map(Number);
      const [bEndH, bEndM] = booking.end_time.split(':').map(Number);
      
      const bStart = new Date(selectedDate);
      bStart.setHours(bStartH, bStartM, 0, 0);
      
      const bEnd = new Date(selectedDate);
      bEnd.setHours(bEndH, bEndM, 0, 0);

      return start < bEnd && end > bStart;
    });

    if (hasOverlap) {
      setCustomTimeError('This time overlaps with an existing booking');
      return;
    }

    const label = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
    setSelectedSlot({ start, end, label });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedSlot) return;
    
    setSubmitting(true);
    setBookingError(null);
    
    try {
      const { error } = await supabase.from('bookings').insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        service_id: selectedService.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        start_time: format(selectedSlot.start, 'HH:mm:ss'),
        end_time: format(selectedSlot.end, 'HH:mm:ss'),
        status: 'pending',
        notes: formData.notes || null
      });

      if (error) throw error;
      setStep(4);
    } catch (err: any) {
      setBookingError(err.message || 'Failed to submit booking');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 14 days for date picker
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfDay(new Date()), i));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-turf-900"><Loader2 className="w-10 h-10 text-turf-green animate-spin" /></div>;
  }

  return (
    <div className="min-h-[90vh] bg-turf-900 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-turf-green/5 rounded-[100%] blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Step Indicator */}
        {step < 4 && (
          <div className="mb-12">
            <div className="flex items-center justify-between relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-turf-800 -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-turf-green -z-10 rounded-full transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
              ></div>
              
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                    step >= num 
                      ? 'bg-turf-green text-turf-900 shadow-[0_0_15px_rgba(0,255,135,0.4)]' 
                      : 'bg-turf-800 text-slate-500 border border-turf-700'
                  }`}>
                    {num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step >= num ? 'text-white' : 'text-slate-500'}`}>
                    {num === 1 ? 'Select Pitch' : num === 2 ? 'Date & Time' : 'Details'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-turf-800 rounded-3xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-turf-green/30 to-transparent"></div>

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">Select Your Pitch</h2>
              <p className="text-slate-400 mb-8">Choose from our available sports facilities.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      setStep(2);
                    }}
                    className={`text-left p-6 rounded-2xl border transition-all ${
                      selectedService?.id === service.id
                        ? 'border-turf-green bg-turf-green/5'
                        : 'border-white/10 bg-turf-900/50 hover:border-turf-green/50 hover:bg-turf-800'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white">{service.name}</h3>
                      <span className="bg-turf-900 text-turf-green text-xs font-bold px-3 py-1 rounded-full border border-turf-green/20">
                        ${service.price}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{service.description}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                      <Clock className="w-4 h-4" />
                      {service.duration_minutes} Minutes
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div>
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Back to pitches
              </button>
              
              <h2 className="text-3xl font-display font-bold text-white mb-2">When do you want to play?</h2>
              <p className="text-slate-400 mb-8">Select a date and time for {selectedService?.name}.</p>
              
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-turf-green" /> Select Date
                  </h3>
                  <div className="relative">
                    <input
                      type="date"
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => {
                        if (e.target.value) {
                          handleDateSelect(new Date(e.target.value + 'T00:00:00'));
                        }
                      }}
                      className="bg-turf-900 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                </div>
                <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
                  {dates.map((d) => (
                    <button
                      key={d.toISOString()}
                      onClick={() => handleDateSelect(d)}
                      className={`flex flex-col items-center justify-center min-w-[70px] h-20 rounded-2xl border snap-start transition-all ${
                        isSameDay(d, selectedDate)
                          ? 'border-turf-green bg-turf-green text-turf-900 shadow-[0_0_15px_rgba(0,255,135,0.3)]'
                          : 'border-white/10 bg-turf-900/50 text-slate-300 hover:border-turf-green/50'
                      }`}
                    >
                      <span className="text-xs font-medium uppercase opacity-80">{format(d, 'EEE')}</span>
                      <span className="text-xl font-bold">{format(d, 'd')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                  <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-turf-green" /> Available Time Slots
                  </h3>
                  <div className="relative flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Custom time:</span>
                      <input
                        type="time"
                        value={customStart}
                        onChange={(e) => {
                          setCustomStart(e.target.value);
                          if (customEnd) applyCustomTime(e.target.value, customEnd);
                        }}
                        className="bg-turf-900 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={customEnd}
                        onChange={(e) => {
                          setCustomEnd(e.target.value);
                          if (customStart) applyCustomTime(customStart, e.target.value);
                        }}
                        className="bg-turf-900 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                    {customTimeError && (
                      <span className="text-xs text-red-400">{customTimeError}</span>
                    )}
                  </div>
                </div>
                
                {loadingSlots ? (
                  <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-turf-green animate-spin" /></div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {availableSlots.map((slot, i) => {
                      if (slot.isPast) return null;

                      const isSelected = selectedSlot === slot;

                      return (
                        <button
                          key={i}
                          onClick={() => !slot.isBooked && setSelectedSlot(slot)}
                          disabled={slot.isBooked}
                          className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all relative group ${
                            slot.isBooked
                              ? 'border-red-500/20 bg-red-500/5 text-red-400/50 cursor-not-allowed opacity-60'
                              : isSelected
                                ? 'border-turf-green bg-turf-green/10 text-turf-green'
                                : 'border-white/10 bg-turf-900 text-slate-300 hover:border-turf-green/50 hover:bg-turf-800'
                          }`}
                        >
                          {slot.label}
                          {slot.isBooked && (
                            <div className="absolute inset-x-0 -top-8 hidden group-hover:block bg-turf-900 text-xs text-slate-300 py-1 px-2 rounded border border-white/10 z-10 whitespace-nowrap">
                              Already booked
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center bg-turf-900/50 rounded-2xl border border-white/5">
                    <p className="text-slate-400">No available slots for this date.</p>
                    <p className="text-sm text-slate-500 mt-1">Please try another date.</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex justify-end">
                <button
                  disabled={!selectedSlot}
                  onClick={() => setStep(3)}
                  className="bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] hover:shadow-[0_0_25px_rgba(0,255,135,0.4)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div>
              <button 
                onClick={() => setStep(2)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Back to time selection
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2">
                  <h2 className="text-3xl font-display font-bold text-white mb-2">Player Details</h2>
                  <p className="text-slate-400 mb-8">Enter your information to complete the booking.</p>
                  
                  <form id="booking-form" onSubmit={handleBookingSubmit} className="space-y-5">
                    {bookingError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                        {bookingError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full bg-turf-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300 ml-1">Phone Number *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-turf-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-turf-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 ml-1">Additional Notes (Optional)</label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full bg-turf-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-turf-green focus:ring-1 focus:ring-turf-green outline-none transition-all resize-none"
                      />
                    </div>
                  </form>
                </div>
                
                {/* Summary Panel */}
                <div className="md:col-span-1">
                  <div className="bg-turf-900 rounded-2xl p-6 border border-white/5 sticky top-24">
                    <h3 className="font-display font-bold text-white mb-6">Booking Summary</h3>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Service</p>
                        <p className="font-medium text-white">{selectedService?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Date</p>
                        <p className="font-medium text-white">{format(selectedDate, 'MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Time</p>
                        <p className="font-medium text-white">{selectedSlot?.label} ({selectedService?.duration_minutes} mins)</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-4 mb-6">
                      <div className="flex justify-between items-end">
                        <p className="text-sm text-slate-400">Total Total</p>
                        <p className="text-2xl font-bold text-turf-green">${selectedService?.price}</p>
                      </div>
                    </div>
                    
                    <button
                      form="booking-form"
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-turf-green hover:bg-turf-green-hover text-turf-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,135,0.2)] hover:shadow-[0_0_25px_rgba(0,255,135,0.4)] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-turf-green/20 border border-turf-green mb-8 shadow-[0_0_40px_rgba(0,255,135,0.3)]">
                <CheckCircle2 className="w-10 h-10 text-turf-green" />
              </div>
              <h2 className="text-4xl font-display font-bold text-white mb-4">Booking Confirmed!</h2>
              <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto">
                Your pitch is reserved. We've sent a confirmation email to <span className="text-white font-medium">{formData.email}</span> with all the details.
              </p>
              
              <div className="bg-turf-900/50 border border-white/5 rounded-2xl p-6 max-w-sm mx-auto mb-10 text-left">
                <div className="flex justify-between mb-3 border-b border-white/5 pb-3">
                  <span className="text-slate-500 text-sm">Pitch</span>
                  <span className="text-white font-medium">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between mb-3 border-b border-white/5 pb-3">
                  <span className="text-slate-500 text-sm">Date</span>
                  <span className="text-white font-medium">{format(selectedDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Time</span>
                  <span className="text-white font-medium">{selectedSlot?.label}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a 
                  href={`https://wa.me/${settings?.turf_phone?.replace(/\D/g, '') || ''}?text=Hi, I just booked ${selectedService?.name} for ${format(selectedDate, 'MMM d, yyyy')} at ${selectedSlot?.label}. Name: ${formData.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)]"
                >
                  Notify Admin via WhatsApp
                </a>
                <Link 
                  to="/"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white border border-white/20 hover:bg-white/5 transition-colors text-center"
                >
                  Return to Home
                </Link>
                <button 
                  onClick={() => {
                    setStep(1);
                    setSelectedService(null);
                    setSelectedSlot(null);
                    setFormData({ fullName: '', email: '', phone: '', notes: '' });
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-turf-900 bg-turf-green hover:bg-turf-green-hover transition-colors shadow-[0_0_15px_rgba(0,255,135,0.2)]"
                >
                  Book Another Pitch
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
