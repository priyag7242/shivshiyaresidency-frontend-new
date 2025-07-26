-- Simple Database Fix for Shiv Shiva Residency
-- This script fixes the database schema step by step

-- ========================================
-- 1. FIX PAYMENTS TABLE
-- ========================================

-- Add missing columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_units INTEGER DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10,2) DEFAULT 12.00;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS other_charges DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS adjustments DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2) DEFAULT 0;

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing payments to have proper values
UPDATE payments 
SET rent_amount = COALESCE(amount, 0)
WHERE rent_amount IS NULL OR rent_amount = 0;

UPDATE payments 
SET total_amount = COALESCE(amount, 0)
WHERE total_amount IS NULL OR total_amount = 0;

UPDATE payments 
SET balance_due = COALESCE(amount, 0)
WHERE balance_due IS NULL OR balance_due = 0;

-- ========================================
-- 2. FIX TENANTS TABLE
-- ========================================

-- Add missing columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS last_electricity_reading INTEGER DEFAULT 0;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS electricity_joining_reading INTEGER DEFAULT 0;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2) DEFAULT 0;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;

ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing tenants to have proper values
UPDATE tenants 
SET status = 'active'
WHERE status IS NULL;

UPDATE tenants 
SET monthly_rent = 5000
WHERE monthly_rent IS NULL OR monthly_rent = 0;

UPDATE tenants 
SET security_deposit = 10000
WHERE security_deposit IS NULL OR security_deposit = 0;

-- ========================================
-- 3. CREATE SAMPLE TENANTS (Simple Method)
-- ========================================

-- Insert sample tenants one by one
INSERT INTO tenants (name, mobile, room_number, status, monthly_rent, security_deposit, last_electricity_reading, electricity_joining_reading, joining_date)
SELECT 'PRACHI', '9876543210', '113', 'active', 5500.00, 11000.00, 250, 180, '2025-01-01'::DATE
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'PRACHI');

INSERT INTO tenants (name, mobile, room_number, status, monthly_rent, security_deposit, last_electricity_reading, electricity_joining_reading, joining_date)
SELECT 'SHIVAM VARMA', '9876543211', '217', 'active', 6000.00, 12000.00, 320, 250, '2025-01-01'::DATE
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'SHIVAM VARMA');

INSERT INTO tenants (name, mobile, room_number, status, monthly_rent, security_deposit, last_electricity_reading, electricity_joining_reading, joining_date)
SELECT 'DOLLY', '9876543212', '105', 'active', 5000.00, 10000.00, 180, 120, '2025-01-01'::DATE
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'DOLLY');

INSERT INTO tenants (name, mobile, room_number, status, monthly_rent, security_deposit, last_electricity_reading, electricity_joining_reading, joining_date)
SELECT 'VISHAL M', '9876543213', '101', 'active', 5200.00, 10400.00, 200, 150, '2025-01-01'::DATE
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'VISHAL M');

INSERT INTO tenants (name, mobile, room_number, status, monthly_rent, security_deposit, last_electricity_reading, electricity_joining_reading, joining_date)
SELECT 'AMAN SRIVASTAV', '9876543214', '102', 'active', 5800.00, 11600.00, 280, 200, '2025-01-01'::DATE
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = 'AMAN SRIVASTAV');

-- ========================================
-- 4. VERIFICATION
-- ========================================

-- Check tenants
SELECT 'Tenants created:' as info;
SELECT name, room_number, monthly_rent, last_electricity_reading, electricity_joining_reading 
FROM tenants 
WHERE status = 'active';

-- Check payments table structure
SELECT 'Payments table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position; 