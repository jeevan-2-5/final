import { addMinutes, isBefore, parseISO, startOfDay, addHours, format, differenceInMinutes, isSameDay } from 'date-fns';
import { supabase } from './supabase';
import { BusinessHours, BlockedDate, Booking, TurfSettings } from '../types';

export async function getAvailableSlots(
  date: Date,
  serviceId: string,
  serviceDuration: number,
  settings: TurfSettings | null
) {
  // 1. Fetch data
  const dayOfWeek = date.getDay(); // 0 is Sunday
  
  let hoursRes: { data: any } = { data: null };
  let blockedRes: { data: any[] } = { data: [] };
  let bookingsRes: { data: any[] } = { data: [] };

  try {
    const [hRes, bRes, bkRes] = await Promise.all([
      supabase.from('business_hours').select('*').eq('weekday', dayOfWeek).single(),
      supabase.from('blocked_dates').select('*').eq('blocked_date', format(date, 'yyyy-MM-dd')),
      supabase.from('bookings').select('*').eq('booking_date', format(date, 'yyyy-MM-dd')).in('status', ['pending', 'confirmed'])
    ]);
    hoursRes = hRes;
    blockedRes = bRes;
    bookingsRes = bkRes;
  } catch (err) {
    console.warn('Database connection failed or not yet seeded in getAvailableSlots. Falling back to default hours.', err);
  }

  // Default to 8 AM - 10 PM if business hours are not configured yet
  const hours: BusinessHours = hoursRes.data || {
    id: 'default',
    weekday: dayOfWeek,
    is_open: true,
    start_time: '08:00:00',
    end_time: '22:00:00'
  };

  const blockedDates: BlockedDate[] = blockedRes.data || [];
  const existingBookings: Booking[] = bookingsRes.data || [];

  // 2. Initial checks
  if (blockedDates.length > 0) return { slots: [], existingBookings: [] }; // Day is blocked
  if (!hours.is_open) return { slots: [], existingBookings: [] }; // Closed on this day

  // 3. Setup time boundaries
  // Parse start_time and end_time for the given date
  const [startH, startM] = hours.start_time.split(':').map(Number);
  const [endH, endM] = hours.end_time.split(':').map(Number);
  
  let startTime = new Date(date);
  startTime.setHours(startH, startM, 0, 0);
  
  let endTime = new Date(date);
  endTime.setHours(endH, endM, 0, 0);

  // Apply booking notice restriction
  const now = new Date();
  const noticeHours = settings?.booking_notice_hours || 0;
  const minimumBookingTime = addHours(now, noticeHours);

  // 4. Generate slots
  const slots: { start: Date; end: Date; label: string; isBooked?: boolean; isPast?: boolean }[] = [];
  let currentSlot = startTime;

  const interval = settings?.slot_interval_minutes || 60;

  while (addMinutes(currentSlot, serviceDuration) <= endTime) {
    const slotEnd = addMinutes(currentSlot, serviceDuration);
    
    // Check if slot is in the past (including notice period)
    const isPast = isBefore(currentSlot, minimumBookingTime);

    // Check for overlaps with existing bookings
    // Overlap rule: new_start < existing_end AND new_end > existing_start
    const hasOverlap = existingBookings.some(booking => {
      // Parse booking times correctly using the same date
      const [bStartH, bStartM] = booking.start_time.split(':').map(Number);
      const [bEndH, bEndM] = booking.end_time.split(':').map(Number);
      
      const bStart = new Date(date);
      bStart.setHours(bStartH, bStartM, 0, 0);
      
      const bEnd = new Date(date);
      bEnd.setHours(bEndH, bEndM, 0, 0);

      return currentSlot < bEnd && slotEnd > bStart;
    });

    slots.push({
      start: currentSlot,
      end: slotEnd,
      label: format(currentSlot, 'HH:mm'),
      isBooked: hasOverlap,
      isPast: isPast
    });

    // Move to next slot based on interval
    currentSlot = addMinutes(currentSlot, interval);
  }

  return { slots, existingBookings };
}
