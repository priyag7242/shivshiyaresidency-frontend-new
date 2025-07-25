-- Migration to add security deposit related columns to tenants table
-- Run this in your Supabase SQL editor

-- Add security deposit related columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS security_deposit_total DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_balance_due_date DATE,
ADD COLUMN IF NOT EXISTS adjust_rent_from_security BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to automatically calculate security deposit balance
CREATE OR REPLACE FUNCTION calculate_security_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate balance: total - paid
  NEW.security_deposit_balance = NEW.security_deposit_total - NEW.security_deposit_paid;
  
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate security balance when deposit amounts change
DROP TRIGGER IF EXISTS trigger_calculate_security_balance ON tenants;
CREATE TRIGGER trigger_calculate_security_balance
  BEFORE INSERT OR UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION calculate_security_balance();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_tenants_updated_at ON tenants;
CREATE TRIGGER trigger_update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_tenants_updated_at();

-- Add comments to document the new columns
COMMENT ON COLUMN tenants.security_deposit_total IS 'Total security deposit amount required';
COMMENT ON COLUMN tenants.security_deposit_paid IS 'Amount of security deposit already paid';
COMMENT ON COLUMN tenants.security_deposit_balance IS 'Remaining security deposit balance (calculated automatically)';
COMMENT ON COLUMN tenants.security_balance_due_date IS 'Due date for remaining security deposit balance';
COMMENT ON COLUMN tenants.adjust_rent_from_security IS 'Whether to adjust one month rent from security deposit';
COMMENT ON COLUMN tenants.updated_at IS 'Timestamp when the record was last updated';

-- Update existing tenants to have default values
UPDATE tenants 
SET 
  security_deposit_total = COALESCE(security_deposit_total, 0),
  security_deposit_paid = COALESCE(security_deposit_paid, 0),
  security_deposit_balance = COALESCE(security_deposit_balance, 0),
  adjust_rent_from_security = COALESCE(adjust_rent_from_security, false),
  updated_at = COALESCE(updated_at, NOW())
WHERE security_deposit_total IS NULL 
   OR security_deposit_paid IS NULL 
   OR security_deposit_balance IS NULL 
   OR adjust_rent_from_security IS NULL
   OR updated_at IS NULL; 