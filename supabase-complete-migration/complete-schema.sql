-- Complete Supabase Schema for Shiv Shiva Residency
-- Run this entire script in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS visitors CASCADE;
DROP TABLE IF EXISTS maintenance CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS tenants CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Rooms Table
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_number TEXT UNIQUE NOT NULL,
  floor INTEGER NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('single', 'double', 'triple', 'dormitory')),
  capacity INTEGER NOT NULL DEFAULT 1,
  current_occupancy INTEGER DEFAULT 0,
  status TEXT DEFAULT 'vacant' CHECK (status IN ('vacant', 'occupied', 'maintenance', 'reserved')),
  monthly_rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Tenants Table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  name TEXT NOT NULL,
  email TEXT,
  mobile TEXT NOT NULL,
  emergency_contact TEXT,
  aadhar_number TEXT,
  occupation TEXT,
  permanent_address TEXT,
  check_in_date DATE NOT NULL,
  check_out_date DATE,
  monthly_rent DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  security_adjustment DECIMAL(10,2) DEFAULT 0,
  has_food BOOLEAN DEFAULT false,
  food_charge DECIMAL(10,2) DEFAULT 0,
  payment_day INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Payments Table
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  room_id UUID REFERENCES rooms(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  billing_month TEXT NOT NULL,
  payment_year INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'card')),
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
  late_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Maintenance Table
CREATE TABLE maintenance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  tenant_id UUID REFERENCES tenants(id),
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  resolved_date TIMESTAMP WITH TIME ZONE,
  assigned_to TEXT,
  cost DECIMAL(10,2),
  notes TEXT
);

-- Create Visitors Table
CREATE TABLE visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  room_id UUID REFERENCES rooms(id),
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT,
  purpose TEXT,
  check_in_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  check_out_time TIMESTAMP WITH TIME ZONE,
  id_proof_type TEXT,
  id_proof_number TEXT
);

-- Insert admin user
INSERT INTO users (username, email, password_hash, full_name, phone, role) 
VALUES (
  'admin', 
  'admin@shivshiva.com', 
  crypt('admin123', gen_salt('bf')), 
  'Administrator',
  '9999999999',
  'admin'
);

-- Insert sample rooms with realistic data
INSERT INTO rooms (room_number, floor, room_type, capacity, status, monthly_rent, security_deposit, amenities) VALUES
('101', 1, 'single', 1, 'occupied', 8000, 16000, '["fan", "light", "attached_bathroom"]'),
('102', 1, 'single', 1, 'vacant', 8000, 16000, '["fan", "light", "attached_bathroom"]'),
('103', 1, 'double', 2, 'occupied', 12000, 24000, '["fan", "light", "attached_bathroom", "balcony"]'),
('104', 1, 'double', 2, 'maintenance', 12000, 24000, '["fan", "light", "attached_bathroom"]'),
('201', 2, 'single', 1, 'occupied', 8500, 17000, '["fan", "light", "attached_bathroom", "window"]'),
('202', 2, 'single', 1, 'vacant', 8500, 17000, '["fan", "light", "attached_bathroom"]'),
('203', 2, 'double', 2, 'occupied', 13000, 26000, '["fan", "light", "attached_bathroom", "balcony", "cupboard"]'),
('204', 2, 'triple', 3, 'vacant', 18000, 36000, '["fan", "light", "attached_bathroom", "balcony", "cupboard"]'),
('301', 3, 'single', 1, 'occupied', 9000, 18000, '["fan", "light", "attached_bathroom", "ac"]'),
('302', 3, 'double', 2, 'vacant', 14000, 28000, '["fan", "light", "attached_bathroom", "balcony", "ac"]'),
('303', 3, 'dormitory', 4, 'occupied', 20000, 40000, '["fan", "light", "common_bathroom", "cupboard"]');

-- Update room occupancy counts
UPDATE rooms SET current_occupancy = 1 WHERE room_number IN ('101', '201', '301');
UPDATE rooms SET current_occupancy = 2 WHERE room_number IN ('103', '203');
UPDATE rooms SET current_occupancy = 3 WHERE room_number = '303';

-- Insert sample tenants
INSERT INTO tenants (room_id, name, email, mobile, occupation, check_in_date, monthly_rent, security_deposit, has_food, food_charge, is_active) VALUES
((SELECT id FROM rooms WHERE room_number = '101'), 'Rahul Sharma', 'rahul@email.com', '9876543210', 'Software Engineer', '2024-06-15', 8000, 16000, true, 2500, true),
((SELECT id FROM rooms WHERE room_number = '103'), 'Amit Kumar', 'amit@email.com', '9876543211', 'Bank Employee', '2024-08-20', 6000, 12000, false, 0, true),
((SELECT id FROM rooms WHERE room_number = '103'), 'Vijay Singh', 'vijay@email.com', '9876543212', 'Teacher', '2024-08-20', 6000, 12000, true, 2500, true),
((SELECT id FROM rooms WHERE room_number = '201'), 'Priya Patel', 'priya@email.com', '9876543213', 'Nurse', '2024-09-10', 8500, 17000, true, 2500, true),
((SELECT id FROM rooms WHERE room_number = '203'), 'Suresh Reddy', 'suresh@email.com', '9876543214', 'Business', '2024-10-05', 6500, 13000, false, 0, true),
((SELECT id FROM rooms WHERE room_number = '203'), 'Kiran Rao', 'kiran@email.com', '9876543215', 'IT Professional', '2024-10-05', 6500, 13000, false, 0, true),
((SELECT id FROM rooms WHERE room_number = '301'), 'Anita Desai', 'anita@email.com', '9876543216', 'Doctor', '2024-11-01', 9000, 18000, true, 2500, true),
((SELECT id FROM rooms WHERE room_number = '303'), 'Ravi Verma', 'ravi@email.com', '9876543217', 'Student', '2024-12-01', 5000, 10000, true, 2500, true),
((SELECT id FROM rooms WHERE room_number = '303'), 'Sanjay Gupta', 'sanjay@email.com', '9876543218', 'Student', '2024-12-01', 5000, 10000, true, 2500, true),
((SELECT id FROM rooms WHERE room_number = '303'), 'Deepak Joshi', 'deepak@email.com', '9876543219', 'Student', '2024-12-15', 5000, 10000, false, 0, true);

-- Insert sample payments
INSERT INTO payments (tenant_id, room_id, amount, payment_date, billing_month, payment_year, payment_method, status) VALUES
((SELECT id FROM tenants WHERE name = 'Rahul Sharma'), (SELECT id FROM rooms WHERE room_number = '101'), 10500, '2025-07-05', '2025-07', 2025, 'upi', 'paid'),
((SELECT id FROM tenants WHERE name = 'Amit Kumar'), (SELECT id FROM rooms WHERE room_number = '103'), 6000, '2025-07-03', '2025-07', 2025, 'bank_transfer', 'paid'),
((SELECT id FROM tenants WHERE name = 'Priya Patel'), (SELECT id FROM rooms WHERE room_number = '201'), 11000, '2025-07-07', '2025-07', 2025, 'cash', 'paid'),
((SELECT id FROM tenants WHERE name = 'Suresh Reddy'), (SELECT id FROM rooms WHERE room_number = '203'), 6500, '2025-07-10', '2025-07', 2025, 'upi', 'paid'),
((SELECT id FROM tenants WHERE name = 'Anita Desai'), (SELECT id FROM rooms WHERE room_number = '301'), 11500, '2025-07-02', '2025-07', 2025, 'card', 'paid');

-- Insert some pending payments
INSERT INTO payments (tenant_id, room_id, amount, payment_date, billing_month, payment_year, payment_method, status) VALUES
((SELECT id FROM tenants WHERE name = 'Vijay Singh'), (SELECT id FROM rooms WHERE room_number = '103'), 8500, CURRENT_DATE, '2025-07', 2025, NULL, 'pending'),
((SELECT id FROM tenants WHERE name = 'Kiran Rao'), (SELECT id FROM rooms WHERE room_number = '203'), 6500, CURRENT_DATE, '2025-07', 2025, NULL, 'pending'),
((SELECT id FROM tenants WHERE name = 'Ravi Verma'), (SELECT id FROM rooms WHERE room_number = '303'), 7500, CURRENT_DATE, '2025-07', 2025, NULL, 'pending'),
((SELECT id FROM tenants WHERE name = 'Sanjay Gupta'), (SELECT id FROM rooms WHERE room_number = '303'), 7500, CURRENT_DATE, '2025-07', 2025, NULL, 'pending'),
((SELECT id FROM tenants WHERE name = 'Deepak Joshi'), (SELECT id FROM rooms WHERE room_number = '303'), 5000, CURRENT_DATE, '2025-07', 2025, NULL, 'pending');

-- Insert maintenance records
INSERT INTO maintenance (room_id, tenant_id, issue_type, description, priority, status) VALUES
((SELECT id FROM rooms WHERE room_number = '104'), NULL, 'plumbing', 'Bathroom tap leaking', 'high', 'in_progress'),
((SELECT id FROM rooms WHERE room_number = '202'), NULL, 'electrical', 'Fan not working', 'medium', 'pending');

-- Insert visitor records
INSERT INTO visitors (tenant_id, room_id, visitor_name, visitor_phone, purpose, check_in_time) VALUES
((SELECT id FROM tenants WHERE name = 'Rahul Sharma'), (SELECT id FROM rooms WHERE room_number = '101'), 'John Doe', '9123456789', 'Friend visit', NOW() - INTERVAL '2 hours'),
((SELECT id FROM tenants WHERE name = 'Priya Patel'), (SELECT id FROM rooms WHERE room_number = '201'), 'Sarah Smith', '9123456790', 'Family visit', NOW() - INTERVAL '1 hour');

-- Create indexes for better performance
CREATE INDEX idx_tenants_room_id ON tenants(room_id);
CREATE INDEX idx_payments_tenant_id ON payments(tenant_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_maintenance_room_id ON maintenance(room_id);
CREATE INDEX idx_visitors_tenant_id ON visitors(tenant_id);

-- Create views for dashboard
CREATE OR REPLACE VIEW dashboard_overview AS
SELECT 
  (SELECT COUNT(*) FROM tenants WHERE is_active = true) as total_tenants,
  (SELECT COUNT(*) FROM tenants WHERE is_active = true) as active_tenants,
  (SELECT COUNT(*) FROM rooms) as total_rooms,
  (SELECT COUNT(*) FROM rooms WHERE status = 'occupied') as occupied_rooms,
  (SELECT COUNT(*) FROM rooms WHERE status = 'vacant') as available_rooms,
  (SELECT COUNT(*) FROM rooms WHERE status = 'maintenance') as maintenance_rooms,
  (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE billing_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM') AND status = 'paid') as actual_revenue_this_month,
  (SELECT COUNT(*) FROM payments WHERE billing_month = TO_CHAR(CURRENT_DATE, 'YYYY-MM') AND status = 'pending') as pending_bills;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;