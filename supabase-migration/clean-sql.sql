-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  room_type TEXT NOT NULL,
  status TEXT DEFAULT 'vacant',
  rent_amount DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2),
  amenities JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create Tenants Table
CREATE TABLE tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  emergency_contact TEXT,
  aadhar_number TEXT,
  occupation TEXT,
  permanent_address TEXT,
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  deposit_paid DECIMAL(10,2),
  rent_amount DECIMAL(10,2),
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
  payment_month TEXT NOT NULL,
  payment_year INTEGER NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending',
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
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
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

-- Insert sample rooms
INSERT INTO rooms (room_number, floor, room_type, status, rent_amount, deposit_amount, amenities) VALUES
('101', 1, 'single', 'vacant', 5000, 10000, '["fan", "light", "attached_bathroom"]'),
('102', 1, 'single', 'vacant', 5000, 10000, '["fan", "light", "attached_bathroom"]'),
('103', 1, 'double', 'vacant', 8000, 16000, '["fan", "light", "attached_bathroom", "balcony"]'),
('201', 2, 'single', 'vacant', 5500, 11000, '["fan", "light", "attached_bathroom"]'),
('202', 2, 'single', 'vacant', 5500, 11000, '["fan", "light", "attached_bathroom"]'),
('203', 2, 'double', 'vacant', 8500, 17000, '["fan", "light", "attached_bathroom", "balcony"]'),
('301', 3, 'single', 'vacant', 6000, 12000, '["fan", "light", "attached_bathroom", "ac"]'),
('302', 3, 'double', 'vacant', 9000, 18000, '["fan", "light", "attached_bathroom", "balcony", "ac"]');