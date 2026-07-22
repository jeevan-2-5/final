-- Drop existing tables to start fresh (careful in production!)
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS clinic_settings CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS turf_settings CASCADE;
DROP TABLE IF EXISTS blocked_dates CASCADE;
DROP TABLE IF EXISTS business_hours CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 1. Create Services Table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Business Hours Table
CREATE TABLE business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    is_open BOOLEAN NOT NULL DEFAULT true,
    start_time TIME,
    end_time TIME
);

-- 4. Create Blocked Dates Table
CREATE TABLE blocked_dates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blocked_date DATE NOT NULL UNIQUE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Turf Settings Table
CREATE TABLE turf_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    turf_name TEXT NOT NULL DEFAULT 'Premium Turf',
    turf_email TEXT,
    turf_phone TEXT,
    turf_address TEXT,
    slot_interval_minutes INTEGER NOT NULL DEFAULT 60,
    booking_notice_hours INTEGER NOT NULL DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert Initial Business Hours
INSERT INTO business_hours (weekday, is_open, start_time, end_time) VALUES
(0, true, '08:00', '22:00'),
(1, true, '08:00', '22:00'),
(2, true, '08:00', '22:00'),
(3, true, '08:00', '22:00'),
(4, true, '08:00', '22:00'),
(5, true, '08:00', '22:00'),
(6, true, '08:00', '22:00');

-- 8. Insert Initial Turf Settings
INSERT INTO turf_settings (turf_name, turf_email, turf_phone, turf_address, slot_interval_minutes, booking_notice_hours)
VALUES ('Premium Turf', 'hello@premiumturf.com', '+1 234 567 8900', '123 Turf Avenue, Sports City', 60, 2);

-- 9. Insert Initial Services
INSERT INTO services (name, description, duration_minutes, price, is_active) VALUES
('5-a-side Football Turf', 'Premium 5-a-side artificial grass turf enclosed with nets.', 60, 50.00, true),
('7-a-side Football Turf', 'Large 7-a-side artificial grass turf enclosed with nets.', 60, 80.00, true),
('Cricket Net Practice', 'Professional cricket practice nets with high-quality artificial turf.', 60, 30.00, true);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE turf_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Services
CREATE POLICY "Anyone can read active services" ON services FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage services" ON services FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Bookings
CREATE POLICY "Anyone can create bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can read bookings" ON bookings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can update bookings" ON bookings FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Business Hours
CREATE POLICY "Anyone can read business hours" ON business_hours FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage business hours" ON business_hours FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Blocked Dates
CREATE POLICY "Anyone can read blocked dates" ON blocked_dates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage blocked dates" ON blocked_dates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Turf Settings
CREATE POLICY "Anyone can read turf settings" ON turf_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage turf settings" ON turf_settings FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid()));

-- Admin Users
CREATE POLICY "Users can read their own admin row" ON admin_users FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- IMPORTANT: You must manually insert your admin user id into the admin_users table
-- INSERT INTO admin_users (user_id) VALUES ('your-auth-user-id-here');

-- Reload the PostgREST schema cache so the API recognizes the new tables immediately
NOTIFY pgrst, 'reload schema';
