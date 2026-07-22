export interface Service {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  service_id: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
}

export interface BusinessHours {
  id: string;
  weekday: number; // 0-6, where 0 is Sunday
  is_open: boolean;
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
}

export interface BlockedDate {
  id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string | null;
  created_at: string;
}

export interface TurfSettings {
  id: string;
  turf_name: string;
  turf_email: string;
  turf_phone: string;
  turf_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  created_at: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  created_at: string;
}
