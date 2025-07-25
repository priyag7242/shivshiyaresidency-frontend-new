-- Migration to add security deposit tracking fields to tenants table
-- Run this in your Supabase SQL editor

-- Add new columns for security deposit tracking
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS security_deposit_paid DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_deposit_balance DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS security_balance_due_date DATE,
ADD COLUMN IF NOT EXISTS adjust_rent_from_security BOOLEAN DEFAULT false;

-- Update existing records to set default values
UPDATE tenants 
SET 
  security_deposit_paid = security_deposit,
  security_deposit_balance = 0
WHERE security_deposit_paid IS NULL;

-- Create trigger function to automatically calculate security deposit balance
CREATE OR REPLACE FUNCTION calculate_security_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate balance: total deposit - paid amount
  NEW.security_deposit_balance = NEW.security_deposit - NEW.security_deposit_paid;
  
  -- Update the updated_at timestamp
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate balance when security deposit paid changes
DROP TRIGGER IF EXISTS trigger_calculate_security_balance ON tenants;
CREATE TRIGGER trigger_calculate_security_balance
  BEFORE INSERT OR UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION calculate_security_balance();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_updated_at ON tenants;
CREATE TRIGGER trigger_update_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the new fields
COMMENT ON COLUMN tenants.security_deposit_paid IS 'Amount of security deposit that has been paid by the tenant';
COMMENT ON COLUMN tenants.security_deposit_balance IS 'Remaining balance of security deposit to be paid (calculated automatically)';
COMMENT ON COLUMN tenants.security_balance_due_date IS 'Date when the remaining security deposit balance is due';
COMMENT ON COLUMN tenants.adjust_rent_from_security IS 'Whether rent can be adjusted from security deposit when tenant leaves'; 