-- Fix Tenants Table Schema
-- Add missing fields for electricity readings and tenant management

-- Add missing columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS last_electricity_reading INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS electricity_joining_reading INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS monthly_rent DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Update existing records to have proper values
UPDATE tenants 
SET 
  status = 'active',
  monthly_rent = COALESCE(monthly_rent, 5000),
  security_deposit = COALESCE(security_deposit, 10000),
  last_electricity_reading = COALESCE(last_electricity_reading, 0),
  electricity_joining_reading = COALESCE(electricity_joining_reading, 0)
WHERE status IS NULL;

-- Add comments for clarity
COMMENT ON COLUMN tenants.last_electricity_reading IS 'Current electricity meter reading';
COMMENT ON COLUMN tenants.electricity_joining_reading IS 'Electricity reading when tenant joined';
COMMENT ON COLUMN tenants.monthly_rent IS 'Monthly rent amount';
COMMENT ON COLUMN tenants.security_deposit IS 'Security deposit amount';
COMMENT ON COLUMN tenants.joining_date IS 'Date when tenant joined';
COMMENT ON COLUMN tenants.status IS 'Tenant status: active, inactive, etc.'; 