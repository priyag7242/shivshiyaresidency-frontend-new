-- Complete Database Fix for Shiv Shiva Residency
-- This script fixes the database schema to support electricity billing and payments

-- ========================================
-- 1. FIX PAYMENTS TABLE
-- ========================================

-- Add missing columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS electricity_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS electricity_rate DECIMAL(10,2) DEFAULT 12.00,
ADD COLUMN IF NOT EXISTS electricity_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rent_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_charges DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS adjustments DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance_due DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing payments to have proper values
UPDATE payments 
SET 
  rent_amount = COALESCE(amount, 0),
  total_amount = COALESCE(amount, 0),
  balance_due = COALESCE(amount, 0),
  electricity_amount = 0,
  electricity_units = 0
WHERE rent_amount IS NULL OR rent_amount = 0;

-- ========================================
-- 2. FIX TENANTS TABLE
-- ========================================

-- Add missing columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS last_electricity_reading INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS electricity_joining_reading INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing tenants to have proper values
UPDATE tenants 
SET 
  status = 'active',
  monthly_rent = COALESCE(monthly_rent, 5000),
  security_deposit = COALESCE(security_deposit, 10000),
  last_electricity_reading = COALESCE(last_electricity_reading, 0),
  electricity_joining_reading = COALESCE(electricity_joining_reading, 0)
WHERE status IS NULL;

-- ========================================
-- 3. CREATE SAMPLE DATA (if no tenants exist)
-- ========================================

-- Insert sample tenants if none exist
INSERT INTO tenants (
  name, mobile, room_number, status, monthly_rent, security_deposit,
  last_electricity_reading, electricity_joining_reading, joining_date
) 
SELECT * FROM (VALUES
  ('PRACHI', '9876543210', '113', 'active', 5500.00, 11000.00, 250, 180, '2025-01-01'::DATE),
  ('SHIVAM VARMA', '9876543211', '217', 'active', 6000.00, 12000.00, 320, 250, '2025-01-01'::DATE),
  ('DOLLY', '9876543212', '105', 'active', 5000.00, 10000.00, 180, 120, '2025-01-01'::DATE),
  ('VISHAL M', '9876543213', '101', 'active', 5200.00, 10400.00, 200, 150, '2025-01-01'::DATE),
  ('AMAN SRIVASTAV', '9876543214', '102', 'active', 5800.00, 11600.00, 280, 200, '2025-01-01'::DATE)
) AS v(name, mobile, room_number, status, monthly_rent, security_deposit, last_electricity_reading, electricity_joining_reading, joining_date)
WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE name = v.name);

-- ========================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ========================================

-- Payments table comments
COMMENT ON COLUMN payments.electricity_units IS 'Electricity units consumed';
COMMENT ON COLUMN payments.electricity_rate IS 'Rate per electricity unit (₹/unit)';
COMMENT ON COLUMN payments.electricity_amount IS 'Total electricity amount (units * rate)';
COMMENT ON COLUMN payments.rent_amount IS 'Monthly rent amount';
COMMENT ON COLUMN payments.other_charges IS 'Other charges (if any)';
COMMENT ON COLUMN payments.adjustments IS 'Adjustments (discounts/additions)';
COMMENT ON COLUMN payments.total_amount IS 'Total bill amount (rent + electricity + other - adjustments)';
COMMENT ON COLUMN payments.amount_paid IS 'Amount paid by tenant';
COMMENT ON COLUMN payments.balance_due IS 'Remaining balance to be paid';
COMMENT ON COLUMN payments.generated_date IS 'Date when bill was generated';

-- Tenants table comments
COMMENT ON COLUMN tenants.last_electricity_reading IS 'Current electricity meter reading';
COMMENT ON COLUMN tenants.electricity_joining_reading IS 'Electricity reading when tenant joined';
COMMENT ON COLUMN tenants.monthly_rent IS 'Monthly rent amount';
COMMENT ON COLUMN tenants.security_deposit IS 'Security deposit amount';
COMMENT ON COLUMN tenants.joining_date IS 'Date when tenant joined';
COMMENT ON COLUMN tenants.status IS 'Tenant status: active, inactive, etc.';

-- ========================================
-- 5. VERIFICATION QUERIES
-- ========================================

-- Check if tables have correct structure
SELECT 'Payments table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position;

SELECT 'Tenants table structure:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants' 
ORDER BY ordinal_position;

-- Check sample data
SELECT 'Sample tenants created:' as info;
SELECT name, room_number, monthly_rent, last_electricity_reading, electricity_joining_reading 
FROM tenants 
WHERE status = 'active'; 